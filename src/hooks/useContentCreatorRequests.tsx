import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface ContentCreatorRequest {
  id: string;
  title: string;
  description: string;
  bounty: number;
  category: string;
  deadline: string;
  status: string;
  platform?: string;
  is_anonymous: boolean;
  requester_name: string;
  created_at: string;
}

export function useContentCreatorRequests() {
  const { user } = useAuth();
  const [requests, setRequests] = useState<ContentCreatorRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    fetchContentCreatorRequests();

    // Subscribe to real-time updates
    const subscription = supabase
      .channel('content_creator_requests')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'requests',
          filter: `content_creator_id=eq.${user.id}`
        },
        () => {
          fetchContentCreatorRequests();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  const fetchContentCreatorRequests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('content_creator_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRequests(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching content creator requests:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch requests');
    } finally {
      setLoading(false);
    }
  };

  return { requests, loading, error, refetch: fetchContentCreatorRequests };
}
