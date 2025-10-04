import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

type StatusTier = 
  | 'glass_beginner'
  | 'glass_collector'
  | 'glass_enthusiast'
  | 'glass_connoisseur'
  | 'glass_royalty'
  | 'glass_legend';

export interface UserStatus {
  id: string;
  user_id: string;
  creator_points: number;
  bounties_completed: number;
  creator_tier: StatusTier;
  requester_points: number;
  bounties_paid: number;
  total_paid_amount: number;
  requester_tier: StatusTier;
  created_at: string;
  updated_at: string;
}

export function useUserStatus(userId?: string) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetUserId) {
      setStatus(null);
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('user_status')
        .select('*')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        if (import.meta.env.DEV) {
          console.error('Error fetching user status:', error);
        }
      } else if (data) {
        setStatus(data as UserStatus);
      }
      setLoading(false);
    };

    fetchStatus();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('user-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_status',
          filter: `user_id=eq.${targetUserId}`,
        },
        (payload) => {
          if (payload.new) {
            setStatus(payload.new as UserStatus);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [targetUserId]);

  return { status, loading };
}
