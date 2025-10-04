import { TrendingUp, DollarSign, Target, Award, Eye, Sparkles } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: string;
  icon: 'trending' | 'dollar' | 'target' | 'award' | 'eye' | 'sparkles';
  trend?: 'up' | 'down' | 'neutral';
}

export function QuickStatsCard({ title, value, change, icon, trend = 'neutral' }: StatsCardProps) {
  const getIcon = () => {
    const iconClass = "w-6 h-6 text-white";
    switch (icon) {
      case 'trending':
        return <TrendingUp className={iconClass} />;
      case 'dollar':
        return <DollarSign className={iconClass} />;
      case 'target':
        return <Target className={iconClass} />;
      case 'award':
        return <Award className={iconClass} />;
      case 'eye':
        return <Eye className={iconClass} />;
      case 'sparkles':
        return <Sparkles className={iconClass} />;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-400';
      case 'down':
        return 'text-red-400';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-xl border-2 border-neon-purple/30 p-4 hover:border-neon-cyan/50 transition-all shadow-neon hover:shadow-cyan">
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm text-muted-foreground font-medium">{title}</p>
        <div className="bg-gradient-neon p-2 rounded-lg shadow-neon">
          {getIcon()}
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-3xl font-black bg-gradient-neon bg-clip-text text-transparent">
          {value}
        </p>
        {change && (
          <p className={`text-xs font-medium ${getTrendColor()}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
