import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center border border-dashed border-border rounded-xl">
        <div className="h-12 w-12 rounded-xl bg-app-loja/10 flex items-center justify-center mb-3">
          <Construction className="h-6 w-6 text-app-loja" />
        </div>
        <h3 className="text-sm font-medium text-foreground mb-1">Em desenvolvimento</h3>
        <p className="text-xs text-muted-foreground max-w-sm">{description}</p>
      </div>
    </div>
  );
}
