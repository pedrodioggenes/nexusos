import { motion, AnimatePresence } from "framer-motion";
import { Minus } from "lucide-react";
import {
  ClipboardList, BarChart3, Megaphone, LayoutDashboard, Package,
  Kanban, Headset, TrendingUp, Rocket, GanttChart, Home,
  Target, Store, DollarSign, FileText, Settings, FlaskConical,
  Zap, Users, Calendar, Shield, ListTodo, MapPin,
} from "lucide-react";

const ICON_MAP: Record<string, typeof Home> = {
  ClipboardList, BarChart3, Megaphone, LayoutDashboard, Package,
  Kanban, Headset, TrendingUp, Rocket, GanttChart,
  Target, Store, DollarSign, FileText, Settings, FlaskConical,
  Zap, Users, Calendar, Shield, ListTodo, MapPin,
};

interface DeskAppIconProps {
  title: string;
  icon: string;
  accentColor: string;
  appLabel?: string;
  onClick?: () => void;
  onRemove?: () => void;
  delay?: number;
  isEditing?: boolean;
  wobbleSeed?: number;
}

export function DeskAppIcon({ title, icon, accentColor, appLabel, onClick, onRemove, delay = 0, isEditing, wobbleSeed = 0 }: DeskAppIconProps) {
  const IconComponent = ICON_MAP[icon] || Package;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isEditing ? {
        opacity: 1,
        scale: 1,
        rotate: [0, -1.2, 1.2, -0.8, 0.8, 0],
      } : { opacity: 1, scale: 1, rotate: 0 }}
      transition={isEditing ? {
        rotate: { repeat: Infinity, duration: 0.8 + wobbleSeed * 0.4, ease: 'easeInOut' },
        opacity: { duration: 0.3, delay },
        scale: { duration: 0.3, delay },
      } : {
        duration: 0.3, delay, type: 'spring', stiffness: 300, damping: 20,
      }}
      className="w-full flex flex-col items-center pt-2"
    >
      {/* Inner 72px wrapper — badge stays anchored to the icon content, not the slot edge */}
      <div className="relative" style={{ width: 72 }}>
        {/* Remove badge */}
        <AnimatePresence>
          {isEditing && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 15 }}
              onClick={(e) => { e.stopPropagation(); onRemove?.(); }}
              className="absolute -top-0.5 -left-0.5 z-10 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: '#EF4444',
                boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
                width: 16,
                height: 16,
              }}
            >
              <Minus className="h-2 w-2 text-white" strokeWidth={3} />
            </motion.button>
          )}
        </AnimatePresence>

        <button
          onClick={isEditing ? undefined : onClick}
          className="flex flex-col items-center gap-0.5 p-1 rounded-md transition-all group w-full"
          onMouseEnter={(e) => {
            if (!isEditing) e.currentTarget.style.backgroundColor = 'rgba(39,39,42,0.6)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
          }}
        >
          {/* Icon container — uniform for all app shortcuts */}
          <div
            className="h-12 w-12 rounded-lg flex items-center justify-center transition-transform group-hover:scale-105"
            style={{
              backgroundColor: '#18181B',
              border: '1px solid #27272A',
            }}
          >
            <IconComponent className="h-5 w-5" style={{ color: accentColor }} />
          </div>
          {/* Label */}
          <span
            className="text-[9px] font-medium leading-tight text-center line-clamp-2 max-w-full"
            style={{ color: '#71717A' }}
          >
            {title}
          </span>
        </button>
      </div>
    </motion.div>
  );
}
