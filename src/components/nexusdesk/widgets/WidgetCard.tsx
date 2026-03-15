import { motion } from "framer-motion";

interface HWWidgetCardProps {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  delay?: number;
}

export function HWWidgetCard({ title, icon, children, delay = 0 }: HWWidgetCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="rounded-lg p-3 bg-festval-graphite border border-festval-border"
    >
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: 'hsl(var(--festval-stone))' }}>{icon}</span>
        <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: 'hsl(var(--festval-stone))' }}>
          {title}
        </h3>
      </div>
      {children}
    </motion.div>
  );
}
