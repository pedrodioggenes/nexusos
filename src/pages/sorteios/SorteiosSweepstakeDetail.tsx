import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { toast } from "sonner";
import {
  ArrowLeft, Trophy, Users, Ticket, ShieldCheck, Clock,
  CheckCircle, XCircle, AlertTriangle, Shuffle, Loader2, Copy, ExternalLink, Server
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function SorteiosSweepstakeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: tenantId } = useHWTenantId();
  const [sweepstake, setSweepstake] = useState<any>(null);
  const [coupons, setCoupons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawing, setDrawing] = useState(false);
  const [stats, setStats] = useState({ total: 0, validados: 0, pendentes: 0, rejeitados: 0, participantesUnicos: 0 });

  const fetchData = async () => {
    if (!id || !tenantId) return;
    setLoading(true);
    const [swRes, couponsRes] = await Promise.all([
      supabase.from("sorteios_sweepstakes").select("*, sorteios_participants(nome, cpf)").eq("id", id).single(),
      supabase.from("sorteios_coupons").select("*, sorteios_participants(nome, cpf, whatsapp)").eq("sorteio_id", id).order("created_at", { ascending: false }),
    ]);
    if (swRes.data) setSweepstake(swRes.data);
    const c = couponsRes.data ?? [];
    setCoupons(c);
    const uniqueP = new Set(c.map((cp: any) => cp.participant_id));
    setStats({
      total: c.length,
      validados: c.filter((cp: any) => cp.status === "validado").length,
      pendentes: c.filter((cp: any) => cp.status === "pendente").length,
      rejeitados: c.filter((cp: any) => cp.status === "rejeitado" || cp.status === "fraudulento").length,
      participantesUnicos: uniqueP.size,
    });
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id, tenantId]);

  const updateCouponStatus = async (couponId: string, status: "validado" | "rejeitado" | "fraudulento") => {
    const { error } = await supabase.from("sorteios_coupons").update({ status, validated_at: new Date().toISOString() }).eq("id", couponId);
    if (error) { toast.error("Erro ao atualizar"); return; }
    toast.success(`Cupom ${status}`);
    fetchData();
  };

  const runDraw = async () => {
    if (!id || !tenantId) return;
    setDrawing(true);
    const { data: eligible } = await supabase
      .from("sorteios_coupons")
      .select("*, sorteios_participants!inner(id, nome, cpf, status)")
      .eq("sorteio_id", id)
      .eq("status", "validado")
      .eq("sorteios_participants.status", "ativo");
    if (!eligible || eligible.length === 0) {
      toast.error("Nenhum cupom elegível");
      setDrawing(false);
      return;
    }
    const winner = eligible[Math.floor(Math.random() * eligible.length)];
    const { error } = await supabase.from("sorteios_sweepstakes").update({ winner_id: winner.participant_id, status: "encerrado" as const }).eq("id", id);
    if (error) { toast.error("Erro ao sortear"); setDrawing(false); return; }
    toast.success(`🎉 Vencedor: ${winner.sorteios_participants?.nome}`);
    setDrawing(false);
    fetchData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  if (!sweepstake) return <div className="text-center py-20 text-muted-foreground">Sorteio não encontrado</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/app/sorteios/campanhas")} className="p-2 rounded-lg border border-border hover:bg-muted transition-colors">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-semibold text-foreground">{sweepstake.titulo}</h2>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sweepstake.status === "ativo" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"}`}>
              {sweepstake.status === "ativo" ? "Ativo" : "Encerrado"}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">{sweepstake.nome_empresa} · {new Date(sweepstake.data_inicio).toLocaleDateString("pt-BR")} — {new Date(sweepstake.data_fim).toLocaleDateString("pt-BR")}</p>
        </div>
      </div>

      {sweepstake.winner_id && sweepstake.sorteios_participants && (
        <div className="rounded-xl p-4 border border-success/30 bg-success/5 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-success" />
          <div>
            <p className="font-bold text-sm text-foreground">🎉 Vencedor: {sweepstake.sorteios_participants.nome}</p>
            <p className="text-xs text-muted-foreground">CPF: {sweepstake.sorteios_participants.cpf}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Cupons Total", value: stats.total, icon: Ticket, color: "text-module-sorteios" },
          { label: "Participantes", value: stats.participantesUnicos, icon: Users, color: "text-module-sorteios" },
          { label: "Validados", value: stats.validados, icon: ShieldCheck, color: "text-success" },
          { label: "Pendentes", value: stats.pendentes, icon: Clock, color: "text-accent" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card rounded-xl p-3 border border-border">
            <div className="flex items-center gap-2 mb-1">
              <Icon className={`w-3.5 h-3.5 ${color}`} />
              <span className="text-[10px] text-muted-foreground">{label}</span>
            </div>
            <p className="text-xl font-bold text-foreground">{value}</p>
          </div>
        ))}
      </div>

      {sweepstake.status === "ativo" && (
        <button onClick={runDraw} disabled={drawing}
          className="w-full py-3 rounded-xl text-sm font-bold text-primary-foreground bg-primary hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          {drawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
          {drawing ? "Sorteando..." : `🎲 Realizar Sorteio (${stats.validados} elegíveis)`}
        </button>
      )}

      <div className="bg-card rounded-xl border border-border">
        <div className="p-3 border-b border-border flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-module-sorteios" />
          <h3 className="text-sm font-semibold text-foreground">Validação de Cupons</h3>
          <span className="text-[10px] text-muted-foreground ml-auto">{coupons.length} cupons</span>
        </div>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Cupom</TableHead>
                <TableHead>Participante</TableHead>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {coupons.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nenhum cupom</TableCell></TableRow>
              ) : coupons.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-mono text-xs">{c.cupom_numero?.length > 20 ? `${c.cupom_numero.slice(0,10)}...${c.cupom_numero.slice(-10)}` : c.cupom_numero}</TableCell>
                  <TableCell>
                    <p className="text-xs font-medium">{c.sorteios_participants?.nome ?? "—"}</p>
                    <p className="text-[10px] text-muted-foreground">{c.sorteios_participants?.cpf ?? ""}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">{c.data_compra ? new Date(c.data_compra).toLocaleDateString("pt-BR") : "—"}</TableCell>
                  <TableCell className="text-xs">{c.valor_compra ? `R$ ${Number(c.valor_compra).toFixed(2)}` : "—"}</TableCell>
                  <TableCell>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                      c.status === "validado" ? "bg-success/10 text-success border-success/20" :
                      c.status === "rejeitado" || c.status === "fraudulento" ? "bg-destructive/10 text-destructive border-destructive/20" :
                      "bg-accent/10 text-accent-foreground border-accent/20"
                    }`}>{c.status}</span>
                  </TableCell>
                  <TableCell>
                    {c.status === "pendente" && (
                      <div className="flex justify-end gap-1">
                        <button onClick={() => updateCouponStatus(c.id, "validado")} className="p-1 rounded hover:bg-success/10 text-success"><CheckCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateCouponStatus(c.id, "rejeitado")} className="p-1 rounded hover:bg-destructive/10 text-destructive"><XCircle className="w-3.5 h-3.5" /></button>
                        <button onClick={() => updateCouponStatus(c.id, "fraudulento")} className="p-1 rounded hover:bg-destructive/10 text-destructive"><AlertTriangle className="w-3.5 h-3.5" /></button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
