import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, CheckCircle2, Briefcase } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion } from "framer-motion";

const POSITIONS = [
  "Operador(a) de Caixa",
  "Repositor(a)",
  "Padeiro(a)",
  "Açougueiro(a)",
  "Auxiliar de Limpeza",
  "Auxiliar de Depósito",
  "Fiscal de Caixa",
  "Atendente de SAC",
  "Motorista",
  "Auxiliar Administrativo",
];

export default function PublicApplicationPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !position) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    setLoading(true);
    try {
      // Insert as candidate — tenant_id will need to be resolved by the company's public URL
      // For now we insert without tenant_id (it's required, so we use a placeholder approach)
      // In production this page would be tenant-scoped via subdomain
      const { error } = await supabase
        .from("hw_candidates")
        .insert([{
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || null,
          position,
          status: 'novo',
          notes: message.trim() || null,
          ai_recommended: false,
          tenant_id: '00000000-0000-0000-0000-000000000000', // placeholder
        }]);
      if (error) throw error;
      setSubmitted(true);
    } catch {
      toast.error("Erro ao enviar candidatura. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 bg-background">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full rounded-2xl p-8 text-center bg-card border border-border">
          <CheckCircle2 className="h-16 w-16 mx-auto mb-4 text-success" />
          <h2 className="text-xl font-bold mb-2 text-foreground">Candidatura Enviada!</h2>
          <p className="text-sm text-muted-foreground">
            Obrigado pelo interesse. Nossa equipe de RH analisará seu perfil e entrará em contato em breve.
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-background">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full rounded-2xl p-6 sm:p-8 bg-card border border-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-app-trade/15">
            <Briefcase className="h-6 w-6 text-app-trade" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-foreground">Trabalhe Conosco</h1>
            <p className="text-xs text-muted-foreground">Envie sua candidatura</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Nome completo *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Seu nome completo" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">E-mail *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Telefone</label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(00) 00000-0000" />
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Vaga de interesse *</label>
            <Select value={position} onValueChange={setPosition}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a vaga" />
              </SelectTrigger>
              <SelectContent>
                {POSITIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Mensagem (opcional)</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Conte-nos sobre você..."
              rows={3} />
          </div>
          <Button type="submit" className="w-full h-11 rounded-xl text-sm font-medium bg-app-trade text-white hover:bg-app-trade/90" disabled={loading}>
            {loading ? 'Enviando...' : 'Enviar Candidatura'}
          </Button>
          <p className="text-[10px] text-center text-muted-foreground/60">
            Seus dados serão utilizados exclusivamente para fins de recrutamento.
          </p>
        </form>
      </motion.div>
    </div>
  );
}
