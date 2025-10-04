import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Crown, Star, Medal, TrendingUp, Sparkles, Wallet, CheckCircle } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusBadge } from './StatusBadge';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  verified: boolean;
  creator_points?: number;
  bounties_completed?: number;
  creator_tier?: string;
  requester_points?: number;
  bounties_paid?: number;
  requester_tier?: string;
}

export function LeaderboardPanel() {
  const [topCreators, setTopCreators] = useState<LeaderboardEntry[]>([]);
  const [topRequesters, setTopRequesters] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    try {
      // Fetch top creators with user_status
      const { data: creators, error: creatorsError } = await supabase
        .from('user_status')
        .select(`
          id,
          user_id,
          creator_points,
          bounties_completed,
          creator_tier,
          profiles!inner(username, display_name, verified)
        `)
        .order('creator_points', { ascending: false })
        .limit(10);

      if (creatorsError) throw creatorsError;
      
      const formattedCreators = creators?.map((c: any) => ({
        id: c.id,
        user_id: c.user_id,
        username: c.profiles?.username,
        display_name: c.profiles?.display_name,
        verified: c.profiles?.verified,
        creator_points: c.creator_points,
        bounties_completed: c.bounties_completed,
        creator_tier: c.creator_tier,
      })) || [];
      
      setTopCreators(formattedCreators);

      // Fetch top requesters with user_status
      const { data: requesters, error: requestersError } = await supabase
        .from('user_status')
        .select(`
          id,
          user_id,
          requester_points,
          bounties_paid,
          requester_tier,
          profiles!inner(username, display_name, verified)
        `)
        .order('requester_points', { ascending: false })
        .limit(10);

      if (requestersError) throw requestersError;
      
      const formattedRequesters = requesters?.map((r: any) => ({
        id: r.id,
        user_id: r.user_id,
        username: r.profiles?.username,
        display_name: r.profiles?.display_name,
        verified: r.profiles?.verified,
        requester_points: r.requester_points,
        bounties_paid: r.bounties_paid,
        requester_tier: r.requester_tier,
      })) || [];
      
      setTopRequesters(formattedRequesters);
    } catch (error) {
      console.error('Error loading leaderboards:', error);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-neon-yellow" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const LeaderList = ({ users, type }: { users: LeaderboardEntry[]; type: 'creators' | 'requesters' }) => (
    <div className="space-y-2">
      {users.map((entry, index) => (
        <div
          key={entry.id}
          className="flex items-center gap-3 p-3 bg-gradient-space/30 rounded-xl border border-neon-purple/20 hover:border-neon-cyan/40 transition-all"
        >
          <div className="w-8 flex items-center justify-center">
            {getRankIcon(index)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground truncate">
                {entry.display_name || entry.username}
              </p>
              {entry.verified && (
                <CheckCircle className="w-4 h-4 text-neon-cyan" />
              )}
              {type === 'creators' && entry.creator_tier && (
                <StatusBadge 
                  tier={entry.creator_tier as any} 
                  title="Creator"
                  showTitle={false}
                />
              )}
              {type === 'requesters' && entry.requester_tier && (
                <StatusBadge 
                  tier={entry.requester_tier as any} 
                  title="Requester"
                  showTitle={false}
                />
              )}
            </div>
            <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
              {type === 'creators' ? (
                <>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {entry.creator_points?.toLocaleString()} glazn pts
                  </span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    {entry.bounties_completed} completed
                  </span>
                </>
              ) : (
                <>
                  <span className="flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {entry.requester_points?.toLocaleString()} glazn pts
                  </span>
                  <span className="flex items-center gap-1">
                    <Wallet className="w-3 h-3" />
                    {entry.bounties_paid} paid
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-pink/40 p-6 shadow-neon">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-neon p-2 rounded-xl shadow-neon">
          <Trophy className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground">Leaderboard</h2>
          <p className="text-xs text-muted-foreground">Top performers in the cosmos</p>
        </div>
      </div>

      <Tabs defaultValue="creators" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-gradient-space/30 mb-4">
          <TabsTrigger value="creators" className="data-[state=active]:bg-neon-cyan/20">
            <TrendingUp className="w-4 h-4 mr-2" />
            Creators
          </TabsTrigger>
          <TabsTrigger value="requesters" className="data-[state=active]:bg-neon-pink/20">
            <Crown className="w-4 h-4 mr-2" />
            Requesters
          </TabsTrigger>
        </TabsList>

        <TabsContent value="creators" className="max-h-[400px] overflow-y-auto">
          <LeaderList users={topCreators} type="creators" />
        </TabsContent>

        <TabsContent value="requesters" className="max-h-[400px] overflow-y-auto">
          <LeaderList users={topRequesters} type="requesters" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
