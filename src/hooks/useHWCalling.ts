/**
 * WebRTC calling hook — uses Supabase Realtime broadcast for signaling.
 * Supports 1:1 voice/video calls and group calls (mesh topology).
 *
 * SIGNALING ARCHITECTURE:
 * - Each user has a persistent RECEIVE channel: `hw-calls-{ownUserId}` (listens for incoming signals)
 * - To send signals to another user, we maintain a persistent SEND channel: `hw-calls-{targetUserId}`
 * - Send channels are created on first use and reused for all subsequent signals to the same target
 * - This avoids the race condition where rapid ICE candidates create conflicting temporary channels
 */
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { startRingback, stopRingback } from '@/lib/ringback';
import { sendPushToUser } from '@/lib/push-sender';
import type { RealtimeChannel } from '@supabase/supabase-js';

const FALLBACK_ICE_SERVERS: RTCIceServer[] = [
  { urls: 'stun:stun.l.google.com:19302' },
  { urls: 'stun:stun1.l.google.com:19302' },
];

// Cache ICE servers for 5 minutes
let cachedIceServers: RTCIceServer[] | null = null;
let cacheExpiry = 0;

async function fetchIceServers(): Promise<RTCIceServer[]> {
  if (cachedIceServers && Date.now() < cacheExpiry) {
    return cachedIceServers;
  }
  try {
    const { data, error } = await supabase.functions.invoke('get-ice-servers');
    if (error || !data?.iceServers) {
      console.warn('[HWCalling] Failed to fetch ICE servers, using fallback');
      return FALLBACK_ICE_SERVERS;
    }
    cachedIceServers = data.iceServers;
    cacheExpiry = Date.now() + 5 * 60 * 1000;
    console.debug('[HWCalling] ICE servers loaded:', cachedIceServers.length, 'servers');
    return cachedIceServers;
  } catch (e) {
    console.warn('[HWCalling] ICE fetch error:', e);
    return FALLBACK_ICE_SERVERS;
  }
}

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'active' | 'ended';
export type CallType = 'voice' | 'video';

export interface CallParticipant {
  userId: string;
  name: string;
  avatar?: string;
  stream?: MediaStream;
  isMuted?: boolean;
  isVideoOff?: boolean;
}

interface SignalPayload {
  type: 'offer' | 'answer' | 'ice-candidate' | 'call-invite' | 'call-accept' | 'call-decline' | 'call-end' | 'call-cancel';
  from: string;
  to: string;
  callId: string;
  callType?: CallType;
  callerName?: string;
  callerAvatar?: string;
  data?: any;
}

interface UseHWCallingReturn {
  callStatus: CallStatus;
  callType: CallType | null;
  callId: string | null;
  localStream: MediaStream | null;
  remoteStreams: Map<string, MediaStream>;
  isMuted: boolean;
  isVideoOff: boolean;
  incomingCall: {
    callId: string;
    callType: CallType;
    callerUserId: string;
    callerName: string;
    callerAvatar?: string;
  } | null;
  startCall: (targetUserIds: string[], type: CallType) => Promise<void>;
  acceptCall: () => Promise<void>;
  declineCall: () => void;
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
}

export function useHWCalling(): UseHWCallingReturn {
  const { user } = useAuth();
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callType, setCallType] = useState<CallType | null>(null);
  const [callId, setCallId] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [incomingCall, setIncomingCall] = useState<UseHWCallingReturn['incomingCall']>(null);

  const peerConnectionsRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const signalingChannelRef = useRef<RealtimeChannel | null>(null);
  const callIdRef = useRef<string | null>(null);
  const callTypeRef = useRef<CallType | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const callStartTimeRef = useRef<Date | null>(null);
  const userIdRef = useRef<string | null>(null);
  const callStatusRef = useRef<CallStatus>('idle');
  const incomingCallRef = useRef<UseHWCallingReturn['incomingCall']>(null);

  // Persistent send channels — one per target user, reused for all signals
  const sendChannelsRef = useRef<Map<string, { channel: RealtimeChannel; ready: Promise<void> }>>(new Map());

  // Keep refs in sync with state
  useEffect(() => { userIdRef.current = user?.id ?? null; }, [user?.id]);
  useEffect(() => { callStatusRef.current = callStatus; }, [callStatus]);
  useEffect(() => { incomingCallRef.current = incomingCall; }, [incomingCall]);

  // ── Remove all send channels ──
  const cleanupSendChannels = useCallback(() => {
    for (const [, entry] of sendChannelsRef.current) {
      supabase.removeChannel(entry.channel);
    }
    sendChannelsRef.current.clear();
  }, []);

  // ── Cleanup ──
  const cleanup = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    localStreamRef.current = null;
    setLocalStream(null);

    for (const pc of peerConnectionsRef.current.values()) {
      pc.close();
    }
    peerConnectionsRef.current.clear();
    setRemoteStreams(new Map());

    cleanupSendChannels();

    callIdRef.current = null;
    callTypeRef.current = null;
    callStartTimeRef.current = null;
    setCallId(null);
    setCallType(null);
    setIsMuted(false);
    setIsVideoOff(false);
  }, [cleanupSendChannels]);

  // ── Get user profile info ──
  const getUserInfo = useCallback(async () => {
    const uid = userIdRef.current;
    if (!uid) return { name: 'Usuário', avatar: undefined };
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url')
      .eq('user_id', uid)
      .maybeSingle();
    return {
      name: data?.full_name || 'Usuário',
      avatar: data?.avatar_url || undefined,
    };
  }, []);

  // ── Get or create a persistent send channel to a target user ──
  const getSendChannel = useCallback((targetUserId: string): Promise<RealtimeChannel> => {
    const existing = sendChannelsRef.current.get(targetUserId);
    if (existing) {
      return existing.ready.then(() => existing.channel);
    }

    const channelName = `hw-calls-${targetUserId}`;
    const channel = supabase.channel(channelName, {
      config: { broadcast: { self: false } },
    });

    const ready = new Promise<void>((resolve, reject) => {
      const timeout = setTimeout(() => {
        console.warn('[HWCalling] Send channel subscription timeout for', channelName);
        // Don't reject — allow retries. Just resolve and hope it works.
        resolve();
      }, 8000);

      channel.subscribe((status) => {
        console.log('[HWCalling] Send channel status:', status, channelName);
        if (status === 'SUBSCRIBED') {
          clearTimeout(timeout);
          resolve();
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          clearTimeout(timeout);
          // Remove failed channel so next attempt creates a new one
          sendChannelsRef.current.delete(targetUserId);
          supabase.removeChannel(channel);
          reject(new Error(`Send channel ${status}`));
        }
      });
    });

    sendChannelsRef.current.set(targetUserId, { channel, ready });
    return ready.then(() => channel);
  }, []);

  // ── Send signal via persistent send channel ──
  const sendSignal = useCallback(async (targetUserId: string, payload: Omit<SignalPayload, 'from' | 'to'>) => {
    const uid = userIdRef.current;
    if (!uid) {
      console.warn('[HWCalling] sendSignal: no user id');
      return;
    }

    try {
      const channel = await getSendChannel(targetUserId);

      const result = await channel.send({
        type: 'broadcast',
        event: 'signal',
        payload: { ...payload, from: uid, to: targetUserId },
      });

      if (payload.type !== 'ice-candidate') {
        console.log('[HWCalling] sendSignal result:', result, 'type:', payload.type, 'to:', targetUserId);
      }
    } catch (e) {
      console.error('[HWCalling] sendSignal failed:', payload.type, 'to:', targetUserId, e);
    }
  }, [getSendChannel]);

  // ── Get media stream ──
  const getMediaStream = useCallback(async (type: CallType): Promise<MediaStream> => {
    const constraints: MediaStreamConstraints = {
      audio: true,
      video: type === 'video' ? { width: 1280, height: 720, facingMode: 'user' } : false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, []);

  // ── Create peer connection ──
  const createPeerConnection = useCallback(async (remoteUserId: string, isInitiator: boolean): Promise<RTCPeerConnection | null> => {
    console.log('[HWCalling] createPeerConnection:', { remoteUserId, isInitiator });
    if (!callIdRef.current || !localStreamRef.current) {
      console.warn('[HWCalling] Missing callId or localStream for peer connection');
      return null;
    }

    const iceServers = await fetchIceServers();
    const pc = new RTCPeerConnection({ iceServers });
    peerConnectionsRef.current.set(remoteUserId, pc);

    // Add local tracks
    localStreamRef.current.getTracks().forEach(track => {
      pc.addTrack(track, localStreamRef.current!);
    });

    // Handle remote tracks
    pc.ontrack = (event) => {
      console.log('[HWCalling] ✅ Remote track received from:', remoteUserId, 'kind:', event.track.kind);
      const [remoteStream] = event.streams;
      setRemoteStreams(prev => {
        const next = new Map(prev);
        next.set(remoteUserId, remoteStream);
        return next;
      });

      if (callStatusRef.current !== 'active') {
        setCallStatus('active');
        callStartTimeRef.current = new Date();
        supabase.from('hw_calls').update({
          status: 'active',
          started_at: new Date().toISOString(),
        }).eq('id', callIdRef.current!).then(() => {});
      }
    };

    // ICE candidates — sent via the persistent send channel (no more temporary channels)
    pc.onicecandidate = (event) => {
      if (event.candidate && callIdRef.current) {
        sendSignal(remoteUserId, {
          type: 'ice-candidate',
          callId: callIdRef.current,
          data: event.candidate.toJSON(),
        });
      }
    };

    pc.oniceconnectionstatechange = () => {
      console.log('[HWCalling] ICE state:', pc.iceConnectionState, 'for:', remoteUserId);
    };

    pc.onconnectionstatechange = () => {
      console.log('[HWCalling] Connection state:', pc.connectionState, 'for:', remoteUserId);
      if (pc.connectionState === 'connected') {
        console.log('[HWCalling] ✅ Peer connected with:', remoteUserId);
      }
      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        console.warn('[HWCalling] Connection failed/disconnected with:', remoteUserId);
        peerConnectionsRef.current.delete(remoteUserId);
        setRemoteStreams(prev => {
          const next = new Map(prev);
          next.delete(remoteUserId);
          return next;
        });
        if (peerConnectionsRef.current.size === 0 && callIdRef.current) {
          cleanup();
          setCallStatus('ended');
          setTimeout(() => setCallStatus('idle'), 2000);
        }
      }
    };

    // If initiator, create and send offer
    if (isInitiator) {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      await sendSignal(remoteUserId, {
        type: 'offer',
        callId: callIdRef.current,
        data: offer,
      });
    }

    return pc;
  }, [sendSignal, cleanup]);

  // ── Handle incoming signals ──
  const handleSignalRef = useRef<(signal: SignalPayload) => Promise<void>>();

  handleSignalRef.current = async (signal: SignalPayload) => {
    console.log('[HWCalling] signal received:', signal.type, 'from:', signal.from);

    switch (signal.type) {
      case 'call-invite': {
        setIncomingCall({
          callId: signal.callId,
          callType: signal.callType || 'voice',
          callerUserId: signal.from,
          callerName: signal.callerName || 'Usuário',
          callerAvatar: signal.callerAvatar,
        });
        break;
      }

      case 'call-accept': {
        if (callIdRef.current === signal.callId) {
          await createPeerConnection(signal.from, true);
        }
        break;
      }

      case 'call-decline': {
        if (callIdRef.current === signal.callId) {
          cleanup();
          setCallStatus('ended');
          await supabase.from('hw_calls').update({ status: 'declined', ended_at: new Date().toISOString() }).eq('id', signal.callId);
          setTimeout(() => setCallStatus('idle'), 2000);
        }
        break;
      }

      case 'call-cancel': {
        const incoming = incomingCallRef.current;
        if (incoming?.callId === signal.callId || callIdRef.current === signal.callId) {
          cleanup();
          setIncomingCall(null);
          setCallStatus('idle');
        }
        break;
      }

      case 'call-end': {
        if (callIdRef.current === signal.callId) {
          cleanup();
          setCallStatus('ended');
          setTimeout(() => setCallStatus('idle'), 2000);
        }
        break;
      }

      case 'offer': {
        const pc = await createPeerConnection(signal.from, false);
        if (pc && signal.data) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          await sendSignal(signal.from, {
            type: 'answer',
            callId: signal.callId,
            data: answer,
          });
        }
        break;
      }

      case 'answer': {
        const pc = peerConnectionsRef.current.get(signal.from);
        if (pc && signal.data) {
          await pc.setRemoteDescription(new RTCSessionDescription(signal.data));
        }
        break;
      }

      case 'ice-candidate': {
        const pc = peerConnectionsRef.current.get(signal.from);
        if (pc && signal.data) {
          try {
            await pc.addIceCandidate(new RTCIceCandidate(signal.data));
          } catch (e) {
            console.warn('[HWCalling] Failed to add ICE candidate:', e);
          }
        }
        break;
      }
    }
  };

  // ── Setup persistent RECEIVE signaling channel ──
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase.channel(`hw-calls-${user.id}`, {
      config: { broadcast: { self: false } },
    });

    channel
      .on('broadcast', { event: 'signal' }, ({ payload }: { payload: SignalPayload }) => {
        const uid = userIdRef.current;
        if (!uid || payload.to !== uid) return;
        handleSignalRef.current?.(payload);
      })
      .subscribe((status) => {
        console.log('[HWCalling] Receive channel status:', status);
      });

    signalingChannelRef.current = channel;

    return () => {
      supabase.removeChannel(channel);
      signalingChannelRef.current = null;
    };
  }, [user?.id]);

  // ── Start call ──
  const startCall = useCallback(async (targetUserIds: string[], type: CallType) => {
    const uid = userIdRef.current;
    if (!uid || callStatusRef.current !== 'idle') return;

    // Get media FIRST (must be in direct click handler for Safari)
    let stream: MediaStream;
    try {
      stream = await getMediaStream(type);
    } catch (e: any) {
      if (e?.name === 'NotAllowedError') {
        throw new Error('Permissão de câmera/microfone negada. Verifique as permissões do navegador.');
      }
      throw new Error('Não foi possível acessar câmera/microfone.');
    }

    try {
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('tenant_id')
        .eq('user_id', uid)
        .maybeSingle();

      if (roleError || !roleData?.tenant_id) {
        throw new Error('Tenant não encontrado.');
      }

      const { data: callData, error } = await supabase
        .from('hw_calls')
        .insert({
          tenant_id: roleData.tenant_id,
          initiated_by: uid,
          call_type: type,
          is_group: targetUserIds.length > 1,
          status: 'ringing',
        })
        .select('id')
        .single();

      if (error || !callData) {
        throw new Error('Erro ao registrar chamada.');
      }

      const newCallId = callData.id;
      callIdRef.current = newCallId;
      callTypeRef.current = type;
      setCallId(newCallId);
      setCallType(type);
      setCallStatus('calling');

      // Add participants
      const participants = [
        { call_id: newCallId, user_id: uid, role: 'caller' as const, status: 'joined' as const, joined_at: new Date().toISOString() },
        ...targetUserIds.map(tuid => ({ call_id: newCallId, user_id: tuid, role: 'callee' as const, status: 'ringing' as const })),
      ];
      await supabase.from('hw_call_participants').insert(participants);

      // Send invite signal + push notification
      const userInfo = await getUserInfo();
      for (const targetId of targetUserIds) {
        await sendSignal(targetId, {
          type: 'call-invite',
          callId: newCallId,
          callType: type,
          callerName: userInfo.name,
          callerAvatar: userInfo.avatar,
        });

        // Push notification for incoming call (best-effort)
        sendPushToUser({
          userId: targetId,
          title: type === 'video' ? '📹 Chamada de vídeo' : '📞 Chamada de voz',
          body: `${userInfo.name} está ligando para você`,
          data: { type: 'call', callId: newCallId, callType: type },
          tag: 'hw-call',
        });
      }

      // Auto-cancel after 30s
      setTimeout(() => {
        if (callIdRef.current === newCallId && callStatusRef.current === 'calling') {
          for (const targetId of targetUserIds) {
            sendSignal(targetId, { type: 'call-cancel', callId: newCallId });
          }
          cleanup();
          setCallStatus('ended');
          supabase.from('hw_calls').update({ status: 'missed', ended_at: new Date().toISOString() }).eq('id', newCallId).then(() => {});
          supabase.from('hw_call_participants').update({ status: 'missed' }).eq('call_id', newCallId).eq('status', 'ringing').then(() => {});
          setTimeout(() => setCallStatus('idle'), 2000);
        }
      }, 30000);
    } catch (e) {
      cleanup();
      setCallStatus('idle');
      throw e;
    }
  }, [getMediaStream, sendSignal, getUserInfo, cleanup]);

  // ── Accept call ──
  const acceptCall = useCallback(async () => {
    const uid = userIdRef.current;
    const incoming = incomingCallRef.current;
    if (!incoming || !uid) return;

    try {
      await getMediaStream(incoming.callType);

      callIdRef.current = incoming.callId;
      callTypeRef.current = incoming.callType;
      setCallId(incoming.callId);
      setCallType(incoming.callType);
      setCallStatus('active');

      // Update DB
      await supabase.from('hw_call_participants')
        .update({ status: 'joined', joined_at: new Date().toISOString() })
        .eq('call_id', incoming.callId)
        .eq('user_id', uid);

      // Signal acceptance — this triggers the caller to create PeerConnection and send offer
      await sendSignal(incoming.callerUserId, {
        type: 'call-accept',
        callId: incoming.callId,
      });

      setIncomingCall(null);
    } catch (e) {
      console.error('[HWCalling] Failed to accept call:', e);
      declineCall();
    }
  }, [getMediaStream, sendSignal]);

  // ── Decline call ──
  const declineCall = useCallback(() => {
    const uid = userIdRef.current;
    const incoming = incomingCallRef.current;
    if (!incoming) return;

    sendSignal(incoming.callerUserId, {
      type: 'call-decline',
      callId: incoming.callId,
    });

    if (uid) {
      supabase.from('hw_call_participants')
        .update({ status: 'declined' })
        .eq('call_id', incoming.callId)
        .eq('user_id', uid)
        .then(() => {});
    }

    setIncomingCall(null);
  }, [sendSignal]);

  // ── End call ──
  const endCall = useCallback(() => {
    const uid = userIdRef.current;
    if (!callIdRef.current) return;

    const duration = callStartTimeRef.current
      ? Math.round((Date.now() - callStartTimeRef.current.getTime()) / 1000)
      : 0;

    for (const peerId of peerConnectionsRef.current.keys()) {
      sendSignal(peerId, { type: 'call-end', callId: callIdRef.current });
    }

    supabase.from('hw_calls').update({
      status: 'ended',
      ended_at: new Date().toISOString(),
      duration_seconds: duration,
    }).eq('id', callIdRef.current).then(() => {});

    if (uid) {
      supabase.from('hw_call_participants')
        .update({ status: 'left', left_at: new Date().toISOString() })
        .eq('call_id', callIdRef.current)
        .eq('user_id', uid)
        .then(() => {});
    }

    cleanup();
    setCallStatus('ended');
    setTimeout(() => setCallStatus('idle'), 2000);
  }, [sendSignal, cleanup]);

  // ── Toggle mute ──
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // ── Toggle video ──
  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  }, []);

  // ── Ringback tone: play when caller is waiting ──
  useEffect(() => {
    if (callStatus === 'calling') {
      startRingback();
    } else {
      stopRingback();
    }
    return () => stopRingback();
  }, [callStatus]);

  return {
    callStatus,
    callType,
    callId,
    localStream,
    remoteStreams,
    isMuted,
    isVideoOff,
    incomingCall,
    startCall,
    acceptCall,
    declineCall,
    endCall,
    toggleMute,
    toggleVideo,
  };
}
