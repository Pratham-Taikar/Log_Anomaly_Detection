import { useState, useMemo } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { LogViewer } from '@/components/dashboard/LogViewer';
import { PipelineView } from '@/components/dashboard/PipelineView';
import { AnomalyDetection } from '@/components/dashboard/AnomalyDetection';
import { FeatureTable } from '@/components/dashboard/FeatureTable';
import { generateLogs, generateTimeSeriesData, generateFeatureVectors } from '@/data/mockLogs';
import { Clock } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const logs = useMemo(() => generateLogs(), []);
  const timeSeriesData = useMemo(() => generateTimeSeriesData(), []);
  const featureVectors = useMemo(() => generateFeatureVectors(), []);

  const tabTitles: Record<string, string> = {
    overview: 'System Overview',
    logs: 'Log Viewer',
    pipeline: 'Processing Pipeline',
    anomalies: 'Anomaly Detection',
    features: 'Feature Extraction',
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      <main className="flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur-md px-8 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-foreground">{tabTitles[activeTab]}</h2>
            <p className="text-xs text-muted-foreground font-mono">2024-02-18 • Monitoring Active</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Online
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              08:00 — 18:00
            </div>
          </div>
        </header>
        <div className="p-8">
          {activeTab === 'overview' && <OverviewTab logs={logs} timeSeriesData={timeSeriesData} />}
          {activeTab === 'logs' && <LogViewer logs={logs} />}
          {activeTab === 'pipeline' && <PipelineView />}
          {activeTab === 'anomalies' && <AnomalyDetection data={timeSeriesData} />}
          {activeTab === 'features' && <FeatureTable data={featureVectors} />}
        </div>
      </main>
    </div>
  );
};

export default Index;
