import React, { useState, useEffect } from 'react';
import { DollarSign, Users, Target, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Contribution {
  id: string;
  amount: number;
  contributor_id: string;
  status: string;
  created_at: string;
}

interface CommunalBountyCardProps {
  requestId: string;
  baseBounty: number;
  allowContributions: boolean;
  minimumContribution?: number;
  showContributors?: boolean;
}

export function CommunalBountyCard({ 
  requestId, 
  baseBounty, 
  allowContributions,
  minimumContribution = 0,
  showContributors = true
}: CommunalBountyCardProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [totalBounty, setTotalBounty] = useState(baseBounty);
  const [contributorsCount, setContributorsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!allowContributions) {
      setLoading(false);
      return;
    }

    fetchContributions();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`contributions-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bounty_contributions',
          filter: `request_id=eq.${requestId}`
        },
        () => {
          fetchContributions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, allowContributions]);

  const fetchContributions = async () => {
    try {
      const { data, error } = await supabase
        .from('bounty_contributions')
        .select('*')
        .eq('request_id', requestId)
        .eq('status', 'accepted');

      if (error) throw error;

      const acceptedContributions = data || [];
      const totalContributed = acceptedContributions.reduce(
        (sum, c) => sum + parseFloat(c.amount.toString()),
        0
      );
      
      setContributions(acceptedContributions);
      setTotalBounty(baseBounty + totalContributed);
      setContributorsCount(acceptedContributions.length);
    } catch (error) {
      console.error('Error fetching contributions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!allowContributions) {
    return (
      <div className="text-center py-4 bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 rounded-xl border-2 border-neon-yellow/40">
        <div className="text-5xl font-black text-transparent bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-cyan bg-clip-text mb-1">
          ${baseBounty}
        </div>
        <div className="text-xs text-neon-yellow font-bold uppercase tracking-widest">
          SINGLE CONTRIBUTOR
        </div>
      </div>
    );
  }

  const contributedAmount = totalBounty - baseBounty;
  const contributionPercentage = baseBounty > 0 
    ? Math.round((contributedAmount / baseBounty) * 100) 
    : 0;

  return (
    <div className="space-y-3">
      {/* Total Bounty Display */}
      <div className="text-center py-4 bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 rounded-xl border-2 border-neon-yellow/40">
        <div className="text-5xl font-black text-transparent bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-cyan bg-clip-text mb-1">
          ${totalBounty}
        </div>
        <div className="text-xs text-neon-yellow font-bold uppercase tracking-widest">
          COMMUNAL BOUNTY
        </div>
      </div>

      {/* Contribution Breakdown */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-card/60 backdrop-blur-sm rounded-lg p-2 border border-neon-pink/30">
          <div className="text-xs text-muted-foreground font-medium mb-1">Base</div>
          <div className="text-lg font-bold text-neon-pink">${baseBounty}</div>
        </div>
        <div className="bg-card/60 backdrop-blur-sm rounded-lg p-2 border border-neon-cyan/30">
          <div className="text-xs text-muted-foreground font-medium mb-1">
            +{contributorsCount} {contributorsCount === 1 ? 'Backer' : 'Backers'}
          </div>
          <div className="text-lg font-bold text-neon-cyan">
            ${contributedAmount > 0 ? contributedAmount.toFixed(0) : '0'}
          </div>
        </div>
      </div>

      {/* Contribution Progress */}
      {contributedAmount > 0 && (
        <div className="bg-card/40 backdrop-blur-sm rounded-lg p-3 border border-neon-purple/30">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-neon-purple" />
              <span className="text-xs font-bold text-neon-purple uppercase">
                Community Boost
              </span>
            </div>
            <span className="text-xs font-bold text-neon-cyan">
              +{contributionPercentage}%
            </span>
          </div>
          <div className="h-2 bg-card/60 rounded-full overflow-hidden border border-neon-purple/30">
            <div 
              className="h-full bg-gradient-to-r from-neon-purple to-neon-cyan transition-all duration-500"
              style={{ width: `${Math.min(contributionPercentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      {/* Minimum Contribution Info */}
      {minimumContribution > 0 && (
        <div className="bg-neon-yellow/10 border border-neon-yellow/30 rounded-lg p-2">
          <div className="flex items-center gap-2">
            <Target className="w-3 h-3 text-neon-yellow" />
            <span className="text-xs text-neon-yellow font-medium">
              Min. contribution: ${minimumContribution}
            </span>
          </div>
        </div>
      )}

      {/* Call to Action */}
      {contributorsCount === 0 && (
        <div className="bg-gradient-neon/10 border-2 border-neon-pink/30 rounded-lg p-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-neon-pink" />
            <span className="text-xs text-neon-pink font-bold">
              Be the first to back this bounty!
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
