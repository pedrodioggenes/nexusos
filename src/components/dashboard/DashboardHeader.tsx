import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DashboardHeaderProps {
  userName: string;
  className?: string;
}

/**
 * Premium Dashboard Header - Simplified version
 * Only displays welcome message and subtitle
 */
export function DashboardHeader({
  userName,
  className,
}: DashboardHeaderProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className={cn("mb-6", className)}
    >
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <h1 className="text-xl md:text-2xl font-bold tracking-tight text-foreground">
          Bem-vindo de volta, {userName}
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Veja o que está acontecendo na sua plataforma hoje
        </p>
      </motion.div>
    </motion.div>
  );
}
