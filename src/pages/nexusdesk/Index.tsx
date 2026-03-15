import { useState, useCallback, useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useHWProfile } from "@/hooks/useHWProfile";
import { useHWUserLayout } from "@/hooks/useHWUserLayout";
import { HWEmbeddedPage } from "@/components/nexusdesk/HWEmbeddedPage";
import { HWSidebar, type HWView } from "@/components/nexusdesk/HWSidebar";
import { HWHeader } from "@/components/nexusdesk/HWHeader";
import { HWWorkspaceWidgets } from "@/components/nexusdesk/HWWorkspaceWidgets";
import { HWDraggableBottomBar } from "@/components/nexusdesk/HWDraggableBottomBar";
import { HWFeedView } from "@/components/nexusdesk/HWFeedView";
import { HWHomeView } from "@/components/nexusdesk/HWHomeView";
import { HWCommsApp } from "@/components/nexusdesk/comms";
import { HWTeamView } from "@/components/nexusdesk/HWTeamView";
import { HWDocumentsView } from "@/components/nexusdesk/HWDocumentsView";
import { HWProfileView } from "@/components/nexusdesk/HWProfileView";
import { HWRecruitmentView } from "@/components/nexusdesk/HWRecruitmentView";
import { HWTrainingsView } from "@/components/nexusdesk/HWTrainingsView";
import { HWGoalsView } from "@/components/nexusdesk/HWGoalsView";
import { DelegationDialog } from "@/components/nexusdesk/DelegationDialog";
import { HWApprovalsView } from "@/components/nexusdesk/HWApprovalsView";
import { HWSettingsProvider } from "@/components/nexusdesk/HWSettingsProvider";
import { HWPresenceProvider } from "@/hooks/useHWPresence";
import { WidgetActionsContext } from "@/components/nexusdesk/WidgetActionsContext";
import { HWCallingProvider, useGlobalCalling } from "@/contexts/HWCallingContext";
import { GlobalIncomingCallBanner } from "@/components/nexusdesk/comms/GlobalIncomingCallBanner";
import { GlobalMessageBanner } from "@/components/nexusdesk/comms/GlobalMessageBanner";
import { useHWIncomingMessages } from "@/hooks/useHWIncomingMessages";
import { CommsActiveCall } from "@/components/nexusdesk/comms/CommsActiveCall";
import { Button } from "@/components/ui/button";
import { Shield } from "lucide-react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { useHWOffHoursCheck } from "@/hooks/useHWOffHoursCheck";
import { HWOffHoursGuard } from "@/components/nexusdesk/HWOffHoursGuard";
import { useHWPushNotifications } from "@/hooks/useHWPushNotifications";
import { DotPattern } from "@/components/ui/dot-pattern";

function useSidebarCollapse(key: string, defaultValue = false) {
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultValue;
    } catch { return defaultValue; }
  });

  const toggle = useCallback(() => {
    setCollapsed((prev: boolean) => {
      const next = !prev;
      localStorage.setItem(key, JSON.stringify(next));
      return next;
    });
  }, [key]);

  return [collapsed, toggle] as const;
}

export default function HyperWorksPage() {
  return (
    <HWCallingProvider>
      <HyperWorksPageInner />
    </HWCallingProvider>
  );
}

function HyperWorksPageInner() {
  const [currentView, setCurrentView] = useState<HWView>("home");
  const containerRef = useRef<HTMLDivElement>(null);
  const { profile } = useHWProfile();
  const [showDelegation, setShowDelegation] = useState(false);
  const [delegateId, setDelegateId] = useState<string | undefined>();
  const [delegateName, setDelegateName] = useState<string | undefined>();
  const [chatTargetUserId, setChatTargetUserId] = useState<string | undefined>();

  const [leftCollapsed, toggleLeftCollapsed] = useSidebarCollapse('hw-left-collapsed');
  const [rightCollapsed, toggleRightCollapsed] = useSidebarCollapse('hw-right-collapsed');
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const isMobile = useIsMobile();

  const calling = useGlobalCalling();
  const { showGuard, acceptTermWithPassword, termText } = useHWOffHoursCheck();
  useHWPushNotifications(); // Auto-register push notifications
  const { incomingMessage, dismiss: dismissMessage } = useHWIncomingMessages(currentView);

  const {
    sidebarOrder,
    homeWidgetsOrder,
    bottomTabs,
    rightWidgetsOrder,
    updateSidebarOrder,
    updateWidgetOrder,
    updateBottomTabs,
    updateRightWidgetsOrder,
  } = useHWUserLayout();

  const isSecretaria = profile === 'secretaria';

  const handleNavigateToChat = useCallback((userId: string) => {
    setChatTargetUserId(userId);
    setCurrentView('messages');
  }, []);

  // When user accepts call from global banner, switch to messages view
  const handleAcceptCallGlobal = useCallback(async () => {
    await calling.acceptCall();
    setCurrentView('messages');
  }, [calling.acceptCall]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
        e.preventDefault();
        toggleLeftCollapsed();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '.') {
        e.preventDefault();
        toggleRightCollapsed();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [toggleLeftCollapsed, toggleRightCollapsed]);

  const isInCall = calling.callStatus === 'calling' || calling.callStatus === 'active';
  const showGlobalBanner = calling.incomingCall && calling.callStatus === 'idle';

  // Get other user info for active call
  const getCallOtherUser = () => {
    if (calling.incomingCall) {
      return { name: calling.incomingCall.callerName, avatar: calling.incomingCall.callerAvatar };
    }
    return { name: 'Chamada', avatar: undefined };
  };

  const renderView = () => {
    // Handle workbench embedded pages (e.g. 'workbench:hipergestao:demandas')
    if (currentView.startsWith('workbench:')) {
      const pageId = currentView.replace('workbench:', '');
      return <HWEmbeddedPage pageId={pageId} />;
    }

    switch (currentView) {
      case 'home':
        return (
          <HWHomeView
            delegateName={delegateName}
            onNavigate={(v) => setCurrentView(v as any)}
          />
        );
      case 'mural':
        return <HWFeedView delegateName={delegateName} />;
      case 'messages':
        return (
          <HWCommsApp
            chatTargetUserId={chatTargetUserId}
            onChatTargetConsumed={() => setChatTargetUserId(undefined)}
          />
        );
      case 'team':
        return <HWTeamView />;
      case 'documents':
        return <HWDocumentsView />;
      case 'profile':
        return <HWProfileView onNavigate={(v) => setCurrentView(v as any)} />;
      case 'recruitment':
        return <HWRecruitmentView />;
      case 'trainings':
        return <HWTrainingsView onNavigate={(v) => setCurrentView(v as any)} />;
      case 'goals':
        return <HWGoalsView />;
      case 'approvals':
        return <HWApprovalsView />;
      default:
        return (
          <HWHomeView
            delegateName={delegateName}
            onNavigate={(v) => setCurrentView(v as any)}
          />
        );
    }
  };

  const widgetActions = { onNavigateToChat: handleNavigateToChat };
  const callOtherUser = getCallOtherUser();

  return (
    <WidgetActionsContext.Provider value={widgetActions}>
    <HWPresenceProvider>
    <HWSettingsProvider containerRef={containerRef}>
    <div ref={containerRef} className="h-[100dvh] flex flex-col lg:flex-row overflow-hidden bg-background relative">
      <DotPattern
        className="absolute inset-0 opacity-[0.025] pointer-events-none z-0 [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black_40%,transparent_100%)]"
        width={20} height={20} cx={1} cy={1} cr={1}
      />

      {/* Off-hours access guard */}
      {showGuard && (
        <HWOffHoursGuard termText={termText} onAccept={acceptTermWithPassword} />
      )}

      {/* Global incoming call banner — visible from ANY view */}
      <AnimatePresence>
        {showGlobalBanner && (
          <GlobalIncomingCallBanner
            callerName={calling.incomingCall!.callerName}
            callerAvatar={calling.incomingCall!.callerAvatar}
            callType={calling.incomingCall!.callType}
            onAccept={handleAcceptCallGlobal}
            onDecline={calling.declineCall}
          />
        )}
      </AnimatePresence>

      {/* Global incoming message banner — iOS-style */}
      <GlobalMessageBanner
        message={incomingMessage}
        onTap={(conversationId) => {
          dismissMessage();
          setChatTargetUserId(undefined); // reset
          setCurrentView('messages');
        }}
        onDismiss={dismissMessage}
      />

      {/* Active call fullscreen overlay — visible from ANY view */}
      {isInCall && currentView !== 'messages' && (
        <div className="fixed inset-0 z-[250]">
          <CommsActiveCall
            callStatus={calling.callStatus}
            callType={calling.callType}
            localStream={calling.localStream}
            remoteStreams={calling.remoteStreams}
            isMuted={calling.isMuted}
            isVideoOff={calling.isVideoOff}
            otherUserName={callOtherUser.name}
            otherUserAvatar={callOtherUser.avatar}
            onToggleMute={calling.toggleMute}
            onToggleVideo={calling.toggleVideo}
            onEndCall={calling.endCall}
          />
        </div>
      )}

      <HWSidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        sidebarOrder={sidebarOrder}
        onSidebarOrderChange={updateSidebarOrder}
        collapsed={leftCollapsed}
        onToggleCollapse={toggleLeftCollapsed}
        mobileOpen={mobileSidebarOpen}
        onMobileOpenChange={setMobileSidebarOpen}
      />

      <main className="flex-1 flex flex-col overflow-hidden min-w-0 pb-16 lg:pb-0">
        <HWHeader currentView={currentView} />

        {isSecretaria && (
          <div className="flex items-center gap-2 px-3 sm:px-4 py-1.5 shrink-0 bg-card border-b border-border">
            {delegateName ? (
              <div className="flex items-center gap-2 flex-1">
                <Shield className="h-3.5 w-3.5 text-module-trade" />
                <span className="text-xs text-muted-foreground">Atuando em nome de <strong className="text-module-trade">{delegateName}</strong></span>
                <Button variant="ghost" size="sm" className="ml-auto h-6 text-[10px] text-muted-foreground"
                  onClick={() => { setDelegateId(undefined); setDelegateName(undefined); }}>
                  Encerrar
                </Button>
              </div>
            ) : (
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5 text-module-trade"
                onClick={() => setShowDelegation(true)}>
                <Shield className="h-3.5 w-3.5" /> Atuar em nome de...
              </Button>
            )}
          </div>
        )}

        <div className="flex-1 overflow-hidden min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentView}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="h-full"
            >
              {renderView()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      <aside
        className="shrink-0 hidden xl:block overflow-hidden bg-card border-l border-border"
        style={{
          width: rightCollapsed ? 56 : 240,
          transition: 'width 400ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        <HWWorkspaceWidgets
          currentView={currentView}
          collapsed={rightCollapsed}
          onToggleCollapse={toggleRightCollapsed}
          widgetOrder={rightWidgetsOrder[currentView] || []}
          onWidgetOrderChange={(order) => updateRightWidgetsOrder(currentView, order)}
        />
      </aside>

      <HWDraggableBottomBar
        currentView={currentView === 'recruitment' || currentView === 'documents' || currentView === 'trainings' || currentView === 'approvals'
          ? (bottomTabs.includes(currentView) ? currentView as HWView : 'home')
          : currentView}
        onViewChange={setCurrentView}
        bottomTabs={bottomTabs}
        onTabsChange={updateBottomTabs}
        onOpenSidebar={() => setMobileSidebarOpen(true)}
      />

      {isSecretaria && (
        <DelegationDialog
          open={showDelegation}
          onOpenChange={setShowDelegation}
          onDelegate={(id, name) => { setDelegateId(id); setDelegateName(name); }}
          onClearDelegation={() => { setDelegateId(undefined); setDelegateName(undefined); }}
          currentDelegateId={delegateId}
        />
      )}
    </div>
    </HWSettingsProvider>
    </HWPresenceProvider>
    </WidgetActionsContext.Provider>
  );
}
