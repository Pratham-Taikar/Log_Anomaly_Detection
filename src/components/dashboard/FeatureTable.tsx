import { motion } from 'framer-motion';
import { FeatureVector } from '@/data/mockLogs';
import { cn } from '@/lib/utils';

interface FeatureTableProps {
  data: FeatureVector[];
}

export function FeatureTable({ data }: FeatureTableProps) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Feature Extraction</h2>
        <p className="text-sm text-muted-foreground">Numerical feature vectors computed per 10-minute time window</p>
      </div>

      <div className="glass-card rounded-lg border border-border overflow-hidden">
        <div className="grid grid-cols-7 gap-2 px-4 py-2.5 bg-muted/30 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
          <span>Window</span>
          <span>Errors</span>
          <span>Warnings</span>
          <span>Templates</span>
          <span>Avg RT (ms)</span>
          <span>Frequency</span>
          <span>Std Dev</span>
        </div>
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
          {data.map((row, i) => {
            const isHigh = row.errorCount > 12 || row.avgResponseTime > 700;
            return (
              <motion.div
                key={row.timeWindow}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.01 }}
                className={cn(
                  'grid grid-cols-7 gap-2 px-4 py-2 text-xs font-mono border-b border-border/50 hover:bg-secondary/50 transition-colors',
                  isHigh && 'bg-destructive/5'
                )}
              >
                <span className="text-foreground">{row.timeWindow}</span>
                <span className={row.errorCount > 12 ? 'text-destructive font-semibold' : 'text-foreground'}>{row.errorCount}</span>
                <span className={row.warnCount > 8 ? 'text-accent' : 'text-foreground'}>{row.warnCount}</span>
                <span className="text-foreground">{row.uniqueTemplates}</span>
                <span className={row.avgResponseTime > 700 ? 'text-accent font-semibold' : 'text-foreground'}>{row.avgResponseTime}</span>
                <span className="text-foreground">{row.eventFrequency}</span>
                <span className="text-muted-foreground">{row.stdDeviation}</span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
