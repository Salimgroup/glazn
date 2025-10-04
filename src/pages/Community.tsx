import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  MapPin, 
  Users, 
  Flame, 
  Instagram,
  Youtube,
  Twitter,
  Music,
  Crown,
  ArrowUp,
  Eye,
  MessageCircle,
  DollarSign,
  Sparkles,
  Filter,
  Globe,
  LogOut,
  HelpCircle,
  Trophy
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { TrendingBountiesSection } from '@/components/TrendingBountiesSection';
import { LiveActivityFeed } from '@/components/LiveActivityFeed';
import { LeaderboardPanel } from '@/components/LeaderboardPanel';
import { NotificationBell } from '@/components/NotificationBell';
import { UserAvatar } from '@/components/UserAvatar';
import { BountyTicker } from '@/components/BountyTicker';
import { useUserSpending } from '@/hooks/useUserSpending';
import { StatusBadge } from '@/components/StatusBadge';

interface MicroInfluencer {
  id: number;
  name: string;
  handle: string;
  platform: 'instagram' | 'youtube' | 'twitter' | 'tiktok';
  followers: string;
  engagement: string;
  category: string;
  location: string;
  avgBounty: number;
  trending: boolean;
  verified: boolean;
}

interface TrendingBounty {
  id: number;
  title: string;
  description: string;
  bounty: number;
  upvotes: number;
  views: number;
  comments: number;
  category: string;
  timeLeft: string;
  hasUpvoted?: boolean;
  contributors: number;
}

export default function Community() {
  const { user, signOut, loading } = useAuth();
  const { spending } = useUserSpending();
  const navigate = useNavigate();

  const [selectedRegion, setSelectedRegion] = useState<string>('North America');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [trendingBounties, setTrendingBounties] = useState<TrendingBounty[]>([
    {
      id: 1,
      title: "Viral TikTok Dance Challenge",
      description: "Create an engaging dance challenge video with trending audio",
      bounty: 2500,
      upvotes: 342,
      views: 5420,
      comments: 89,
      category: "Video",
      timeLeft: "2 days",
      hasUpvoted: false,
      contributors: 12
    },
    {
      id: 2,
      title: "Instagram Reels Package - Tech Product",
      description: "10 professional reels showcasing our new gadget",
      bounty: 1800,
      upvotes: 287,
      views: 4100,
      comments: 54,
      category: "Video",
      timeLeft: "4 days",
      hasUpvoted: false,
      contributors: 8
    },
    {
      id: 3,
      title: "YouTube Product Review",
      description: "Detailed review video of our fitness equipment",
      bounty: 3200,
      upvotes: 198,
      views: 3200,
      comments: 67,
      category: "Video",
      timeLeft: "5 days",
      hasUpvoted: false,
      contributors: 15
    },
    {
      id: 4,
      title: "Food Photography Series",
      description: "50 high-quality photos of restaurant dishes",
      bounty: 1200,
      upvotes: 156,
      views: 2800,
      comments: 34,
      category: "Photography",
      timeLeft: "3 days",
      hasUpvoted: false,
      contributors: 5
    }
  ]);

  const regions = ['North America', 'Europe', 'Asia', 'South America', 'Africa', 'Oceania'];

  const microInfluencers: Record<string, MicroInfluencer[]> = {
    'North America': [
      {
        id: 1,
        name: "Sarah Martinez",
        handle: "@sarahcreates",
        platform: "instagram",
        followers: "45K",
        engagement: "8.2%",
        category: "Lifestyle",
        location: "Los Angeles, CA",
        avgBounty: 850,
        trending: true,
        verified: true
      },
      {
        id: 2,
        name: "Tech Mike",
        handle: "@techmike",
        platform: "youtube",
        followers: "52K",
        engagement: "6.5%",
        category: "Technology",
        location: "Austin, TX",
        avgBounty: 1200,
        trending: true,
        verified: true
      },
      {
        id: 3,
        name: "FitLife Emma",
        handle: "@fitlifeemma",
        platform: "tiktok",
        followers: "38K",
        engagement: "12.3%",
        category: "Fitness",
        location: "Miami, FL",
        avgBounty: 950,
        trending: false,
        verified: true
      },
      {
        id: 4,
        name: "Chef Marco",
        handle: "@chefmarco",
        platform: "instagram",
        followers: "41K",
        engagement: "9.1%",
        category: "Food",
        location: "New York, NY",
        avgBounty: 780,
        trending: true,
        verified: false
      },
      {
        id: 5,
        name: "Travel Tales",
        handle: "@traveltales",
        platform: "youtube",
        followers: "67K",
        engagement: "7.8%",
        category: "Travel",
        location: "Denver, CO",
        avgBounty: 1450,
        trending: false,
        verified: true
      }
    ],
    'Europe': [
      {
        id: 6,
        name: "Luna Fashion",
        handle: "@lunastyle",
        platform: "instagram",
        followers: "58K",
        engagement: "10.5%",
        category: "Fashion",
        location: "Paris, France",
        avgBounty: 1100,
        trending: true,
        verified: true
      },
      {
        id: 7,
        name: "Gaming Alex",
        handle: "@gamingalex",
        platform: "youtube",
        followers: "72K",
        engagement: "8.9%",
        category: "Gaming",
        location: "Berlin, Germany",
        avgBounty: 1350,
        trending: true,
        verified: true
      }
    ],
    'Asia': [
      {
        id: 8,
        name: "Tokyo Eats",
        handle: "@tokyoeats",
        platform: "instagram",
        followers: "89K",
        engagement: "11.2%",
        category: "Food",
        location: "Tokyo, Japan",
        avgBounty: 1600,
        trending: true,
        verified: true
      }
    ],
    'South America': [
      {
        id: 9,
        name: "Brazil Dance",
        handle: "@brazildance",
        platform: "tiktok",
        followers: "94K",
        engagement: "15.3%",
        category: "Dance",
        location: "Rio, Brazil",
        avgBounty: 890,
        trending: true,
        verified: true
      }
    ],
    'Africa': [],
    'Oceania': []
  };

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleUpvote = (bountyId: number) => {
    setTrendingBounties(prev => prev.map(bounty => 
      bounty.id === bountyId 
        ? { 
            ...bounty, 
            upvotes: bounty.hasUpvoted ? bounty.upvotes - 1 : bounty.upvotes + 1,
            hasUpvoted: !bounty.hasUpvoted 
          }
        : bounty
    ));
    toast.success(
      trendingBounties.find(b => b.id === bountyId)?.hasUpvoted 
        ? "Upvote removed" 
        : "Bounty upvoted!"
    );
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return <Instagram className="w-4 h-4" />;
      case 'youtube': return <Youtube className="w-4 h-4" />;
      case 'twitter': return <Twitter className="w-4 h-4" />;
      case 'tiktok': return <Music className="w-4 h-4" />;
      default: return null;
    }
  };

  const getPlatformColor = (platform: string) => {
    switch (platform) {
      case 'instagram': return 'from-pink-500 to-purple-500';
      case 'youtube': return 'from-red-500 to-red-600';
      case 'twitter': return 'from-blue-400 to-blue-500';
      case 'tiktok': return 'from-black to-pink-500';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const filteredInfluencers = selectedPlatform === 'all' 
    ? microInfluencers[selectedRegion] || []
    : (microInfluencers[selectedRegion] || []).filter(inf => inf.platform === selectedPlatform);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-space flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-neon-pink border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading community...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Bounty Ticker */}
      <BountyTicker bounties={trendingBounties.map(b => ({ id: b.id, title: b.title, bounty: b.bounty }))} />

      {/* Floating Rank Badge */}
      {user && spending && (
        <div className="fixed top-4 right-4 z-50 group animate-fade-in">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-neon rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition-opacity shadow-neon" />
            <div className="relative bg-card/90 backdrop-blur-xl px-6 py-3 rounded-2xl border-2 border-neon-pink shadow-neon hover:scale-105 transition-transform">
              <div className="flex items-center gap-3">
                <Trophy className="w-6 h-6 text-neon-yellow" />
                <div className="text-left">
                  <div className="text-xs text-neon-yellow font-bold uppercase tracking-wider">
                    {spending.current_tier}
                  </div>
                  <div className="text-2xl font-black text-foreground">
                    ${spending.points}
                  </div>
                </div>
                <StatusBadge 
                  tier={spending.current_tier} 
                  title={spending.title}
                  showTitle={false}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-card/40 backdrop-blur-xl border-b border-neon-pink/30 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar ethnicity="mixed" size="md" />
              <div className="relative">
                <div className="bg-gradient-neon p-2 rounded-xl shadow-neon">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <Sparkles className="w-3 h-3 text-neon-yellow absolute -top-1 -right-1 animate-pulse" />
              </div>
              <h1 className="text-xl font-black bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-cyan bg-clip-text text-transparent">
                Glazn Community
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                onClick={() => navigate('/how-to')}
                className="bg-card/60 hover:bg-card/80 text-foreground px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border-2 border-neon-cyan/40"
              >
                <HelpCircle className="w-4 h-4" />
                HOW TO
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-gradient-neon text-white px-6 py-2 rounded-xl font-bold shadow-neon hover:shadow-glow transition-all flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                BROWSE BOUNTIES
              </button>
              <Button
                onClick={async () => {
                  await signOut();
                  toast.success('Signed out successfully');
                  navigate('/auth');
                }}
                variant="outline"
                size="icon"
                className="border-neon-cyan/40 hover:bg-neon-cyan/10 hover:shadow-cyan"
              >
                <LogOut className="w-4 h-4 text-neon-cyan" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-cyber py-12 border-b border-neon-cyan/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-8">
            <h2 className="text-5xl font-black bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-cyan bg-clip-text text-transparent mb-4">
              Welcome to the Creator Universe
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover trending bounties, connect with micro-influencers, and join the fastest-growing creator economy
            </p>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-card/80 backdrop-blur-xl border-2 border-neon-pink/40">
              <CardContent className="p-6 text-center">
                <DollarSign className="w-8 h-8 text-neon-yellow mx-auto mb-2" />
                <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text">
                  $2.4M
                </div>
                <p className="text-sm text-muted-foreground">Total Bounties</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-xl border-2 border-neon-purple/40">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-neon-cyan mx-auto mb-2" />
                <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text">
                  45K+
                </div>
                <p className="text-sm text-muted-foreground">Active Creators</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-xl border-2 border-neon-cyan/40">
              <CardContent className="p-6 text-center">
                <Flame className="w-8 h-8 text-neon-pink mx-auto mb-2" />
                <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text">
                  1,234
                </div>
                <p className="text-sm text-muted-foreground">Open Bounties</p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-xl border-2 border-neon-yellow/40">
              <CardContent className="p-6 text-center">
                <TrendingUp className="w-8 h-8 text-neon-purple mx-auto mb-2" />
                <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text">
                  892
                </div>
                <p className="text-sm text-muted-foreground">Completed Today</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Trending Bounties with Upvotes */}
            <Card className="bg-card/80 backdrop-blur-xl border-2 border-neon-yellow/40 shadow-glow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-r from-neon-yellow to-neon-pink p-2 rounded-xl shadow-glow animate-pulse">
                      <Flame className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <CardTitle className="text-2xl font-black text-foreground">Trending Bounties</CardTitle>
                      <CardDescription>Most popular requests from the community</CardDescription>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="border-neon-cyan/40">
                    <Filter className="w-4 h-4 mr-2" />
                    Filter
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingBounties.map((bounty) => (
                  <div
                    key={bounty.id}
                    className="p-4 bg-gradient-space/30 rounded-xl border border-neon-yellow/20 hover:border-neon-pink/40 transition-all group"
                  >
                    <div className="flex gap-4">
                      {/* Upvote Section */}
                      <div className="flex flex-col items-center gap-1">
                        <button
                          onClick={() => handleUpvote(bounty.id)}
                          className={`p-2 rounded-lg transition-all ${
                            bounty.hasUpvoted 
                              ? 'bg-neon-pink text-white shadow-neon' 
                              : 'bg-card hover:bg-neon-pink/20 text-muted-foreground hover:text-neon-pink'
                          }`}
                        >
                          <ArrowUp className="w-5 h-5" />
                        </button>
                        <span className={`text-sm font-bold ${
                          bounty.hasUpvoted ? 'text-neon-pink' : 'text-muted-foreground'
                        }`}>
                          {bounty.upvotes}
                        </span>
                      </div>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="font-bold text-foreground group-hover:text-neon-cyan transition-colors mb-1">
                              {bounty.title}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {bounty.description}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-black text-neon-yellow">
                              ${bounty.bounty.toLocaleString()}
                            </div>
                            {bounty.contributors > 0 && (
                              <Badge variant="outline" className="border-neon-purple/40 text-neon-purple text-xs">
                                +{bounty.contributors} supporters
                              </Badge>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {bounty.views}
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            {bounty.comments}
                          </div>
                          <Badge variant="outline" className="border-neon-purple/40 text-neon-purple">
                            {bounty.category}
                          </Badge>
                          <span className="ml-auto text-neon-cyan">
                            {bounty.timeLeft} left
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Regional Micro-Influencers */}
            <Card className="bg-card/80 backdrop-blur-xl border-2 border-neon-cyan/40 shadow-glow">
              <CardHeader>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-r from-neon-cyan to-neon-purple p-2 rounded-xl shadow-glow">
                    <MapPin className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black text-foreground">Regional Micro-Influencers</CardTitle>
                    <CardDescription>Top 100 creators by region and platform</CardDescription>
                  </div>
                </div>

                {/* Region Selector */}
                <div className="flex gap-2 flex-wrap mb-4">
                  {regions.map((region) => (
                    <button
                      key={region}
                      onClick={() => setSelectedRegion(region)}
                      className={`px-4 py-2 rounded-lg font-bold transition-all ${
                        selectedRegion === region
                          ? 'bg-gradient-neon text-white shadow-neon'
                          : 'bg-card/60 text-muted-foreground hover:bg-card'
                      }`}
                    >
                      <Globe className="w-4 h-4 inline mr-2" />
                      {region}
                    </button>
                  ))}
                </div>

                {/* Platform Filter */}
                <Tabs value={selectedPlatform} onValueChange={setSelectedPlatform} className="w-full">
                  <TabsList className="grid grid-cols-5 w-full bg-card/60">
                    <TabsTrigger value="all" className="data-[state=active]:bg-gradient-neon data-[state=active]:text-white">
                      All
                    </TabsTrigger>
                    <TabsTrigger value="instagram" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                      <Instagram className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="youtube" className="data-[state=active]:bg-red-600 data-[state=active]:text-white">
                      <Youtube className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="tiktok" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-black data-[state=active]:to-pink-500 data-[state=active]:text-white">
                      <Music className="w-4 h-4" />
                    </TabsTrigger>
                    <TabsTrigger value="twitter" className="data-[state=active]:bg-blue-500 data-[state=active]:text-white">
                      <Twitter className="w-4 h-4" />
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent>
                {filteredInfluencers.length > 0 ? (
                  <div className="space-y-3">
                    {filteredInfluencers.slice(0, 5).map((influencer, index) => (
                      <div
                        key={influencer.id}
                        className="flex items-center gap-4 p-4 bg-gradient-space/30 rounded-xl border border-neon-cyan/20 hover:border-neon-pink/40 transition-all cursor-pointer group"
                      >
                        <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-r ${getPlatformColor(influencer.platform)} text-white font-black shadow-neon`}>
                          {index + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-bold text-foreground group-hover:text-neon-cyan transition-colors">
                              {influencer.name}
                            </p>
                            {influencer.verified && (
                              <Badge variant="outline" className="border-neon-yellow/40 text-neon-yellow text-xs">
                                ✓ Verified
                              </Badge>
                            )}
                            {influencer.trending && (
                              <Badge className="bg-neon-pink/20 text-neon-pink text-xs">
                                <Flame className="w-3 h-3 mr-1" />
                                Trending
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <div className="flex items-center gap-1">
                              {getPlatformIcon(influencer.platform)}
                              {influencer.handle}
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-3 h-3" />
                              {influencer.followers}
                            </div>
                            <div className="flex items-center gap-1">
                              <TrendingUp className="w-3 h-3" />
                              {influencer.engagement}
                            </div>
                            <Badge variant="outline" className="border-neon-purple/40 text-neon-purple">
                              {influencer.category}
                            </Badge>
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3" />
                              {influencer.location}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-lg font-black text-neon-yellow">
                            ${influencer.avgBounty}
                          </div>
                          <div className="text-xs text-muted-foreground">avg bounty</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    <Globe className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>No influencers found in this region yet.</p>
                    <p className="text-sm mt-2">Check back soon as we expand!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <LiveActivityFeed />
            <LeaderboardPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
