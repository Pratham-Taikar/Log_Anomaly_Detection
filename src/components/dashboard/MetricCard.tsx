import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  variant?: 'default' | 'primary' | 'warning' | 'danger' | 'success';
}

const variantStyles = {
  default: 'border-border',
  primary: 'border-primary/30 glow-primary',
  warning: 'border-accent/30 glow-warning',
  danger: 'border-destructive/30 glow-danger',
  success: 'border-success/30',
};

const iconVariants = {
  default: 'bg-secondary text-foreground',
  primary: 'bg-primary/15 text-primary',
  warning: 'bg-accent/15 text-accent',
  danger: 'bg-destructive/15 text-destructive',
  success: 'bg-success/15 text-success',
};

export function MetricCard({ title, value, subtitle, icon: Icon, trend, trendValue, variant = 'default' }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn('glass-card rounded-lg p-5 border', variantStyles[variant])}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
          <p className="text-2xl font-bold text-foreground font-mono">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trendValue && (
            <p className={cn(
              'text-xs font-medium',
              trend === 'up' ? 'text-destructive' : trend === 'down' ? 'text-success' : 'text-muted-foreground'
            )}>
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendValue}
            </p>
          )}
        </div>
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', iconVariants[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </motion.div>
  );
}
