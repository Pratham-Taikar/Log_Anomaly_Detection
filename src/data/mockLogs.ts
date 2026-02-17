// Simulated log data and anomaly detection results

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  raw: string;
  template: string;
  params: string[];
  component: string;
}

export interface AnomalyPoint {
  time: string;
  errorCount: number;
  avgResponseTime: number;
  uniqueTemplates: number;
  anomalyScore: number;
  isAnomaly: boolean;
  isolationForest: 'normal' | 'anomaly';
  statistical: 'normal' | 'anomaly';
  hybridDecision: 'normal' | 'warning' | 'anomaly';
}

export interface FeatureVector {
  timeWindow: string;
  errorCount: number;
  warnCount: number;
  uniqueTemplates: number;
  avgResponseTime: number;
  eventFrequency: number;
  stdDeviation: number;
}

const components = ['AuthService', 'BlockManager', 'DataPipeline', 'APIGateway', 'CacheLayer', 'Scheduler', 'StorageEngine', 'NetworkIO'];

const templates: { template: string; level: LogEntry['level']; component: string }[] = [
  { template: 'Block <*> replicated to <*> nodes successfully', level: 'INFO', component: 'BlockManager' },
  { template: 'Request processed in <*>ms for endpoint <*>', level: 'INFO', component: 'APIGateway' },
  { template: 'Cache hit ratio: <*>% for partition <*>', level: 'INFO', component: 'CacheLayer' },
  { template: 'Connection timeout after <*>ms to host <*>', level: 'ERROR', component: 'NetworkIO' },
  { template: 'Block <*> failed due to timeout', level: 'ERROR', component: 'BlockManager' },
  { template: 'Memory usage exceeded <*>% threshold', level: 'WARN', component: 'StorageEngine' },
  { template: 'Authentication failed for user <*> from IP <*>', level: 'WARN', component: 'AuthService' },
  { template: 'Scheduled task <*> completed in <*>ms', level: 'INFO', component: 'Scheduler' },
  { template: 'Pipeline stage <*> processing <*> records', level: 'INFO', component: 'DataPipeline' },
  { template: 'Disk I/O latency spike: <*>ms on volume <*>', level: 'ERROR', component: 'StorageEngine' },
  { template: 'Rate limit exceeded for client <*>', level: 'WARN', component: 'APIGateway' },
  { template: 'Data corruption detected in block <*>', level: 'ERROR', component: 'BlockManager' },
];

function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateTimestamp(baseHour: number, minute: number): string {
  return `2024-02-18 ${String(baseHour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:${String(randomInt(0, 59)).padStart(2, '0')}`;
}

export function generateLogs(): LogEntry[] {
  const logs: LogEntry[] = [];
  for (let h = 8; h <= 18; h++) {
    const isAnomalyHour = h === 14 || h === 15;
    const count = isAnomalyHour ? randomInt(40, 60) : randomInt(8, 18);
    for (let i = 0; i < count; i++) {
      const tpl = isAnomalyHour && Math.random() > 0.4
        ? templates.filter(t => t.level === 'ERROR' || t.level === 'WARN')[randomInt(0, 4)]
        : templates[randomInt(0, templates.length - 1)];
      const params = [String(randomInt(1000, 9999)), String(randomInt(1, 200))];
      const raw = tpl.template.replace('<*>', params[0]).replace('<*>', params[1]);
      logs.push({
        id: `log-${h}-${i}`,
        timestamp: generateTimestamp(h, randomInt(0, 59)),
        level: tpl.level,
        raw,
        template: tpl.template,
        params,
        component: tpl.component,
      });
    }
  }
  return logs.sort((a, b) => a.timestamp.localeCompare(b.timestamp));
}

export function generateTimeSeriesData(): AnomalyPoint[] {
  const points: AnomalyPoint[] = [];
  for (let h = 8; h <= 18; h++) {
    for (let m = 0; m < 60; m += 10) {
      const isAnomaly = (h === 14 && m >= 20) || (h === 15 && m <= 30);
      const errorCount = isAnomaly ? randomInt(15, 45) : randomInt(0, 5);
      const avgResponseTime = isAnomaly ? randomInt(800, 2500) : randomInt(50, 300);
      const uniqueTemplates = isAnomaly ? randomInt(8, 12) : randomInt(2, 5);
      const anomalyScore = isAnomaly ? Math.random() * 0.4 + 0.6 : Math.random() * 0.3;

      const isoResult = anomalyScore > 0.65 ? 'anomaly' : 'normal';
      const statResult = errorCount > 12 || avgResponseTime > 700 ? 'anomaly' : 'normal';
      const hybrid = isoResult === 'anomaly' && statResult === 'anomaly'
        ? 'anomaly'
        : isoResult === 'anomaly' || statResult === 'anomaly'
          ? 'warning'
          : 'normal';

      points.push({
        time: `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`,
        errorCount,
        avgResponseTime,
        uniqueTemplates,
        anomalyScore,
        isAnomaly,
        isolationForest: isoResult as 'normal' | 'anomaly',
        statistical: statResult as 'normal' | 'anomaly',
        hybridDecision: hybrid as 'normal' | 'warning' | 'anomaly',
      });
    }
  }
  return points;
}

export function generateFeatureVectors(): FeatureVector[] {
  return generateTimeSeriesData().map(p => ({
    timeWindow: p.time,
    errorCount: p.errorCount,
    warnCount: randomInt(0, p.errorCount),
    uniqueTemplates: p.uniqueTemplates,
    avgResponseTime: p.avgResponseTime,
    eventFrequency: randomInt(10, 100),
    stdDeviation: Math.round(Math.random() * 50 * 100) / 100,
  }));
}

export const PIPELINE_STEPS = [
  { id: 'collect', label: 'Log Collection', description: 'Ingest raw log files from software systems', icon: 'FileText' },
  { id: 'parse', label: 'Log Parsing', description: 'Extract templates using Drain-style parsing', icon: 'Code' },
  { id: 'store', label: 'Database Storage', description: 'Store structured logs for querying', icon: 'Database' },
  { id: 'extract', label: 'Feature Extraction', description: 'Compute numerical feature vectors', icon: 'BarChart3' },
  { id: 'detect', label: 'Anomaly Detection', description: 'Isolation Forest + Statistical thresholds', icon: 'Brain' },
  { id: 'hybrid', label: 'Hybrid Decision', description: 'Combine ML and statistical results', icon: 'GitMerge' },
  { id: 'visualize', label: 'Visualization', description: 'Dashboard with actionable insights', icon: 'Monitor' },
] as const;
