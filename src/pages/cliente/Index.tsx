import { PageHeader } from "@/components/ui/page-header";
import { Heart, Users, TrendingUp, MessageSquare } from "lucide-react";

export default function ClienteHome() {
  const stats = [
    { label: "Clientes Ativos", value: "—", icon: Users },
    { label: "NPS Atual", value: "—", icon: TrendingUp },
    { label: "Tickets Abertos", value: "—", icon: MessageSquare },
    { label: "Satisfação", value: "—", icon: Heart },
  ];

  return (
    <div>
      <PageHeader
        title="Cliente"
        description="Gestão de relacionamento e experiência do cliente"
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-border bg-card p-4 flex flex-col gap-2"
          >
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-module-cliente/10 flex items-center justify-center">
                <stat.icon className="h-4 w-4 text-module-cliente" />
              </div>
            </div>
            <p className="text-2xl font-semibold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col items-center justify-center py-16 text-muted-foreground border border-dashed border-border rounded-xl">
        <Heart className="h-12 w-12 mb-4 opacity-20" />
        <p className="text-sm font-medium">Aplicativo em desenvolvimento</p>
        <p className="text-xs mt-1">As funcionalidades serão implementadas em breve.</p>
      </div>
    </div>
  );
}
