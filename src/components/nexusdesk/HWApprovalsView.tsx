import { motion } from "framer-motion";
import { CheckSquare, Clock, FileCheck, AlertTriangle } from "lucide-react";
import { useHWProfile } from "@/hooks/useHWProfile";

interface ApprovalItem {
  id: string;
  type: string;
  title: string;
  requester: string;
  date: string;
  status: 'pending' | 'urgent';
}

const MOCK_APPROVALS: ApprovalItem[] = [
  { id: '1', type: 'Férias', title: 'Solicitação de férias - 15 dias', requester: 'Maria Silva', date: '2026-03-10', status: 'pending' },
  { id: '2', type: 'Compra', title: 'Compra de materiais de escritório', requester: 'João Santos', date: '2026-03-08', status: 'urgent' },
  { id: '3', type: 'Demanda', title: 'Campanha Dia das Mães', requester: 'Ana Costa', date: '2026-03-07', status: 'pending' },
];

export function HWApprovalsView() {
  const { department } = useHWProfile();

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto px-3 sm:px-6 py-6 pb-20 lg:pb-6">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="mb-6"
        >
          <h1 className="text-xl font-bold text-festval-ivory">
            Aprovações Pendentes
          </h1>
          <p className="text-sm mt-1 text-festval-stone">
            Gerencie solicitações que precisam da sua decisão
          </p>
        </motion.div>

        <div className="space-y-3">
          {MOCK_APPROVALS.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="rounded-xl p-4 flex items-start gap-4 bg-festval-graphite"
              style={{ border: '1px solid hsl(var(--festval-border))' }}
            >
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                style={{ backgroundColor: item.status === 'urgent' ? 'rgba(239,68,68,0.15)' : 'hsl(var(--festval-copper) / 0.15)' }}
              >
                {item.status === 'urgent' ? (
                  <AlertTriangle className="h-5 w-5" style={{ color: '#EF4444' }} />
                ) : (
                  <Clock className="h-5 w-5 text-festval-copper" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                    style={{ backgroundColor: 'hsl(var(--festval-border))', color: 'hsl(var(--festval-stone))' }}>
                    {item.type}
                  </span>
                  {item.status === 'urgent' && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                      style={{ backgroundColor: 'rgba(239,68,68,0.15)', color: '#EF4444' }}>
                      Urgente
                    </span>
                  )}
                </div>
                <p className="text-sm font-medium text-festval-ivory">{item.title}</p>
                <p className="text-xs mt-0.5 text-festval-stone">
                  Solicitado por {item.requester} · {new Date(item.date).toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  className="h-8 px-3 rounded-lg text-xs font-medium transition-colors hover:opacity-90 text-festval-ivory"
                  style={{ backgroundColor: '#22C55E' }}
                >
                  Aprovar
                </button>
                <button
                  className="h-8 px-3 rounded-lg text-xs font-medium transition-colors hover:bg-zinc-800 text-festval-stone"
                  style={{ border: '1px solid hsl(var(--festval-border))' }}
                >
                  Recusar
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {MOCK_APPROVALS.length === 0 && (
          <div className="text-center py-16">
            <FileCheck className="h-12 w-12 mx-auto mb-3" style={{ color: 'hsl(var(--festval-border))' }} />
            <p className="text-sm font-medium text-festval-stone">Tudo aprovado!</p>
            <p className="text-xs mt-1" style={{ color: 'hsl(var(--festval-stone-muted))' }}>Nenhuma solicitação pendente</p>
          </div>
        )}
      </div>
    </div>
  );
}
