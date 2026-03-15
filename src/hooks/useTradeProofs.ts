import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const BUCKET = "trade-proofs";

function isProbablyUrl(value: string) {
  return /^https?:\/\//i.test(value);
}

function guessFileKind(value: string) {
  const v = value.toLowerCase();
  if (v.includes(".pdf")) return "pdf";
  if (v.match(/\.(png|jpg|jpeg|webp|gif)(\?|$)/)) return "image";
  return "file";
}

async function resolveProofDisplayUrl(imageUrlOrPath: string | null) {
  if (!imageUrlOrPath) return null;
  if (isProbablyUrl(imageUrlOrPath)) return imageUrlOrPath;

  // treat as storage path
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(imageUrlOrPath, 60 * 60); // 1h

  if (error) {
    // fallback: return null; UI handles it
    return null;
  }
  return data.signedUrl;
}

export function useTradeProofs() {
  return useQuery({
    queryKey: ["trade-proofs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_proofs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = await Promise.all(
        (data ?? []).map(async (p: any) => {
          const displayUrl = await resolveProofDisplayUrl(p.image_url);
          const kind = guessFileKind(p.image_url ?? displayUrl ?? "");
          return {
            ...p,
            file_path: p.image_url, // keep original path
            display_url: displayUrl ?? (isProbablyUrl(p.image_url) ? p.image_url : null),
            file_kind: kind,
          };
        })
      );

      return mapped;
    },
  });
}

export function useTradeProofsWithDetails() {
  return useQuery({
    queryKey: ["trade-proofs-with-details"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_proofs")
        .select(
          `
          *,
          checklist_item:trade_checklist_items(
            id, title, status, package_id,
            package:trade_packages(
              id, name, supplier_id,
              supplier:suppliers(id, name)
            )
          )
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      const mapped = await Promise.all(
        (data ?? []).map(async (p: any) => {
          const displayUrl = await resolveProofDisplayUrl(p.image_url);
          const kind = guessFileKind(p.image_url ?? displayUrl ?? "");
          return {
            ...p,
            file_path: p.image_url,
            display_url: displayUrl ?? (isProbablyUrl(p.image_url) ? p.image_url : null),
            file_kind: kind,
            checklist_title: p.checklist_item?.title ?? null,
            package_name: p.checklist_item?.package?.name ?? null,
            supplier_name: p.checklist_item?.package?.supplier?.name ?? null,
            checklist_item_id: p.checklist_item?.id ?? p.checklist_item_id,
          };
        })
      );

      return mapped;
    },
  });
}

export function useCreateTradeProof() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      checklist_item_id: string;
      storage_path: string; // we store path in image_url
      description?: string;
    }) => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("trade_proofs")
        .insert({
          checklist_item_id: payload.checklist_item_id,
          image_url: payload.storage_path, // IMPORTANT: store path here
          status: "pending",
          uploaded_by: user.id,
          description: payload.description ?? null,
        })
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-proofs"] });
      qc.invalidateQueries({ queryKey: ["trade-proofs-with-details"] });
      qc.invalidateQueries({ queryKey: ["trade-checklists"] });
      qc.invalidateQueries({ queryKey: ["trade-checklists-grouped"] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Falha ao criar comprovação");
    },
  });
}

export function useApproveProof() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { id: string; approve: boolean; notes?: string }) => {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();

      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated");

      const status = payload.approve ? "approved" : "rejected";

      const { data, error } = await supabase
        .from("trade_proofs")
        .update({
          status,
          reviewed_by: user.id,
          reviewed_at: new Date().toISOString(),
          review_notes: payload.notes ?? null,
        })
        .eq("id", payload.id)
        .select()
        .single();

      if (error) throw error;

      return data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["trade-proofs"] });
      qc.invalidateQueries({ queryKey: ["trade-proofs-with-details"] });
      qc.invalidateQueries({ queryKey: ["trade-checklists"] });
      qc.invalidateQueries({ queryKey: ["trade-checklists-grouped"] });
      qc.invalidateQueries({ queryKey: ["notifications"] });
    },
    onError: (err: any) => {
      toast.error(err?.message ?? "Falha ao atualizar comprovação");
    },
  });
}

// Backward compatibility exports
export type TradeProof = any;
export type TradeProofInsert = any;
export type TradeProofUpdate = any;
export interface TradeProofWithDetails extends TradeProof {
  checklist_title?: string;
  package_name?: string;
  supplier_name?: string;
  display_url?: string | null;
  file_kind?: string | null;
}

export function useUpdateTradeProof() {
  return useApproveProof();
}
