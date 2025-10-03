import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Trophy, Crown, Star, Medal, TrendingUp } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface PublicProfile {
  id: string;
  username: string;
  display_name: string;
  verified: boolean;
  reputation_score: number;
  bounties_completed: number;
  bounties_posted: number;
}

export function LeaderboardPanel() {
  const [topCreators, setTopCreators] = useState<PublicProfile[]>([]);
  const [topRequesters, setTopRequesters] = useState<PublicProfile[]>([]);

  useEffect(() => {
    loadLeaderboards();
  }, []);

  const loadLeaderboards = async () => {
    // Use public_profiles view that excludes sensitive financial data
    // Sort by reputation score instead of financial data for privacy
    const { data: creators } = await supabase
      .from('public_profiles')
      .select('*')
      .order('reputation_score', { ascending: false })
      .limit(10);

    const { data: requesters } = await supabase
      .from('public_profiles')
      .select('*')
      .order('reputation_score', { ascending: false })
      .limit(10);

    if (creators) setTopCreators(creators as PublicProfile[]);
    if (requesters) setTopRequesters(requesters as PublicProfile[]);
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Crown className="w-5 h-5 text-neon-yellow" />;
    if (index === 1) return <Medal className="w-5 h-5 text-gray-400" />;
    if (index === 2) return <Medal className="w-5 h-5 text-orange-400" />;
    return <span className="text-sm font-bold text-muted-foreground">#{index + 1}</span>;
  };

  const LeaderList = ({ profiles, type }: { profiles: PublicProfile[]; type: 'creator' | 'requester' }) => (
    <div className="space-y-2">
      {profiles.map((profile, index) => (
        <div
          key={profile.id}
          className="flex items-center gap-3 p-3 bg-gradient-space/30 rounded-xl border border-neon-purple/20 hover:border-neon-cyan/40 transition-all"
        >
          <div className="w-8 flex items-center justify-center">
            {getRankIcon(index)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-bold text-foreground truncate">
                {profile.display_name || profile.username}
              </p>
              {profile.verified && (
                <Star className="w-4 h-4 text-neon-yellow fill-neon-yellow" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {type === 'creator'
                ? `${profile.bounties_completed} completed`
                : `${profile.bounties_posted} bounties posted`}
            </p>
          </div>
          <div className="text-right">
            <div className="text-lg font-black bg-gradient-neon bg-clip-text text-transparent">
              {profile.reputation_score}
            </div>
            <div className="text-xs text-muted-foreground">reputation</div>
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
          <LeaderList profiles={topCreators} type="creator" />
        </TabsContent>

        <TabsContent value="requesters" className="max-h-[400px] overflow-y-auto">
          <LeaderList profiles={topRequesters} type="requester" />
        </TabsContent>
      </Tabs>
    </div>
  );
}
