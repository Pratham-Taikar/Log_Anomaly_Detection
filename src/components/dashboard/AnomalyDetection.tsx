import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { AnomalyPoint } from '@/data/mockLogs';
import { cn } from '@/lib/utils';
import { Shield, ShieldAlert, ShieldCheck, AlertTriangle } from 'lucide-react';

interface AnomalyDetectionProps {
  data: AnomalyPoint[];
}

export function AnomalyDetection({ data }: AnomalyDetectionProps) {
  const anomalies = useMemo(() => data.filter(d => d.hybridDecision !== 'normal'), [data]);
  const highConfidence = anomalies.filter(d => d.hybridDecision === 'anomaly');
  const warnings = anomalies.filter(d => d.hybridDecision === 'warning');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">Hybrid Anomaly Detection</h2>
        <p className="text-sm text-muted-foreground">Combining Isolation Forest (ML) + Statistical Threshold analysis</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Isolation Forest</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">Unsupervised ML model isolating rare events in feature space using random partitioning trees.</p>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between"><span className="text-muted-foreground">Type</span><span className="text-foreground">Unsupervised</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Features</span><span className="text-foreground">6-dimensional</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Contamination</span><span className="text-primary">0.05</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Trees</span><span className="text-foreground">100</span></div>
          </div>
        </div>

        <div className="glass-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">Statistical Thresholds</h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">μ ± kσ and percentile-based limits computed from baseline system behavior.</p>
          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between"><span className="text-muted-foreground">Method</span><span className="text-foreground">μ ± 3σ + P99</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Error threshold</span><span className="text-destructive">&gt; 12/min</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Latency limit</span><span className="text-accent">&gt; 700ms</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Baseline</span><span className="text-foreground">24h rolling</span></div>
          </div>
        </div>
      </div>

      <div className="glass-card rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground">Detected Anomalies ({anomalies.length})</h3>
        </div>
        <div className="grid grid-cols-[80px_100px_100px_120px_1fr] gap-4 px-5 py-2 bg-muted/20 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
          <span>Time</span>
          <span>Isolation Forest</span>
          <span>Statistical</span>
          <span>Hybrid Decision</span>
          <span>Score</span>
        </div>
        <div className="max-h-[350px] overflow-y-auto scrollbar-thin">
          {anomalies.map((a, i) => (
            <motion.div
              key={a.time}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.03 }}
              className={cn(
                'grid grid-cols-[80px_100px_100px_120px_1fr] gap-4 px-5 py-2.5 text-xs font-mono border-b border-border/50',
                a.hybridDecision === 'anomaly' ? 'bg-destructive/5' : 'bg-accent/5'
              )}
            >
              <span className="text-foreground">{a.time}</span>
              <span className={a.isolationForest === 'anomaly' ? 'text-destructive' : 'text-success'}>
                {a.isolationForest === 'anomaly' ? '⚠ Anomaly' : '✓ Normal'}
              </span>
              <span className={a.statistical === 'anomaly' ? 'text-destructive' : 'text-success'}>
                {a.statistical === 'anomaly' ? '⚠ Anomaly' : '✓ Normal'}
              </span>
              <span className={cn(
                'font-semibold',
                a.hybridDecision === 'anomaly' ? 'text-destructive' : 'text-accent'
              )}>
                {a.hybridDecision === 'anomaly' ? '🔴 High' : '🟡 Warning'}
              </span>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className={cn('h-full rounded-full', a.anomalyScore > 0.7 ? 'bg-destructive' : 'bg-accent')}
                    style={{ width: `${a.anomalyScore * 100}%` }}
                  />
                </div>
                <span className="text-muted-foreground w-10 text-right">{(a.anomalyScore * 100).toFixed(0)}%</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
