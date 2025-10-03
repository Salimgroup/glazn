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

export interface UserSpending {
  id: string;
  user_id: string;
  total_spent: number;
  points: number;
  current_tier: StatusTier;
  title: string;
  created_at: string;
  updated_at: string;
}

export function useUserSpending() {
  const { user } = useAuth();
  const [spending, setSpending] = useState<UserSpending | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setSpending(null);
      setLoading(false);
      return;
    }

    const fetchSpending = async () => {
      const { data, error } = await supabase
        .from('user_spending' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        if (import.meta.env.DEV) {
          console.error('Error fetching user spending:', error);
        }
      } else if (data) {
        setSpending(data as unknown as UserSpending);
      }
      setLoading(false);
    };

    fetchSpending();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('user-spending-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_spending',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setSpending(payload.new as UserSpending);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const addSpending = async (amount: number) => {
    if (!user) return;

    try {
      const { error } = await (supabase as any).rpc('add_user_spending', {
        p_user_id: user.id,
        p_amount: amount,
      });

      if (error) {
        if (import.meta.env.DEV) {
          console.error('Error adding spending:', error);
        }
        throw error;
      }
    } catch (err) {
      if (import.meta.env.DEV) {
        console.error('Error calling add_user_spending:', err);
      }
      throw err;
    }
  };

  return { spending, loading, addSpending };
}
