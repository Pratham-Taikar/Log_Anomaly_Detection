import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AlertTriangle, FileText, ShieldAlert, BarChart3 } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AnomalyChart } from './AnomalyChart';
import { AnomalyPoint, LogEntry } from '@/types/dataTypes';
import type { StatsResponse } from '@/api/logApi';

interface OverviewTabProps {
  logs: LogEntry[];
  timeSeriesData: AnomalyPoint[];
  apiStats?: StatsResponse | null;
}

export function OverviewTab({ logs, timeSeriesData, apiStats }: OverviewTabProps) {
  const serviceAnomalyData = useMemo(() => {
    const anomalyLogs = logs.filter(l => l.prediction === 'Anomaly');
    const byService = new Map<string, number>();
    anomalyLogs.forEach(l => {
      const svc = l.component || 'System';
      byService.set(svc, (byService.get(svc) ?? 0) + 1);
    });
    return Array.from(byService.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);
  }, [logs]);

  const stats = useMemo(() => {
    if (apiStats) {
      return {
        total: apiStats.total_logs,
        errors: logs.filter(l => l.level === 'ERROR').length,
        anomalies: apiStats.anomaly_count,
        templates: new Set(logs.map(l => l.template)).size,
        normal: apiStats.normal_count,
        anomalyPct: apiStats.anomaly_percentage,
      };
    }
    const errors = logs.filter(l => l.level === 'ERROR').length;
    const warnings = logs.filter(l => l.level === 'WARN').length;
    const anomalies = timeSeriesData.filter(d => d.hybridDecision === 'anomaly').length;
    const templates = new Set(logs.map(l => l.template)).size;
    return { errors, warnings, anomalies, templates, total: logs.length, normal: logs.length - anomalies, anomalyPct: 0 };
  }, [logs, timeSeriesData, apiStats]);

  const hasData = logs.length > 0;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-border bg-muted/20 p-4 mb-6">
        <h3 className="text-sm font-medium text-foreground mb-1">Detection Summary</h3>
        <p className="text-xs text-muted-foreground">
          {apiStats
            ? 'Real-time ML (Isolation Forest) + Rule-based detection. Rules flag brute force, DB failures, unauthorized access.'
            : 'Client-side hybrid detection (ML simulation + statistical thresholds).'}
        </p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Logs Analyzed"
          value={stats.total.toLocaleString()}
          subtitle={hasData ? 'From uploaded file' : 'Upload a log file to start'}
          icon={FileText}
          variant="primary"
        />
        <MetricCard
          title="Error Logs"
          value={stats.errors}
          subtitle="ERROR level entries"
          icon={AlertTriangle}
          variant="danger"
        />
        <MetricCard
          title="Anomalies Detected"
          value={stats.anomalies}
          subtitle={apiStats && stats.total > 0 ? `${(stats.anomalyPct ?? 0).toFixed(1)}% of total` : 'ML + Rules'}
          icon={ShieldAlert}
          variant="warning"
        />
        <MetricCard
          title={apiStats ? 'Normal Logs' : 'Unique Templates'}
          value={apiStats ? (stats.normal ?? 0) : stats.templates}
          subtitle={apiStats ? 'No anomaly flagged' : 'Distinct log patterns'}
          icon={BarChart3}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {serviceAnomalyData.length > 0 && (
          <div className="glass-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-medium text-foreground mb-1">Anomalies per Service</h3>
            <p className="text-xs text-muted-foreground mb-4">Which services produced the most anomalies</p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={serviceAnomalyData} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 18%)" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(220, 18%, 10%)',
                    border: '1px solid hsl(220, 14%, 18%)',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="count" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <AnomalyChart data={timeSeriesData} metric="errorCount" title="Error Count Over Time" />
        <AnomalyChart data={timeSeriesData} metric="avgResponseTime" title="Avg Response Time (ms)" />
      </div>

      <AnomalyChart data={timeSeriesData} metric="anomalyScore" title="Anomaly Score — Hybrid Detection" />
    </div>
  );
}
