import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ActivityEvent {
  id: string;
  type:
    | "demand_created"
    | "demand_updated"
    | "campaign_created"
    | "campaign_updated"
    | "alert_created"
    | "alert_resolved"
    | "transaction_created"
    | "document_created"
    | "document_updated"
    | "plan_created"
    | "plan_updated";
  title: string;
  description?: string;
  timestamp: Date;
  link?: string;
}

export type ActivityCategory =
  | "all"
  | "demanda"
  | "campanha"
  | "alerta"
  | "financeiro"
  | "documento"
  | "planejamento";

const TYPE_TO_CATEGORY: Record<ActivityEvent["type"], ActivityCategory> = {
  demand_created: "demanda",
  demand_updated: "demanda",
  campaign_created: "campanha",
  campaign_updated: "campanha",
  alert_created: "alerta",
  alert_resolved: "alerta",
  transaction_created: "financeiro",
  document_created: "documento",
  document_updated: "documento",
  plan_created: "planejamento",
  plan_updated: "planejamento",
};

export function getActivityCategory(type: ActivityEvent["type"]): ActivityCategory {
  return TYPE_TO_CATEGORY[type] ?? "all";
}

/**
 * Aggregates real activity events from multiple existing tables.
 * No new tables or RLS needed – read-only queries.
 */
export function useActivityFeed() {
  return useQuery({
    queryKey: ["activity-feed"],
    queryFn: async () => {
      const events: ActivityEvent[] = [];

      // Run all queries in parallel; each one is independent and non-blocking
      const [demands, campaigns, transactions, alerts, documents, plans] =
        await Promise.allSettled([
          supabase
            .from("marketing_demands")
            .select("id, title, status, created_at, updated_at")
            .order("updated_at", { ascending: false })
            .limit(50),
          supabase
            .from("marketing_campaigns")
            .select("id, name, status, created_at, updated_at")
            .order("updated_at", { ascending: false })
            .limit(50),
          supabase
            .from("financial_transactions")
            .select("id, description, type, amount, category, created_at")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("marketing_alerts")
            .select("id, title, type, severity, is_resolved, resolved_at, created_at")
            .order("created_at", { ascending: false })
            .limit(50),
          supabase
            .from("workspace_pages")
            .select("id, title, created_at, updated_at")
            .order("updated_at", { ascending: false })
            .limit(50),
          supabase
            .from("marketing_plans")
            .select("id, title, status, created_at, updated_at")
            .order("updated_at", { ascending: false })
            .limit(30),
        ]);

      // --- Demands ---
      if (demands.status === "fulfilled" && demands.value.data) {
        for (const d of demands.value.data) {
          const wasUpdated =
            d.updated_at &&
            d.created_at &&
            new Date(d.updated_at).getTime() - new Date(d.created_at).getTime() > 60_000;

          events.push({
            id: `demand-c-${d.id}`,
            type: "demand_created",
            title: `Demanda criada: "${d.title}"`,
            timestamp: new Date(d.created_at),
            link: "/app/marketing/demandas",
          });

          if (wasUpdated) {
            events.push({
              id: `demand-u-${d.id}`,
              type: "demand_updated",
              title: `Demanda atualizada: "${d.title}"`,
              description: `Status: ${d.status}`,
              timestamp: new Date(d.updated_at),
              link: "/app/marketing/demandas",
            });
          }
        }
      }

      // --- Campaigns ---
      if (campaigns.status === "fulfilled" && campaigns.value.data) {
        for (const c of campaigns.value.data) {
          const wasUpdated =
            c.updated_at &&
            c.created_at &&
            new Date(c.updated_at).getTime() - new Date(c.created_at).getTime() > 60_000;

          events.push({
            id: `campaign-c-${c.id}`,
            type: "campaign_created",
            title: `Campanha criada: "${c.name}"`,
            timestamp: new Date(c.created_at),
            link: "/app/marketing/campanhas",
          });

          if (wasUpdated) {
            events.push({
              id: `campaign-u-${c.id}`,
              type: "campaign_updated",
              title: `Campanha atualizada: "${c.name}"`,
              description: `Status: ${c.status}`,
              timestamp: new Date(c.updated_at),
              link: "/app/marketing/campanhas",
            });
          }
        }
      }

      // --- Financial transactions ---
      if (transactions.status === "fulfilled" && transactions.value.data) {
        for (const t of transactions.value.data) {
          const label = t.type === "receita" ? "Receita" : "Custo";
          const amount = new Intl.NumberFormat("pt-BR", {
            style: "currency",
            currency: "BRL",
            minimumFractionDigits: 0,
          }).format(Number(t.amount));

          events.push({
            id: `tx-${t.id}`,
            type: "transaction_created",
            title: `${label} registrada: ${t.description}`,
            description: `${amount} — ${t.category}`,
            timestamp: new Date(t.created_at),
            link: "/app/marketing/financeiro",
          });
        }
      }

      // --- Alerts ---
      if (alerts.status === "fulfilled" && alerts.value.data) {
        for (const a of alerts.value.data) {
          events.push({
            id: `alert-c-${a.id}`,
            type: "alert_created",
            title: `Alerta: ${a.title}`,
            description: `Severidade: ${a.severity}`,
            timestamp: new Date(a.created_at),
            link: "/app/marketing/alertas",
          });

          if (a.is_resolved && a.resolved_at) {
            events.push({
              id: `alert-r-${a.id}`,
              type: "alert_resolved",
              title: `Alerta resolvido: ${a.title}`,
              timestamp: new Date(a.resolved_at),
              link: "/app/marketing/alertas",
            });
          }
        }
      }

      // --- Documents ---
      if (documents.status === "fulfilled" && documents.value.data) {
        for (const doc of documents.value.data) {
          const wasUpdated =
            doc.updated_at &&
            doc.created_at &&
            new Date(doc.updated_at).getTime() - new Date(doc.created_at).getTime() > 60_000;

          events.push({
            id: `doc-c-${doc.id}`,
            type: "document_created",
            title: `Documento criado: "${doc.title}"`,
            timestamp: new Date(doc.created_at),
            link: `/app/marketing/documentos/${doc.id}`,
          });

          if (wasUpdated) {
            events.push({
              id: `doc-u-${doc.id}`,
              type: "document_updated",
              title: `Documento editado: "${doc.title}"`,
              timestamp: new Date(doc.updated_at),
              link: `/app/marketing/documentos/${doc.id}`,
            });
          }
        }
      }

      // --- Plans ---
      if (plans.status === "fulfilled" && plans.value.data) {
        for (const p of plans.value.data) {
          const wasUpdated =
            p.updated_at &&
            p.created_at &&
            new Date(p.updated_at).getTime() - new Date(p.created_at).getTime() > 60_000;

          events.push({
            id: `plan-c-${p.id}`,
            type: "plan_created",
            title: `Plano criado: "${p.title}"`,
            timestamp: new Date(p.created_at),
            link: "/app/marketing/planejamento",
          });

          if (wasUpdated) {
            events.push({
              id: `plan-u-${p.id}`,
              type: "plan_updated",
              title: `Plano atualizado: "${p.title}"`,
              description: `Status: ${p.status}`,
              timestamp: new Date(p.updated_at),
              link: "/app/marketing/planejamento",
            });
          }
        }
      }

      // Sort all events by timestamp descending
      events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      return events;
    },
    staleTime: 60_000, // 1 min cache
  });
}
