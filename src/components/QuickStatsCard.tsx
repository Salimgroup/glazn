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
    const iconClass = "w-full h-full text-white";
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
    <div className="bg-card/80 backdrop-blur-xl rounded-lg sm:rounded-xl border-2 border-neon-purple/30 p-2.5 sm:p-4 hover:border-neon-cyan/50 transition-all shadow-neon hover:shadow-cyan">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <p className="text-[0.65rem] sm:text-sm text-muted-foreground font-medium">{title}</p>
        <div className="bg-gradient-neon p-1.5 sm:p-2 rounded-lg shadow-neon">
          <div className="w-4 h-4 sm:w-6 sm:h-6 text-white">
            {getIcon()}
          </div>
        </div>
      </div>
      <div className="space-y-0.5 sm:space-y-1">
        <p className="text-xl sm:text-3xl font-black bg-gradient-neon bg-clip-text text-transparent">
          {value}
        </p>
        {change && (
          <p className={`text-[0.6rem] sm:text-xs font-medium ${getTrendColor()}`}>
            {change}
          </p>
        )}
      </div>
    </div>
  );
}
