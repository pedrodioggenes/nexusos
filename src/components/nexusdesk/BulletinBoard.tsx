import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWBulletins, useCreateBulletin } from "@/hooks/useHWBulletins";
import { useHWProfile } from "@/hooks/useHWProfile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ClipboardList, Pin, Plus, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

const CATEGORY_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  general: { bg: 'rgba(59, 130, 246, 0.15)', color: '#3B82F6', label: 'Geral' },
  urgent: { bg: 'rgba(239, 68, 68, 0.15)', color: '#EF4444', label: 'Urgente' },
  hr: { bg: 'rgba(168, 85, 247, 0.15)', color: '#A855F7', label: 'RH' },
  safety: { bg: 'rgba(234, 179, 8, 0.15)', color: '#EAB308', label: 'Segurança' },
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}min`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  return `${Math.floor(hours / 24)}d`;
}

export function BulletinBoard() {
  const { user } = useAuth();
  const { data: tenantId } = useHWTenantId();
  const { profile } = useHWProfile();
  const { data: bulletins, isLoading } = useHWBulletins(tenantId || undefined);
  const createBulletin = useCreateBulletin();
  const [showDialog, setShowDialog] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("general");

  const canCreate = profile === 'diretor' || profile === 'chefe' || profile === 'secretaria';

  const handleSubmit = () => {
    if (!user?.id || !tenantId || !title.trim() || !content.trim()) return;
    createBulletin.mutate(
      { tenant_id: tenantId, author_id: user.id, title: title.trim(), content: content.trim(), category },
      {
        onSuccess: () => {
          toast.success("Aviso publicado!");
          setShowDialog(false);
          setTitle("");
          setContent("");
          setCategory("general");
        },
      }
    );
  };

  const activeBulletins = (bulletins || []).filter(b => !b.expires_at || new Date(b.expires_at) > new Date());

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-5 w-5" style={{ color: '#3B82F6' }} />
          <h2 className="text-sm font-bold" style={{ color: '#FAFAFA' }}>Quadro de Avisos</h2>
        </div>
        {canCreate && (
          <Button size="sm" className="h-8 text-xs gap-1.5 rounded-lg" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}
            onClick={() => setShowDialog(true)}>
            <Plus className="h-3 w-3" /> Novo Aviso
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin" style={{ color: '#52525B' }} /></div>
      ) : !activeBulletins.length ? (
        <div className="text-center py-8 rounded-xl" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
          <ClipboardList className="h-8 w-8 mx-auto mb-2" style={{ color: '#3F3F46' }} />
          <p className="text-xs" style={{ color: '#71717A' }}>Nenhum aviso no momento.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {activeBulletins.map((b, i) => {
            const cat = CATEGORY_STYLES[b.category] || CATEGORY_STYLES.general;
            return (
              <motion.div key={b.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="rounded-xl p-4" style={{ backgroundColor: '#18181B', border: '1px solid #27272A' }}>
                <div className="flex items-center gap-2 mb-2">
                  {b.pinned && <Pin className="h-3 w-3" style={{ color: '#EA580C' }} />}
                  <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ backgroundColor: cat.bg, color: cat.color }}>{cat.label}</span>
                  <span className="text-[10px] ml-auto" style={{ color: '#52525B' }}>{timeAgo(b.created_at)}</span>
                </div>
                <h3 className="text-sm font-semibold" style={{ color: '#FAFAFA' }}>{b.title}</h3>
                <p className="text-xs mt-1 leading-relaxed" style={{ color: '#A1A1AA' }}>{b.content}</p>
                <p className="text-[10px] mt-2" style={{ color: '#52525B' }}>por {b.author_name}</p>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md" style={{ backgroundColor: '#18181B', borderColor: '#27272A' }}>
          <DialogHeader>
            <DialogTitle style={{ color: '#FAFAFA' }}>Novo Aviso</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium mb-1.5 block" style={{ color: '#A1A1AA' }}>Categoria</label>
              <div className="flex gap-2 flex-wrap">
                {Object.entries(CATEGORY_STYLES).map(([key, style]) => (
                  <button key={key} onClick={() => setCategory(key)}
                    className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                    style={{ backgroundColor: category === key ? style.bg : '#27272A', color: style.color, border: category === key ? `1px solid ${style.color}` : '1px solid transparent' }}>
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
            <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do aviso"
              style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
            <Textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Conteúdo do aviso..." rows={4}
              style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
          </div>
          <DialogFooter>
            <Button onClick={handleSubmit} disabled={!title.trim() || !content.trim() || createBulletin.isPending}
              className="w-full" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}>
              {createBulletin.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Publicar Aviso
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
