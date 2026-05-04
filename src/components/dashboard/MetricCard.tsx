import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  variant?: "default" | "primary" | "warning" | "danger" | "success";
  progress?: number;
}

const variantStyles = {
  default: "border-border hover:border-border/80",
  primary: "border-primary/30 glow-primary hover:border-primary/50",
  warning: "border-accent/30 glow-warning hover:border-accent/50",
  danger: "border-destructive/30 glow-danger hover:border-destructive/50",
  success: "border-success/30 hover:border-success/50",
};

const iconVariants = {
  default: "bg-secondary text-foreground",
  primary: "bg-primary/15 text-primary",
  warning: "bg-accent/15 text-accent",
  danger: "bg-destructive/15 text-destructive",
  success: "bg-success/15 text-success",
};

const progressColors = {
  default: "text-muted",
  primary: "text-primary",
  warning: "text-accent",
  danger: "text-destructive",
  success: "text-success",
};

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
  progress,
}: MetricCardProps) {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset =
    circumference - (progress ? (progress / 100) * circumference : 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className={cn(
        "glass-card rounded-xl p-6 border transition-all duration-300 relative overflow-hidden group",
        variantStyles[variant],
      )}
    >
      {/* Background decoration */}
      <div
        className={cn(
          "absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-5 blur-3xl transition-opacity group-hover:opacity-10",
          iconVariants[variant].split(" ")[0],
        )}
      />

      <div className="flex items-center justify-between relative z-10">
        <div className="space-y-1.5 flex-1">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.15em] mb-1">
            {title}
          </p>
          <div className="flex items-baseline gap-2">
            <p className="text-3xl font-black text-foreground font-mono tracking-tight">
              {value}
            </p>
            {trendValue && (
              <span
                className={cn(
                  "text-[10px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5",
                  trend === "up"
                    ? "bg-destructive/10 text-destructive"
                    : trend === "down"
                      ? "bg-success/10 text-success"
                      : "bg-muted/10 text-muted-foreground",
                )}
              >
                {trend === "up" ? "↑" : trend === "down" ? "↓" : "•"}{" "}
                {trendValue}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground/80 font-medium leading-relaxed">
              {subtitle}
            </p>
          )}
        </div>

        <div className="relative flex items-center justify-center ml-4">
          {progress !== undefined ? (
            <div className="relative w-16 h-16 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-muted/10"
                />
                <motion.circle
                  cx="32"
                  cy="32"
                  r={radius}
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={circumference}
                  initial={{ strokeDashoffset: circumference }}
                  animate={{ strokeDashoffset }}
                  transition={{ duration: 1.5, ease: "easeOut" }}
                  className={progressColors[variant]}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Icon
                  className={cn(
                    "w-4 h-4 mb-0.5 opacity-50",
                    progressColors[variant],
                  )}
                />
                <span className="text-[10px] font-bold font-mono">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 duration-300",
                iconVariants[variant],
              )}
            >
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
