import { useMemo } from "react";
import { useMarketingAlerts } from "@/hooks/useMarketingAlerts";
import { useDemandStats } from "@/hooks/useMarketingDemands";
import { useMarketingPlans } from "@/hooks/useMarketingPlans";
import { useMarketingCampaigns } from "@/hooks/useMarketingCampaigns";
import { useTeamTasks } from "@/hooks/useTeamTasks";
import { useRetailActions } from "@/hooks/useRetailActions";
import { useFinancialSummary } from "@/hooks/useFinancialTransactions";
import { useMarketingBudgets } from "@/hooks/useMarketingBudgets";

// All hooks run in parallel via React Query — no N+1
export function useDashboardSummary() {
  const { data: alerts = [] } = useMarketingAlerts({ unreadOnly: false });
  const { data: demandStats } = useDemandStats();
  const { data: plans } = useMarketingPlans();
  const { data: campaigns } = useMarketingCampaigns();
  const { data: tasks } = useTeamTasks();
  const { actions } = useRetailActions();
  const { data: financialSummary } = useFinancialSummary();
  const { data: budget } = useMarketingBudgets();

  return useMemo(() => {
    const now = new Date();
    const today = now.toISOString().split("T")[0];
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    // --- Alerts ---
    const unresolvedAlerts = alerts.filter(a => !a.is_resolved);
    const criticalCount = unresolvedAlerts.filter(a => a.severity === "critical").length;
    const warningCount = unresolvedAlerts.filter(a => a.severity === "warning").length;

    // --- Demands ---
    const overdueDemands = demandStats?.overdue || 0;
    const urgentDemands = demandStats?.urgent || 0;
    const pendingDemands = (demandStats?.open || 0) + (demandStats?.inProgress || 0);

    // --- Plans this week ---
    const plansThisWeek = (plans || []).filter(p => {
      if (!p.start_date) return false;
      return p.start_date >= today && p.start_date <= weekEndStr;
    });
    const plansToday = (plans || []).filter(p => p.start_date === today);

    // --- Campaigns ---
    const allCampaigns = campaigns || [];
    const activeCampaigns = allCampaigns.filter(c => c.status === "active");
    const pendingApproval = allCampaigns.filter(c => c.status === "pending_approval");
    const campaignsWithoutROI = activeCampaigns.filter(c => !c.actual_roi || c.actual_roi === 0);
    const overdueApprovals = pendingApproval.filter(c => {
      if (!c.approval_deadline) return false;
      return c.approval_deadline < today;
    });

    // --- Tasks (team production) ---
    const allTasks = tasks || [];
    const tasksByArea = {
      social: allTasks.filter(t => t.task_type === "social" && t.status !== "done"),
      design: allTasks.filter(t => t.task_type === "design" && t.status !== "done"),
      copy: allTasks.filter(t => t.task_type === "copy" && t.status !== "done"),
      traffic: allTasks.filter(t => t.task_type === "traffic" && t.status !== "done"),
      video: allTasks.filter(t => t.task_type === "video" && t.status !== "done"),
    };
    const overdueTasks = allTasks.filter(t => t.deadline && t.deadline < today && t.status !== "done");
    const tasksInReview = allTasks.filter(t => t.status === "review");

    // --- Retail Actions ---
    const runningActions = actions.filter(a => a.status === "running");
    const plannedActions = actions.filter(a => a.status === "planned");

    // --- Budget ---
    const totalBudget = budget?.total_budget || 0;
    const categories = budget?.marketing_budget_categories || [];
    const totalSpent = categories.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0);
    const budgetUsagePercent = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    // --- Composite urgency score (0-100) ---
    const urgencyScore = Math.min(100,
      criticalCount * 25 +
      warningCount * 10 +
      overdueDemands * 15 +
      overdueApprovals.length * 20 +
      overdueTasks.length * 10 +
      (budgetUsagePercent > 90 ? 20 : 0)
    );

    return {
      alerts: { total: unresolvedAlerts.length, critical: criticalCount, warning: warningCount },
      demands: { overdue: overdueDemands, urgent: urgentDemands, pending: pendingDemands, total: demandStats?.total || 0 },
      plans: { thisWeek: plansThisWeek, today: plansToday, total: plans?.length || 0 },
      campaigns: {
        active: activeCampaigns.length,
        pendingApproval: pendingApproval.length,
        overdueApprovals: overdueApprovals.length,
        withoutROI: campaignsWithoutROI.length,
        total: allCampaigns.length,
      },
      tasks: { byArea: tasksByArea, overdue: overdueTasks.length, inReview: tasksInReview.length },
      retail: { running: runningActions.length, planned: plannedActions.length, total: actions.length },
      budget: { total: totalBudget, spent: totalSpent, percent: budgetUsagePercent },
      financial: financialSummary || null,
      urgencyScore,
    };
  }, [alerts, demandStats, plans, campaigns, tasks, actions, financialSummary, budget]);
}
