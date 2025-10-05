import { Crown } from 'lucide-react';

interface StatusBadgeProps {
  tier: string;
  title: string;
  showTitle?: boolean;
}

export function StatusBadge({ tier, title, showTitle = true }: StatusBadgeProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="w-8 h-8 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
        <Crown className="w-4 h-4 text-primary-foreground" />
      </div>
      {showTitle && (
        <span className="text-sm font-semibold">{title}</span>
      )}
    </div>
  );
}

export function StatusProgress({ currentSpending, currentTier }: { currentSpending: number; currentTier: string }) {
  const tiers = [
    { name: 'glass_beginner', min: 0, max: 100 },
    { name: 'glass_collector', min: 100, max: 500 },
    { name: 'glass_enthusiast', min: 500, max: 2000 },
    { name: 'glass_connoisseur', min: 2000, max: 5000 },
    { name: 'glass_royalty', min: 5000, max: 10000 },
    { name: 'glass_legend', min: 10000, max: Infinity }
  ];

  const currentTierData = tiers.find(t => t.name === currentTier) || tiers[0];
  const progress = currentTierData.max === Infinity 
    ? 100 
    : ((currentSpending - currentTierData.min) / (currentTierData.max - currentTierData.min)) * 100;

  return (
    <div className="space-y-2">
      <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-primary to-secondary transition-all duration-300"
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>
      {currentTierData.max !== Infinity && (
        <p className="text-xs text-muted-foreground text-right">
          ${currentSpending.toLocaleString()} / ${currentTierData.max.toLocaleString()}
        </p>
      )}
    </div>
  );
}
