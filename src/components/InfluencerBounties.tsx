import React from 'react';
import { Crown, Instagram, Twitter, Youtube, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Influencer {
  id: number;
  name: string;
  handle: string;
  platform: 'instagram' | 'twitter' | 'youtube';
  followers: string;
  category: string;
  suggestedBounty: number;
  avatar: string;
}

const influencers: Influencer[] = [
  {
    id: 1,
    name: 'Sarah Johnson',
    handle: '@sarahstyle',
    platform: 'instagram',
    followers: '2.4M',
    category: 'Fashion & Lifestyle',
    suggestedBounty: 5000,
    avatar: '👩🏻'
  },
  {
    id: 2,
    name: 'Marcus Tech',
    handle: '@marcustech',
    platform: 'youtube',
    followers: '1.8M',
    category: 'Technology',
    suggestedBounty: 3500,
    avatar: '👨🏿'
  },
  {
    id: 3,
    name: 'Elena Rodriguez',
    handle: '@elenafit',
    platform: 'instagram',
    followers: '3.1M',
    category: 'Fitness & Wellness',
    suggestedBounty: 4200,
    avatar: '👩🏽'
  },
  {
    id: 4,
    name: 'David Chen',
    handle: '@davidcooks',
    platform: 'youtube',
    followers: '950K',
    category: 'Food & Cooking',
    suggestedBounty: 2800,
    avatar: '👨🏻'
  }
];

const platformIcons = {
  instagram: Instagram,
  twitter: Twitter,
  youtube: Youtube
};

interface InfluencerBountiesProps {
  onCreateBounty: (influencer: Influencer) => void;
}

export const InfluencerBounties: React.FC<InfluencerBountiesProps> = ({ onCreateBounty }) => {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-neon-yellow/20 to-neon-pink/20 border-2 border-neon-yellow/40 rounded-2xl p-6 backdrop-blur-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="bg-gradient-to-br from-neon-yellow to-neon-pink p-3 rounded-xl">
            <Crown className="w-6 h-6 text-space-dark" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-foreground">Elite Influencers</h2>
            <p className="text-sm text-muted-foreground">Reach millions with premium content creators</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {influencers.map((influencer) => {
          const PlatformIcon = platformIcons[influencer.platform];
          return (
            <div 
              key={influencer.id}
              className="group relative bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-border hover:border-neon-pink/60 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-neon-pink/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-neon-cyan/20 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative p-6">
                <div className="flex items-start gap-4 mb-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full blur-md opacity-75" />
                    <div className="relative w-16 h-16 bg-gradient-to-br from-neon-pink to-neon-purple rounded-full flex items-center justify-center border-2 border-white/20 text-3xl">
                      {influencer.avatar}
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-lg font-black text-foreground">{influencer.name}</h3>
                    <div className="flex items-center gap-2 text-muted-foreground text-sm">
                      <PlatformIcon className="w-4 h-4" />
                      <span>{influencer.handle}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                      <TrendingUp className="w-4 h-4 text-neon-cyan" />
                      <span className="text-neon-cyan font-bold text-sm">{influencer.followers} followers</span>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/50 rounded-xl p-3 mb-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Category</p>
                  <p className="text-sm font-bold text-foreground">{influencer.category}</p>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wider">Suggested Bounty</p>
                    <p className="text-2xl font-black text-transparent bg-gradient-to-r from-neon-yellow to-neon-pink bg-clip-text">
                      ${influencer.suggestedBounty.toLocaleString()}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={() => onCreateBounty(influencer)}
                  className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink text-white font-black py-3 rounded-xl transition-all duration-300 shadow-[0_0_20px_rgba(255,0,255,0.3)] hover:shadow-[0_0_30px_rgba(255,0,255,0.5)]"
                >
                  <Crown className="w-4 h-4 mr-2" />
                  CREATE BOUNTY REQUEST
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
