import { useState } from 'react';
import { Package, Plus, Search, MapPin } from 'lucide-react';
import { PageWrapper } from '@/components/marketing/PageWrapper';
import { PremiumGlassCard } from '@/components/dashboard/PremiumGlassCard';
import { BlurFade } from '@/components/ui/blur-fade';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useGondolas } from '@/hooks/useGondolas';
import { Badge } from '@/components/ui/badge';

export default function Gondolas() {
  const { tenant } = useAuth();
  const [search, setSearch] = useState('');
  const { data: gondolas = [], isLoading } = useGondolas(tenant?.id);

  const filteredGondolas = gondolas.filter(g =>
    g.code.toLowerCase().includes(search.toLowerCase()) ||
    g.sector?.toLowerCase().includes(search.toLowerCase()) ||
    g.category?.toLowerCase().includes(search.toLowerCase())
  );

  const sectors = Array.from(new Set(gondolas.map(g => g.sector).filter(Boolean)));

  return (
    <PageWrapper
      title="Gôndolas"
      subtitle="Mapa e gestão de prateleiras"
      icon={<Package className="w-6 h-6" />}
      actions={
        <Button className="bg-gradient-to-r from-emerald-500 to-emerald-600">
          <Plus className="w-4 h-4 mr-2" />
          Nova Gôndola
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Busca e Filtros */}
        <PremiumGlassCard className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, setor ou categoria..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2 flex-wrap">
              {sectors.map((sector) => (
                <Badge 
                  key={sector} 
                  variant="outline"
                  className="cursor-pointer hover:bg-emerald-500/20"
                  onClick={() => setSearch(sector || '')}
                >
                  {sector}
                </Badge>
              ))}
            </div>
          </div>
        </PremiumGlassCard>

        {/* Lista de Gôndolas */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded-lg animate-pulse" />
            ))}
          </div>
        ) : filteredGondolas.length === 0 ? (
          <PremiumGlassCard className="p-12 text-center">
            <Package className="w-12 h-12 mx-auto text-muted-foreground mb-4 opacity-50" />
            <p className="text-muted-foreground mb-4">Nenhuma gôndola encontrada</p>
            <Button>Adicionar Primeira Gôndola</Button>
          </PremiumGlassCard>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {filteredGondolas.map((gondola, idx) => (
              <BlurFade key={gondola.id} delay={0.03 * idx}>
                <PremiumGlassCard className="p-4 cursor-pointer hover:border-emerald-400 transition-colors text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center">
                    <span className="text-lg font-bold text-white">{gondola.code}</span>
                  </div>
                  <p className="text-sm font-medium truncate">{gondola.name || gondola.code}</p>
                  <p className="text-xs text-muted-foreground">{gondola.sector}</p>
                  <Badge variant="outline" className="mt-2 text-xs">
                    {gondola.category || 'Geral'}
                  </Badge>
                </PremiumGlassCard>
              </BlurFade>
            ))}
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
