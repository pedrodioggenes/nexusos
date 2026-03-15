import * as React from 'react';
import { useState } from 'react';
import { Share2, Copy, Check, Link, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface ShareDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string | null;
  isDarkMode?: boolean;
}

export const ShareDialog = React.forwardRef<HTMLDivElement, ShareDialogProps>(
  function ShareDialog({
    open,
    onOpenChange,
    conversationId,
  }, ref) {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [copied, setCopied] = useState(false);

    const createShareLink = async () => {
      if (!conversationId || !user) return;
      
      setIsLoading(true);
      try {
        const { data: existing } = await (supabase as any)
          .from('ia_shared_conversations')
          .select('share_token')
          .eq('conversation_id', conversationId)
          .eq('is_active', true)
          .single();

        let token = existing?.share_token;

        if (!token) {
          const { data, error } = await (supabase as any)
            .from('ia_shared_conversations')
            .insert({
              conversation_id: conversationId,
              created_by: user.id,
            })
            .select('share_token')
            .single();

          if (error) throw error;
          token = data.share_token;
        }

        const link = `${window.location.origin}/ia/shared/${token}`;
        setShareLink(link);
      } catch (error) {
        console.error('Error creating share link:', error);
        toast.error('Erro ao criar link de compartilhamento');
      } finally {
        setIsLoading(false);
      }
    };

    const handleCopy = async () => {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copiado!');
      setTimeout(() => setCopied(false), 2000);
    };

    const handleOpen = () => {
      if (!shareLink && conversationId) {
        createShareLink();
      }
    };

    return (
      <Dialog open={open} onOpenChange={(isOpen) => {
        onOpenChange(isOpen);
        if (isOpen) handleOpen();
      }}>
        <DialogContent 
          ref={ref}
          className="sm:max-w-md bg-secondary/95 border-border"
        >
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-foreground/90">
              <Share2 className="h-5 w-5" />
              Compartilhar conversa
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Gere um link público para compartilhar esta conversa
            </DialogDescription>
          </DialogHeader>
          
          <div className="mt-4 space-y-4">
            {isLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : shareLink ? (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input
                    value={shareLink}
                    readOnly
                    className="flex-1 font-mono text-sm bg-muted/50 border-border text-foreground/80"
                  />
                  <Button
                    onClick={handleCopy}
                    className="bg-foreground text-background hover:bg-foreground/90"
                  >
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground/70">
                  Qualquer pessoa com este link poderá visualizar esta conversa.
                </p>
              </div>
            ) : (
              <Button
                onClick={createShareLink}
                className="w-full gap-2 bg-foreground text-background hover:bg-foreground/90"
              >
                <Link className="h-4 w-4" />
                Gerar link público
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }
);
