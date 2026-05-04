import {
  Activity,
  BarChart3,
  Brain,
  FileText,
  GitMerge,
  LayoutDashboard,
  Settings,
  Upload,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const mainNavItems = [
  { id: "overview", label: "Dashboard", icon: LayoutDashboard },
  { id: "anomalies", label: "Threat Alerts", icon: Brain },
  { id: "upload", label: "Import Data", icon: Upload },
  { id: "system", label: "How It Works", icon: Activity },
];

const advancedNavItems = [
  { id: "logs", label: "Raw Data Explorer", icon: FileText },
  { id: "pipeline", label: "Processing Steps", icon: GitMerge },
  { id: "features", label: "ML Features", icon: BarChart3 },
];

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-border bg-sidebar flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="font-semibold text-sm text-foreground tracking-tight">
              AnomalyBuster
            </h1>
            <p className="text-[10px] text-muted-foreground font-serial uppercase tracking-widest">
              Anomaly Detection System
            </p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-6">
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Main Menu
          </p>
          {mainNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
        <div className="space-y-1">
          <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Under the Hood
          </p>
          {advancedNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all",
                activeTab === item.id
                  ? "bg-primary/10 text-primary glow-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary",
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>
      </nav>
      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-all">
          <Settings className="w-4 h-4" />
          Settings
        </button>
      </div>
    </aside>
  );
}
