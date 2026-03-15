import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWProfile } from "@/hooks/useHWProfile";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWPosts, useCreateHWPost, useAddHWComment, useToggleHWReaction } from "@/hooks/useHWFeed";
import { useWorkspaceFileUpload } from "@/hooks/useWorkspaceFileUpload";
import { useHWFavorites } from "@/hooks/useHWFavorites";
import { useHWPostAcks, useAckPost } from "@/hooks/useHWAcks";
import { useHWSearchPosts } from "@/hooks/useHWSearchPosts";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Heart, MessageCircle, Send, Megaphone, Pin, Image, Paperclip, Loader2, Link2, CheckCircle2, ExternalLink, X, FileIcon, BarChart3, Search, ShieldCheck, Clock, Star } from "lucide-react";
import { useHWEntityLinks } from "@/hooks/useHWEntityLinks";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { PollComposer } from "./PollComposer";
import { PollResults } from "./PollResults";
import { RecognitionWall } from "./RecognitionWall";
import { BulletinBoard } from "./BulletinBoard";
import { ClimateSurveySection } from "./ClimateSurveySection";
import { useCreateHWPoll } from "@/hooks/useHWPolls";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────

interface FeedPost {
  id: string;
  authorName: string;
  authorInitials: string;
  authorRole: string;
  teamName: string;
  type: 'post' | 'broadcast';
  title?: string;
  content: string;
  imageUrl?: string;
  createdAt: string;
  reactions: { emoji: string; count: number; reacted: boolean }[];
  comments: { id: string; authorName: string; authorInitials: string; content: string; createdAt: string }[];
  readCount: number;
  pinnedUntil?: string;
  requiresAck?: boolean;
  hasPoll?: boolean;
  scheduledAt?: string;
}

// ─── Mock fallback data ──────────────────────────────────

const MOCK_POSTS: FeedPost[] = [
  {
    id: 'mock-1', authorName: 'Carlos Diretor', authorInitials: 'CD', authorRole: 'Diretor Geral',
    teamName: 'Diretoria', type: 'broadcast', title: 'Comunicado da Diretoria',
    content: 'Informamos que a partir do dia 10/03 iniciaremos o novo sistema de ponto eletrônico. Todos os colaboradores devem comparecer ao RH até sexta-feira para cadastro biométrico.',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    reactions: [{ emoji: '👍', count: 24, reacted: false }, { emoji: '✅', count: 12, reacted: true }],
    comments: [{ id: 'c1', authorName: 'Maria Silva', authorInitials: 'MS', content: 'Entendido, chefe!', createdAt: new Date(Date.now() - 3000000).toISOString() }],
    readCount: 156, pinnedUntil: new Date(Date.now() + 86400000).toISOString(),
  },
  {
    id: 'mock-2', authorName: 'Ana Oliveira', authorInitials: 'AO', authorRole: 'Chefe de Departamento',
    teamName: 'Caixas', type: 'post',
    content: 'Equipe, lembrem-se: amanhã teremos treinamento obrigatório sobre o novo sistema de pagamento por aproximação. Horário: 07h30.',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    reactions: [{ emoji: '👍', count: 8, reacted: false }], comments: [], readCount: 12,
  },
  {
    id: 'mock-3', authorName: 'Roberto Santos', authorInitials: 'RS', authorRole: 'Chefe de Departamento',
    teamName: 'Reposição', type: 'post',
    content: 'Excelente trabalho da equipe ontem na virada de layout do corredor 7! Reduzimos o tempo de execução em 40%. Parabéns a todos!',
    createdAt: new Date(Date.now() - 14400000).toISOString(),
    reactions: [{ emoji: '🎉', count: 15, reacted: true }, { emoji: '💪', count: 9, reacted: false }],
    comments: [
      { id: 'c2', authorName: 'João Pereira', authorInitials: 'JP', content: 'Valeu chefe! A equipe toda arrasou!', createdAt: new Date(Date.now() - 13000000).toISOString() },
      { id: 'c3', authorName: 'Fernanda Lima', authorInitials: 'FL', content: 'Obrigada pelo reconhecimento 🙌', createdAt: new Date(Date.now() - 12000000).toISOString() },
    ],
    readCount: 18,
  },
];

// ─── Helpers ─────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

// ─── Post Card ───────────────────────────────────────────

function PostCard({ post, tenantId, entityLinks = [], ackData, onAck }: {
  post: FeedPost;
  tenantId?: string;
  entityLinks?: { entity_type: string; entity_id: string; label: string | null; relation_type: string }[];
  ackData?: { count: number; userAcked: boolean };
  onAck?: () => void;
}) {
  const { user } = useAuth();
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const addComment = useAddHWComment();
  const toggleReaction = useToggleHWReaction();
  const { isFavorite, toggle: toggleFavorite } = useHWFavorites();
  const postLinks = entityLinks;
  const isFav = isFavorite('post', post.id);

  const isBroadcast = post.type === 'broadcast';
  const isPinned = post.pinnedUntil && new Date(post.pinnedUntil) > new Date();

  const handleComment = () => {
    if (!newComment.trim() || !user?.id || !tenantId) return;
    addComment.mutate({
      post_id: post.id,
      user_id: user.id,
      content: newComment.trim(),
      tenant_id: tenantId,
    });
    setNewComment("");
  };

  const handleReaction = (emoji: string) => {
    if (!user?.id || !tenantId) return;
    toggleReaction.mutate({ post_id: post.id, user_id: user.id, emoji, tenant_id: tenantId });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl overflow-hidden"
      style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}
    >
      {isBroadcast && (
        <div className="flex items-center gap-2 px-4 py-2 text-xs font-semibold"
          style={{ backgroundColor: 'rgba(194, 65, 12, 0.15)', color: '#EA580C' }}>
          <Megaphone className="h-3.5 w-3.5" />
          Comunicado da Diretoria
          {isPinned && <Pin className="h-3 w-3 ml-auto" />}
        </div>
      )}

      <div className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="text-xs font-semibold"
              style={{ backgroundColor: isBroadcast ? 'rgba(194, 65, 12, 0.2)' : '#27272A', color: isBroadcast ? '#EA580C' : '#A1A1AA' }}>
              {post.authorInitials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{post.authorName}</span>
              <span className="text-xs" style={{ color: '#52525B' }}>· {timeAgo(post.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs" style={{ color: '#71717A' }}>{post.authorRole}</span>
              <span className="text-xs" style={{ color: '#3F3F46' }}>·</span>
              <span className="text-xs" style={{ color: '#71717A' }}>{post.teamName}</span>
            </div>
          </div>
        </div>

        {post.title && <h3 className="text-sm font-semibold mb-2" style={{ color: '#FAFAFA' }}>{post.title}</h3>}

        <p className="text-sm leading-relaxed whitespace-pre-wrap" style={{ color: '#D4D4D8' }}>{post.content}</p>

        {/* Inline image */}
        {post.imageUrl && (
          <div className="mt-3 rounded-lg overflow-hidden" style={{ border: '1px solid #27272A' }}>
            <img src={post.imageUrl} alt="Anexo do post" className="w-full max-h-80 object-cover" />
          </div>
        )}

        {/* Entity links */}
        {postLinks.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1.5">
            {postLinks.map((link, i) => (
              <Badge key={i} className="text-[10px] h-5 gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                style={{
                  backgroundColor: link.relation_type === 'evidence' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
                  color: link.relation_type === 'evidence' ? '#22C55E' : '#3B82F6',
                  border: `1px solid ${link.relation_type === 'evidence' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(59, 130, 246, 0.3)'}`,
                }}>
                {link.relation_type === 'evidence' ? <CheckCircle2 className="h-2.5 w-2.5" /> : <Link2 className="h-2.5 w-2.5" />}
                {link.label || link.entity_type}
                <ExternalLink className="h-2.5 w-2.5 ml-0.5" />
              </Badge>
            ))}
          </div>
        )}

        {/* Poll results */}
        {post.hasPoll && <PollResults postId={post.id} />}

        {/* Ack button */}
        {post.requiresAck && (
          <div className="mt-3 flex items-center gap-3">
            {ackData?.userAcked ? (
              <div className="flex items-center gap-1.5 text-xs font-medium" style={{ color: '#22C55E' }}>
                <ShieldCheck className="h-3.5 w-3.5" /> Leitura confirmada
              </div>
            ) : (
              <Button size="sm" onClick={onAck} className="h-7 text-xs gap-1.5 rounded-lg"
                style={{ backgroundColor: 'rgba(194, 65, 12, 0.15)', color: '#EA580C', border: '1px solid rgba(194, 65, 12, 0.3)' }}>
                <ShieldCheck className="h-3 w-3" /> Confirmar Leitura
              </Button>
            )}
            {ackData && ackData.count > 0 && (
              <span className="text-[10px]" style={{ color: '#52525B' }}>
                {ackData.count} confirmação{ackData.count > 1 ? 'ões' : ''}
              </span>
            )}
          </div>
        )}

        <div className="mt-3 flex items-center gap-4">
          <span className="text-xs" style={{ color: '#52525B' }}>
            {post.readCount} {post.readCount === 1 ? 'visualização' : 'visualizações'}
          </span>
        </div>

        <div className="mt-3 flex items-center gap-2 flex-wrap">
          {post.reactions.map((r, i) => (
            <button key={i} onClick={() => handleReaction(r.emoji)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium transition-colors"
              style={{
                backgroundColor: r.reacted ? 'rgba(194, 65, 12, 0.15)' : '#27272A',
                color: r.reacted ? '#EA580C' : '#A1A1AA',
                border: r.reacted ? '1px solid rgba(194, 65, 12, 0.3)' : '1px solid transparent',
              }}>
              {r.emoji} {r.count}
            </button>
          ))}
          <button onClick={() => handleReaction('👍')}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors hover:bg-zinc-800"
            style={{ color: '#52525B' }}>
            <Heart className="h-3 w-3" /> Reagir
          </button>
          <button
            onClick={() => toggleFavorite.mutate({ entityType: 'post', entityId: post.id })}
            className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs transition-colors hover:bg-zinc-800 ml-auto"
            style={{ color: isFav ? '#F59E0B' : '#52525B' }}>
            <Star className="h-3 w-3" style={{ fill: isFav ? '#F59E0B' : 'none' }} />
          </button>
        </div>

        <button onClick={() => setShowComments(!showComments)}
          className="mt-3 flex items-center gap-1.5 text-xs font-medium transition-colors hover:underline"
          style={{ color: '#71717A' }}>
          <MessageCircle className="h-3.5 w-3.5" />
          {post.comments.length > 0 ? `${post.comments.length} comentário${post.comments.length > 1 ? 's' : ''}` : 'Comentar'}
        </button>

        <AnimatePresence>
          {showComments && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="mt-3 pt-3 space-y-3" style={{ borderTop: '1px solid #27272A' }}>
                {post.comments.map(comment => (
                  <div key={comment.id} className="flex gap-2">
                    <Avatar className="h-7 w-7 shrink-0">
                      <AvatarFallback className="text-[9px] font-semibold" style={{ backgroundColor: '#27272A', color: '#A1A1AA' }}>
                        {comment.authorInitials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold" style={{ color: '#D4D4D8' }}>{comment.authorName}</span>
                        <span className="text-[10px]" style={{ color: '#52525B' }}>{timeAgo(comment.createdAt)}</span>
                      </div>
                      <p className="text-xs mt-0.5" style={{ color: '#A1A1AA' }}>{comment.content}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Input value={newComment} onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Escreva um comentário..." className="flex-1 h-8 text-xs"
                    style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }}
                    onKeyDown={(e) => e.key === 'Enter' && handleComment()} />
                  <Button size="icon" className="h-8 w-8 shrink-0" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}
                    disabled={!newComment.trim()} onClick={handleComment}>
                    <Send className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

// ─── Post Composer ───────────────────────────────────────

function PostComposer({ isBroadcast = false, tenantId }: { isBroadcast?: boolean; tenantId?: string }) {
  const { user } = useAuth();
  const [showComposer, setShowComposer] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);
  const [attachedImage, setAttachedImage] = useState<string | null>(null);
  const [attachedFile, setAttachedFile] = useState<{ name: string; url: string } | null>(null);
  const [pollData, setPollData] = useState<{ question: string; options: string[] } | null>(null);
  const [requiresAck, setRequiresAck] = useState(false);
  const [scheduledAt, setScheduledAt] = useState("");
  const createPost = useCreateHWPost();
  const createPoll = useCreateHWPoll();
  const { uploadFile, isUploading } = useWorkspaceFileUpload({});
  const imageInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setAttachedImage(url);
    } catch {}
    e.target.value = '';
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const url = await uploadFile(file);
      setAttachedFile({ name: file.name, url });
    } catch {}
    e.target.value = '';
  };

  const handleSubmit = () => {
    if (isBroadcast) {
      setShowConfirm(true);
    } else {
      doSubmit();
    }
  };

  const doSubmit = () => {
    if (!user?.id || !tenantId || !content.trim()) return;
    const isScheduled = !!scheduledAt;
    createPost.mutate({
      tenant_id: tenantId,
      author_id: user.id,
      content: content.trim(),
      type: isBroadcast ? 'broadcast' : 'post',
      title: isBroadcast ? title.trim() : undefined,
      image_url: attachedImage || undefined,
      pinned_until: isBroadcast ? new Date(Date.now() + 86400000).toISOString() : undefined,
      scheduled_at: isScheduled ? new Date(scheduledAt).toISOString() : undefined,
      is_published: isScheduled ? false : true,
      requires_ack: requiresAck,
    }, {
      onSuccess: (data) => {
        // Create poll if data exists
        if (pollData && data?.id) {
          createPoll.mutate({
            post_id: data.id,
            tenant_id: tenantId,
            question: pollData.question,
            options: pollData.options,
          });
        }
        toast.success(isScheduled ? 'Post agendado!' : isBroadcast ? 'Comunicado enviado!' : 'Post publicado!');
        setShowComposer(false);
        setTitle("");
        setContent("");
        setAttachedImage(null);
        setAttachedFile(null);
        setPollData(null);
        setRequiresAck(false);
        setScheduledAt("");
      },
      onError: () => toast.error('Erro ao publicar'),
    });
  };

  return (
    <>
      <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={handleImageSelect} />
      <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileSelect} />

      <Button onClick={() => setShowComposer(true)} className="w-full rounded-xl h-11 text-sm font-medium"
        style={{ backgroundColor: isBroadcast ? '#C2410C' : '#27272A', color: '#FAFAFA' }}>
        {isBroadcast ? <><Megaphone className="h-4 w-4 mr-2" /> Comunicado Geral</> : <><Send className="h-4 w-4 mr-2" /> Novo Post para a Equipe</>}
      </Button>

      <Dialog open={showComposer} onOpenChange={setShowComposer}>
        <DialogContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }} className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle style={{ color: '#FAFAFA' }}>{isBroadcast ? 'Comunicado Geral' : 'Novo Post'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            {isBroadcast && (
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Título do comunicado"
                style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
            )}
            <Textarea value={content} onChange={(e) => setContent(e.target.value)}
              placeholder={isBroadcast ? 'Escreva seu comunicado para toda a empresa...' : 'Escreva uma mensagem para sua equipe...'} rows={5}
              style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />

            {/* Attached image preview */}
            {attachedImage && (
              <div className="relative rounded-lg overflow-hidden" style={{ border: '1px solid #27272A' }}>
                <img src={attachedImage} alt="Preview" className="w-full max-h-40 object-cover" />
                <button onClick={() => setAttachedImage(null)}
                  className="absolute top-2 right-2 h-6 w-6 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
                  <X className="h-3 w-3" style={{ color: '#FAFAFA' }} />
                </button>
              </div>
            )}

            {/* Attached file preview */}
            {attachedFile && (
              <div className="flex items-center gap-2 p-2 rounded-lg" style={{ backgroundColor: '#27272A' }}>
                <FileIcon className="h-4 w-4 shrink-0" style={{ color: '#3B82F6' }} />
                <span className="text-xs truncate" style={{ color: '#D4D4D8' }}>{attachedFile.name}</span>
                <button onClick={() => setAttachedFile(null)} className="ml-auto shrink-0">
                  <X className="h-3 w-3" style={{ color: '#71717A' }} />
                </button>
              </div>
            )}

            <div className="flex gap-2 flex-wrap">
              <Button variant="ghost" size="sm" style={{ color: '#71717A' }} disabled={isUploading}
                onClick={() => imageInputRef.current?.click()}>
                <Image className="h-4 w-4 mr-1" /> {isUploading ? 'Enviando...' : 'Imagem'}
              </Button>
              <Button variant="ghost" size="sm" style={{ color: '#71717A' }} disabled={isUploading}
                onClick={() => fileInputRef.current?.click()}>
                <Paperclip className="h-4 w-4 mr-1" /> Arquivo
              </Button>
              <PollComposer onPollData={setPollData} />
            </div>

            {/* Scheduling */}
            {isBroadcast && (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input type="datetime-local" value={scheduledAt} onChange={(e) => setScheduledAt(e.target.value)}
                    className="h-8 text-xs rounded-lg px-2 flex-1"
                    style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA', border: '1px solid #3F3F46' }} />
                  {scheduledAt && (
                    <button onClick={() => setScheduledAt("")} className="shrink-0">
                      <X className="h-3.5 w-3.5" style={{ color: '#71717A' }} />
                    </button>
                  )}
                </div>
                {scheduledAt && (
                  <p className="text-[10px] flex items-center gap-1" style={{ color: '#3B82F6' }}>
                    <Clock className="h-3 w-3" /> Será publicado em {new Date(scheduledAt).toLocaleString('pt-BR')}
                  </p>
                )}
              </div>
            )}

            {/* Requires ack toggle */}
            {isBroadcast && (
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={requiresAck} onChange={(e) => setRequiresAck(e.target.checked)}
                  className="rounded" />
                <span className="text-xs" style={{ color: '#A1A1AA' }}>
                  <ShieldCheck className="h-3 w-3 inline mr-1" /> Exigir confirmação de leitura
                </span>
              </label>
            )}

            {isBroadcast && (
              <div className="rounded-lg p-3" style={{ backgroundColor: '#27272A' }}>
                <p className="text-xs" style={{ color: '#71717A' }}>
                  <Megaphone className="h-3 w-3 inline mr-1" />
                  Este comunicado será enviado para <strong style={{ color: '#FAFAFA' }}>todos os colaboradores</strong> e ficará fixado por 24h.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setShowComposer(false)} style={{ color: '#71717A' }}>Cancelar</Button>
            <Button onClick={handleSubmit} disabled={!content.trim() || (isBroadcast && !title.trim()) || createPost.isPending || isUploading}
              style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}>
              {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isBroadcast ? 'Enviar Comunicado' : 'Publicar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showConfirm} onOpenChange={setShowConfirm}>
        <AlertDialogContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
          <AlertDialogHeader>
            <AlertDialogTitle style={{ color: '#FAFAFA' }}>Confirmar envio</AlertDialogTitle>
            <AlertDialogDescription style={{ color: '#A1A1AA' }}>
              Este comunicado será enviado para todos os colaboradores da empresa. Deseja continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel style={{ color: '#A1A1AA', borderColor: '#3F3F46' }}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setShowConfirm(false); doSubmit(); }} style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}>
              Confirmar Envio
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── KPI Dashboard ───────────────────────────────────────

interface MockKPI { label: string; value: string; delta: string; positive: boolean; }

function KPIDashboard({ profile }: { profile: 'diretor' | 'chefe' }) {
  const kpis: MockKPI[] = profile === 'diretor' ? [
    { label: 'Colaboradores Ativos', value: '247', delta: '+3 este mês', positive: true },
    { label: 'Posts esta Semana', value: '34', delta: '+12% vs semana ant.', positive: true },
    { label: 'Treinamentos Pendentes', value: '18', delta: '-5 vs mês ant.', positive: true },
    { label: 'Taxa de Engajamento', value: '78%', delta: '+4pp', positive: true },
    { label: 'Equipes Ativas', value: '17', delta: 'Todas ativas', positive: true },
    { label: 'Candidatos em Análise', value: '12', delta: '3 novos hoje', positive: true },
  ] : [
    { label: 'Membros da Equipe', value: '14', delta: '2 em férias', positive: true },
    { label: 'Posts do Mês', value: '8', delta: '+2 vs mês ant.', positive: true },
    { label: 'Treinamentos Pendentes', value: '3', delta: '1 vence amanhã', positive: false },
    { label: 'Engajamento Equipe', value: '85%', delta: '+6pp', positive: true },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 mb-4">
      {kpis.map((kpi, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
          className="rounded-xl p-3" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
          <p className="text-[10px] font-medium uppercase tracking-wider" style={{ color: '#71717A' }}>{kpi.label}</p>
          <p className="text-xl font-bold mt-1" style={{ color: '#FAFAFA' }}>{kpi.value}</p>
          <p className="text-[10px] mt-1" style={{ color: kpi.positive ? '#22C55E' : '#EF4444' }}>{kpi.delta}</p>
        </motion.div>
      ))}
    </div>
  );
}

// ─── Main Feed View ──────────────────────────────────────

type FeedTab = 'feed' | 'recognitions' | 'bulletins' | 'climate';

interface HWFeedViewProps { delegateName?: string; }

export function HWFeedView({ delegateName }: HWFeedViewProps) {
  const { user } = useAuth();
  const { profile, permissions } = useHWProfile();
  const { data: tenantId } = useHWTenantId();
  const { data: dbPosts, isLoading } = useHWPosts(tenantId || undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [activeTab, setActiveTab] = useState<FeedTab>('feed');

  const posts = dbPosts && dbPosts.length > 0 ? dbPosts : MOCK_POSTS;
  const postIds = posts.map(p => p.id).filter(id => !id.startsWith('mock-'));
  const { data: entityLinks = [] } = useHWEntityLinks(postIds);
  const { data: ackMap = new Map() } = useHWPostAcks(postIds);
  const ackPost = useAckPost();
  const { data: searchResults } = useHWSearchPosts(searchQuery, tenantId || undefined);

  const linksByPost = new Map<string, typeof entityLinks>();
  for (const link of entityLinks) {
    const list = linksByPost.get(link.message_id) || [];
    list.push(link);
    linksByPost.set(link.message_id, list);
  }

  const handleAck = (postId: string) => {
    if (!user?.id) return;
    ackPost.mutate({ post_id: postId, user_id: user.id });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4 space-y-4">
        {profile === 'secretaria' && delegateName && (
          <div className="rounded-lg px-3 py-2 text-xs font-medium flex items-center gap-2"
            style={{ backgroundColor: 'rgba(194, 65, 12, 0.1)', color: '#EA580C', border: '1px solid rgba(194, 65, 12, 0.2)' }}>
            <span>Operando em nome de</span><strong>{delegateName}</strong>
          </div>
        )}


        {/* Engagement tabs */}
        <div className="flex gap-1 overflow-x-auto pb-1 -mx-1 px-1">
          {([
            { key: 'feed', label: 'Feed' },
            { key: 'recognitions', label: '⭐ Reconhecimentos' },
            { key: 'bulletins', label: '📋 Avisos' },
            { key: 'climate', label: '📊 Clima' },
          ] as { key: FeedTab; label: string }[]).map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap transition-colors"
              style={{
                backgroundColor: activeTab === tab.key ? 'rgba(194, 65, 12, 0.15)' : 'transparent',
                color: activeTab === tab.key ? '#EA580C' : '#71717A',
                border: activeTab === tab.key ? '1px solid rgba(194, 65, 12, 0.3)' : '1px solid transparent',
              }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {activeTab === 'recognitions' && <RecognitionWall />}
        {activeTab === 'bulletins' && <BulletinBoard />}
        {activeTab === 'climate' && <ClimateSurveySection />}

        {activeTab === 'feed' && (
          <>
            {/* Search bar */}
            <div className="flex gap-2">
              {showSearch ? (
                <div className="flex-1 flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5" style={{ color: '#52525B' }} />
                    <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Buscar comunicados..." className="pl-9 h-9 text-xs" autoFocus
                      style={{ backgroundColor: '#18181B', borderColor: '#27272A', color: '#FAFAFA' }} />
                  </div>
                  <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0"
                    onClick={() => { setShowSearch(false); setSearchQuery(""); }}>
                    <X className="h-4 w-4" style={{ color: '#71717A' }} />
                  </Button>
                </div>
              ) : (
                <>
                  {permissions.canBroadcast && <PostComposer isBroadcast tenantId={tenantId || undefined} />}
                  {permissions.canCreatePosts && !permissions.canBroadcast && <PostComposer tenantId={tenantId || undefined} />}
                  <Button variant="ghost" size="icon" className="h-11 w-11 shrink-0 rounded-xl"
                    style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}
                    onClick={() => setShowSearch(true)}>
                    <Search className="h-4 w-4" style={{ color: '#71717A' }} />
                  </Button>
                </>
              )}
            </div>

            {/* Search results */}
            {showSearch && searchQuery.trim() && searchResults && (
              <div className="space-y-2">
                <p className="text-xs font-medium" style={{ color: '#71717A' }}>
                  {searchResults.length} resultado{searchResults.length !== 1 ? 's' : ''}
                </p>
                {searchResults.map(r => (
                  <div key={r.id} className="rounded-lg p-3" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
                    {r.title && <p className="text-xs font-semibold mb-1" style={{ color: '#FAFAFA' }}>{r.title}</p>}
                    <p className="text-xs line-clamp-2" style={{ color: '#A1A1AA' }}>{r.content}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className="text-[10px]" style={{ color: '#52525B' }}>{r.author_name}</span>
                      <span className="text-[10px]" style={{ color: '#3F3F46' }}>·</span>
                      <span className="text-[10px]" style={{ color: '#52525B' }}>{timeAgo(r.created_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Feed */}
            {!showSearch && (
              isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#52525B' }} />
                </div>
              ) : (
                <div className="space-y-3">
                  {posts.map(post => (
                    <PostCard
                      key={post.id}
                      post={post}
                      tenantId={tenantId || undefined}
                      entityLinks={linksByPost.get(post.id) || []}
                      ackData={ackMap.get(post.id)}
                      onAck={() => handleAck(post.id)}
                    />
                  ))}
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}
