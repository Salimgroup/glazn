import { Flame, Eye, Heart, DollarSign } from 'lucide-react';

interface TrendingBounty {
  id: number;
  title: string;
  bounty: number;
  views: number;
  likes: number;
  category: string;
}

export function TrendingBountiesSection() {
  // Mock data - will be replaced with real data
  const trendingBounties: TrendingBounty[] = [
    {
      id: 1,
      title: "Viral TikTok Content Creation",
      bounty: 2500,
      views: 1234,
      likes: 89,
      category: "Video"
    },
    {
      id: 2,
      title: "Instagram Reels Package",
      bounty: 1800,
      views: 987,
      likes: 67,
      category: "Video"
    },
    {
      id: 3,
      title: "Product Photography Bundle",
      bounty: 1500,
      views: 756,
      likes: 54,
      category: "Photography"
    }
  ];

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-yellow/40 p-6 shadow-glow">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-r from-neon-yellow to-neon-pink p-2 rounded-xl shadow-glow animate-pulse">
          <Flame className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground">Trending Now</h2>
          <p className="text-xs text-muted-foreground">Hot bounties in the cosmos</p>
        </div>
      </div>

      <div className="space-y-3">
        {trendingBounties.map((bounty, index) => (
          <div
            key={bounty.id}
            className="flex items-center gap-4 p-4 bg-gradient-space/30 rounded-xl border border-neon-yellow/20 hover:border-neon-pink/40 transition-all cursor-pointer group"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-neon text-white font-black shadow-neon">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-foreground mb-1 truncate group-hover:text-neon-cyan transition-colors">
                {bounty.title}
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {bounty.views}
                </div>
                <div className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {bounty.likes}
                </div>
                <span className="px-2 py-0.5 bg-neon-purple/20 text-neon-purple rounded-full">
                  {bounty.category}
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-black text-neon-yellow">
                ${bounty.bounty.toLocaleString()}
              </div>
              <div className="text-xs text-muted-foreground">bounty</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
