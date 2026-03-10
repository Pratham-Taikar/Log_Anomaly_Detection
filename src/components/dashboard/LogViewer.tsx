import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter } from 'lucide-react';
import { LogEntry } from '@/types/dataTypes';
import { cn } from '@/lib/utils';

interface LogViewerProps {
  logs: LogEntry[];
}

const levelColors = {
  INFO: 'text-primary',
  WARN: 'text-accent',
  ERROR: 'text-destructive',
  DEBUG: 'text-muted-foreground',
};

const levelBg = {
  INFO: 'bg-primary/10',
  WARN: 'bg-accent/10',
  ERROR: 'bg-destructive/10',
  DEBUG: 'bg-muted',
};

export function LogViewer({ logs }: LogViewerProps) {
  const [search, setSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('ALL');
  const [predictionFilter, setPredictionFilter] = useState<string>('ALL');
  const [showTemplates, setShowTemplates] = useState(false);
  const hasPredictions = logs.some(l => l.prediction);

  const filtered = useMemo(() => {
    return logs.filter(log => {
      if (levelFilter !== 'ALL' && log.level !== levelFilter) return false;
      if (predictionFilter !== 'ALL' && log.prediction !== predictionFilter) return false;
      if (search && !log.raw.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [logs, search, levelFilter, predictionFilter]);

  return (
    <div className="space-y-4">
      <div className="flex gap-3 items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search logs..."
            className="w-full bg-secondary border border-border rounded-md pl-10 pr-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex gap-1">
          {['ALL', 'ERROR', 'WARN', 'INFO', 'DEBUG'].map(level => (
            <button
              key={level}
              onClick={() => setLevelFilter(level)}
              className={cn(
                'px-3 py-2 text-xs font-mono rounded-md transition-all',
                levelFilter === level ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'
              )}
            >
              {level}
            </button>
          ))}
        </div>
        {hasPredictions && (
          <div className="flex gap-1">
            {['ALL', 'Anomaly', 'Normal'].map(p => (
              <button
                key={p}
                onClick={() => setPredictionFilter(p)}
                className={cn(
                  'px-3 py-2 text-xs font-medium rounded-md transition-all',
                  predictionFilter === p ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'
                )}
              >
                {p}
              </button>
            ))}
          </div>
        )}
        <button
          onClick={() => setShowTemplates(!showTemplates)}
          className={cn(
            'flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-md transition-all',
            showTemplates ? 'bg-primary/20 text-primary' : 'bg-secondary text-muted-foreground hover:text-foreground'
          )}
        >
          <Filter className="w-3 h-3" />
          Templates
        </button>
      </div>

      <div className="glass-card rounded-lg border border-border overflow-hidden">
        <div
          className={cn(
            'grid gap-4 px-4 py-2.5 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider border-b border-border',
            hasPredictions ? 'grid-cols-[140px_60px_100px_1fr_130px]' : 'grid-cols-[160px_70px_120px_1fr]'
          )}
        >
          <span>Timestamp</span>
          <span>Level</span>
          <span>Service</span>
          <span>{showTemplates ? 'Template' : 'Message'}</span>
          {hasPredictions && <span>Detection</span>}
        </div>
        <div className="max-h-[500px] overflow-y-auto scrollbar-thin">
          {filtered.slice(0, 100).map((log, i) => (
            <motion.div
              key={log.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: i * 0.01 }}
              className={cn(
                'grid gap-4 px-4 py-2.5 text-xs font-mono border-b border-border/50 hover:bg-secondary/50 transition-colors',
                log.level === 'ERROR' && 'bg-destructive/5',
                log.prediction === 'Anomaly' && 'bg-destructive/5',
                hasPredictions ? 'grid-cols-[140px_60px_100px_1fr_130px]' : 'grid-cols-[160px_70px_120px_1fr]'
              )}
            >
              <span className="text-muted-foreground">{log.timestamp}</span>
              <span className={cn('font-semibold', levelColors[log.level])}>
                <span className={cn('px-1.5 py-0.5 rounded text-[10px]', levelBg[log.level])}>
                  {log.level}
                </span>
              </span>
              <span className="text-secondary-foreground truncate">{log.component}</span>
              <span className="text-foreground truncate">
                {showTemplates ? log.template : log.raw}
              </span>
              {hasPredictions && (
                <div className="flex flex-col gap-0.5">
                  <span
                    className={cn(
                      'font-medium',
                      log.prediction === 'Anomaly' ? 'text-destructive' : 'text-success'
                    )}
                  >
                    {log.prediction ?? '—'}
                    {log.confidence != null && (
                      <span className="text-muted-foreground ml-1">({(log.confidence * 100).toFixed(0)}%)</span>
                    )}
                  </span>
                  {log.detection_reason && log.prediction === 'Anomaly' && (
                    <span className="text-[10px] text-muted-foreground truncate" title={log.detection_reason}>
                      {log.detection_reason}
                    </span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </div>
        <div className="px-4 py-2 bg-muted/30 text-xs text-muted-foreground border-t border-border">
          Showing {Math.min(filtered.length, 100)} of {filtered.length} entries
        </div>
      </div>
    </div>
  );
}
