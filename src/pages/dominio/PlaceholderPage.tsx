import { BlurFade } from "@/components/ui/blur-fade";
import { Card } from "@/components/ui/card";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  subtitle: string;
}

export function PlaceholderPage({ title, subtitle }: PlaceholderPageProps) {
  return (
    <div className="space-y-6">
      <BlurFade delay={0}>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
        </div>
      </BlurFade>

      <BlurFade delay={0.1}>
        <Card className="p-8 bg-card border-border">
          <div className="flex flex-col items-center justify-center text-center py-8">
             <div className="h-14 w-14 rounded-xl bg-app-dominio/10 flex items-center justify-center mb-4">
              <Construction className="h-7 w-7 text-app-dominio" />
            </div>
            <h3 className="font-semibold text-foreground text-lg">Em desenvolvimento</h3>
            <p className="text-sm text-muted-foreground mt-2 max-w-md">
              Esta página está sendo construída e estará disponível em breve com dados e análises completas.
            </p>
          </div>
        </Card>
      </BlurFade>
    </div>
  );
}
