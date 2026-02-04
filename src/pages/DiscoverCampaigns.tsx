"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Briefcase, DollarSign, Clock, Users, Building2, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

const campaignTypes = [
  'Product Review',
  'Unboxing',
  'Story Mention',
  'Reel/TikTok',
  'YouTube Video',
  'Blog Post',
  'Giveaway',
  'Brand Ambassador',
  'Event Coverage',
  'UGC Content',
];

const allNiches = [
  'Fashion & Style',
  'Beauty & Skincare', 
  'Fitness & Health',
  'Food & Cooking',
  'Travel & Adventure',
  'Tech & Gaming',
  'Music & Entertainment',
  'Lifestyle & Wellness',
];

interface Campaign {
  id: string;
  title: string;
  description: string;
  budget: number;
  budget_type: 'fixed' | 'per_creator' | 'negotiable';
  campaign_type: string;
  niches: string[];
  deadline: string | null;
  slots_available: number;
  slots_filled: number;
  created_at: string;
  brand: {
    id: string;
    company_name: string;
    avatar_url: string;
    is_verified: boolean;
  };
  requirements: string[];
  deliverables: string[];
}

export default function DiscoverCampaigns() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [budgetRange, setBudgetRange] = useState([0, 50000]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, [selectedTypes, selectedNiches, budgetRange]);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      // Fetch from requests table (existing structure)
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Transform requests to campaign format
      const transformedCampaigns = (data || []).map(request => ({
        id: request.id,
        title: request.title,
        description: request.description,
        budget: request.bounty,
        budget_type: 'fixed' as const,
        campaign_type: request.category || 'UGC Content',
        niches: [] as string[],
        deadline: request.deadline,
        slots_available: 10,
        slots_filled: 0,
        created_at: request.created_at || new Date().toISOString(),
        brand: {
          id: request.user_id || '',
          company_name: 'Brand',
          avatar_url: '',
          is_verified: false,
        },
        requirements: [] as string[],
        deliverables: [] as string[],
      }));

      setCampaigns(transformedCampaigns);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      campaign.title?.toLowerCase().includes(query) ||
      campaign.description?.toLowerCase().includes(query) ||
      campaign.brand.company_name?.toLowerCase().includes(query)
    );
  });

  const toggleType = (type: string) => {
    setSelectedTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev =>
      prev.includes(niche)
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    );
  };

  const clearFilters = () => {
    setSelectedTypes([]);
    setSelectedNiches([]);
    setBudgetRange([0, 50000]);
    setSearchQuery('');
  };

  const activeFilterCount = selectedTypes.length + selectedNiches.length + (budgetRange[0] > 0 || budgetRange[1] < 50000 ? 1 : 0);

  const getBudgetDisplay = (campaign: Campaign) => {
    if (campaign.budget_type === 'negotiable') return 'Negotiable';
    if (campaign.budget_type === 'per_creator') return `$${campaign.budget}/creator`;
    return `$${campaign.budget.toLocaleString()}`;
  };

  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Discover Campaigns</h1>
              <p className="text-sm text-muted-foreground">Find brand collaborations that match your content</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Dashboard
            </Button>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search campaigns..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Sheet open={showFilters} onOpenChange={setShowFilters}>
              <SheetTrigger asChild>
                <Button variant="outline" className="relative">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center bg-neon-pink">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    Filters
                    {activeFilterCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Clear all
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>

                <div className="mt-6 space-y-6">
                  {/* Campaign Types */}
                  <div>
                    <h3 className="font-medium mb-3">Campaign Type</h3>
                    <div className="flex flex-wrap gap-2">
                      {campaignTypes.map((type) => (
                        <button
                          key={type}
                          onClick={() => toggleType(type)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            selectedTypes.includes(type)
                              ? 'bg-neon-pink text-black font-medium'
                              : 'bg-card border border-border hover:border-neon-pink/50'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Niches */}
                  <div>
                    <h3 className="font-medium mb-3">Niches</h3>
                    <div className="flex flex-wrap gap-2">
                      {allNiches.map((niche) => (
                        <button
                          key={niche}
                          onClick={() => toggleNiche(niche)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            selectedNiches.includes(niche)
                              ? 'bg-neon-cyan text-black font-medium'
                              : 'bg-card border border-border hover:border-neon-cyan/50'
                          }`}
                        >
                          {niche}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Budget Range */}
                  <div>
                    <h3 className="font-medium mb-3">Budget Range</h3>
                    <div className="px-2">
                      <Slider
                        value={budgetRange}
                        onValueChange={setBudgetRange}
                        max={50000}
                        step={500}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${budgetRange[0].toLocaleString()}</span>
                        <span>${budgetRange[1].toLocaleString()}+</span>
                      </div>
                    </div>
                  </div>

                  <Button onClick={() => setShowFilters(false)} className="w-full">
                    Apply Filters
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* Active Filters */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {selectedTypes.map((type) => (
                <Badge key={type} variant="secondary" className="gap-1">
                  {type}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleType(type)} />
                </Badge>
              ))}
              {selectedNiches.map((niche) => (
                <Badge key={niche} variant="secondary" className="gap-1">
                  {niche}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleNiche(niche)} />
                </Badge>
              ))}
              {(budgetRange[0] > 0 || budgetRange[1] < 50000) && (
                <Badge variant="secondary" className="gap-1">
                  ${budgetRange[0].toLocaleString()} - ${budgetRange[1].toLocaleString()}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setBudgetRange([0, 50000])} />
                </Badge>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredCampaigns.length} campaign{filteredCampaigns.length !== 1 ? 's' : ''} available
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-full" />
                    <div className="h-4 bg-muted rounded w-2/3" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCampaigns.length === 0 ? (
          <div className="text-center py-12">
            <Briefcase className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No campaigns found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or check back later</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredCampaigns.map((campaign) => (
              <Card 
                key={campaign.id} 
                className="hover:border-neon-pink/50 transition-all cursor-pointer group"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-neon-pink to-neon-purple rounded-lg flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">{campaign.brand.company_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(campaign.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="bg-neon-cyan/10 text-neon-cyan border-neon-cyan/30">
                      {campaign.campaign_type}
                    </Badge>
                  </div>

                  <h3 className="font-semibold text-lg mb-2 group-hover:text-neon-pink transition-colors">
                    {campaign.title}
                  </h3>

                  {campaign.description && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                      {campaign.description}
                    </p>
                  )}

                  <div className="flex flex-wrap gap-3 mb-4">
                    <div className="flex items-center gap-1.5 text-sm">
                      <DollarSign className="w-4 h-4 text-neon-yellow" />
                      <span className="font-medium text-neon-yellow">{getBudgetDisplay(campaign)}</span>
                    </div>
                    
                    {campaign.deadline && (
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>Due {formatDistanceToNow(new Date(campaign.deadline), { addSuffix: true })}</span>
                      </div>
                    )}

                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <Users className="w-4 h-4" />
                      <span>{campaign.slots_filled}/{campaign.slots_available} spots filled</span>
                    </div>
                  </div>

                  {campaign.niches && campaign.niches.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {campaign.niches.slice(0, 3).map((niche) => (
                        <Badge key={niche} variant="secondary" className="text-xs">
                          {niche}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-border">
                    <Button className="w-full bg-gradient-to-r from-neon-pink to-neon-purple hover:opacity-90">
                      Apply Now
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
