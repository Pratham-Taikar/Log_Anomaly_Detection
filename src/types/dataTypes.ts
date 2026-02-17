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
