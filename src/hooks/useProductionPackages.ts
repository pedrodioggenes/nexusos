import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { addDays, format } from "date-fns";
import type { DemandType, DemandPriority } from "@/hooks/useMarketingDemands";

interface PackageDemandDef {
  title: string;
  type: DemandType;
  priority: DemandPriority;
  dayOffset: number; // days from today
}

const DEFAULT_PACKAGE_DEMANDS: PackageDemandDef[] = [
  { title: "Briefing e Referências", type: "general", priority: "high", dayOffset: 1 },
  { title: "Criação de Arte / Design", type: "design", priority: "high", dayOffset: 3 },
  { title: "Redação / Copywriting", type: "copywriting", priority: "medium", dayOffset: 3 },
  { title: "Produção de Vídeo", type: "video", priority: "medium", dayOffset: 5 },
  { title: "Publicação Social Media", type: "social_media", priority: "high", dayOffset: 7 },
];

export function useCreateProductionPackage() {
  const queryClient = useQueryClient();
  const { user, tenant } = useAuth();

  return useMutation({
    mutationFn: async (input: {
      name: string;
      campaignId?: string;
      customDemands?: PackageDemandDef[];
    }) => {
      if (!tenant?.id || !user?.id) throw new Error("Sessão inválida");

      const demandsToCreate = input.customDemands || DEFAULT_PACKAGE_DEMANDS;
      const today = new Date();

      // 1. Create the package record
      const { data: pkg, error: pkgError } = await supabase
        .from("demand_packages")
        .insert({
          name: input.name,
          tenant_id: tenant.id,
          created_by: user.id,
          context: { campaign_id: input.campaignId || null },
        })
        .select()
        .single();

      if (pkgError) throw pkgError;

      // 2. Create all demands
      const demandInserts = demandsToCreate.map((d) => ({
        title: `[${input.name}] ${d.title}`,
        type: d.type,
        priority: d.priority,
        status: "open" as const,
        tenant_id: tenant.id,
        created_by: user.id,
        due_date: format(addDays(today, d.dayOffset), "yyyy-MM-dd"),
        campaign_id: input.campaignId || null,
        tags: ["pacote", input.name.toLowerCase().replace(/\s+/g, "-")],
      }));

      const { data: createdDemands, error: demandsError } = await supabase
        .from("marketing_demands")
        .insert(demandInserts)
        .select("id");

      if (demandsError) throw demandsError;

      // 3. Link demands to package
      if (createdDemands && createdDemands.length > 0) {
        const linkInserts = createdDemands.map((d) => ({
          package_id: pkg.id,
          demand_id: d.id,
          tenant_id: tenant.id,
        }));

        const { error: linkError } = await supabase
          .from("demand_package_items")
          .insert(linkInserts);

        if (linkError) throw linkError;
      }

      return { package: pkg, demandsCount: createdDemands?.length || 0 };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["marketing-demands"] });
      queryClient.invalidateQueries({ queryKey: ["demand-stats"] });
      toast.success(`Pacote "${result.package.name}" criado com ${result.demandsCount} demandas!`);
    },
    onError: (err: Error) => {
      toast.error(`Erro ao criar pacote: ${err.message}`);
    },
  });
}
