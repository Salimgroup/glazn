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
  const isOwnStatus = user?.id === targetUserId;
  const [status, setStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!targetUserId) {
      setStatus(null);
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      // Use full user_status table for own status (includes sensitive data)
      // Use public_user_status view for others (excludes points and financial data)
      let data, error;
      
      if (isOwnStatus) {
        const result = await supabase
          .from('user_status')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();
        data = result.data;
        error = result.error;
      } else {
        const result = await supabase
          .from('public_user_status')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

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
    // Only subscribe to full user_status for own status
    const channel = supabase
      .channel('user-status-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: isOwnStatus ? 'user_status' : 'public_user_status',
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
  }, [targetUserId, isOwnStatus]);

  return { status, loading, isOwnStatus };
}
