import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Store, 
  Search,
  MapPin,
  TrendingUp,
  TrendingDown,
  Plus,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  useStorePerformance, 
  useStorePerformanceStats,
  type StorePerformance 
} from "@/hooks/useStorePerformance";
import { useStoreScores, type StoreScore } from "@/hooks/useStoreScore";
import { CreateStorePerformanceDialog } from "@/components/marketing/CreateStorePerformanceDialog";
import { cn } from "@/lib/utils";
import { StoreRankingCard } from "@/components/marketing/StoreRankingCard";
import { StoreComparisonCard } from "@/components/marketing/StoreComparisonCard";
import { RegionalAlertsCard } from "@/components/marketing/RegionalAlertsCard";
import { StoreScoreRanking } from "@/components/marketing/StoreScoreRanking";
import { StoreDetailDrawer } from "@/components/marketing/StoreDetailDrawer";
import { StoreScoreGauge } from "@/components/marketing/StoreScoreGauge";
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { BlurFade } from "@/components/ui/blur-fade";
import { Empty } from "@/components/ui/empty";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function Lojas() {
  const [searchQuery, setSearchQuery] = useState("");
  const [periodType, setPeriodType] = useState("monthly");
  const [selectedStore, setSelectedStore] = useState<StorePerformance | null>(null);
  const [selectedScoreStore, setSelectedScoreStore] = useState<StoreScore | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);

  const { data: stores = [], isLoading } = useStorePerformance(periodType);
  const { data: stats } = useStorePerformanceStats();
  const { data: storeScores = [] } = useStoreScores();

  const filteredStores = stores.filter(store => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        store.unit?.name?.toLowerCase().includes(query) ||
        store.unit?.city?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Sort by ROI
  const sortedStores = [...filteredStores].sort((a, b) => (b.roi || 0) - (a.roi || 0));

  const handleStoreClick = (store: StorePerformance) => {
    setSelectedStore(store);
  };

  const handleScoreStoreClick = (store: StoreScore) => {
    setSelectedScoreStore(store);
    setShowDetailDrawer(true);
  };

  // Build a score map for the store cards
  const scoreMap = new Map(storeScores.map(s => [s.unitId, s]));

  return (
    <PageWrapper
      title="Performance por Loja"
      subtitle="Análise de ROI e métricas por unidade"
      icon={<Store className="h-5 w-5 text-app-gestao" />}
      actions={
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowCreateDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Registrar Performance
          </Button>
          <Select value={periodType} onValueChange={setPeriodType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      }
    >

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="border-app-gestao/30 bg-app-gestao/5">
          <CardContent className="p-3">
            <p className="text-lg md:text-xl font-bold text-app-gestao">
              {stats?.storeCount || 0}
            </p>
            <p className="text-[10px] text-muted-foreground">Lojas Monitoradas</p>
          </CardContent>
        </Card>

        <Card className="border-green-500/30 bg-green-500/5">
          <CardContent className="p-3">
            <p className="text-lg md:text-xl font-bold text-green-500">
              {(stats?.averageRoi || 0).toFixed(0)}%
            </p>
            <p className="text-[10px] text-muted-foreground">ROI Médio</p>
          </CardContent>
        </Card>

        <Card className="border-blue-500/30 bg-blue-500/5">
          <CardContent className="p-3">
            <p className="text-lg md:text-xl font-bold text-blue-500">
              {formatCurrency(stats?.totalRevenue || 0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Receita Total</p>
          </CardContent>
        </Card>

        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-3">
            <p className="text-lg md:text-xl font-bold text-yellow-500">
              {formatCurrency(stats?.totalInvestment || 0)}
            </p>
            <p className="text-[10px] text-muted-foreground">Investimento</p>
          </CardContent>
        </Card>
      </div>

      {/* Score Ranking + Alerts + Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
        <StoreScoreRanking
          scores={storeScores}
          onStoreClick={handleScoreStoreClick}
        />
        <RegionalAlertsCard 
          limit={3} 
        />
        <StoreComparisonCard store={selectedStore} className="md:col-span-2 lg:col-span-1" />
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar loja ou cidade..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Stores List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="h-5 w-5 border-2 border-app-gestao/30 border-t-app-gestao rounded-full animate-spin" />
        </div>
      ) : sortedStores.length === 0 ? (
        <Empty
          icon={<Store className="h-12 w-12" />}
          title="Nenhum dado encontrado"
          description={searchQuery ? "Tente ajustar a busca" : "Registre dados de performance por loja"}
        />
      ) : (
        <div className="grid gap-3 md:gap-4 md:grid-cols-2 lg:grid-cols-3">
          {sortedStores.map((store, index) => {
            const roi = store.roi || 0;
            const isHighPerformance = roi >= 200;
            const isLowPerformance = roi < 100;
            const isSelected = selectedStore?.id === store.id;

            return (
              <motion.div
                key={store.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                onClick={() => handleStoreClick(store)}
                className="cursor-pointer"
              >
                <Card className={cn(
                  "border-border/50 hover:shadow-md transition-all",
                  isHighPerformance && "ring-1 ring-green-500/30",
                  isLowPerformance && "ring-1 ring-destructive/30",
                  isSelected && "ring-2 ring-app-gestao"
                )}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        {/* Score gauge replaces rank number */}
                        {(() => {
                          const storeScore = scoreMap.get(store.unit_id);
                          return storeScore ? (
                            <StoreScoreGauge score={storeScore.score} size="sm" />
                          ) : (
                            <div className={cn(
                              "h-10 w-10 rounded-lg flex items-center justify-center text-sm font-bold",
                              isHighPerformance && "bg-green-500/10 text-green-500",
                              isLowPerformance && "bg-destructive/10 text-destructive",
                              !isHighPerformance && !isLowPerformance && "bg-muted text-muted-foreground"
                            )}>
                              {index + 1}
                            </div>
                          );
                        })()}
                        <div>
                          <h3 className="font-medium text-sm">
                            {store.unit?.name || "Loja"}
                          </h3>
                          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                            <MapPin className="h-2.5 w-2.5" />
                            {store.unit?.city || "Cidade"}
                          </div>
                        </div>
                      </div>

                      <div className={cn(
                        "flex items-center gap-1 text-lg font-bold",
                        isHighPerformance && "text-green-500",
                        isLowPerformance && "text-destructive",
                        !isHighPerformance && !isLowPerformance && "text-foreground"
                      )}>
                        {isHighPerformance ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : isLowPerformance ? (
                          <TrendingDown className="h-4 w-4" />
                        ) : null}
                        {roi.toFixed(0)}%
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        <div>
                          <p className="text-muted-foreground">Investimento</p>
                          <p className="font-medium">{formatCurrency(store.investment)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Receita</p>
                          <p className="font-medium text-green-500">{formatCurrency(store.revenue)}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-center p-2 rounded bg-muted/30">
                        <div>
                          <p className="text-sm font-semibold">{store.impressions?.toLocaleString('pt-BR') || 0}</p>
                          <p className="text-[9px] text-muted-foreground">Impressões</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{store.clicks?.toLocaleString('pt-BR') || 0}</p>
                          <p className="text-[9px] text-muted-foreground">Cliques</p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold">{store.conversions || 0}</p>
                          <p className="text-[9px] text-muted-foreground">Conversões</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">
                          Taxa de Conversão: {(store.conversion_rate || 0).toFixed(1)}%
                        </span>
                        {store.foot_traffic > 0 && (
                          <span className="text-muted-foreground">
                            Fluxo: {store.foot_traffic.toLocaleString('pt-BR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <CreateStorePerformanceDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
      <StoreDetailDrawer
        store={selectedScoreStore}
        open={showDetailDrawer}
        onOpenChange={setShowDetailDrawer}
      />
    </PageWrapper>
  );
}