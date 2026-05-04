import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Network,
  Database,
  Cpu,
  ShieldCheck,
  Zap,
  LineChart as LineChartIcon,
} from "lucide-react";

export function SystemMetrics() {
  const confusionMatrixData = [
    { name: "Predicted Normal", "Actual Normal": 2805, "Actual Anomaly": 14 },
    { name: "Predicted Anomaly", "Actual Normal": 159, "Actual Anomaly": 22 },
  ];

  const metricsData = [
    {
      metric: "Accuracy",
      value: "94.23%",
      status: "Excellent",
      type: "success",
    },
    { metric: "Precision", value: "78.00%", status: "Good", type: "success" },
    { metric: "Recall", value: "84.00%", status: "Excellent", type: "success" },
    { metric: "F1 Score", value: "80.89%", status: "Good", type: "success" },
  ];

  const performanceData = [
    { time: "00:00", load: 45, latency: 120 },
    { time: "04:00", load: 30, latency: 105 },
    { time: "08:00", load: 65, latency: 150 },
    { time: "12:00", load: 85, latency: 210 },
    { time: "16:00", load: 70, latency: 180 },
    { time: "20:00", load: 50, latency: 130 },
  ];

  const comparisonData = [
    { name: "LogST", Accuracy: 89, Precision: 89, Recall: 90, "F1 Score": 89 },
    {
      name: "LogAssist",
      Accuracy: 84,
      Precision: 83,
      Recall: 85,
      "F1 Score": 84,
    },
    {
      name: "Ensemble",
      Accuracy: 92,
      Precision: 91,
      Recall: 92,
      "F1 Score": 91,
    },
    { name: "EvLog", Accuracy: 94, Precision: 93, Recall: 95, "F1 Score": 94 },
    {
      name: "LogPara",
      Accuracy: 93,
      Precision: 92,
      Recall: 94,
      "F1 Score": 93,
    },
    {
      name: "Proposed",
      Accuracy: 95,
      Precision: 94,
      Recall: 95,
      "F1 Score": 94,
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header Section */}
      <div className="text-center space-y-4 mb-8">
        <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary via-purple-400 to-primary">
          How the System Works
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Our anomaly detection pipeline utilizes a hybrid approach, combining
          Isolation Forest machine learning models with deterministic rule-based
          engines to provide real-time, high-accuracy threat detection.
        </p>
      </div>

      {/* Architecture Section */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20 -translate-y-1/2 hidden md:block z-0" />

        {[
          {
            title: "Log Ingestion",
            icon: Database,
            desc: "Raw logs collected & parsed",
          },
          {
            title: "Feature Extraction",
            icon: Network,
            desc: "TF-IDF & Statistical metrics",
          },
          { title: "ML Analysis", icon: Cpu, desc: "Isolation Forest scoring" },
          {
            title: "Alert Generation",
            icon: ShieldCheck,
            desc: "Hybrid decision & reporting",
          },
        ].map((step, idx) => (
          <div
            key={idx}
            className="glass-card p-6 rounded-xl relative z-10 flex flex-col items-center text-center hover:-translate-y-1 transition-transform duration-300 shadow-[0_0_15px_rgba(0,0,0,0.2)] hover:shadow-[0_0_25px_hsl(var(--primary)/0.3)]"
          >
            <div className="w-14 h-14 rounded-full bg-background border-2 border-primary/50 flex items-center justify-center mb-4 text-primary glow-primary">
              <step.icon className="w-6 h-6" />
            </div>
            <h3 className="font-semibold text-foreground">{step.title}</h3>
            <p className="text-xs text-muted-foreground mt-2">{step.desc}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Confusion Matrix Graph */}
        <div className="glass-card p-6 rounded-xl border border-border/50">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Zap className="w-5 h-5 text-warning" />
              Confusion Matrix Visualization
            </h3>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={confusionMatrixData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                <Tooltip
                  cursor={{ fill: "hsl(var(--muted)/0.4)" }}
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                  }}
                />
                <Legend />
                <Bar
                  dataKey="Actual Normal"
                  fill="hsl(var(--success))"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="Actual Anomaly"
                  fill="hsl(var(--destructive))"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Metrics Table */}
        <div className="glass-card p-6 rounded-xl border border-border/50 flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-primary" />
            Model Evaluation Metrics
          </h3>
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full overflow-hidden rounded-lg border border-border/50">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-medium">Metric</th>
                    <th className="px-6 py-4 font-medium">Value</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {metricsData.map((row, i) => (
                    <tr key={i} className="hover:bg-muted/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {row.metric}
                      </td>
                      <td className="px-6 py-4 text-primary font-mono">
                        {row.value}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${row.type === "success" ? "bg-success/10 text-success" : "bg-warning/10 text-warning"}`}
                        >
                          <div
                            className={`w-1.5 h-1.5 rounded-full ${row.type === "success" ? "bg-success" : "bg-warning"}`}
                          />
                          {row.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Comparative Performance Chart */}
      <div className="glass-card p-6 rounded-xl border border-border/50">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <LineChartIcon className="w-5 h-5 text-primary" />
            Performance Comparison of Log Anomaly Detection Models
          </h3>
        </div>
        <div className="h-[350px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 25 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="name"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickMargin={15}
              >
                <text
                  x={0}
                  y={0}
                  dy={25}
                  textAnchor="middle"
                  fill="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
              </XAxis>
              <YAxis
                domain={[82, 96]}
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                label={{
                  value: "Performance (%)",
                  angle: -90,
                  position: "insideLeft",
                  fill: "hsl(var(--muted-foreground))",
                  dy: 50,
                  dx: -10,
                }}
              />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend
                verticalAlign="top"
                height={36}
                wrapperStyle={{ paddingBottom: "20px" }}
              />
              <Line
                type="linear"
                dataKey="Accuracy"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="linear"
                dataKey="Precision"
                stroke="#f97316"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="linear"
                dataKey="Recall"
                stroke="#22c55e"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line
                type="linear"
                dataKey="F1 Score"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* System Load Graph */}
      <div className="glass-card p-6 rounded-xl border border-border/50">
        <h3 className="text-lg font-semibold mb-6">
          System Performance & Latency
        </h3>
        <div className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={performanceData}
              margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorLoad" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--primary))"
                    stopOpacity={0}
                  />
                </linearGradient>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop
                    offset="5%"
                    stopColor="hsl(var(--destructive))"
                    stopOpacity={0.3}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(var(--destructive))"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="time"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
              />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip
                contentStyle={{
                  background: "hsl(var(--card))",
                  border: "1px solid hsl(var(--border))",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area
                type="monotone"
                dataKey="load"
                name="CPU Load (%)"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorLoad)"
              />
              <Area
                type="monotone"
                dataKey="latency"
                name="Latency (ms)"
                stroke="hsl(var(--destructive))"
                fillOpacity={1}
                fill="url(#colorLatency)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
