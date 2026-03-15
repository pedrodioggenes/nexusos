import { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MessageSquare, Send, Loader2, Trash2 } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PremiumGlassCard } from "@/components/dashboard/PremiumGlassCard";
import {
  useDemandComments,
  useCreateDemandComment,
  useDeleteDemandComment,
} from "@/hooks/useDemandComments";
import { useTenantProfiles } from "@/hooks/useTenantProfiles";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface DemandCommentsProps {
  demandId: string;
}

/**
 * Renders text with URLs converted to clickable links.
 */
function CommentContent({ text }: { text: string }) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return (
    <p className="text-sm text-foreground/80 whitespace-pre-wrap break-words">
      {parts.map((part, i) =>
        urlRegex.test(part) ? (
          <a
            key={i}
            href={part}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline hover:text-primary/80 break-all"
          >
            {part}
          </a>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </p>
  );
}

export function DemandComments({ demandId }: DemandCommentsProps) {
  const { data: comments, isLoading } = useDemandComments(demandId);
  const createComment = useCreateDemandComment();
  const deleteComment = useDeleteDemandComment();
  const { resolveName } = useTenantProfiles();
  const { user } = useAuth();
  const [newComment, setNewComment] = useState("");

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    await createComment.mutateAsync({ demandId, content: newComment.trim() });
    setNewComment("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <PremiumGlassCard className="p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-app-gestao" />
        Comentários {comments && comments.length > 0 && `(${comments.length})`}
      </h2>

      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-4">
          {comments && comments.length > 0 ? (
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {comments.map((comment) => {
                const name = resolveName(comment.user_id);
                const initials = name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const isOwner = user?.id === comment.user_id;

                return (
                  <div key={comment.id} className="group flex gap-3">
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-medium truncate">{name}</span>
                        <span className="text-xs text-muted-foreground shrink-0">
                          {format(new Date(comment.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </span>
                        {isOwner && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button
                                className="opacity-0 group-hover:opacity-100 transition-opacity ml-auto text-muted-foreground hover:text-destructive shrink-0"
                                title="Excluir comentário"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir comentário?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() =>
                                    deleteComment.mutate({
                                      commentId: comment.id,
                                      demandId,
                                    })
                                  }
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                      <CommentContent text={comment.content} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum comentário ainda. Seja o primeiro!
            </p>
          )}

          {/* New comment input */}
          <div className="space-y-2 pt-2 border-t border-border">
            <Textarea
              placeholder="Escreva um comentário... (Ctrl+Enter para enviar)"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={2}
              className="resize-none"
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={handleSubmit}
                disabled={!newComment.trim() || createComment.isPending}
                className="gap-1.5"
              >
                {createComment.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Send className="h-3.5 w-3.5" />
                )}
                Comentar
              </Button>
            </div>
          </div>
        </div>
      )}
    </PremiumGlassCard>
  );
}
