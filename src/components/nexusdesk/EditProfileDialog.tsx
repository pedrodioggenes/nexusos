import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Loader2, Trash2, User, Phone, FileText } from "lucide-react";
import { toast } from "sonner";
import { AvatarCropDialog } from "./AvatarCropDialog";

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentAvatarUrl?: string;
  initials: string;
}

export function EditProfileDialog({ open, onOpenChange, currentName, currentAvatarUrl, initials }: EditProfileDialogProps) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileRef = useRef<HTMLInputElement>(null);
  const [fullName, setFullName] = useState(currentName);
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | undefined>(currentAvatarUrl);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [cropSrc, setCropSrc] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !user?.id) return;
    setFullName(currentName);
    setAvatarPreview(currentAvatarUrl);
    setAvatarFile(null);
    setRemoveAvatar(false);
    setCropSrc(null);

    supabase.from("profiles").select("phone, bio").eq("user_id", user.id).single().then(({ data }) => {
      setPhone(data?.phone || "");
      setBio(data?.bio || "");
    });
  }, [open, user?.id, currentName, currentAvatarUrl]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Imagem muito grande (máx. 5MB)");
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setCropSrc(objectUrl);
    e.target.value = "";
  };

  const handleCropComplete = (blob: Blob) => {
    const file = new File([blob], "avatar-cropped.jpg", { type: "image/jpeg" });
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(blob));
    setRemoveAvatar(false);
    setCropSrc(null);
  };

  const handleRemoveAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(undefined);
    setRemoveAvatar(true);
  };

  const handleSave = async () => {
    if (!user?.id) return;
    setSaving(true);
    try {
      let avatarUrl = removeAvatar ? null : currentAvatarUrl;

      if (avatarFile) {
        const path = `${user.id}/avatar.jpg`;
        const { error: uploadErr } = await supabase.storage
          .from('avatars')
          .upload(path, avatarFile, { upsert: true, contentType: avatarFile.type });
        if (uploadErr) throw uploadErr;

        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path);
        avatarUrl = urlData.publicUrl + `?t=${Date.now()}`;
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName.trim(),
          avatar_url: avatarUrl,
          phone: phone.trim() || null,
          bio: bio.trim() || null,
        })
        .eq('user_id', user.id);
      if (error) throw error;

      queryClient.invalidateQueries({ queryKey: ['hw-user-display'] });
      queryClient.invalidateQueries({ queryKey: ['nexusdesk-members'] });
      toast.success("Perfil atualizado");
      onOpenChange(false);
    } catch (err: any) {
      toast.error(err.message || "Erro ao salvar");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden" style={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
          <div className="relative">
            <div className="h-24 w-full rounded-t-lg" style={{ background: "linear-gradient(135deg, hsl(var(--muted)), hsl(var(--card)))" }} />
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2">
              <button type="button" className="relative group" onClick={() => fileRef.current?.click()}>
                <Avatar className="h-20 w-20 ring-4" style={{ "--tw-ring-color": "hsl(var(--card))" } as React.CSSProperties}>
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="text-xl font-bold" style={{ backgroundColor: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                  <Camera className="h-5 w-5 text-white" />
                </div>
              </button>
            </div>
          </div>

          <div className="pt-14 px-6 pb-6">
            <DialogHeader className="mb-1">
              <DialogTitle className="text-center text-foreground">Editar Perfil</DialogTitle>
            </DialogHeader>

            <div className="flex justify-center gap-2 mb-5">
              <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-lg border-border text-muted-foreground"
                onClick={() => fileRef.current?.click()}>
                <Camera className="h-3 w-3 mr-1.5" /> Trocar foto
              </Button>
              {(avatarPreview || currentAvatarUrl) && !removeAvatar && (
                <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-lg border-border text-destructive"
                  onClick={handleRemoveAvatar}>
                  <Trash2 className="h-3 w-3 mr-1.5" /> Remover
                </Button>
              )}
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <User className="h-3 w-3" /> Nome completo
                </Label>
                <Input value={fullName} onChange={e => setFullName(e.target.value)}
                  className="rounded-xl bg-background border-border text-foreground" placeholder="Seu nome" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                  <Phone className="h-3 w-3" /> Telefone
                </Label>
                <Input value={phone} onChange={e => setPhone(e.target.value)}
                  className="rounded-xl bg-background border-border text-foreground" placeholder="(00) 00000-0000" />
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-1.5 text-muted-foreground">
                    <FileText className="h-3 w-3" /> Bio / Status
                  </Label>
                  <span className="text-[10px] text-muted-foreground">{bio.length}/160</span>
                </div>
                <Textarea value={bio} onChange={e => setBio(e.target.value.slice(0, 160))}
                  className="rounded-xl bg-background border-border text-foreground resize-none min-h-[70px]"
                  placeholder="Uma breve descrição sobre você..." rows={2} />
              </div>
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <Button variant="ghost" onClick={() => onOpenChange(false)} className="text-muted-foreground rounded-xl">
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving || !fullName.trim()}
                className="rounded-xl bg-primary text-primary-foreground hover:bg-primary/90">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Salvar'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {cropSrc && (
        <AvatarCropDialog
          open={!!cropSrc}
          onOpenChange={(v) => { if (!v) setCropSrc(null); }}
          imageSrc={cropSrc}
          onCropComplete={handleCropComplete}
        />
      )}
    </>
  );
}