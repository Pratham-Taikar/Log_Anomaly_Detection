import { useState, useMemo, useCallback } from 'react';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { OverviewTab } from '@/components/dashboard/OverviewTab';
import { LogViewer } from '@/components/dashboard/LogViewer';
import { PipelineView } from '@/components/dashboard/PipelineView';
import { AnomalyDetection } from '@/components/dashboard/AnomalyDetection';
import { FeatureTable } from '@/components/dashboard/FeatureTable';
import { FileUpload } from '@/components/dashboard/FileUpload';
import { PipelineResult } from '@/lib/logParser';
import { Clock, Database } from 'lucide-react';

const Index = () => {
  const [activeTab, setActiveTab] = useState('upload');
  // No demo/static data by default — start in uploaded mode
  const [dataSource, setDataSource] = useState<'uploaded'>('uploaded');
  const [uploadedResult, setUploadedResult] = useState<PipelineResult | null>(null);
  // Use uploaded data; if none uploaded yet, default to empty arrays
  const logs = uploadedResult ? uploadedResult.logs : [];
  const timeSeriesData = uploadedResult ? uploadedResult.anomalies : [];
  const featureVectors = uploadedResult ? uploadedResult.features : [];

  const handlePipelineComplete = useCallback((result: PipelineResult) => {
    setUploadedResult(result);
    setDataSource('uploaded');
  }, []);

  const handleClearSystem = useCallback(() => {
    setUploadedResult(null);
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
            <div className="flex items-center gap-1 bg-secondary rounded-md p-0.5">
              <button
                onClick={() => uploadedResult && setDataSource('uploaded')}
                disabled={!uploadedResult}
                className={`px-3 py-1.5 rounded text-xs font-medium transition-all ${
                  uploadedResult
                    ? 'text-muted-foreground hover:text-foreground'
                    : 'text-muted-foreground/40 cursor-not-allowed'
                }`}
              >
                <Database className="w-3 h-3 inline mr-1.5" />
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
          {activeTab === 'upload' && (
            <FileUpload onPipelineComplete={handlePipelineComplete} onClearSystem={handleClearSystem} />
          )}
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
