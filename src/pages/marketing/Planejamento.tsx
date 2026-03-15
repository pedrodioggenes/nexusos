import { useState, useCallback, useMemo } from 'react';
import { Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useCreateMarketingPlan,
  useUpdateMarketingPlan,
  useDeleteMarketingPlan,
  useDuplicateMarketingPlan,
  MarketingPlan,
} from '@/hooks/useMarketingPlans';
import { useUnifiedCalendarEvents, CalendarEvent, CalendarEventSource } from '@/hooks/useUnifiedCalendarEvents';
import { MarketingPlanDialog } from '@/components/marketing/MarketingPlanDialog';
import { DayDetailSheet } from '@/components/marketing/DayDetailSheet';
import { toast } from 'sonner';
import { parseISO, isSameDay } from 'date-fns';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Calendar components
import { CalendarHeader, CalendarViewMode, CalendarFilters } from '@/components/marketing/calendar/CalendarHeader';
import { CalendarGrid } from '@/components/marketing/calendar/CalendarGrid';
import { CalendarWeekView } from '@/components/marketing/calendar/CalendarWeekView';
import { CalendarAgendaView } from '@/components/marketing/calendar/CalendarAgendaView';
import { CalendarTimelineView } from '@/components/marketing/calendar/CalendarTimelineView';
import { CalendarSidebar } from '@/components/marketing/calendar/CalendarSidebar';
import { useCalendarKeyboard } from '@/components/marketing/calendar/useCalendarKeyboard';

export default function Planejamento() {
  const navigate = useNavigate();

  // View state
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<CalendarViewMode>("month");
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<CalendarFilters>({ types: [], statuses: [], sources: [] });
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Dialogs
  const [daySheetOpen, setDaySheetOpen] = useState(false);
  const [planDialogOpen, setPlanDialogOpen] = useState(false);
  const [editingPlan, setEditingPlan] = useState<MarketingPlan | null>(null);
  const [deletePlanId, setDeletePlanId] = useState<string | null>(null);

  // Data - unified
  const { data: allEvents, isLoading } = useUnifiedCalendarEvents();
  const createPlan = useCreateMarketingPlan();
  const updatePlan = useUpdateMarketingPlan();
  const deletePlan = useDeleteMarketingPlan();
  const duplicatePlan = useDuplicateMarketingPlan();

  // Filter events
  const filteredEvents = useMemo(() => {
    let result = allEvents || [];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(e => e.title.toLowerCase().includes(q) || e.description?.toLowerCase().includes(q));
    }
    if (filters.types.length > 0) {
      result = result.filter(e => filters.types.includes(e.type));
    }
    if (filters.statuses.length > 0) {
      result = result.filter(e => filters.statuses.includes(e.status));
    }
    if (filters.sources && filters.sources.length > 0) {
      result = result.filter(e => filters.sources!.includes(e.source));
    }
    return result;
  }, [allEvents, searchQuery, filters]);

  // Navigation
  const handlePrevMonth = useCallback(() => {
    if (currentMonth === 0) { setCurrentMonth(11); setCurrentYear(y => y - 1); }
    else setCurrentMonth(m => m - 1);
  }, [currentMonth]);

  const handleNextMonth = useCallback(() => {
    if (currentMonth === 11) { setCurrentMonth(0); setCurrentYear(y => y + 1); }
    else setCurrentMonth(m => m + 1);
  }, [currentMonth]);

  const handleToday = useCallback(() => {
    const now = new Date();
    setCurrentMonth(now.getMonth());
    setCurrentYear(now.getFullYear());
    setSelectedDate(now);
  }, []);

  const handleMonthChange = useCallback((month: number, year: number) => {
    setCurrentMonth(month);
    setCurrentYear(year);
  }, []);

  // Event handlers
  const handleDayClick = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const handleDayDoubleClick = useCallback((date: Date) => {
    setSelectedDate(date);
    setEditingPlan(null);
    setPlanDialogOpen(true);
  }, []);

  const handleNewAction = useCallback(() => {
    setEditingPlan(null);
    setPlanDialogOpen(true);
  }, []);

  // Contextual navigation based on event source
  const handleEventClick = useCallback((event: CalendarEvent) => {
    switch (event.source) {
      case 'marketing_plan':
        setDaySheetOpen(false);
        setEditingPlan(event.originalData as MarketingPlan);
        setPlanDialogOpen(true);
        break;
      case 'demand':
        navigate(`/app/marketing/demandas?id=${event.id}`);
        break;
      case 'retail_action':
        navigate(`/app/marketing/acoes`);
        break;
      case 'campaign':
        navigate(`/app/marketing/campanhas`);
        break;
      case 'briefing':
        break;
      case 'execution':
        navigate(`/app/marketing/execucoes`);
        break;
      default:
        break;
    }
  }, [navigate]);

  const handleDeleteAction = useCallback((event: CalendarEvent) => {
    if (event.source === 'marketing_plan') {
      setDeletePlanId(event.id);
    }
  }, []);

  const handleDeleteById = useCallback((eventId: string) => {
    setDaySheetOpen(false);
    setDeletePlanId(eventId);
  }, []);

  const handleDuplicateAction = useCallback(async (event: CalendarEvent) => {
    if (event.source === 'marketing_plan') {
      try {
        await duplicatePlan.mutateAsync(event.originalData as MarketingPlan);
        toast.success('Ação duplicada!');
      } catch {
        toast.error('Erro ao duplicar');
      }
    }
  }, [duplicatePlan]);

  const handleEventDrop = useCallback(async (event: CalendarEvent, newDate: Date) => {
    if (event.source === 'marketing_plan') {
      try {
        const dateStr = newDate.toISOString().split('T')[0];
        await updatePlan.mutateAsync({ id: event.id, start_date: dateStr });
        toast.success('Evento reagendado!');
      } catch {
        toast.error('Erro ao reagendar');
      }
    } else {
      toast.info('Reagendamento disponível apenas para Planos de Marketing');
    }
  }, [updatePlan]);

  const handleSavePlan = async (data: Partial<MarketingPlan>) => {
    try {
      if (editingPlan) {
        await updatePlan.mutateAsync({ id: editingPlan.id, ...data });
        toast.success('Ação atualizada!');
      } else {
        await createPlan.mutateAsync({ type: data.type || 'campaign', title: data.title || '', ...data });
        toast.success('Ação criada!');
      }
      setEditingPlan(null);
    } catch {
      toast.error('Erro ao salvar ação');
      throw new Error('save failed');
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletePlanId) return;
    try {
      await deletePlan.mutateAsync(deletePlanId);
      toast.success('Ação excluída!');
      setDeletePlanId(null);
    } catch {
      toast.error('Erro ao excluir ação');
    }
  };

  const handleSidebarEventClick = useCallback((event: CalendarEvent) => {
    if (event.start_date) {
      const date = parseISO(event.start_date);
      setSelectedDate(date);
      setCurrentMonth(date.getMonth());
      setCurrentYear(date.getFullYear());
    }
    handleEventClick(event);
  }, [handleEventClick]);

  // Events for selected day
  const eventsForSelectedDay = useMemo(() => {
    if (!selectedDate) return [];
    return filteredEvents.filter(e => e.start_date && isSameDay(parseISO(e.start_date), selectedDate));
  }, [filteredEvents, selectedDate]);

  // Keyboard shortcuts
  useCalendarKeyboard({
    onNewEvent: handleNewAction,
    onToday: handleToday,
    onPreviousMonth: handlePrevMonth,
    onNextMonth: handleNextMonth,
    onEscape: () => {
      setDaySheetOpen(false);
      setPlanDialogOpen(false);
    },
  });

  return (
    <PageWrapper
      title="Calendário Executivo"
      subtitle="Radar unificado de datas · N novo · T hoje · ←→ navegar"
      icon={<Calendar className="h-5 w-5 text-app-gestao" />}
      hideHeader
    >
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="shrink-0 pb-3">
          <CalendarHeader
            currentMonth={currentMonth}
            currentYear={currentYear}
            viewMode={viewMode}
            searchQuery={searchQuery}
            filters={filters}
            onPreviousMonth={handlePrevMonth}
            onNextMonth={handleNextMonth}
            onToday={handleToday}
            onViewModeChange={setViewMode}
            onSearchChange={setSearchQuery}
            onFiltersChange={setFilters}
            onNewAction={handleNewAction}
          />
        </div>

        {/* Content area with sidebar */}
        <div className="flex flex-1 min-h-0">
          <CalendarSidebar
            open={sidebarOpen}
            onToggle={() => setSidebarOpen(o => !o)}
            currentMonth={currentMonth}
            currentYear={currentYear}
            selectedDate={selectedDate}
            events={filteredEvents}
            onMonthChange={handleMonthChange}
            onDateSelect={(date) => {
              setSelectedDate(date);
              setCurrentMonth(date.getMonth());
              setCurrentYear(date.getFullYear());
            }}
            onEventClick={handleSidebarEventClick}
          />

          {/* Main calendar view */}
          <div className="flex-1 overflow-auto min-w-0">
            {isLoading ? (
              <div className="space-y-2 p-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-[500px] w-full rounded-xl" />
              </div>
            ) : (
              <>
                {viewMode === "month" && (
                  <CalendarGrid
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    events={filteredEvents}
                    selectedDate={selectedDate}
                    onDayClick={handleDayClick}
                    onDayDoubleClick={handleDayDoubleClick}
                    onEventEdit={handleEventClick}
                    onEventDelete={handleDeleteAction}
                    onEventDuplicate={handleDuplicateAction}
                    onEventDrop={handleEventDrop}
                  />
                )}

                {viewMode === "week" && (
                  <CalendarWeekView
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    events={filteredEvents}
                    selectedDate={selectedDate}
                    onDayClick={handleDayClick}
                    onEventEdit={handleEventClick}
                    onEventDelete={handleDeleteAction}
                    onEventDuplicate={handleDuplicateAction}
                  />
                )}

                {viewMode === "agenda" && (
                  <CalendarAgendaView
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    events={filteredEvents}
                    onEventEdit={handleEventClick}
                    onEventDelete={handleDeleteAction}
                    onEventDuplicate={handleDuplicateAction}
                  />
                )}

                {viewMode === "timeline" && (
                  <CalendarTimelineView
                    currentMonth={currentMonth}
                    currentYear={currentYear}
                    events={filteredEvents}
                    onEventEdit={handleEventClick}
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Day Detail Sheet */}
      <DayDetailSheet
        open={daySheetOpen}
        onOpenChange={setDaySheetOpen}
        selectedDate={selectedDate}
        events={eventsForSelectedDay}
        onNewAction={() => { setDaySheetOpen(false); handleNewAction(); }}
        onEditAction={handleEventClick}
        onDeleteAction={handleDeleteById}
      />

      {/* Marketing Plan Dialog */}
      <MarketingPlanDialog
        open={planDialogOpen}
        onOpenChange={(open) => {
          setPlanDialogOpen(open);
          if (!open) setEditingPlan(null);
        }}
        plan={editingPlan}
        defaultDate={selectedDate}
        onSave={handleSavePlan}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletePlanId} onOpenChange={() => setDeletePlanId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir ação?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O evento será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageWrapper>
  );
}
