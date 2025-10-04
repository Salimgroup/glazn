import { Crown, Target } from 'lucide-react';
import { Card } from './ui/card';
import { StatusBadge, StatusProgress } from './StatusBadge';
import { useUserStatus } from '@/hooks/useUserStatus';
import { Skeleton } from './ui/skeleton';

interface UserStatusCardProps {
  userId?: string;
  mode: 'creator' | 'requester';
}

export function UserStatusCard({ userId, mode }: UserStatusCardProps) {
  const { status, loading } = useUserStatus(userId);

  if (loading) {
    return (
      <Card className="p-6 space-y-4">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-24 w-full" />
      </Card>
    );
  }

  if (!status) {
    return null;
  }

  const isCreator = mode === 'creator';
  const points = isCreator ? status.creator_points : status.requester_points;
  const tier = isCreator ? status.creator_tier : status.requester_tier;
  const count = isCreator ? status.bounties_completed : status.bounties_paid;
  const title = isCreator ? 'Creator Status' : 'Requester Status';

  return (
    <Card className="p-6 bg-card/80 backdrop-blur-xl border-2 border-neon-purple/30 hover:border-neon-cyan/50 transition-all shadow-neon">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold bg-gradient-neon bg-clip-text text-transparent">
            {title}
          </h3>
          <div className={isCreator ? 'text-neon-cyan' : 'text-neon-purple'}>
            {isCreator ? <Target className="w-6 h-6" /> : <Crown className="w-6 h-6" />}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <StatusBadge 
            tier={tier as any} 
            title={tier.replace('glass_', '').replace('_', ' ')}
            showTitle={false}
          />
          <div>
            <p className="text-2xl font-black bg-gradient-neon bg-clip-text text-transparent">
              {points.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground">Glazn Points</p>
          </div>
        </div>

        <div className="pt-2">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">
              {isCreator ? 'Bounties Completed' : 'Bounties Posted'}
            </span>
            <span className="text-sm font-bold">{count}</span>
          </div>
          <StatusProgress currentSpending={points} currentTier={tier as any} />
        </div>

        {!isCreator && status.total_paid_amount > 0 && (
          <div className="pt-2 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Total Paid Out</span>
              <span className="text-lg font-bold text-neon-cyan">
                ${status.total_paid_amount.toLocaleString()}
              </span>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
