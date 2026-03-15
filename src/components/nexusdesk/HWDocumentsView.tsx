import { useState, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, FileText, Image, File, Download, Loader2, Star, Pin } from "lucide-react";
import { useHWFavorites } from "@/hooks/useHWFavorites";
import { motion } from "framer-motion";
import { useHWProfile } from "@/hooks/useHWProfile";
import { useHWTenantId } from "@/hooks/useHWTenantId";
import { useHWDocuments, useUploadHWDocument } from "@/hooks/useHWDocuments";
import { supabase } from "@/integrations/supabase/client";
import { useDeskPinContext, type PinnableItem } from "@/hooks/useDeskPins";
import { PinToDeskButton } from "@/components/nexusdesk/PinToDeskButton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";

interface DocItem {
  id: string;
  name: string;
  fileType: string;
  contextType: 'personal' | 'team' | 'department' | 'rh';
  contextLabel: string;
  uploadedBy: string;
  uploadedAt: string;
  size: string;
  filePath?: string;
}

const MOCK_DOCS: DocItem[] = [
  { id: '1', name: 'Manual de Operação de Caixa v3.pdf', fileType: 'pdf', contextType: 'team', contextLabel: 'Equipe', uploadedBy: 'Ana Oliveira', uploadedAt: '01/03/2026', size: '2.4 MB' },
  { id: '2', name: 'Escala de Março 2026.xlsx', fileType: 'xlsx', contextType: 'department', contextLabel: 'Departamento', uploadedBy: 'Ana Oliveira', uploadedAt: '28/02/2026', size: '156 KB' },
  { id: '3', name: 'Certificado LGPD.pdf', fileType: 'pdf', contextType: 'personal', contextLabel: 'Pessoal', uploadedBy: 'Você', uploadedAt: '15/02/2026', size: '890 KB' },
  { id: '4', name: 'Procedimento de Abertura de Loja.pdf', fileType: 'pdf', contextType: 'department', contextLabel: 'Departamento', uploadedBy: 'Roberto Santos', uploadedAt: '20/02/2026', size: '3.1 MB' },
  { id: '5', name: 'Política de Férias 2026.pdf', fileType: 'pdf', contextType: 'rh', contextLabel: 'RH', uploadedBy: 'Daniela Rocha', uploadedAt: '05/01/2026', size: '512 KB' },
];

function getFileIcon(type: string) {
  if (['jpg', 'png', 'jpeg', 'webp'].includes(type)) return <Image className="h-5 w-5" />;
  if (['pdf'].includes(type)) return <FileText className="h-5 w-5" style={{ color: '#EF4444' }} />;
  return <File className="h-5 w-5" />;
}

const CONTEXT_COLORS: Record<string, { bg: string; text: string }> = {
  personal: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
  Pessoal: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3B82F6' },
  team: { bg: 'rgba(22, 163, 74, 0.15)', text: '#22C55E' },
  Equipe: { bg: 'rgba(22, 163, 74, 0.15)', text: '#22C55E' },
  department: { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7' },
  Departamento: { bg: 'rgba(168, 85, 247, 0.15)', text: '#A855F7' },
  rh: { bg: 'rgba(234, 179, 8, 0.15)', text: '#EAB308' },
  RH: { bg: 'rgba(234, 179, 8, 0.15)', text: '#EAB308' },
};

const CONTEXT_OPTIONS = [
  { value: 'personal', label: 'Pessoal' },
  { value: 'team', label: 'Equipe' },
  { value: 'department', label: 'Departamento' },
  { value: 'rh', label: 'RH' },
];

function UploadDialog({
  open,
  onOpenChange,
  tenantId,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  tenantId: string;
}) {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState<globalThis.File | null>(null);
  const [contextType, setContextType] = useState('personal');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadDoc = useUploadHWDocument();

  const handleUpload = async () => {
    if (!selectedFile || !user?.id) return;
    setUploading(true);
    try {
      const ext = selectedFile.name.split('.').pop() || 'file';
      const path = `hw-documents/${tenantId}/${Date.now()}_${selectedFile.name}`;

      const { error: uploadErr } = await supabase.storage.from('workspace-files').upload(path, selectedFile);
      if (uploadErr) throw uploadErr;

      await uploadDoc.mutateAsync({
        tenant_id: tenantId,
        name: selectedFile.name,
        file_path: path,
        file_type: ext,
        context_type: contextType,
        uploaded_by: user.id,
      });

      toast.success("Documento enviado!");
      onOpenChange(false);
      setSelectedFile(null);
    } catch (err: any) {
      toast.error(err?.message || "Erro ao enviar documento");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent style={{ backgroundColor: '#18181B', borderColor: '#27272A' }} className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle style={{ color: '#FAFAFA' }}>Enviar Documento</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <input ref={fileRef} type="file" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
          <button onClick={() => fileRef.current?.click()}
            className="w-full rounded-xl p-6 text-center transition-colors hover:bg-zinc-800"
            style={{ border: '2px dashed #3F3F46', backgroundColor: '#27272A' }}>
            <Upload className="h-8 w-8 mx-auto mb-2" style={{ color: '#52525B' }} />
            <p className="text-sm font-medium" style={{ color: selectedFile ? '#FAFAFA' : '#71717A' }}>
              {selectedFile ? selectedFile.name : 'Clique para selecionar arquivo'}
            </p>
            {selectedFile && (
              <p className="text-[10px] mt-1" style={{ color: '#52525B' }}>
                {(selectedFile.size / 1024).toFixed(0)} KB
              </p>
            )}
          </button>

          <div>
            <p className="text-xs font-medium mb-2" style={{ color: '#A1A1AA' }}>Contexto do documento</p>
            <div className="flex gap-1.5 flex-wrap">
              {CONTEXT_OPTIONS.map(opt => (
                <button key={opt.value} onClick={() => setContextType(opt.value)}
                  className="px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                  style={{
                    backgroundColor: contextType === opt.value ? 'rgba(194, 65, 12, 0.2)' : '#27272A',
                    color: contextType === opt.value ? '#EA580C' : '#A1A1AA',
                  }}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)} style={{ color: '#71717A' }}>Cancelar</Button>
          <Button onClick={handleUpload} disabled={!selectedFile || uploading} style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}>
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Enviar'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function HWDocumentsView() {
  const { data: tenantId } = useHWTenantId();
  const { data: dbDocs, isLoading } = useHWDocuments(tenantId || undefined);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const { isFavorite, toggle: toggleFavorite } = useHWFavorites();
  const pinCtx = useDeskPinContext();

  const makePinnable = (doc: DocItem): PinnableItem => ({
    id: doc.id,
    title: doc.name,
    icon: 'FileText',
    subtitle: `${doc.contextLabel} · ${doc.size}`,
    accentColor: CONTEXT_COLORS[doc.contextType]?.text || '#3B82F6',
    sourceView: 'documents',
    itemType: doc.fileType,
    meta: { fileType: doc.fileType, size: doc.size, uploadedBy: doc.uploadedBy },
  });

  const docs: DocItem[] = dbDocs && dbDocs.length > 0 ? dbDocs : MOCK_DOCS;

  const filtered = docs.filter(d => {
    if (searchQuery && !d.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (activeFilter && d.contextType !== activeFilter) return false;
    return true;
  });

  const filters = [
    { key: null, label: 'Todos' },
    { key: 'personal', label: 'Pessoal' },
    { key: 'team', label: 'Equipe' },
    { key: 'department', label: 'Departamento' },
    { key: 'rh', label: 'RH' },
  ];

  const handleDownload = async (doc: DocItem) => {
    if (!doc.filePath) {
      toast.info("Download não disponível para documentos de exemplo");
      return;
    }
    const { data } = await supabase.storage.from('workspace-files').createSignedUrl(doc.filePath, 60);
    if (data?.signedUrl) {
      window.open(data.signedUrl, '_blank');
    } else {
      toast.error("Erro ao gerar link de download");
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-3 sm:px-4 py-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4" style={{ color: '#52525B' }} />
            <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Buscar documento..."
              className="pl-9" style={{ backgroundColor: '#27272A', borderColor: '#3F3F46', color: '#FAFAFA' }} />
          </div>
          <Button className="shrink-0 rounded-lg" style={{ backgroundColor: '#C2410C', color: '#FFFFFF' }}
            onClick={() => setShowUpload(true)}>
            <Upload className="h-4 w-4 mr-1.5" /><span className="hidden sm:inline">Enviar</span>
          </Button>
        </div>

        <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
          {filters.map(f => (
            <button key={f.key ?? 'all'} onClick={() => setActiveFilter(f.key)}
              className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors"
              style={{ backgroundColor: activeFilter === f.key ? 'rgba(194, 65, 12, 0.2)' : '#27272A', color: activeFilter === f.key ? '#EA580C' : '#A1A1AA' }}>
              {f.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: '#52525B' }} />
          </div>
        ) : (
          <div className="space-y-1">
            {filtered.map((doc, i) => {
              const ctx = CONTEXT_COLORS[doc.contextType] || CONTEXT_COLORS[doc.contextLabel] || CONTEXT_COLORS.personal;
              return (
                <motion.div key={doc.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }}
                  className="flex items-center gap-3 p-3 rounded-lg transition-colors hover:bg-zinc-800/50" style={{ backgroundColor: '#18181B' }}>
                  <div style={{ color: '#71717A' }}>{getFileIcon(doc.fileType)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: '#FAFAFA' }}>{doc.name}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px]" style={{ color: '#52525B' }}>{doc.uploadedBy} · {doc.uploadedAt}</span>
                      <span className="text-[10px]" style={{ color: '#52525B' }}>{doc.size}</span>
                    </div>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium shrink-0" style={{ backgroundColor: ctx.bg, color: ctx.text }}>
                    {doc.contextLabel}
                  </span>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-zinc-700"
                    style={{ color: isFavorite('document', doc.id) ? '#F59E0B' : '#52525B' }}
                    onClick={() => toggleFavorite.mutate({ entityType: 'document', entityId: doc.id })}>
                    <Star className="h-3.5 w-3.5" style={{ fill: isFavorite('document', doc.id) ? '#F59E0B' : 'none' }} />
                  </Button>
                  {pinCtx && (
                    <PinToDeskButton
                      item={makePinnable(doc)}
                      isPinned={pinCtx.isPinned(doc.id, 'documents')}
                      onPinChoice={pinCtx.showPinChoice}
                      onUnpin={pinCtx.unpinItem}
                      size="sm"
                    />
                  )}
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 hover:bg-zinc-700" style={{ color: '#52525B' }}
                    onClick={() => handleDownload(doc)}>
                    <Download className="h-3.5 w-3.5" />
                  </Button>
                </motion.div>
              );
            })}
            {filtered.length === 0 && (
              <div className="text-center py-12">
                <FileText className="h-10 w-10 mx-auto mb-3" style={{ color: '#3F3F46' }} />
                <p className="text-sm" style={{ color: '#52525B' }}>Nenhum documento encontrado</p>
              </div>
            )}
          </div>
        )}
      </div>

      {tenantId && (
        <UploadDialog open={showUpload} onOpenChange={setShowUpload} tenantId={tenantId} />
      )}
    </div>
  );
}
