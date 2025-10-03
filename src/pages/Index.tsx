import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Sparkles, Users, CheckCircle, Clock, Star, Search, Filter, TrendingUp, Zap, Target, Award, LogOut, Trophy } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { StatusBadge, StatusProgress } from '@/components/StatusBadge';
import { useUserSpending } from '@/hooks/useUserSpending';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function GlassSlipper() {
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
    deadline: '3'
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
      setNewRequest({ title: '', description: '', bounty: '', category: 'Photography', deadline: '3' });
      
      // Add spending and update points
      try {
        await addSpending(bountyAmount);
        toast.success(`✨ Request posted! +${bountyAmount} points earned!`, { duration: 3000 });
      } catch (error) {
        console.error('Error adding spending:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-purple-600 p-2.5 rounded-xl">
                  <Crown className="w-7 h-7 text-white" />
                </div>
                <Sparkles className="w-4 h-4 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 bg-clip-text text-transparent">
                  GlassSlipper
                </h1>
                <p className="text-xs text-purple-600 italic">AI-Powered Perfect Fits</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {user && spending && (
                <button
                  onClick={() => setShowStatusModal(true)}
                  className="flex items-center gap-3 px-3 py-2 bg-muted rounded-lg hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  {user.user_metadata?.avatar_url && (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt={user.user_metadata?.full_name || 'User'} 
                      className="w-8 h-8 rounded-full"
                    />
                  )}
                  <div className="flex flex-col items-start">
                    <span className="text-sm font-medium text-foreground">
                      {user.user_metadata?.full_name || user.email?.split('@')[0]}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {spending.points} points
                    </span>
                  </div>
                  <StatusBadge 
                    tier={spending.current_tier} 
                    title={spending.title}
                    showTitle={false}
                  />
                </button>
              )}
              <button
                onClick={() => setShowAISettings(true)}
                className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                  aiEnabled 
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md hover:shadow-lg' 
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                AI {aiEnabled ? 'Active' : 'Off'}
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white px-6 py-2.5 rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
              >
                <Crown className="w-4 h-4" />
                Post Request
              </button>
              <Button
                onClick={async () => {
                  await signOut();
                  toast.success('Signed out successfully');
                  navigate('/auth');
                }}
                variant="outline"
                size="icon"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 text-white py-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Sparkles className="absolute top-10 left-10 w-6 h-6 animate-pulse" />
          <Sparkles className="absolute top-20 right-20 w-8 h-8 animate-pulse" style={{ animationDelay: '0.5s' }} />
          <Sparkles className="absolute bottom-10 left-1/4 w-5 h-5 animate-pulse" style={{ animationDelay: '1s' }} />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4">
              <Zap className="w-4 h-4 text-yellow-300" />
              <span className="text-sm font-medium">AI-Powered Matching • Auto-Submit • Earn Passively</span>
            </div>
            <h2 className="text-4xl font-bold mb-3">Every Request Finds Its Perfect Match</h2>
            <p className="text-xl text-white/90 italic">Upload once. Earn forever. AI does the work.</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b border-purple-200">
          <button
            onClick={() => setActiveTab('browse')}
            className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'browse'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Search className="w-4 h-4" />
            Browse Requests
            <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full">
              {filteredRequests.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('portfolio')}
            className={`pb-3 px-4 font-medium transition-colors flex items-center gap-2 ${
              activeTab === 'portfolio'
                ? 'border-b-2 border-purple-500 text-purple-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            My Portfolio
            <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
              {portfolio.filter(p => p.autoSubmit).length} Active
            </span>
          </button>
        </div>

        {/* Search and Filters */}
        {activeTab === 'browse' && (
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search requests by title or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`px-6 py-3 rounded-xl font-medium transition-all flex items-center gap-2 ${
                  showFilters
                    ? 'bg-purple-600 text-white'
                    : 'bg-white border border-purple-200 text-gray-700 hover:bg-purple-50'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="bg-white rounded-xl border border-purple-200 p-6 space-y-4">
                <div className="grid md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="w-full px-4 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="newest">Newest First</option>
                      <option value="bounty-high">Highest Bounty</option>
                      <option value="bounty-low">Lowest Bounty</option>
                      <option value="deadline">Deadline (Soon)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bounty Range: ${bountyRange[0]} - ${bountyRange[1]}
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="number"
                        value={bountyRange[0]}
                        onChange={(e) => setBountyRange([parseInt(e.target.value) || 0, bountyRange[1]])}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Min"
                      />
                      <input
                        type="number"
                        value={bountyRange[1]}
                        onChange={(e) => setBountyRange([bountyRange[0], parseInt(e.target.value) || 1000])}
                        className="w-full px-3 py-2 border border-purple-200 rounded-lg focus:ring-2 focus:ring-purple-500"
                        placeholder="Max"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Showing {filteredRequests.length} of {requests.length} requests</span>
              {aiEnabled && (
                <div className="flex items-center gap-2 text-green-600">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Auto-Submit Active</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Portfolio View */}
        {activeTab === 'portfolio' && (
          <>
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6 mb-6">
              <div className="flex items-start gap-4">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-gray-900 mb-2">AI Auto-Submit Portfolio</h3>
                  <p className="text-sm text-gray-600 mb-3">
                    Upload your best work with tags. Our AI automatically submits matching content to new requests, 
                    letting you earn from the same content multiple times without lifting a finger!
                  </p>
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => setShowPortfolioModal(true)}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:shadow-md transition-all"
                    >
                      Upload to Portfolio
                    </button>
                    <div className="text-sm text-gray-600">
                      <strong>{portfolio.filter(p => p.autoSubmit).length}</strong> items active • 
                      <strong className="text-green-600 ml-1">{portfolio.reduce((sum, p) => sum + p.timesUsed, 0)}</strong> auto-submissions
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolio.map((item) => {
                const matchingRequests = requests.filter(r => 
                  r.aiMatched && r.aiMatched.includes(item.id)
                );

                return (
                  <div key={item.id} className="bg-white rounded-xl shadow-sm border border-purple-100 hover:shadow-md transition-shadow">
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div className="text-4xl">{item.thumbnail}</div>
                        <div className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          {item.autoSubmit ? 'Auto-Submit ON' : 'Manual'}
                        </div>
                      </div>
                      
                      <h3 className="font-bold text-lg mb-2 text-gray-900">{item.title}</h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{item.description}</p>
                      
                      <div className="mb-3">
                        <div className="flex flex-wrap gap-1">
                          {item.tags.slice(0, 4).map((tag, idx) => (
                            <span key={idx} className="text-xs px-2 py-1 bg-purple-50 text-purple-600 rounded-full">
                              #{tag}
                            </span>
                          ))}
                          {item.tags.length > 4 && (
                            <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">
                              +{item.tags.length - 4}
                            </span>
                          )}
                        </div>
                      </div>

                      {matchingRequests.length > 0 && (
                        <div className="mb-3 p-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-1 text-xs text-green-700">
                            <Target className="w-3 h-3" />
                            <span className="font-medium">Matched to {matchingRequests.length} active request{matchingRequests.length > 1 ? 's' : ''}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Award className="w-4 h-4 text-purple-500" />
                          Used {item.timesUsed}x
                        </div>
                        <button className="text-sm text-purple-600 hover:text-purple-700 font-medium">
                          Edit
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Request Cards */}
        {activeTab === 'browse' && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredRequests.map((request) => {
              const matchedItems = getMatchedPortfolioItems(request);
              const bestMatch = matchedItems[0];

              return (
                <div key={request.id} className="bg-white rounded-2xl shadow-sm border border-purple-100 hover:shadow-lg hover:border-purple-200 transition-all">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-xs font-medium px-3 py-1.5 bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700 rounded-full border border-purple-200">
                        {request.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        {request.deadline}
                      </span>
                    </div>
                    
                    {bestMatch && aiEnabled && (
                      <div className="mb-3">
                        <div className={`bg-gradient-to-r ${getMatchBadgeColor(bestMatch.matchScore)} p-3 rounded-lg text-white`}>
                          <div className="flex items-center gap-2 mb-1">
                            <Zap className="w-4 h-4" />
                            <span className="text-xs font-bold">AI AUTO-MATCHED</span>
                          </div>
                          <div className="text-xs">
                            "{bestMatch.title}" • {bestMatch.matchScore}% match
                          </div>
                          {matchedItems.length > 1 && (
                            <div className="text-xs mt-1 opacity-90">
                              +{matchedItems.length - 1} more from your portfolio
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <h3 className="font-bold text-lg mb-2 text-gray-900">{request.title}</h3>
                    <p className="text-sm text-gray-600 mb-4 line-clamp-2">{request.description}</p>
                    
                    <div className="mb-4 pb-4 border-b border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-1">
                            <Crown className="w-5 h-5 text-purple-500" />
                            <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-500 bg-clip-text text-transparent">
                              ${request.bounty}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500">Total Bounty</div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-gray-900">{request.submissions}</div>
                          <div className="text-xs text-gray-500">Submissions</div>
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-gray-600">You receive:</span>
                          <span className="font-semibold text-green-600">${calculateCreatorPayout(request.bounty)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">by {request.requester}</span>
                      <button className="bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:shadow-md transition-all flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Submit
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredRequests.length === 0 && (
              <div className="col-span-full text-center py-12">
                <div className="text-gray-400 mb-4">
                  <Search className="w-16 h-16 mx-auto" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No requests found</h3>
                <p className="text-gray-600">Try adjusting your filters or search query</p>
              </div>
            )}
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

      {/* Create Request Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                  <Crown className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Post Your Request</h2>
              </div>
              <p className="text-sm text-gray-600 italic">AI will instantly scan all creator portfolios for matches</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">What Are You Looking For?</label>
                <input
                  type="text"
                  value={newRequest.title}
                  onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
                  placeholder="e.g., Sunset Beach Photography"
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                <select
                  value={newRequest.category}
                  onChange={(e) => setNewRequest({ ...newRequest, category: e.target.value })}
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {categories.filter(c => c !== 'All').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Detailed Description</label>
                <textarea
                  value={newRequest.description}
                  onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                  placeholder="Be specific about what you want. The more detail, the better the AI matching..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bounty Amount ($)</label>
                  <input
                    type="number"
                    value={newRequest.bounty}
                    onChange={(e) => setNewRequest({ ...newRequest, bounty: e.target.value })}
                    placeholder="100"
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deadline (days)</label>
                  <input
                    type="number"
                    value={newRequest.deadline}
                    onChange={(e) => setNewRequest({ ...newRequest, deadline: e.target.value })}
                    placeholder="3"
                    className="w-full px-4 py-2.5 border border-purple-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
              </div>

              {newRequest.bounty && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                  <div className="bg-white/60 rounded-lg p-3 border border-purple-200">
                    <div className="text-xs font-medium text-gray-700 mb-2">Payment Breakdown:</div>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Total bounty:</span>
                        <span className="font-semibold text-gray-900">${newRequest.bounty}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Winner receives:</span>
                        <span className="font-semibold text-green-600">${calculateCreatorPayout(parseFloat(newRequest.bounty))}</span>
                      </div>
                      <div className="flex justify-between border-t border-gray-200 pt-1 mt-1">
                        <span className="text-gray-600">Platform fee (20%):</span>
                        <span className="font-medium text-purple-600">${calculateCommission(parseFloat(newRequest.bounty))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-purple-100 flex gap-3 bg-gray-50">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-6 py-3 border border-gray-300 rounded-xl font-medium text-gray-700 hover:bg-white transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateRequest}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600 text-white rounded-xl font-medium hover:shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <Sparkles className="w-4 h-4" />
                Post & Find Matches
              </button>
            </div>
          </div>
        </div>
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
    </div>
  );
}