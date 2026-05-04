import { useMemo } from "react";
import { motion } from "framer-motion";
import { AnomalyPoint, LogEntry } from "@/types/dataTypes";
import { cn } from "@/lib/utils";
import { Shield, AlertTriangle } from "lucide-react";

interface AnomalyDetectionProps {
  data: AnomalyPoint[];
  logs?: LogEntry[];
  dataSource?: "uploaded" | "backend";
}

const isBackendFormat = (d: AnomalyPoint) =>
  d.message != null || d.source != null;

export function AnomalyDetection({
  data,
  logs = [],
  dataSource = "uploaded",
}: AnomalyDetectionProps) {
  const anomalies = useMemo(
    () =>
      data.filter(
        (d) =>
          d.hybridDecision !== "normal" || (isBackendFormat(d) && d.isAnomaly),
      ),
    [data],
  );
  const anomalyLogs = useMemo(
    () =>
      logs.length > 0 && dataSource === "backend"
        ? logs.filter((l) => l.prediction === "Anomaly")
        : [],
    [logs, dataSource],
  );
  const useBackendFormat =
    dataSource === "backend" ||
    (anomalies.length > 0 && isBackendFormat(anomalies[0]));

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="rounded-lg border border-border bg-destructive/10 p-5 flex items-start gap-4">
        <div className="bg-destructive/20 p-3 rounded-full">
          <AlertTriangle className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h2 className="text-base font-semibold text-foreground mb-1">
            Threat Alerts Center
          </h2>
          <p className="text-sm text-muted-foreground">
            {useBackendFormat
              ? "Security events automatically flagged by our AI and rule-based system (e.g., brute force attempts, unauthorized access)."
              : "Potential security threats detected from your current data."}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="glass-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/15 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              AI Threat Analysis
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Our AI model continuously learns normal behavior and identifies
            rare, potentially malicious activities.
          </p>
        </div>

        <div className="glass-card rounded-lg border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-accent/15 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-foreground">
              Security Rules Engine
            </h3>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Deterministic rules immediately flag known attack signatures and
            critical system failures.
          </p>
        </div>
      </div>

      <div className="glass-card rounded-lg border border-border overflow-hidden">
        <div className="px-5 py-3 border-b border-border bg-muted/30">
          <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-destructive"></span>
            </span>
            Active Alerts (
            {useBackendFormat ? anomalyLogs.length : anomalies.length})
          </h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {useBackendFormat
              ? "Detailed view of flagged security events."
              : "Time-window based threat detection."}
          </p>
        </div>
        {useBackendFormat && anomalyLogs.length > 0 ? (
          <>
            <div className="grid grid-cols-[130px_60px_90px_1fr_140px_70px] gap-4 px-5 py-2.5 bg-muted/20 text-[10px] font-medium text-muted-foreground uppercase tracking-wider border-b border-border">
              <span>Timestamp</span>
              <span>Level</span>
              <span>Source</span>
              <span>Message</span>
              <span>Why Flagged</span>
              <span>Conf.</span>
            </div>
            <div className="max-h-[400px] overflow-y-auto scrollbar-thin">
              {anomalyLogs.map((log, i) => (
                <motion.div
                  key={log.id + i}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.02 }}
                  className="grid grid-cols-[130px_60px_90px_1fr_140px_70px] gap-4 px-5 py-2.5 text-xs font-mono border-b border-border/50 bg-destructive/5 hover:bg-destructive/10"
                >
                  <span className="text-muted-foreground">{log.timestamp}</span>
                  <span className="font-medium text-destructive">
                    {log.level}
                  </span>
                  <span className="text-primary">{log.source ?? "ML"}</span>
                  <span className="text-foreground truncate" title={log.raw}>
                    {log.raw}
                  </span>
                  <span
                    className="text-muted-foreground text-[11px]"
                    title={log.detection_reason}
                  >
                    {log.detection_reason ?? "—"}
                  </span>
                  <span className="font-medium text-destructive">
                    {log.confidence != null
                      ? `${(log.confidence * 100).toFixed(0)}%`
                      : "—"}
                  </span>
                </motion.div>
              ))}
            </div>
          </>
        ) : useBackendFormat && anomalyLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No anomalies detected. All logs classified as Normal.
          </div>
        ) : (
          <>
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
                    "grid grid-cols-[80px_100px_100px_120px_1fr] gap-4 px-5 py-2.5 text-xs font-mono border-b border-border/50",
                    a.hybridDecision === "anomaly"
                      ? "bg-destructive/5"
                      : "bg-accent/5",
                  )}
                >
                  <span className="text-foreground">{a.time}</span>
                  <span
                    className={
                      a.isolationForest === "anomaly"
                        ? "text-destructive"
                        : "text-success"
                    }
                  >
                    {a.isolationForest === "anomaly" ? "⚠ Anomaly" : "✓ Normal"}
                  </span>
                  <span
                    className={
                      a.statistical === "anomaly"
                        ? "text-destructive"
                        : "text-success"
                    }
                  >
                    {a.statistical === "anomaly" ? "⚠ Anomaly" : "✓ Normal"}
                  </span>
                  <span
                    className={cn(
                      "font-semibold",
                      a.hybridDecision === "anomaly"
                        ? "text-destructive"
                        : "text-accent",
                    )}
                  >
                    {a.hybridDecision === "anomaly" ? "🔴 High" : "🟡 Warning"}
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          (a.anomalyScore ?? 0) > 0.7
                            ? "bg-destructive"
                            : "bg-accent",
                        )}
                        style={{ width: `${(a.anomalyScore ?? 0) * 100}%` }}
                      />
                    </div>
                    <span className="text-muted-foreground w-10 text-right">
                      {((a.anomalyScore ?? 0) * 100).toFixed(0)}%
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}
        {!useBackendFormat && anomalies.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-sm">
            No anomaly windows detected. Use ML Backend mode for per-log
            detection.
          </div>
        )}
      </div>
    </div>
  );
}
