import { Crown, Gem, Star, Sparkles, Target, Footprints } from 'lucide-react';
import { cn } from '@/lib/utils';

type StatusTier = 
  | 'glass_beginner'
  | 'glass_collector'
  | 'glass_enthusiast'
  | 'glass_connoisseur'
  | 'glass_royalty'
  | 'glass_legend';

interface StatusBadgeProps {
  tier: StatusTier;
  title: string;
  className?: string;
  showTitle?: boolean;
}

const tierConfig = {
  glass_legend: {
    icon: Crown,
    gradient: 'from-yellow-400 via-amber-500 to-yellow-600',
    glow: 'shadow-[0_0_20px_rgba(251,191,36,0.5)]',
    border: 'border-yellow-400/50',
  },
  glass_royalty: {
    icon: Gem,
    gradient: 'from-purple-400 via-pink-500 to-purple-600',
    glow: 'shadow-[0_0_15px_rgba(168,85,247,0.4)]',
    border: 'border-purple-400/50',
  },
  glass_connoisseur: {
    icon: Star,
    gradient: 'from-blue-400 via-cyan-500 to-blue-600',
    glow: 'shadow-[0_0_12px_rgba(59,130,246,0.4)]',
    border: 'border-blue-400/50',
  },
  glass_enthusiast: {
    icon: Sparkles,
    gradient: 'from-green-400 via-emerald-500 to-green-600',
    glow: 'shadow-[0_0_10px_rgba(34,197,94,0.3)]',
    border: 'border-green-400/50',
  },
  glass_collector: {
    icon: Target,
    gradient: 'from-orange-400 via-amber-500 to-orange-600',
    glow: 'shadow-[0_0_8px_rgba(249,115,22,0.3)]',
    border: 'border-orange-400/50',
  },
  glass_beginner: {
    icon: Footprints,
    gradient: 'from-gray-400 via-gray-500 to-gray-600',
    glow: 'shadow-[0_0_5px_rgba(156,163,175,0.2)]',
    border: 'border-gray-400/50',
  },
};

export function StatusBadge({ tier, title, className, showTitle = true }: StatusBadgeProps) {
  const config = tierConfig[tier];
  const Icon = config.icon;

  return (
    <div
      className={cn(
        'inline-flex items-center gap-2 px-3 py-1.5 rounded-full border-2',
        'bg-gradient-to-r',
        config.gradient,
        config.glow,
        config.border,
        'text-white font-medium text-sm',
        'animate-in fade-in slide-in-from-top-2 duration-300',
        className
      )}
    >
      <Icon className="w-4 h-4" />
      {showTitle && <span>{title}</span>}
    </div>
  );
}

export function StatusProgress({
  currentSpending,
  currentTier,
}: {
  currentSpending: number;
  currentTier: StatusTier;
}) {
  const tierThresholds = {
    glass_beginner: { min: 0, max: 100, next: 'Glass Collector' },
    glass_collector: { min: 100, max: 500, next: 'Glass Enthusiast' },
    glass_enthusiast: { min: 500, max: 2000, next: 'Glass Connoisseur' },
    glass_connoisseur: { min: 2000, max: 5000, next: 'Glass Royalty' },
    glass_royalty: { min: 5000, max: 10000, next: 'Glass Legend' },
    glass_legend: { min: 10000, max: 10000, next: 'Max Level' },
  };

  const threshold = tierThresholds[currentTier];
  const progress = threshold.max === threshold.min 
    ? 100 
    : ((currentSpending - threshold.min) / (threshold.max - threshold.min)) * 100;
  const remaining = Math.max(0, threshold.max - currentSpending);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">Progress to {threshold.next}</span>
        <span className="font-medium text-foreground">
          ${currentSpending.toFixed(0)} / ${threshold.max}
        </span>
      </div>
      <div className="relative h-3 bg-muted rounded-full overflow-hidden">
        <div
          className="absolute inset-y-0 left-0 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 rounded-full transition-all duration-500"
          style={{ width: `${Math.min(100, progress)}%` }}
        />
      </div>
      {remaining > 0 && (
        <p className="text-xs text-muted-foreground">
          ${remaining.toFixed(0)} more to reach {threshold.next}
        </p>
      )}
    </div>
  );
}
