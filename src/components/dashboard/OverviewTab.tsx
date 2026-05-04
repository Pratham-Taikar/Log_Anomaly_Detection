import { useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { AlertTriangle, FileText, ShieldAlert, BarChart3 } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { AnomalyChart } from "./AnomalyChart";
import { AnomalyPoint, LogEntry } from "@/types/dataTypes";
import type { StatsResponse } from "@/api/logApi";

interface OverviewTabProps {
  logs: LogEntry[];
  timeSeriesData: AnomalyPoint[];
  apiStats?: StatsResponse | null;
}

export function OverviewTab({
  logs,
  timeSeriesData,
  apiStats,
}: OverviewTabProps) {
  const serviceAnomalyData = useMemo(() => {
    const anomalyLogs = logs.filter((l) => l.prediction === "Anomaly");
    const byService = new Map<string, number>();
    anomalyLogs.forEach((l) => {
      const svc = l.component || "System";
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
        errors: logs.filter((l) => l.level === "ERROR").length,
        anomalies: apiStats.anomaly_count,
        templates: new Set(logs.map((l) => l.template)).size,
        normal: apiStats.normal_count,
        anomalyPct: apiStats.anomaly_percentage,
      };
    }
    const errors = logs.filter((l) => l.level === "ERROR").length;
    const warnings = logs.filter((l) => l.level === "WARN").length;
    const anomalies = timeSeriesData.filter(
      (d) => d.hybridDecision === "anomaly",
    ).length;
    const templates = new Set(logs.map((l) => l.template)).size;
    return {
      errors,
      warnings,
      anomalies,
      templates,
      total: logs.length,
      normal: logs.length - anomalies,
      anomalyPct: 0,
    };
  }, [logs, timeSeriesData, apiStats]);

  const hasData = logs.length > 0;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-lg border border-border bg-muted/20 p-5 mb-6 flex items-start gap-4">
        <div className="bg-primary/20 p-3 rounded-full">
          <ShieldAlert className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-foreground mb-1">
            System Monitoring Active
          </h3>
          <p className="text-sm text-muted-foreground">
            {apiStats
              ? "Our AI-driven security engine is actively scanning your system in real-time. It automatically detects unusual behavior, potential security breaches, and critical system failures."
              : "Client-side scanning mode is active. Upload data to begin analyzing for potential threats and anomalies."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <MetricCard
          title="Total Events Analyzed"
          value={stats.total.toLocaleString()}
          subtitle={
            hasData ? "From current data source" : "Upload data to start"
          }
          icon={FileText}
          variant="primary"
        />
        <MetricCard
          title="Critical Errors"
          value={stats.errors}
          subtitle="System failures requiring attention"
          icon={AlertTriangle}
          variant="danger"
        />
        <MetricCard
          title="Potential Threats"
          value={stats.anomalies}
          subtitle={
            apiStats && stats.total > 0
              ? `${(stats.anomalyPct ?? 0).toFixed(1)}% of all events`
              : "AI + Security Rules"
          }
          icon={ShieldAlert}
          variant="warning"
        />
        <MetricCard
          title={apiStats ? "Safe Events" : "Event Types"}
          value={apiStats ? (stats.normal ?? 0) : stats.templates}
          subtitle={
            apiStats ? "Verified normal activity" : "Distinct system activities"
          }
          icon={BarChart3}
          variant="default"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {serviceAnomalyData.length > 0 && (
          <div className="glass-card rounded-lg border border-border p-5">
            <h3 className="text-sm font-medium text-foreground mb-1">
              Threats by System Area
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Which parts of the system are most affected
            </p>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={serviceAnomalyData}
                margin={{ top: 5, right: 5, bottom: 5, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(220, 14%, 18%)"
                />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} width={30} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(220, 18%, 10%)",
                    border: "1px solid hsl(220, 14%, 18%)",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                />
                <Bar
                  dataKey="count"
                  fill="hsl(0, 72%, 55%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
        <AnomalyChart
          data={timeSeriesData}
          metric="errorCount"
          title="System Errors Over Time"
        />
        <AnomalyChart
          data={timeSeriesData}
          metric="avgResponseTime"
          title="System Latency (Response Time)"
        />
      </div>

      <AnomalyChart
        data={timeSeriesData}
        metric="anomalyScore"
        title="AI Threat Risk Score Over Time"
      />
    </div>
  );
}
