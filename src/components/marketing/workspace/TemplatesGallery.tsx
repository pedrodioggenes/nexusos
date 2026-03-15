import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { WORKSPACE_TEMPLATES, TEMPLATE_CATEGORIES, type WorkspaceTemplate } from '@/lib/workspace-templates';
import { useCreateWorkspacePage } from '@/hooks/useWorkspacePages';
import { cn } from '@/lib/utils';

interface TemplatesGalleryProps {
  onClose?: () => void;
}

export function TemplatesGallery({ onClose }: TemplatesGalleryProps) {
  const navigate = useNavigate();
  const createPage = useCreateWorkspacePage();

  const handleUseTemplate = async (template: WorkspaceTemplate) => {
    const newPage = await createPage.mutateAsync({
      title: template.name,
      icon: template.icon,
      content: template.content,
    });
    
    onClose?.();
    navigate(`/app/marketing/documentos/${newPage.id}`);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-app-gestao" />
        <h2 className="font-semibold">Começar com Template</h2>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {WORKSPACE_TEMPLATES.map((template, index) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <Card
              className="group cursor-pointer hover:border-app-gestao/30 transition-all hover:shadow-lg p-4"
              onClick={() => handleUseTemplate(template)}
            >
              <div className="flex items-start gap-3">
                <span className="text-3xl">{template.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm truncate group-hover:text-app-gestao transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {template.description}
                  </p>
                  <Badge 
                    variant="secondary" 
                    className={cn(
                      "mt-2 text-[10px] px-1.5 py-0",
                      TEMPLATE_CATEGORIES[template.category].color
                    )}
                  >
                    {TEMPLATE_CATEGORIES[template.category].label}
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
