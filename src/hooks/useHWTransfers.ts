import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function useTransferMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (transfer: {
      user_id: string;
      from_team_id: string;
      to_team_id: string;
      tenant_id: string;
      transferred_by: string;
      reason?: string;
      member_record_id: string; // hw_team_members.id to delete
    }) => {
      // 1. Record transfer history
      const { error: histErr } = await supabase
        .from("hw_member_transfers")
        .insert([{
          user_id: transfer.user_id,
          from_team_id: transfer.from_team_id,
          to_team_id: transfer.to_team_id,
          tenant_id: transfer.tenant_id,
          transferred_by: transfer.transferred_by,
          reason: transfer.reason || null,
        }]);
      if (histErr) throw histErr;

      // 2. Remove from old team
      const { error: delErr } = await supabase
        .from("hw_team_members")
        .delete()
        .eq("id", transfer.member_record_id);
      if (delErr) throw delErr;

      // 3. Add to new team
      const { error: addErr } = await supabase
        .from("hw_team_members")
        .insert([{ team_id: transfer.to_team_id, user_id: transfer.user_id }]);
      if (addErr) throw addErr;

      return true;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["hw-departments"] });
    },
  });
}
