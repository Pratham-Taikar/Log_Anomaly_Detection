import { useState, useMemo, useCallback } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { LogViewer } from '@/components/dashboard/LogViewer';
import { PipelineView } from '@/components/dashboard/PipelineView';
import { AnomalyDetection } from '@/components/dashboard/AnomalyDetection';
import { FeatureTable } from '@/components/dashboard/FeatureTable';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { generateLogs, generateTimeSeriesData, generateFeatureVectors } from '@/data/mockLogs';
import { PipelineResult } from '@/lib/logParser';
import { Clock, Database } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  const [dataSource, setDataSource] = useState<'mock' | 'uploaded'>('mock');
  const [uploadedResult, setUploadedResult] = useState<PipelineResult | null>(null);

  const mockLogs = useMemo(() => generateLogs(), []);
  const mockTimeSeries = useMemo(() => generateTimeSeriesData(), []);
  const mockFeatures = useMemo(() => generateFeatureVectors(), []);

  // Use uploaded data if available and selected, otherwise mock
  const logs = dataSource === 'uploaded' && uploadedResult ? uploadedResult.logs : mockLogs;
  const timeSeriesData = dataSource === 'uploaded' && uploadedResult ? uploadedResult.anomalies : mockTimeSeries;
  const featureVectors = dataSource === 'uploaded' && uploadedResult ? uploadedResult.features : mockFeatures;

  const handlePipelineComplete = useCallback((result: PipelineResult) => {
    setUploadedResult(result);
    setDataSource('uploaded');
  }, []);

  const tabTitles: Record<string, string> = {
    upload: 'Log File Upload',
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
            <p className="text-xs text-muted-foreground font-mono">Monitoring Active</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Data source toggle */}
            <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
              <button
                onClick={() => setDataSource('mock')}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  dataSource === 'mock'
                    ? 'bg-primary/20 text-primary'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <Database className="w-3 h-3 inline mr-1.5" />
                Demo Data
              </button>
              <button
                onClick={() => uploadedResult && setDataSource('uploaded')}
                disabled={!uploadedResult}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  dataSource === 'uploaded'
                    ? 'bg-primary/20 text-primary'
                    : uploadedResult
                      ? 'text-muted-foreground hover:text-foreground'
                      : 'text-muted-foreground/40 cursor-not-allowed'
                }`}
              >
                Uploaded Data
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs text-success">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
              System Online
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-md text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {dataSource === 'uploaded' ? 'Uploaded' : 'Demo'}
            </div>
          </div>
        </header>
        <div className="p-8">
          {activeTab === 'upload' && <FileUpload onPipelineComplete={handlePipelineComplete} />}
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
