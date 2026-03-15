import {
  DollarSign,
  MousePointer,
  Eye,
  TrendingUp,
} from "lucide-react";
import { TeamAreaPage, TeamAreaConfig } from "@/components/marketing/team/TeamAreaPage";

const config: TeamAreaConfig = {
  taskType: "traffic",
  title: "Tráfego Pago",
  subtitle: "Gestão de campanhas de mídia paga e performance",
  defaultPlatforms: ["Meta Ads"],
  statIcons: [
    <DollarSign className="h-4 w-4" />,
    <TrendingUp className="h-4 w-4" />,
    <Eye className="h-4 w-4" />,
    <MousePointer className="h-4 w-4" />,
  ],
  extraSection: () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-module-gestao to-primary" />
          <h4 className="text-sm font-medium">Meta Ads</h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Investimento</span>
            <span className="font-medium">R$ 28.5K</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">ROAS</span>
            <span className="font-medium text-emerald-500">4.5x</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">CTR</span>
            <span className="font-medium">2.8%</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-amber-500 to-orange-500" />
          <h4 className="text-sm font-medium">Google Ads</h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Investimento</span>
            <span className="font-medium">R$ 12.8K</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">ROAS</span>
            <span className="font-medium text-emerald-500">3.8x</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">CTR</span>
            <span className="font-medium">3.2%</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="h-4 w-4 rounded bg-gradient-to-br from-destructive to-pink-500" />
          <h4 className="text-sm font-medium">TikTok Ads</h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">Investimento</span>
            <span className="font-medium">R$ 3.9K</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">ROAS</span>
            <span className="font-medium text-emerald-500">5.1x</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">CTR</span>
            <span className="font-medium">4.1%</span>
          </div>
        </div>
      </div>
    </div>
  ),
};

export default function Trafego() {
  return <TeamAreaPage config={config} />;
}
