import { PageHeader } from "@/components/ui/page-header";
import { Construction } from "lucide-react";

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

export default function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  return (
    <div>
      <PageHeader title={title} description={description || "Em construção"} />
      <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
        <Construction className="h-12 w-12 mb-4 opacity-30" />
        <p className="text-sm">Esta página será implementada na próxima fase.</p>
      </div>
    </div>
  );
}
