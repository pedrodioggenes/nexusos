import { memo } from 'react';
import { 
  Plus, 
  Paperclip, 
  FolderOpen, 
  Image, 
  Search, 
  Bot,
  MoreHorizontal,
  GraduationCap,
  Globe,
  PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

export type ComposerAction = 
  | 'upload_files'
  | 'google_drive'
  | 'create_image'
  | 'investigate'
  | 'agent_mode'
  | 'study_learn'
  | 'web_search'
  | 'whiteboard';

interface ComposerActionsMenuProps {
  onAction: (action: ComposerAction) => void;
  disabled?: boolean;
}

export const ComposerActionsMenu = memo(function ComposerActionsMenu({
  onAction,
  disabled = false,
}: ComposerActionsMenuProps) {
  const handleAction = (action: ComposerAction) => {
    switch (action) {
      case 'upload_files':
        onAction('upload_files');
        break;
      case 'google_drive':
        toast.info('Adicionar do Google Drive', { 
          description: 'Esta funcionalidade estará disponível em breve.' 
        });
        break;
      case 'create_image':
        toast.info('Criar imagem', { 
          description: 'Você pode pedir para a NexusIA gerar imagens diretamente na conversa. Ex: "Crie uma imagem de..."' 
        });
        break;
      case 'investigate':
        toast.info('Modo Investigar', { 
          description: 'Esta funcionalidade de pesquisa aprofundada estará disponível em breve.' 
        });
        break;
      case 'agent_mode':
        toast.info('Modo Agente', { 
          description: 'O modo de execução autônoma de tarefas estará disponível em breve.' 
        });
        break;
      case 'study_learn':
        toast.info('Estudar e Aprender', { 
          description: 'O modo de estudo guiado estará disponível em breve.' 
        });
        break;
      case 'web_search':
        toast.info('Buscar na web', { 
          description: 'A NexusIA já pode buscar informações na web durante a conversa. Basta perguntar!' 
        });
        break;
      case 'whiteboard':
        toast.info('Lousa', { 
          description: 'A lousa interativa para desenhos e diagramas estará disponível em breve.' 
        });
        break;
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          disabled={disabled}
          className="h-8 w-8 rounded-full text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors"
          title="Mais opções"
        >
          <Plus className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="start" 
        className="w-56 bg-[#18181B] border-white/10"
        sideOffset={8}
      >
        {/* Primary actions */}
        <DropdownMenuItem 
          onClick={() => handleAction('upload_files')}
          className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/10"
        >
          <Paperclip className="h-4 w-4 text-muted-foreground" />
          <span>Adicionar fotos e arquivos</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleAction('google_drive')}
          className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/10"
        >
          <FolderOpen className="h-4 w-4 text-muted-foreground" />
          <span>Adicionar de Google Drive</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />

        {/* AI Features */}
        <DropdownMenuItem 
          onClick={() => handleAction('create_image')}
          className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/10"
        >
          <Image className="h-4 w-4 text-muted-foreground" />
          <span>Criar imagem</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleAction('investigate')}
          className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/10"
        >
          <Search className="h-4 w-4 text-muted-foreground" />
          <span>Investigar</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          onClick={() => handleAction('agent_mode')}
          className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/10"
        >
          <Bot className="h-4 w-4 text-muted-foreground" />
          <span>Modo agente</span>
        </DropdownMenuItem>

        {/* More submenu */}
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/10">
            <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
            <span>Mais</span>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent 
            className="w-48 bg-[#18181B] border-white/10"
            sideOffset={4}
          >
            <DropdownMenuItem 
              onClick={() => handleAction('study_learn')}
              className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/10"
            >
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
              <span>Estudar e aprender</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleAction('web_search')}
              className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/10"
            >
              <Globe className="h-4 w-4 text-muted-foreground" />
              <span>Buscar na web</span>
            </DropdownMenuItem>
            
            <DropdownMenuItem 
              onClick={() => handleAction('whiteboard')}
              className="flex items-center gap-3 py-2.5 cursor-pointer hover:bg-white/10"
            >
              <PenTool className="h-4 w-4 text-muted-foreground" />
              <span>Lousa</span>
            </DropdownMenuItem>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

export default ComposerActionsMenu;
