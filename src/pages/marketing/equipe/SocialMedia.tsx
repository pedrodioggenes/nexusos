import {
  Instagram,
  Facebook,
  Youtube,
  MessageCircle,
  Users,
  TrendingUp,
  Calendar,
  BarChart3,
} from "lucide-react";
import { TeamAreaPage, TeamAreaConfig } from "@/components/marketing/team/TeamAreaPage";

const config: TeamAreaConfig = {
  taskType: "social",
  title: "Social Media",
  subtitle: "Gestão de demandas de redes sociais e conteúdo orgânico",
  defaultPlatforms: ["Instagram"],
  statIcons: [
    <Users className="h-4 w-4" />,
    <TrendingUp className="h-4 w-4" />,
    <Calendar className="h-4 w-4" />,
    <BarChart3 className="h-4 w-4" />,
  ],
  extraSection: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Instagram className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-lg font-bold">28.5K</p>
            <p className="text-[10px] text-muted-foreground">seguidores</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-blue-500/10">
            <Facebook className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <p className="text-lg font-bold">12.8K</p>
            <p className="text-[10px] text-muted-foreground">curtidas</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-destructive/10">
            <Youtube className="h-5 w-5 text-destructive" />
          </div>
          <div>
            <p className="text-lg font-bold">3.9K</p>
            <p className="text-[10px] text-muted-foreground">inscritos</p>
          </div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-emerald-500/10">
            <MessageCircle className="h-5 w-5 text-emerald-500" />
          </div>
          <div>
            <p className="text-lg font-bold">8.2K</p>
            <p className="text-[10px] text-muted-foreground">contatos</p>
          </div>
        </div>
      </div>
    </div>
  ),
};

export default function SocialMedia() {
  return <TeamAreaPage config={config} />;
}
