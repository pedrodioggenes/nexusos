import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FileText,
  Plus,
  Link2,
  ExternalLink,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useDemandDocuments,
  useLinkDocument,
  useUnlinkDocument,
  useCreateAndLinkDocument,
} from "@/hooks/useDemandDocuments";
import { useWorkspacePages } from "@/hooks/useWorkspacePages";

interface DemandDocumentsSectionProps {
  demandId: string;
  demandTitle: string;
}

export function DemandDocumentsSection({ demandId, demandTitle }: DemandDocumentsSectionProps) {
  const navigate = useNavigate();
  const { data: links = [], isLoading } = useDemandDocuments(demandId);
  const linkDocument = useLinkDocument();
  const unlinkDocument = useUnlinkDocument();
  const createAndLink = useCreateAndLinkDocument();
  const { data: allPages = [] } = useWorkspacePages();

  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [search, setSearch] = useState("");

  const linkedPageIds = new Set(links.map((l) => l.page_id));

  const filteredPages = allPages.filter(
    (p) =>
      !linkedPageIds.has(p.id) &&
      p.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreateNew = () => {
    createAndLink.mutate(
      { demandId, title: `Doc: ${demandTitle}` },
      {
        onSuccess: (page) => {
          navigate(`/app/marketing/documentos/${page.id}`);
        },
      }
    );
  };

  const handleLinkExisting = (pageId: string) => {
    linkDocument.mutate({ demandId, pageId });
    setShowLinkDialog(false);
  };

  const handleUnlink = (linkId: string, pageId: string) => {
    unlinkDocument.mutate({ linkId, demandId, pageId });
  };

  const handleOpenDoc = (pageId: string) => {
    navigate(`/app/marketing/documentos/${pageId}`);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-1.5">
          <FileText className="h-3.5 w-3.5" />
          Documentos
        </h4>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={handleCreateNew}
            disabled={createAndLink.isPending}
          >
            {createAndLink.isPending ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Plus className="h-3 w-3" />
            )}
            Criar
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs gap-1"
            onClick={() => setShowLinkDialog(true)}
          >
            <Link2 className="h-3 w-3" />
            Vincular
          </Button>
        </div>
      </div>

      {/* Linked documents list */}
      {isLoading ? (
        <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
          <Loader2 className="h-3 w-3 animate-spin" />
          Carregando...
        </div>
      ) : links.length === 0 ? (
        <p className="text-xs text-muted-foreground italic py-1">
          Nenhum documento vinculado
        </p>
      ) : (
        <div className="space-y-1.5">
          {links.map((link) => (
            <div
              key={link.id}
              className="flex items-center justify-between gap-2 rounded-md border bg-muted/30 px-2.5 py-1.5 group"
            >
              <button
                onClick={() => handleOpenDoc(link.page_id)}
                className="flex items-center gap-2 text-sm hover:text-app-gestao transition-colors text-left min-w-0"
              >
                <span className="text-base flex-shrink-0">{link.page_icon || "📄"}</span>
                <span className="truncate">{link.page_title || "Sem título"}</span>
              </button>
              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleOpenDoc(link.page_id)}
                >
                  <ExternalLink className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                  onClick={() => handleUnlink(link.id, link.page_id)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Link existing document dialog */}
      <Dialog open={showLinkDialog} onOpenChange={setShowLinkDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular Documento</DialogTitle>
            <DialogDescription>
              Selecione um documento existente para vincular a esta demanda.
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Buscar documentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />

          <ScrollArea className="max-h-[300px]">
            {filteredPages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhum documento disponível
              </p>
            ) : (
              <div className="space-y-1">
                {filteredPages.map((page) => (
                  <button
                    key={page.id}
                    onClick={() => handleLinkExisting(page.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <span className="text-base">{page.icon || "📄"}</span>
                    <span className="text-sm truncate">{page.title}</span>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
}
