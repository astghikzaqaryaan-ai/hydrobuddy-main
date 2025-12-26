import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  iconColor?: string;
}

const StatsCard = ({ icon: Icon, label, value, subtitle, iconColor = "text-primary" }: StatsCardProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-card border border-border/50 hover:shadow-water transition-shadow duration-300">
      <div className="flex items-center gap-2 mb-2">
        <div className={`p-2 rounded-xl bg-secondary ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
        <span className="text-xs text-muted-foreground font-medium">{label}</span>
      </div>
      <p className="text-xl font-bold text-foreground">{value}</p>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
      )}
    </div>
  );
};

export default StatsCard;
