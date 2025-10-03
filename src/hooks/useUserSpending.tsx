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
        .from('user_spending')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user spending:', error);
      } else {
        setSpending(data);
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

    const { error } = await supabase.rpc('add_user_spending', {
      p_user_id: user.id,
      p_amount: amount,
    });

    if (error) {
      console.error('Error adding spending:', error);
      throw error;
    }
  };

  return { spending, loading, addSpending };
}
