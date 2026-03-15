import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Megaphone, Link2, X, Loader2 } from "lucide-react";
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
  useDocumentDemands,
  useLinkDocument,
  useUnlinkDocument,
} from "@/hooks/useDemandDocuments";
import { useMarketingDemands } from "@/hooks/useMarketingDemands";

interface DocumentDemandLinkProps {
  pageId: string;
}

export function DocumentDemandLink({ pageId }: DocumentDemandLinkProps) {
  const navigate = useNavigate();
  const { data: links = [], isLoading } = useDocumentDemands(pageId);
  const linkDocument = useLinkDocument();
  const unlinkDocument = useUnlinkDocument();
  const { data: allDemands = [] } = useMarketingDemands();

  const [showDialog, setShowDialog] = useState(false);
  const [search, setSearch] = useState("");

  const linkedDemandIds = new Set(links.map((l) => l.demand_id));

  const filteredDemands = allDemands.filter(
    (d) =>
      !linkedDemandIds.has(d.id) &&
      d.title.toLowerCase().includes(search.toLowerCase())
  );

  const handleLink = (demandId: string) => {
    linkDocument.mutate({ demandId, pageId });
    setShowDialog(false);
  };

  const handleUnlink = (linkId: string, demandId: string) => {
    unlinkDocument.mutate({ linkId, demandId, pageId });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Megaphone className="h-3 w-3" />
          Demandas Vinculadas
        </h4>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 text-[11px] gap-1"
          onClick={() => setShowDialog(true)}
        >
          <Link2 className="h-3 w-3" />
          Vincular
        </Button>
      </div>

      {isLoading ? (
        <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />
      ) : links.length === 0 ? (
        <p className="text-[11px] text-muted-foreground italic">
          Nenhuma demanda vinculada
        </p>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {links.map((link) => (
            <Badge
              key={link.id}
              variant="outline"
              className="text-[10px] gap-1 pr-1 cursor-pointer hover:bg-muted group"
            >
              <span
                onClick={() => navigate("/app/marketing/demandas")}
                className="truncate max-w-[150px]"
              >
                {link.demand_title || "Demanda"}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnlink(link.id, link.demand_id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity ml-0.5"
              >
                <X className="h-2.5 w-2.5 text-destructive" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Vincular a Demanda</DialogTitle>
            <DialogDescription>
              Selecione uma demanda para vincular a este documento.
            </DialogDescription>
          </DialogHeader>

          <Input
            placeholder="Buscar demandas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="mb-2"
          />

          <ScrollArea className="max-h-[300px]">
            {filteredDemands.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Nenhuma demanda disponível
              </p>
            ) : (
              <div className="space-y-1">
                {filteredDemands.map((demand) => (
                  <button
                    key={demand.id}
                    onClick={() => handleLink(demand.id)}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted transition-colors text-left"
                  >
                    <Megaphone className="h-3.5 w-3.5 text-app-gestao flex-shrink-0" />
                    <div className="min-w-0">
                      <span className="text-sm truncate block">{demand.title}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {demand.status} • {demand.type}
                      </span>
                    </div>
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
