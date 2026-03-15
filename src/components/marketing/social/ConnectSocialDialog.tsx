import { useState } from 'react';
import { Instagram, Facebook, Youtube, ExternalLink, AlertCircle } from 'lucide-react';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import type { PlatformConfig } from '@/hooks/useSocialMediaConnections';

// TikTok icon component
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
    </svg>
  );
}

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  tiktok: TikTokIcon,
};

const PLATFORM_HELP: Record<string, { url: string; description: string }> = {
  instagram: {
    url: 'https://business.instagram.com/',
    description: 'Para conectar o Instagram, você precisa de uma conta Business ou Creator conectada a uma página do Facebook.',
  },
  facebook: {
    url: 'https://business.facebook.com/',
    description: 'Conecte sua página do Facebook para acompanhar métricas de alcance e engajamento.',
  },
  tiktok: {
    url: 'https://www.tiktok.com/business/',
    description: 'Acesse o TikTok for Business para obter acesso às métricas da sua conta.',
  },
  youtube: {
    url: 'https://studio.youtube.com/',
    description: 'Conecte seu canal do YouTube para acompanhar inscritos, visualizações e tempo de exibição.',
  },
};

const accountSchema = z.object({
  accountName: z.string()
    .min(1, "Nome da conta é obrigatório")
    .max(100, "Nome muito longo")
    .regex(/^[a-zA-Z0-9._]+$/, "Use apenas letras, números, pontos e underscores"),
});

interface ConnectSocialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  platform: PlatformConfig | null;
  onConnect: (accountName: string) => void;
  isConnecting?: boolean;
}

export function ConnectSocialDialog({
  open,
  onOpenChange,
  platform,
  onConnect,
  isConnecting,
}: ConnectSocialDialogProps) {
  const [accountName, setAccountName] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!platform) return null;

  const Icon = PLATFORM_ICONS[platform.icon];
  const help = PLATFORM_HELP[platform.id];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const result = accountSchema.safeParse({ accountName: accountName.trim() });
    if (!result.success) {
      setError(result.error.errors[0].message);
      return;
    }

    onConnect(result.data.accountName);
  };

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      setAccountName('');
      setError(null);
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center text-white",
              platform.bgColor
            )}>
              <Icon className="w-5 h-5" />
            </div>
            <DialogTitle>Conectar {platform.name}</DialogTitle>
          </div>
          <DialogDescription>
            Insira o nome de usuário da sua conta para conectar.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="accountName">Nome de usuário</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
              <Input
                id="accountName"
                placeholder="seu_usuario"
                value={accountName}
                onChange={(e) => {
                  setAccountName(e.target.value);
                  setError(null);
                }}
                className="pl-8"
                autoComplete="off"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>

          <Alert className="bg-muted/50 border-muted-foreground/20">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              {help.description}
            </AlertDescription>
          </Alert>

          <div className="flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              asChild
            >
              <a href={help.url} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Saiba mais
              </a>
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => handleOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isConnecting || !accountName.trim()}
                className={cn(platform.bgColor, "text-white hover:opacity-90")}
              >
                {isConnecting ? 'Conectando...' : 'Conectar'}
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
