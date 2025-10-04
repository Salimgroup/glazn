import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Users, CheckCircle, Clock, Star, Search, Filter, TrendingUp, Zap, Target, Award, LogOut, Trophy, Link as LinkIcon, FileCheck, DollarSign, Plus, HelpCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { StatusBadge, StatusProgress } from '@/components/StatusBadge';
import { useUserSpending } from '@/hooks/useUserSpending';
import { ExternalSubmissionModal } from '@/components/ExternalSubmissionModal';
import { SubmissionsManagementModal } from '@/components/SubmissionsManagementModal';
import { UserAvatar } from '@/components/UserAvatar';
import { BountyTicker } from '@/components/BountyTicker';
import { InfluencerBounties } from '@/components/InfluencerBounties';
import { ShareableBountyLink } from '@/components/ShareableBountyLink';
import { ContributeToBountyModal } from '@/components/ContributeToBountyModal';
import { ContributionsManagementModal } from '@/components/ContributionsManagementModal';
import { LiveActivityFeed } from '@/components/LiveActivityFeed';
import { LeaderboardPanel } from '@/components/LeaderboardPanel';
import { NotificationBell } from '@/components/NotificationBell';
import { QuickStatsCard } from '@/components/QuickStatsCard';
import { TrendingBountiesSection } from '@/components/TrendingBountiesSection';
import { BountyReactions } from '@/components/BountyReactions';
import { ContentCreatorDashboard } from '@/components/ContentCreatorDashboard';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function Glazn() {
  const { user, signOut, loading } = useAuth();
  const { spending, addSpending } = useUserSpending();
  const navigate = useNavigate();
  const COMMISSION_RATE = 0.20;

  // Redirect to auth if not logged in
  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const [showStatusModal, setShowStatusModal] = useState(false);

  const calculateCreatorPayout = (bounty: number) => {
    return (bounty * (1 - COMMISSION_RATE)).toFixed(2);
  };

  const calculateCommission = (bounty: number) => {
    return (bounty * COMMISSION_RATE).toFixed(2);
  };

  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [bountyRange, setBountyRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState('newest');
  const [showFilters, setShowFilters] = useState(false);

  // Portfolio state
  const [portfolio, setPortfolio] = useState([
    {
      id: 1,
      title: 'Golden Hour Beach Set',
      description: 'Collection of sunset beach photos with golden lighting',
      tags: ['beach', 'sunset', 'golden hour', 'photography', 'ocean', 'waves'],
      type: 'Photography',
      thumbnail: '🌅',
      autoSubmit: true,
      timesUsed: 3
    },
    {
      id: 2,
      title: 'Urban Street Photography',
      description: 'Street art and urban landscape photos',
      tags: ['urban', 'street', 'art', 'graffiti', 'city', 'photography'],
      type: 'Photography',
      thumbnail: '🏙️',
      autoSubmit: true,
      timesUsed: 5
    },
    {
      id: 3,
      title: 'Product Showcase Video',
      description: 'Professional product unboxing and review template',
      tags: ['product', 'unboxing', 'video', 'review', 'tech'],
      type: 'Video',
      thumbnail: '📦',
      autoSubmit: true,
      timesUsed: 2
    }
  ]);

  const [requests, setRequests] = useState([
    {
      id: 1,
      title: 'Sunset Beach Photography',
      description: 'Looking for high-quality sunset photos at a beach location. Should capture golden hour lighting with waves.',
      bounty: 150,
      requester: 'Sarah M.',
      category: 'Photography',
      deadline: '3 days',
      submissions: 7,
      status: 'open',
      aiMatched: [],
      createdAt: Date.now() - 86400000
    },
    {
      id: 2,
      title: 'Product Unboxing Video',
      description: 'Need a 2-3 minute unboxing video for tech product. Professional lighting and clear audio required.',
      bounty: 200,
      requester: 'TechStart Inc.',
      category: 'Video',
      deadline: '5 days',
      submissions: 12,
      status: 'open',
      aiMatched: [],
      createdAt: Date.now() - 172800000
    },
    {
      id: 3,
      title: 'Urban Street Art Photos',
      description: 'Collection of 10 photos featuring street art and murals in urban settings.',
      bounty: 100,
      requester: 'Mike D.',
      category: 'Photography',
      deadline: '7 days',
      submissions: 15,
      status: 'open',
      aiMatched: [],
      createdAt: Date.now() - 259200000
    }
  ]);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPortfolioModal, setShowPortfolioModal] = useState(false);
  const [showAISettings, setShowAISettings] = useState(false);
  const [aiEnabled, setAiEnabled] = useState(true);
  const [autoSubmissions, setAutoSubmissions] = useState<any[]>([]);
  const [showExternalSubmission, setShowExternalSubmission] = useState<{ id: number; title: string } | null>(null);
  const [showSubmissionsManagement, setShowSubmissionsManagement] = useState<{ id: number; title: string } | null>(null);
  const [shareableBounty, setShareableBounty] = useState<{ id: number; title: string } | null>(null);
  const [contributeToBounty, setContributeToBounty] = useState<{ id: number; title: string; bounty: number; minimumContribution?: number } | null>(null);
  const [manageContributions, setManageContributions] = useState<{ id: number; title: string } | null>(null);

  const [newPortfolioItem, setNewPortfolioItem] = useState({
    title: '',
    description: '',
    tags: '',
    type: 'Photography',
    autoSubmit: true
  });

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    bounty: '',
    category: 'Photography',
    deadline: '3',
    allowContributions: true,
    minimumContribution: '0'
  });

  const categories = ['All', 'Photography', 'Video', 'Digital Art', 'Graphic Design', '3D Rendering', 'Animation', 'Writing', 'Music'];

  // AI Matching Logic
  const calculateMatchScore = (requestText: string, portfolioTags: string[]) => {
    const requestWords = requestText.toLowerCase().split(/\s+/);
    let matches = 0;
    let totalWeight = 0;

    portfolioTags.forEach(tag => {
      const tagWords = tag.toLowerCase().split(/\s+/);
      tagWords.forEach(tagWord => {
        requestWords.forEach(requestWord => {
          if (requestWord.includes(tagWord) || tagWord.includes(requestWord)) {
            matches++;
            totalWeight++;
          }
        });
      });
    });

    const score = Math.min(100, (matches / Math.max(requestWords.length, 1)) * 100);
    return Math.round(score);
  };

  const getMatchedPortfolioItems = (request: any) => {
    if (!aiEnabled) return [];
    
    return portfolio
      .filter(item => item.autoSubmit)
      .map(item => ({
        ...item,
        matchScore: calculateMatchScore(
          `${request.title} ${request.description}`,
          item.tags
        )
      }))
      .filter(item => item.matchScore > 30)
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  // Auto-submit when new request is created
  useEffect(() => {
    requests.forEach(request => {
      if (!request.aiMatched || request.aiMatched.length === 0) {
        const matches = getMatchedPortfolioItems(request);
        if (matches.length > 0 && aiEnabled) {
          // Update request with matched items
          setRequests(prev => prev.map(r => 
            r.id === request.id 
              ? { ...r, aiMatched: matches.map(m => m.id) }
              : r
          ));

          // Show notification
          matches.forEach(match => {
            toast.success(
              `🎯 AI Auto-Submit: "${match.title}" matched with "${request.title}" (${match.matchScore}% match)`,
              { duration: 5000 }
            );
          });

          // Track auto-submission
          setAutoSubmissions(prev => [
            ...prev,
            {
              requestId: request.id,
              portfolioItems: matches,
              timestamp: Date.now()
            }
          ]);
        }
      }
    });
  }, [requests, aiEnabled]);

  // Filtered and sorted requests
  const filteredRequests = useMemo(() => {
    let filtered = requests.filter(request => {
      const matchesSearch = 
        request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        request.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === 'All' || request.category === selectedCategory;
      
      const matchesBounty = 
        request.bounty >= bountyRange[0] && request.bounty <= bountyRange[1];

      return matchesSearch && matchesCategory && matchesBounty;
    });

    // Sort
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => b.createdAt - a.createdAt);
        break;
      case 'bounty-high':
        filtered.sort((a, b) => b.bounty - a.bounty);
        break;
      case 'bounty-low':
        filtered.sort((a, b) => a.bounty - b.bounty);
        break;
      case 'deadline':
        filtered.sort((a, b) => 
          parseInt(a.deadline) - parseInt(b.deadline)
        );
        break;
    }

    return filtered;
  }, [requests, searchQuery, selectedCategory, bountyRange, sortBy]);

  const handleCreateRequest = async () => {
    if (newRequest.title && newRequest.description && newRequest.bounty) {
      const bountyAmount = parseInt(newRequest.bounty);
      const request = {
        id: requests.length + 1,
        title: newRequest.title,
        description: newRequest.description,
        bounty: bountyAmount,
        requester: 'You',
        category: newRequest.category,
        deadline: `${newRequest.deadline} days`,
        submissions: 0,
        status: 'open',
        aiMatched: [],
        createdAt: Date.now()
      };
      setRequests([request, ...requests]);
      setShowCreateModal(false);
      setNewRequest({ title: '', description: '', bounty: '', category: 'Photography', deadline: '3', allowContributions: true, minimumContribution: '0' });
      
      // Add spending and update points
      try {
        await addSpending(bountyAmount);
        toast.success(`✨ Request posted! +${bountyAmount} points earned!`, { duration: 3000 });
      } catch (error) {
        if (import.meta.env.DEV) {
          console.error('Error adding spending:', error);
        }
        toast.success('✨ Request posted! AI is now scanning for matches...', { duration: 3000 });
      }
    }
  };

  const handleAddToPortfolio = () => {
    if (newPortfolioItem.title && newPortfolioItem.tags) {
      const item = {
        id: portfolio.length + 1,
        title: newPortfolioItem.title,
        description: newPortfolioItem.description,
        tags: newPortfolioItem.tags.toLowerCase().split(',').map(tag => tag.trim()),
        type: newPortfolioItem.type,
        thumbnail: '📁',
        autoSubmit: newPortfolioItem.autoSubmit,
        timesUsed: 0
      };
      setPortfolio([item, ...portfolio]);
      setShowPortfolioModal(false);
      setNewPortfolioItem({ title: '', description: '', tags: '', type: 'Photography', autoSubmit: true });
      
      toast.success('🎨 Added to portfolio! AI will auto-submit to matching requests', { duration: 3000 });
    }
  };

  const getMatchBadgeColor = (score: number) => {
    if (score >= 70) return 'from-green-500 to-emerald-500';
    if (score >= 50) return 'from-yellow-500 to-orange-500';
    return 'from-blue-500 to-cyan-500';
  };

  const handleInfluencerBounty = (influencer: any) => {
    setNewRequest({
      title: `${influencer.category} Content by ${influencer.name}`,
      description: `Looking for premium ${influencer.category.toLowerCase()} content from ${influencer.name} (${influencer.handle}). ${influencer.followers} followers on ${influencer.platform}.`,
      bounty: influencer.suggestedBounty.toString(),
      category: influencer.category.split(' ')[0],
      deadline: '7',
      allowContributions: true,
      minimumContribution: '0'
    });
    setActiveTab('browse');
    setShowCreateModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Bounty Ticker */}
      <BountyTicker bounties={requests.map(r => ({ id: r.id, title: r.title, bounty: r.bounty }))} />

      {/* Floating Rank Badge */}
      {user && spending && (
        <button
          onClick={() => setShowStatusModal(true)}
          className="fixed top-4 right-4 z-50 group animate-fade-in"
        >
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
        </button>
      )}

      {/* Compact Header */}
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
                Glazn
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationBell />
              <button
                onClick={() => navigate('/feed')}
                className="bg-gradient-neon text-white px-4 py-2 rounded-xl font-bold shadow-neon hover:shadow-glow transition-all flex items-center gap-2"
              >
                <Zap className="w-4 h-4" />
                FEED
              </button>
              <button
                onClick={() => navigate('/')}
                className="bg-card/60 hover:bg-card/80 text-foreground px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border-2 border-neon-purple/40"
              >
                <Users className="w-4 h-4" />
                COMMUNITY
              </button>
              <button
                onClick={() => navigate('/how-to')}
                className="bg-card/60 hover:bg-card/80 text-foreground px-4 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border-2 border-neon-cyan/40"
              >
                <HelpCircle className="w-4 h-4" />
                HOW TO
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-neon text-white px-6 py-2 rounded-xl font-bold shadow-neon hover:shadow-glow transition-all flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                POST BOUNTY
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

      {/* Hero Stats Bar */}
      <div className="bg-gradient-cyber py-4 shadow-neon border-b border-neon-cyan/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-card/40 backdrop-blur-sm rounded-xl p-3 border-2 border-neon-pink/40">
              <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text mb-1">
                ${requests.reduce((sum, r) => sum + r.bounty, 0).toLocaleString()}
              </div>
              <div className="text-xs font-bold text-neon-yellow uppercase tracking-wider">Total Bounties</div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm rounded-xl p-3 border-2 border-neon-purple/40">
              <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text mb-1">
                {filteredRequests.length}
              </div>
              <div className="text-xs font-bold text-neon-cyan uppercase tracking-wider">Active Requests</div>
            </div>
            <div className="bg-card/40 backdrop-blur-sm rounded-xl p-3 border-2 border-neon-cyan/40">
              <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text mb-1">
                {portfolio.reduce((sum, p) => sum + p.timesUsed, 0)}
              </div>
              <div className="text-xs font-bold text-neon-pink uppercase tracking-wider">AI Matches</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Simplified Tabs */}
        <div className="flex gap-3 mb-6">
          <button
            onClick={() => setActiveTab('browse')}
            className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all ${
              activeTab === 'browse'
                ? 'bg-gradient-neon text-white shadow-neon border-2 border-neon-pink'
                : 'bg-card/40 text-muted-foreground hover:bg-card/60 border-2 border-border'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Target className="w-5 h-5" />
              BOUNTIES ({filteredRequests.length})
            </div>
          </button>
          <button
            onClick={() => setActiveTab('influencers')}
            className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all ${
              activeTab === 'influencers'
                ? 'bg-gradient-to-r from-neon-yellow to-neon-cyan text-space-dark shadow-cyan border-2 border-neon-cyan'
                : 'bg-card/40 text-muted-foreground hover:bg-card/60 border-2 border-border'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Crown className="w-5 h-5" />
              INFLUENCERS
            </div>
          </button>
          <button
            onClick={() => setActiveTab('creator')}
            className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all ${
              activeTab === 'creator'
                ? 'bg-gradient-to-r from-neon-cyan to-neon-purple text-white shadow-cyan border-2 border-neon-cyan'
                : 'bg-card/40 text-muted-foreground hover:bg-card/60 border-2 border-border'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Star className="w-5 h-5" />
              MY REQUESTS
            </div>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`flex-1 py-3 px-4 font-bold rounded-xl transition-all ${
              activeTab === 'portfolio'
                ? 'bg-gradient-to-r from-neon-purple to-neon-pink text-white shadow-glow border-2 border-neon-purple'
                : 'bg-card/40 text-muted-foreground hover:bg-card/60 border-2 border-border'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Sparkles className="w-5 h-5" />
              MY CONTENT ({portfolio.filter(p => p.autoSubmit).length})
            </div>
          </button>
        </div>

        {/* Minimal Search */}
        {activeTab === 'browse' && (
          <>
            {/* Quick Stats Dashboard */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <QuickStatsCard
                title="Active Bounties"
                value={filteredRequests.length}
                change="+12% this week"
                icon="target"
                trend="up"
              />
              <QuickStatsCard
                title="Total Volume"
                value={`$${requests.reduce((sum, r) => sum + r.bounty, 0).toLocaleString()}`}
                change="+8% this week"
                icon="dollar"
                trend="up"
              />
              <QuickStatsCard
                title="Creators Online"
                value="2,847"
                change="+24% today"
                icon="trending"
                trend="up"
              />
              <QuickStatsCard
                title="Avg Response"
                value="< 2h"
                change="Fastest ever"
                icon="award"
                trend="up"
              />
            </div>

            <div className="mb-6">
              <div className="relative">
                <Search className="w-5 h-5 text-neon-cyan absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search bounties in the cosmos..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-card/60 backdrop-blur-sm border-2 border-neon-purple/40 rounded-xl text-foreground placeholder-muted-foreground focus:ring-2 focus:ring-neon-pink focus:border-neon-pink"
                />
              </div>
            </div>
          </>
        )}

        {/* Influencers Tab */}
        {activeTab === 'influencers' && (
          <InfluencerBounties onCreateBounty={handleInfluencerBounty} />
        )}

        {/* Content Creator Tab */}
        {activeTab === 'creator' && (
          <ContentCreatorDashboard />
        )}

        {/* Portfolio View - Simplified */}
        {activeTab === 'portfolio' && (
          <>
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-600/20 border-2 border-green-400/30 rounded-2xl p-6 mb-6 backdrop-blur-sm">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-3 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-xl text-white mb-2">AI Auto-Submit Portfolio</h3>
                  <p className="text-sm text-white/80 mb-4">
                    Upload once, earn forever! AI automatically matches your content to new bounties.
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowPortfolioModal(true)}
                      className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-xl text-sm font-bold hover:shadow-[0_0_30px_rgba(34,197,94,0.5)] transition-all"
                    >
                      + UPLOAD CONTENT
                    </button>
                    <div className="text-sm text-white/90 font-bold">
                      {portfolio.filter(p => p.autoSubmit).length} Active • 
                      <span className="text-green-400 ml-1">{portfolio.reduce((sum, p) => sum + p.timesUsed, 0)} Matches</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {portfolio.map((item) => {
                const matchingRequests = requests.filter(r => 
                  r.aiMatched && r.aiMatched.includes(item.id)
                );

                return (
                  <div key={item.id} className="bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:border-green-400/50 transition-all p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="text-4xl">{item.thumbnail}</div>
                      <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-400/30 font-bold">
                        <CheckCircle className="w-3 h-3" />
                        AUTO-ON
                      </span>
                    </div>
                    
                    <h3 className="font-bold text-lg mb-2 text-white">{item.title}</h3>
                    <p className="text-sm text-white/70 mb-3 line-clamp-2">{item.description}</p>
                    
                    {matchingRequests.length > 0 && (
                      <div className="mb-3 p-2 bg-green-500/20 border border-green-400/30 rounded-lg">
                        <div className="flex items-center gap-1 text-xs text-green-400 font-bold">
                          <Target className="w-3 h-3" />
                          MATCHED TO {matchingRequests.length} BOUNTY{matchingRequests.length > 1 ? 'S' : ''}
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-white/10">
                      <div className="flex items-center gap-1 text-sm text-white/80 font-bold">
                        <Award className="w-4 h-4 text-yellow-400" />
                        Used {item.timesUsed}x
                      </div>
                      <button className="text-sm text-green-400 hover:text-green-300 font-bold">
                        EDIT
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Bounty Cards with Sidebar Layout */}
        {activeTab === 'browse' && (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Sidebar - Trending & Activity */}
            <div className="lg:col-span-1 space-y-6">
              <TrendingBountiesSection />
              <LiveActivityFeed />
            </div>

            {/* Main Content - Bounty Cards */}
            <div className="lg:col-span-1 space-y-4">
              {filteredRequests.map((request) => {
                const matchedItems = getMatchedPortfolioItems(request);
                const bestMatch = matchedItems[0];

                return (
                  <div key={request.id} className="group relative animate-fade-in">
                    {/* Glow Effect */}
                    <div className="absolute -inset-1 bg-gradient-neon rounded-2xl blur-lg opacity-25 group-hover:opacity-100 transition-opacity" />
                  
                  <div className="relative bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-pink/40 hover:border-neon-cyan transition-all overflow-hidden shadow-neon">
                    {/* AI Match Badge */}
                    {bestMatch && aiEnabled && (
                      <div className="absolute top-0 right-0 bg-gradient-to-br from-neon-cyan to-neon-purple text-white px-3 py-1 rounded-bl-xl text-xs font-bold flex items-center gap-1 shadow-cyan">
                        <Zap className="w-3 h-3" />
                        {bestMatch.matchScore}% MATCH
                      </div>
                    )}

                    <div className="p-5">
                      {/* Bounty Amount - HUGE */}
                      <div className="mb-4 text-center py-4 bg-gradient-to-r from-neon-pink/20 to-neon-purple/20 rounded-xl border-2 border-neon-yellow/40">
                        <div className="text-5xl font-black text-transparent bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-cyan bg-clip-text mb-1">
                          ${request.bounty}
                        </div>
                        <div className="text-xs text-neon-yellow font-bold uppercase tracking-widest">TOTAL BOUNTY</div>
                      </div>

                      {/* Category Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-bold px-2 py-1 bg-neon-cyan/20 text-neon-cyan rounded-lg border border-neon-cyan/30 uppercase">
                          {request.category}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground font-medium">
                          <Clock className="w-3 h-3" />
                          {request.deadline}
                        </span>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 text-foreground">{request.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{request.description}</p>
                      
                      {/* Your Payout */}
                      <div className="mb-4 p-3 bg-gradient-to-r from-neon-purple/20 to-neon-pink/20 border-2 border-neon-purple/40 rounded-xl">
                        <div className="flex justify-between items-center">
                          <span className="text-xs text-neon-purple font-bold uppercase">You Get:</span>
                          <span className="text-2xl font-black text-transparent bg-gradient-neon bg-clip-text">${calculateCreatorPayout(request.bounty)}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                      {request.requester === 'You' && (
                          <>
                            <button
                              onClick={() => setShowSubmissionsManagement({ id: request.id, title: request.title })}
                              className="flex-1 bg-card/60 hover:bg-card/80 text-foreground px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border-2 border-neon-purple/40"
                            >
                              <FileCheck className="w-4 h-4" />
                              REVIEW
                            </button>
                            <button
                              onClick={() => setManageContributions({ id: request.id, title: request.title })}
                              className="bg-card/60 hover:bg-card/80 text-foreground px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border-2 border-neon-yellow/40"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => setShareableBounty({ id: request.id, title: request.title })}
                              className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-purple hover:to-neon-cyan text-white px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 shadow-cyan"
                            >
                              <LinkIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {request.requester !== 'You' && (
                          <>
                            <button
                              onClick={() => setShowExternalSubmission({ id: request.id, title: request.title })}
                              className="flex-1 bg-gradient-neon hover:shadow-glow text-white px-4 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-neon"
                            >
                              <LinkIcon className="w-4 h-4" />
                              SUBMIT
                            </button>
                            <button
                              onClick={() => setContributeToBounty({ 
                                id: request.id, 
                                title: request.title, 
                                bounty: request.bounty,
                                minimumContribution: 0
                              })}
                              className="bg-gradient-to-r from-neon-yellow to-neon-pink hover:shadow-glow text-white px-4 py-3 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2 shadow-neon"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>

                      {/* Bounty Reactions */}
                      <div className="mt-4 pt-4 border-t border-neon-purple/20">
                        <BountyReactions requestId={request.id.toString()} />
                      </div>

                      {/* Submissions Count */}
                      <div className="mt-3 text-center text-xs text-muted-foreground">
                        {request.submissions} cosmic submissions
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRequests.length === 0 && (
              <div className="col-span-full text-center py-12">
                <Search className="w-16 h-16 mx-auto text-muted-foreground/20 mb-4" />
                <h3 className="text-xl font-bold text-foreground mb-2">No bounties in this sector</h3>
                <p className="text-muted-foreground">Try searching another quadrant of the cosmos</p>
              </div>
            )}
          </div>

          {/* Right Sidebar - Leaderboard */}
          <div className="lg:col-span-1">
            <LeaderboardPanel />
          </div>
        </div>
      )}
      </div>

      {/* Portfolio Upload Modal */}
      {showPortfolioModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Add to AI Portfolio</h2>
              </div>
              <p className="text-sm text-gray-600">Upload content that can be automatically submitted to matching requests</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Title</label>
                <input
                  type="text"
                  value={newPortfolioItem.title}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, title: e.target.value })}
                  placeholder="e.g., Golden Hour Beach Collection"
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content Type</label>
                <select
                  value={newPortfolioItem.type}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, type: e.target.value })}
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={newPortfolioItem.description}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, description: e.target.value })}
                  placeholder="Describe this content..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={newPortfolioItem.tags}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, tags: e.target.value })}
                  placeholder="beach, sunset, golden hour, ocean, waves"
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">AI uses these tags to match your content with requests</p>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                <input
                  type="checkbox"
                  id="autoSubmit"
                  checked={newPortfolioItem.autoSubmit}
                  onChange={(e) => setNewPortfolioItem({ ...newPortfolioItem, autoSubmit: e.target.checked })}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <label htmlFor="autoSubmit" className="text-sm text-gray-700 cursor-pointer">
                  <strong>Enable AI Auto-Submit</strong> - Automatically submit this content to matching requests
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-purple-100 flex gap-3 bg-gray-50">
              <button
                onClick={() => setShowPortfolioModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddToPortfolio}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Add to Portfolio
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Settings Modal */}
      {showAISettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full">
            <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">AI Auto-Submit Settings</h2>
              <p className="text-sm text-gray-600">Control how AI submits your portfolio content</p>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl">
                <div className="flex items-center gap-3">
                  <Sparkles className={`w-6 h-6 ${aiEnabled ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <div className="font-semibold text-gray-900">AI Auto-Submit</div>
                    <div className="text-sm text-gray-600">Automatically submit matching portfolio items</div>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setAiEnabled(!aiEnabled);
                    toast.success(
                      !aiEnabled ? '✨ AI Auto-Submit Enabled!' : '⏸️ AI Auto-Submit Paused',
                      { duration: 2000 }
                    );
                  }}
                  className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${
                    aiEnabled ? 'bg-green-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${
                      aiEnabled ? 'translate-x-7' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-gray-900">How AI Matching Works:</h3>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p>AI scans new requests and calculates match scores with your portfolio</p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p>Items with 30%+ match are automatically submitted</p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p>You earn {(1-COMMISSION_RATE)*100}% of the bounty if selected</p>
                  </div>
                  <div className="flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p>Same content can win multiple requests over time</p>
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <div className="text-sm text-blue-900">
                    <strong>Pro Tip:</strong> Add detailed, specific tags to your portfolio items for better AI matching accuracy and higher match scores!
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-purple-100 bg-gray-50">
              <button
                onClick={() => setShowAISettings(false)}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium hover:shadow-lg transition-all"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Request Modal - Exciting */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-gradient-to-br from-purple-900 to-pink-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-yellow-400">
            <div className="p-6 border-b border-yellow-400/30 bg-gradient-to-r from-yellow-400/20 to-orange-500/20">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-3 rounded-xl shadow-lg">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-white">POST YOUR BOUNTY</h2>
                  <p className="text-sm text-yellow-400 font-bold">AI instantly matches with creators!</p>
                </div>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-white mb-2">What Do You Need?</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="e.g., Sunset Beach Photography"
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                />
              </div>

              {/* HUGE Bounty Input */}
              <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 border-2 border-yellow-400/30 rounded-2xl p-6">
                <label className="block text-center text-sm font-black text-yellow-400 mb-3 uppercase tracking-widest">
                  💰 SET YOUR BOUNTY 💰
                </label>
                <div className="relative">
                  <span className="absolute left-6 top-1/2 -translate-y-1/2 text-4xl font-black text-white">$</span>
                  <input
                    type="number"
                    value={newRequest.bounty}
                    onChange={(e) => setNewRequest({ ...newRequest, bounty: e.target.value })}
                    placeholder="500"
                    className="w-full pl-16 pr-6 py-6 bg-black/30 border-2 border-yellow-400 rounded-xl text-5xl font-black text-center text-white placeholder-white/30 focus:ring-4 focus:ring-yellow-400/50 focus:border-yellow-400"
                  />
                </div>
                {newRequest.bounty && (
                  <div className="mt-4 p-3 bg-black/30 rounded-lg">
                    <div className="flex justify-between text-sm">
                      <span className="text-white/70 font-medium">Creator gets:</span>
                      <span className="text-2xl font-black text-green-400">
                        ${calculateCreatorPayout(parseInt(newRequest.bounty))}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                      <span className="text-white/50">Platform fee (20%):</span>
                      <span className="text-white/70 font-bold">
                        ${calculateCommission(parseInt(newRequest.bounty))}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-white mb-2">Category</label>
                  <select
                    value={newRequest.category}
                    onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                    className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  >
                    {categories.filter(c => c !== 'All').map(cat => (
                      <option key={cat} value={cat} className="bg-purple-900">{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-white mb-2">Deadline</label>
                  <input
                    type="number"
                    value={newRequest.deadline}
                    onChange={(e) => setNewRequest({ ...newRequest, deadline: e.target.value })}
                    placeholder="3"
                    className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                  <p className="text-xs text-white/50 mt-1">days</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-white mb-2">Detailed Description</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Be specific! Better details = better AI matches..."
                  rows={4}
                  className="w-full px-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 resize-none"
                />
              </div>

              <div className="bg-blue-500/20 border border-blue-400/30 rounded-xl p-4">
                <div className="flex gap-2">
                  <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0" />
                  <div className="text-sm text-blue-400">
                    <strong className="text-white">AI is standing by!</strong> Once posted, your request will be instantly matched with creator portfolios. You'll get submissions within minutes!
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-neon-yellow/20 to-neon-pink/20 border-2 border-neon-yellow/30 rounded-xl">
                <input
                  type="checkbox"
                  id="allowContributions"
                  checked={newRequest.allowContributions}
                  onChange={(e) => setNewRequest({ ...newRequest, allowContributions: e.target.checked })}
                  className="w-5 h-5 text-neon-pink border-neon-yellow/30 rounded focus:ring-neon-yellow"
                />
                <label htmlFor="allowContributions" className="text-sm text-white cursor-pointer font-medium">
                  <strong className="text-neon-yellow">Allow others to contribute to this bounty</strong>
                  <p className="text-xs text-white/70 mt-1">Contributors can add funds but you maintain full control over accepting submissions</p>
                </label>
              </div>

              {newRequest.allowContributions && (
                <div>
                  <label className="block text-sm font-bold text-white mb-2">
                    Minimum Contribution (Optional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-white">$</span>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={newRequest.minimumContribution}
                      onChange={(e) => setNewRequest({ ...newRequest, minimumContribution: e.target.value })}
                      placeholder="0"
                      className="w-full pl-10 pr-4 py-3 bg-white/10 border-2 border-white/20 rounded-xl text-white placeholder-white/40 focus:ring-2 focus:ring-neon-yellow focus:border-neon-yellow"
                    />
                  </div>
                  <p className="text-xs text-white/50 mt-1">
                    Set a minimum amount contributors must pledge to access submissions (leave 0 for no minimum)
                  </p>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-yellow-400/30 flex gap-3 bg-black/30">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-4 border-2 border-white/20 rounded-xl font-bold text-white hover:bg-white/10 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                className="flex-1 px-6 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 text-black rounded-xl font-black hover:shadow-[0_0_40px_rgba(251,191,36,0.6)] transition-all flex items-center justify-center gap-2 text-lg"
              >
                <Crown className="w-5 h-5" />
                POST BOUNTY
              </button>
            </div>
          </div>
        </div>
      )}

      {/* External Submission Modal */}
      {showExternalSubmission && (
        <ExternalSubmissionModal
          requestId={showExternalSubmission.id.toString()}
          requestTitle={showExternalSubmission.title}
          onClose={() => setShowExternalSubmission(null)}
          onSubmit={() => {
            toast.success('Submission sent for review!');
          }}
        />
      )}

      {/* Submissions Management Modal */}
      {showSubmissionsManagement && (
        <SubmissionsManagementModal
          requestId={showSubmissionsManagement.id.toString()}
          requestTitle={showSubmissionsManagement.title}
          onClose={() => setShowSubmissionsManagement(null)}
        />
      )}

      {/* Status Modal */}
      <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <Trophy className="w-6 h-6 text-primary" />
              Your Status & Rewards
            </DialogTitle>
            <DialogDescription>
              Track your spending and unlock exclusive titles
            </DialogDescription>
          </DialogHeader>

          {spending && (
            <div className="space-y-6 pt-4">
              {/* Current Status */}
              <div className="flex flex-col items-center gap-4 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl">
                <StatusBadge 
                  tier={spending.current_tier} 
                  title={spending.title}
                  className="scale-125"
                />
                <div className="text-center">
                  <div className="text-3xl font-bold text-foreground">
                    {spending.points} Points
                  </div>
                  <div className="text-sm text-muted-foreground">
                    ${spending.total_spent.toFixed(2)} total spent
                  </div>
                </div>
              </div>

              {/* Progress */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Level Progress</h3>
                <StatusProgress 
                  currentSpending={spending.total_spent}
                  currentTier={spending.current_tier}
                />
              </div>

              {/* All Tiers */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">All Status Tiers</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <StatusBadge tier="glass_beginner" title="👟 Glass Beginner" />
                    <span className="text-muted-foreground">$0+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <StatusBadge tier="glass_collector" title="🎯 Glass Collector" />
                    <span className="text-muted-foreground">$100+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <StatusBadge tier="glass_enthusiast" title="✨ Glass Enthusiast" />
                    <span className="text-muted-foreground">$500+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <StatusBadge tier="glass_connoisseur" title="🌟 Glass Connoisseur" />
                    <span className="text-muted-foreground">$2,000+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <StatusBadge tier="glass_royalty" title="💎 Glass Royalty" />
                    <span className="text-muted-foreground">$5,000+</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <StatusBadge tier="glass_legend" title="👑 Glass Legend" />
                    <span className="text-muted-foreground">$10,000+</span>
                  </div>
                </div>
              </div>

              {/* Benefits */}
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground">Status Benefits</h3>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Exclusive badges and titles</li>
                  <li>• Priority in creator matching</li>
                  <li>• Recognition in the community</li>
                  <li>• Special perks for top tiers</li>
                </ul>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Shareable Bounty Link Modal */}
      {shareableBounty && (
        <ShareableBountyLink
          bountyId={shareableBounty.id}
          bountyTitle={shareableBounty.title}
          isOpen={!!shareableBounty}
          onClose={() => setShareableBounty(null)}
        />
      )}

      {/* Contribute to Bounty Modal */}
      {contributeToBounty && (
        <ContributeToBountyModal
          isOpen={!!contributeToBounty}
          onClose={() => setContributeToBounty(null)}
          requestId={contributeToBounty.id.toString()}
          requestTitle={contributeToBounty.title}
          currentBounty={contributeToBounty.bounty}
          minimumContribution={contributeToBounty.minimumContribution}
        />
      )}

      {/* Manage Contributions Modal */}
      {manageContributions && (
        <ContributionsManagementModal
          isOpen={!!manageContributions}
          onClose={() => setManageContributions(null)}
          requestId={manageContributions.id.toString()}
          requestTitle={manageContributions.title}
        />
      )}
    </div>
  );
}