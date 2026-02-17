import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { AnomalyPoint } from '@/data/mockLogs';

interface AnomalyChartProps {
  data: AnomalyPoint[];
  metric: 'errorCount' | 'avgResponseTime' | 'anomalyScore';
  title: string;
}

const metricConfig = {
  errorCount: { color: 'hsl(0, 72%, 55%)', label: 'Error Count', threshold: 12 },
  avgResponseTime: { color: 'hsl(38, 92%, 55%)', label: 'Avg Response (ms)', threshold: 700 },
  anomalyScore: { color: 'hsl(187, 80%, 52%)', label: 'Anomaly Score', threshold: 0.65 },
};

export function AnomalyChart({ data, metric, title }: AnomalyChartProps) {
  const config = metricConfig[metric];

  const chartData = useMemo(() => data.map(d => ({
    ...d,
    fill: d.hybridDecision === 'anomaly' ? 'hsl(0, 72%, 55%)' : d.hybridDecision === 'warning' ? 'hsl(38, 92%, 55%)' : config.color,
  })), [data, config.color]);

  return (
    <div className="glass-card rounded-lg border border-border p-5">
      <h3 className="text-sm font-medium text-foreground mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
          <defs>
            <linearGradient id={`gradient-${metric}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={config.color} stopOpacity={0.3} />
              <stop offset="100%" stopColor={config.color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} tickLine={false} axisLine={false} width={45} />
          <Tooltip
            contentStyle={{
              background: 'hsl(220, 18%, 10%)',
              border: '1px solid hsl(220, 14%, 18%)',
              borderRadius: '8px',
              fontSize: '12px',
              color: 'hsl(210, 20%, 92%)',
            }}
          />
          <ReferenceLine y={config.threshold} stroke="hsl(0, 72%, 55%)" strokeDasharray="5 5" strokeOpacity={0.6} />
          <Area type="monotone" dataKey={metric} stroke={config.color} fill={`url(#gradient-${metric})`} strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
