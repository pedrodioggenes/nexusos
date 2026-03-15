import { cn } from "@/lib/utils";

interface StoreScoreGaugeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

function getScoreColor(score: number) {
  if (score >= 75) return 'text-green-500';
  if (score >= 50) return 'text-yellow-500';
  if (score >= 30) return 'text-orange-500';
  return 'text-destructive';
}

function getScoreRingColor(score: number) {
  if (score >= 75) return 'stroke-green-500';
  if (score >= 50) return 'stroke-yellow-500';
  if (score >= 30) return 'stroke-orange-500';
  return 'stroke-destructive';
}

function getScoreLabel(score: number) {
  if (score >= 75) return 'Excelente';
  if (score >= 50) return 'Bom';
  if (score >= 30) return 'Regular';
  return 'Crítico';
}

const sizes = {
  sm: { outer: 48, stroke: 4, fontSize: 'text-sm', labelSize: 'text-[8px]' },
  md: { outer: 64, stroke: 5, fontSize: 'text-lg', labelSize: 'text-[9px]' },
  lg: { outer: 88, stroke: 6, fontSize: 'text-2xl', labelSize: 'text-[10px]' },
};

export function StoreScoreGauge({ score, size = 'md', className }: StoreScoreGaugeProps) {
  const s = sizes[size];
  const radius = (s.outer - s.stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - score / 100);

  return (
    <div className={cn('relative inline-flex items-center justify-center', className)}>
      <svg width={s.outer} height={s.outer} className="-rotate-90">
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={radius}
          fill="none"
          className="stroke-muted"
          strokeWidth={s.stroke}
        />
        <circle
          cx={s.outer / 2}
          cy={s.outer / 2}
          r={radius}
          fill="none"
          className={getScoreRingColor(score)}
          strokeWidth={s.stroke}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={cn('font-bold leading-none', s.fontSize, getScoreColor(score))}>
          {score}
        </span>
        {size !== 'sm' && (
          <span className={cn('text-muted-foreground mt-0.5', s.labelSize)}>
            {getScoreLabel(score)}
          </span>
        )}
      </div>
    </div>
  );
}
