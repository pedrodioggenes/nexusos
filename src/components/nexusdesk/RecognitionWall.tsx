import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWRecognitions, useCreateRecognition } from "@/hooks/useHWRecognitions";
import { useHWMembers } from "@/hooks/useHWMembers";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Star, Plus, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

const EMOJI_OPTIONS = [
  { emoji: "⭐", label: "Estrela" },
  { emoji: "🏆", label: "Troféu" },
  { emoji: "💪", label: "Força" },
  { emoji: "🎯", label: "Foco" },
  { emoji: "🚀", label: "Destaque" },
  { emoji: "❤️", label: "Amor" },
];

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function RecognitionWall() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { data: recognitions, isLoading } = useHWRecognitions(tenantId || undefined);
  const { members } = useHWMembers();
  const createRecognition = useCreateRecognition();
  const [showDialog, setShowDialog] = useState(false);
  const [toUserId, setToUserId] = useState("");
  const [message, setMessage] = useState("");
  const [emoji, setEmoji] = useState("⭐");

  const handleSubmit = () => {
    if (!user?.id || !tenantId || !toUserId || !message.trim()) return;
    createRecognition.mutate(
      { tenant_id: tenantId, from_user_id: user.id, to_user_id: toUserId, message: message.trim(), emoji },
      {
        onSuccess: () => {
          toast.success("Reconhecimento enviado!");
          setShowDialog(false);
          setToUserId("");
          setMessage("");
          setEmoji("⭐");
        },
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5" style={{ color: '#EAB308' }} />
          <h2 className="text-sm font-bold" style={{ color: '#FAFAFA' }}>Mural de Reconhecimentos</h2>
        </div>
        <Button size="sm" className="h-8 text-xs gap-1.5 rounded-lg" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}
          onClick={() => setShowDialog(true)}>
          <Plus className="h-3 w-3" /> Reconhecer
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" style={{ color: '#52525B' }} /></div>
      ) : !recognitions?.length ? (
        <div className="text-center py-8 rounded-xl" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
          <Star className="h-8 w-8 mx-auto mb-2" style={{ color: '#3F3F46' }} />
          <p className="text-xs" style={{ color: '#71717A' }}>Nenhum reconhecimento ainda. Seja o primeiro!</p>
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {recognitions.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-3" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{r.emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs" style={{ color: '#D4D4D8' }}>
                      <strong style={{ color: '#FAFAFA' }}>{r.from_name}</strong>
                      {" reconheceu "}
                      <strong style={{ color: '#EAB308' }}>{r.to_name}</strong>
                    </p>
                    <p className="text-xs mt-1" style={{ color: '#A1A1AA' }}>"{r.message}"</p>
                    <p className="text-[10px] mt-1" style={{ color: '#52525B' }}>{timeAgo(r.created_at)} atrás</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md" style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#FAFAFA' }}>Enviar Reconhecimento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Para quem?</label>
              <Select value={toUserId} onValueChange={setToUserId}>
                <SelectTrigger style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }}>
                  <SelectValue placeholder="Selecione um colega" />
                </SelectTrigger>
                <SelectContent style={{ backgroundColor: '#27272A', borderColor: '#3F3F46' }}>
                  {members.filter(m => m.user_id !== user?.id).map(m => (
                    <SelectItem key={m.user_id} value={m.user_id} style={{ color: '#FAFAFA' }}>{m.full_name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Emoji</label>
              <div className="flex gap-2">
                {EMOJI_OPTIONS.map(e => (
                  <button key={e.emoji} onClick={() => setEmoji(e.emoji)}
                    className="text-xl p-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: emoji === e.emoji ? 'rgba(234, 179, 8, 0.2)' : '#27272A', border: emoji === e.emoji ? '1px solid #EAB308' : '1px solid transparent' }}>
                    {e.emoji}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Mensagem</label>
              <Textarea value={message} onChange={e => setMessage(e.target.value)}
                placeholder="Por que essa pessoa merece reconhecimento?" rows={3}
                style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={!toUserId || !message.trim() || createRecognition.isPending}
              className="w-full" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}>
              {createRecognition.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Star className="h-4 w-4 mr-2" />}
              Enviar Reconhecimento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
