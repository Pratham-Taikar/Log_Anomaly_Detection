import { useMemo } from 'react';
import { AlertTriangle, FileText, Activity, ShieldAlert, Clock, BarChart3 } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { AnomalyChart } from './AnomalyChart';
import { AnomalyPoint, LogEntry } from '@/types/dataTypes';

interface OverviewTabProps {
  logs: LogEntry[];
  timeSeriesData: AnomalyPoint[];
}

export function OverviewTab({ logs, timeSeriesData }: OverviewTabProps) {
  const stats = useMemo(() => {
    const errors = logs.filter(l => l.level === 'ERROR').length;
    const warnings = logs.filter(l => l.level === 'WARN').length;
    const anomalies = timeSeriesData.filter(d => d.hybridDecision === 'anomaly').length;
    const templates = new Set(logs.map(l => l.template)).size;
    return { errors, warnings, anomalies, templates, total: logs.length };
  }, [logs, timeSeriesData]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Logs"
          value={stats.total.toLocaleString()}
          subtitle="Last 11 hours"
          icon={FileText}
          variant="primary"
        />
        <MetricCard
          title="Errors"
          value={stats.errors}
          icon={AlertTriangle}
          variant="danger"
          trend="up"
          trendValue="+180% during anomaly"
        />
        <MetricCard
          title="Anomalies Detected"
          value={stats.anomalies}
          subtitle="High confidence"
          icon={ShieldAlert}
          variant="warning"
        />
        <MetricCard
          title="Unique Templates"
          value={stats.templates}
          icon={BarChart3}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <AnomalyChart data={timeSeriesData} metric="errorCount" title="Error Count Over Time" />
        <AnomalyChart data={timeSeriesData} metric="avgResponseTime" title="Avg Response Time (ms)" />
      </div>

      <AnomalyChart data={timeSeriesData} metric="anomalyScore" title="Anomaly Score — Hybrid Detection" />
    </div>
  );
}
