import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { StorePerformance } from "@/hooks/useStorePerformance";

export interface StoreScorePillar {
  key: 'execution' | 'consistency' | 'result' | 'adherence';
  label: string;
  score: number; // 0–100
  description: string;
}

export interface StoreScore {
  unitId: string;
  unitName: string;
  unitCity: string;
  score: number; // 0–100
  trend: number; // delta vs previous period
  pillars: StoreScorePillar[];
  topDrivers: { label: string; positive: boolean }[];
  performance?: StorePerformance;
}

/**
 * Calculates a 0–100 store score from 4 pillars:
 * 1) Execução – planned actions executed / total
 * 2) Consistência – weeks with registered activity
 * 3) Resultado – KPIs/ROI performance
 * 4) Aderência – campaigns with linked demands/executions
 */
export function useStoreScores() {
  return useQuery({
    queryKey: ['store-scores'],
    queryFn: async () => {
      // 1) Fetch current month performance
      const now = new Date();
      const currentStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      const prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];

      const [perfRes, prevPerfRes, unitsRes] = await Promise.all([
        supabase
          .from('marketing_store_performance')
          .select('*, unit:units(id, name, city)')
          .eq('period_type', 'monthly')
          .eq('period_start', currentStart),
        supabase
          .from('marketing_store_performance')
          .select('*, unit:units(id, name, city)')
          .eq('period_type', 'monthly')
          .eq('period_start', prevStart),
        supabase.from('units').select('id, name, city'),
      ]);

      const currentPerf = (perfRes.data || []) as StorePerformance[];
      const prevPerf = (prevPerfRes.data || []) as StorePerformance[];
      const units = unitsRes.data || [];

      // Build map of previous scores for trend calculation
      const prevMap = new Map<string, StorePerformance>();
      prevPerf.forEach(p => prevMap.set(p.unit_id, p));

      // Network averages for normalization
      const avgROI = currentPerf.length > 0
        ? currentPerf.reduce((s, p) => s + (p.roi || 0), 0) / currentPerf.length
        : 100;

      const scores: StoreScore[] = [];

      for (const perf of currentPerf) {
        const unit = perf.unit || units.find(u => u.id === perf.unit_id);
        if (!unit) continue;

        // Pillar 1: Execução (based on conversions vs clicks ratio)
        const execRate = perf.clicks > 0 ? (perf.conversions / perf.clicks) * 100 : 0;
        const executionScore = Math.min(100, execRate * 10); // normalize

        // Pillar 2: Consistência (based on having data across periods)
        const prevData = prevMap.get(perf.unit_id);
        const hasCurrentData = perf.revenue > 0;
        const hasPrevData = prevData && prevData.revenue > 0;
        const consistencyScore = hasCurrentData && hasPrevData ? 90 : hasCurrentData ? 60 : 20;

        // Pillar 3: Resultado (ROI relative to network average)
        const roiRatio = avgROI > 0 ? (perf.roi || 0) / avgROI : 0;
        const resultScore = Math.min(100, Math.max(0, roiRatio * 70));

        // Pillar 4: Aderência (foot traffic + conversion rate as proxy)
        const adherenceBase = perf.foot_traffic > 0 ? 40 : 0;
        const adherenceConv = Math.min(40, (perf.conversion_rate || 0) * 4);
        const adherenceExtra = perf.impressions > 0 && perf.clicks > 0 ? 20 : 0;
        const adherenceScore = Math.min(100, adherenceBase + adherenceConv + adherenceExtra);

        // Weighted score
        const score = Math.round(
          executionScore * 0.25 +
          consistencyScore * 0.25 +
          resultScore * 0.30 +
          adherenceScore * 0.20
        );

        // Trend: compare with previous period score
        let trend = 0;
        if (prevData) {
          const prevROIRatio = avgROI > 0 ? (prevData.roi || 0) / avgROI : 0;
          const prevScore = Math.round(prevROIRatio * 70 * 0.3 + 60 * 0.25 + 50 * 0.25 + 50 * 0.2);
          trend = score - prevScore;
        }

        // Top 2 drivers
        const pillars: StoreScorePillar[] = [
          { key: 'execution', label: 'Execução', score: Math.round(executionScore), description: 'Ações planejadas executadas' },
          { key: 'consistency', label: 'Consistência', score: Math.round(consistencyScore), description: 'Regularidade de registros' },
          { key: 'result', label: 'Resultado', score: Math.round(resultScore), description: 'ROI e KPIs vs rede' },
          { key: 'adherence', label: 'Aderência', score: Math.round(adherenceScore), description: 'Campanhas vinculadas' },
        ];

        const sorted = [...pillars].sort((a, b) => b.score - a.score);
        const topDrivers = [
          { label: sorted[0].label, positive: sorted[0].score >= 60 },
          { label: sorted[sorted.length - 1].label, positive: sorted[sorted.length - 1].score >= 60 },
        ];

        scores.push({
          unitId: perf.unit_id,
          unitName: unit.name,
          unitCity: unit.city,
          score,
          trend,
          pillars,
          topDrivers,
          performance: perf,
        });
      }

      return scores.sort((a, b) => b.score - a.score);
    },
  });
}
