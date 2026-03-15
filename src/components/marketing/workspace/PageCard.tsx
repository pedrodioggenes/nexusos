import { Star, MoreHorizontal, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

export interface PageData {
  id: string;
  title: string;
  icon: string;
  is_favorite: boolean;
  updated_at: string;
  cover_image?: string | null;
}

interface PageCardProps {
  page: PageData;
  onClick: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  isSelected?: boolean;
  onSelect?: (selected: boolean) => void;
  selectionMode?: boolean;
}

export function PageCard({ 
  page, 
  onClick, 
  onDelete, 
  onToggleFavorite,
  isSelected = false,
  onSelect,
  selectionMode = false,
}: PageCardProps) {
  const handleClick = () => {
    if (selectionMode && onSelect) {
      onSelect(!isSelected);
    } else {
      onClick();
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect?.(!isSelected);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
    >
      <Card
        className={cn(
          "group relative cursor-pointer overflow-hidden transition-all",
          isSelected 
            ? "border-primary ring-2 ring-primary/20" 
            : "hover:border-module-gestao/30"
        )}
        onClick={handleClick}
      >
        {/* Checkbox for selection */}
        <div 
          className={cn(
            "absolute top-2 left-2 z-10 transition-opacity",
            selectionMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"
          )}
          onClick={handleCheckboxClick}
        >
          <Checkbox 
            checked={isSelected}
            className="h-5 w-5 bg-background/80 backdrop-blur-sm border-2"
          />
        </div>

        {/* Cover or gradient */}
        {page.cover_image ? (
          <div className="h-16 overflow-hidden">
            <img 
              src={page.cover_image} 
              alt="" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-16 bg-gradient-to-br from-module-gestao/10 to-module-gestao/5" />
        )}

        <div className="p-4">
          <div className="flex items-start gap-3">
            <span className="text-3xl">{page.icon}</span>
            <div className="flex-1 min-w-0">
              <h3 className="font-medium truncate">{page.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">
                Editado {new Date(page.updated_at).toLocaleDateString('pt-BR', {
                  day: 'numeric',
                  month: 'short',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Actions overlay */}
        <div className={cn(
          "absolute top-2 right-2 transition-opacity flex gap-1",
          selectionMode ? "opacity-0" : "opacity-0 group-hover:opacity-100"
        )}>
          <Button
            variant="secondary"
            size="icon"
            className="h-7 w-7"
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
          >
            <Star className={cn(
              "h-3.5 w-3.5",
              page.is_favorite && "fill-amber-500 text-amber-500"
            )} />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="secondary" size="icon" className="h-7 w-7">
                <MoreHorizontal className="h-3.5 w-3.5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete();
                }}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Excluir
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </Card>
    </motion.div>
  );
}
