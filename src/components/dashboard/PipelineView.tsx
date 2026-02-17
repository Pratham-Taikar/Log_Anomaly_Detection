import { motion } from 'framer-motion';
import { FileText, Code, Database, BarChart3, Brain, GitMerge, Monitor, ArrowRight, CheckCircle2 } from 'lucide-react';

const PIPELINE_STEPS = [
  { id: 'collect', label: 'Log Collection', description: 'Ingest raw log files from software systems', icon: 'FileText' },
  { id: 'parse', label: 'Log Parsing', description: 'Extract templates using Drain-style parsing', icon: 'Code' },
  { id: 'store', label: 'Database Storage', description: 'Store structured logs for querying', icon: 'Database' },
  { id: 'extract', label: 'Feature Extraction', description: 'Compute numerical feature vectors', icon: 'BarChart3' },
  { id: 'detect', label: 'Anomaly Detection', description: 'Isolation Forest + Statistical thresholds', icon: 'Brain' },
  { id: 'hybrid', label: 'Hybrid Decision', description: 'Combine ML and statistical results', icon: 'GitMerge' },
  { id: 'visualize', label: 'Visualization', description: 'Dashboard with actionable insights', icon: 'Monitor' },
];
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  FileText, Code, Database, BarChart3, Brain, GitMerge, Monitor,
};

export function PipelineView() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Processing Pipeline</h2>
        <p className="text-sm text-muted-foreground">Raw Logs → Parsing → Feature Extraction → Anomaly Detection → Hybrid Decision → Visualization</p>
      </div>

      <div className="flex flex-col gap-3">
        {PIPELINE_STEPS.map((step, i) => {
          const Icon = iconMap[step.icon];
          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center">
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center border',
                    'bg-primary/10 border-primary/30 text-primary'
                  )}>
                    {Icon && <Icon className="w-5 h-5" />}
                  </div>
                  {i < PIPELINE_STEPS.length - 1 && (
                    <div className="w-px h-6 bg-border mt-1" />
                  )}
                </div>
                <div className="glass-card rounded-lg border border-border p-4 flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">{step.label}</h3>
                      <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
                    </div>
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="glass-card rounded-lg border border-border p-5 mt-8">
        <h3 className="text-sm font-semibold text-foreground mb-4">Parsing Example</h3>
        <div className="space-y-3">
          <div className="bg-muted rounded-md p-3">
            <p className="text-xs text-muted-foreground mb-1">Raw Log</p>
            <code className="text-xs font-mono text-foreground">2024-02-18 10:15:21 ERROR Block 2356 failed due to timeout</code>
          </div>
          <div className="flex justify-center">
            <ArrowRight className="w-4 h-4 text-primary" />
          </div>
          <div className="bg-primary/5 border border-primary/20 rounded-md p-3">
            <p className="text-xs text-primary mb-1">Parsed Template</p>
            <code className="text-xs font-mono text-foreground">Block {"<*>"} failed due to timeout</code>
            <div className="flex gap-2 mt-2">
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-mono">param: 2356</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-mono">level: ERROR</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
