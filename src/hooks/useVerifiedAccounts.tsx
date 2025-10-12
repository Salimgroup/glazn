import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type VerifiedAccount = {
  id: string;
  platform: 'google' | 'linkedin' | 'twitter' | 'facebook' | 'github' | 'snapchat' | 'tiktok';
  platform_username: string | null;
  platform_email: string | null;
  verified_at: string;
};

export function useVerifiedAccounts(userId: string | undefined) {
  const [accounts, setAccounts] = useState<VerifiedAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
      setAccounts([]);
      setLoading(false);
      return;
    }

    const fetchAccounts = async () => {
      const { data, error } = await supabase
        .from('verified_social_accounts')
        .select('id, platform, platform_username, platform_email, verified_at')
        .eq('user_id', userId);

      if (!error && data) {
        setAccounts(data as VerifiedAccount[]);
      }
      setLoading(false);
    };

    fetchAccounts();
  }, [userId]);

  return { accounts, loading };
}
