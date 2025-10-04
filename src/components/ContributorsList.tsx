import React, { useState, useEffect } from 'react';
import { Users, DollarSign, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { UserAvatar } from './UserAvatar';
import { formatDistanceToNow } from 'date-fns';

interface Contributor {
  id: string;
  amount: number;
  contributor_id: string;
  status: string;
  created_at: string;
  message?: string;
  profiles?: {
    display_name: string;
    username: string;
    avatar_url?: string;
  } | null;
}

interface ContributorsListProps {
  requestId: string;
  showPending?: boolean;
  maxDisplay?: number;
}

export function ContributorsList({ 
  requestId, 
  showPending = false,
  maxDisplay = 5 
}: ContributorsListProps) {
  const [contributors, setContributors] = useState<Contributor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchContributors();

    // Subscribe to real-time updates
    const channel = supabase
      .channel(`contributors-${requestId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bounty_contributions',
          filter: `request_id=eq.${requestId}`
        },
        () => {
          fetchContributors();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [requestId, showPending]);

  const fetchContributors = async () => {
    try {
      let query = supabase
        .from('bounty_contributions')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (!showPending) {
        query = query.eq('status', 'accepted');
      }

      const { data: contributionsData, error: contributionsError } = await query;

      if (contributionsError) throw contributionsError;

      // Fetch profiles for contributors
      if (contributionsData && contributionsData.length > 0) {
        const contributorIds = contributionsData.map((c) => c.contributor_id);
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, display_name, username, avatar_url')
          .in('id', contributorIds);

        // Merge profiles with contributions
        const contributorsWithProfiles = contributionsData.map((contrib) => {
          const profile = profilesData?.find((p) => p.id === contrib.contributor_id);
          return {
            ...contrib,
            profiles: profile || null
          };
        });

        setContributors(contributorsWithProfiles as Contributor[]);
      } else {
        setContributors([]);
      }
    } catch (error) {
      console.error('Error fetching contributors:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-card/40 rounded-lg" />
        ))}
      </div>
    );
  }

  if (contributors.length === 0) {
    return (
      <div className="text-center py-6 bg-card/20 backdrop-blur-sm rounded-xl border border-neon-purple/20">
        <Users className="w-8 h-8 mx-auto text-muted-foreground/40 mb-2" />
        <p className="text-sm text-muted-foreground">No contributors yet</p>
        <p className="text-xs text-muted-foreground/70 mt-1">
          Be the first to back this bounty!
        </p>
      </div>
    );
  }

  const displayedContributors = contributors.slice(0, maxDisplay);
  const remainingCount = contributors.length - maxDisplay;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-neon-cyan" />
          <span className="text-sm font-bold text-foreground">
            {contributors.length} {contributors.length === 1 ? 'Backer' : 'Backers'}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Total: $
          {contributors
            .filter((c) => c.status === 'accepted')
            .reduce((sum, c) => sum + parseFloat(c.amount.toString()), 0)
            .toFixed(0)}
        </div>
      </div>

      {displayedContributors.map((contributor) => (
        <div
          key={contributor.id}
          className={`p-3 rounded-lg border backdrop-blur-sm transition-all ${
            contributor.status === 'accepted'
              ? 'bg-card/60 border-neon-cyan/30'
              : contributor.status === 'pending'
              ? 'bg-neon-yellow/10 border-neon-yellow/30'
              : 'bg-card/40 border-neon-pink/30 opacity-60'
          }`}
        >
          <div className="flex items-center gap-3">
            <UserAvatar ethnicity="mixed" size="sm" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground truncate">
                  {contributor.profiles?.display_name || 'Anonymous'}
                </span>
                {contributor.status === 'pending' && (
                  <span className="text-xs px-2 py-0.5 bg-neon-yellow/20 text-neon-yellow rounded-full font-bold">
                    PENDING
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-lg font-bold text-neon-cyan">
                  ${parseFloat(contributor.amount.toString()).toFixed(0)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDistanceToNow(new Date(contributor.created_at), { addSuffix: true })}
                </span>
              </div>
              {contributor.message && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                  "{contributor.message}"
                </p>
              )}
            </div>
          </div>
        </div>
      ))}

      {remainingCount > 0 && (
        <div className="text-center py-2 bg-card/40 rounded-lg border border-neon-purple/20">
          <span className="text-xs text-muted-foreground font-medium">
            +{remainingCount} more {remainingCount === 1 ? 'backer' : 'backers'}
          </span>
        </div>
      )}
    </div>
  );
}
