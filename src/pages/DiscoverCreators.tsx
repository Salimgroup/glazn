"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Users, Instagram, Star, DollarSign, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { UserAvatar } from '@/components/UserAvatar';
import { VerifiedBadge } from '@/components/VerifiedBadge';

const allNiches = [
  'Fashion & Style',
  'Beauty & Skincare', 
  'Fitness & Health',
  'Food & Cooking',
  'Travel & Adventure',
  'Tech & Gaming',
  'Music & Entertainment',
  'Lifestyle & Wellness',
  'Business & Finance',
  'Art & Design',
  'Comedy & Memes',
  'Education & Learning',
];

interface Creator {
  id: string;
  display_name: string;
  username: string;
  avatar_url: string;
  bio: string;
  niches: string[];
  base_rate: number | null;
  instagram_handle: string | null;
  follower_count: number | null;
  engagement_rate: number | null;
  rating: number | null;
  total_reviews: number;
  is_verified: boolean;
  location: string | null;
}

export default function DiscoverCreators() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNiches, setSelectedNiches] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState([0, 10000]);
  const [minFollowers, setMinFollowers] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchCreators();
  }, [selectedNiches, priceRange, minFollowers]);

  const fetchCreators = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('user_type', 'creator')
        .eq('onboarding_completed', true);

      if (selectedNiches.length > 0) {
        query = query.overlaps('niches', selectedNiches);
      }

      if (priceRange[0] > 0) {
        query = query.gte('base_rate', priceRange[0]);
      }
      if (priceRange[1] < 10000) {
        query = query.lte('base_rate', priceRange[1]);
      }

      if (minFollowers > 0) {
        query = query.gte('follower_count', minFollowers);
      }

      const { data, error } = await query.order('rating', { ascending: false });

      if (error) throw error;
      setCreators(data || []);
    } catch (error) {
      console.error('Error fetching creators:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCreators = creators.filter(creator => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      creator.display_name?.toLowerCase().includes(query) ||
      creator.username?.toLowerCase().includes(query) ||
      creator.bio?.toLowerCase().includes(query) ||
      creator.niches?.some(n => n.toLowerCase().includes(query))
    );
  });

  const toggleNiche = (niche: string) => {
    setSelectedNiches(prev =>
      prev.includes(niche)
        ? prev.filter(n => n !== niche)
        : [...prev, niche]
    );
  };

  const clearFilters = () => {
    setSelectedNiches([]);
    setPriceRange([0, 10000]);
    setMinFollowers(0);
    setSearchQuery('');
  };

  const activeFilterCount = selectedNiches.length + (priceRange[0] > 0 || priceRange[1] < 10000 ? 1 : 0) + (minFollowers > 0 ? 1 : 0);

  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Discover Creators</h1>
              <p className="text-sm text-muted-foreground">Find the perfect creators for your campaigns</p>
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
                placeholder="Search by name, niche, or keywords..."
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

                  {/* Price Range */}
                  <div>
                    <h3 className="font-medium mb-3">Price Range (per post)</h3>
                    <div className="px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={10000}
                        step={100}
                        className="mb-2"
                      />
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>${priceRange[0]}</span>
                        <span>${priceRange[1]}+</span>
                      </div>
                    </div>
                  </div>

                  {/* Minimum Followers */}
                  <div>
                    <h3 className="font-medium mb-3">Minimum Followers</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { label: 'Any', value: 0 },
                        { label: '1K+', value: 1000 },
                        { label: '10K+', value: 10000 },
                        { label: '50K+', value: 50000 },
                        { label: '100K+', value: 100000 },
                        { label: '1M+', value: 1000000 },
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => setMinFollowers(option.value)}
                          className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                            minFollowers === option.value
                              ? 'bg-neon-pink text-black font-medium'
                              : 'bg-card border border-border hover:border-neon-pink/50'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
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
              {selectedNiches.map((niche) => (
                <Badge key={niche} variant="secondary" className="gap-1">
                  {niche}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => toggleNiche(niche)} />
                </Badge>
              ))}
              {(priceRange[0] > 0 || priceRange[1] < 10000) && (
                <Badge variant="secondary" className="gap-1">
                  ${priceRange[0]} - ${priceRange[1]}
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setPriceRange([0, 10000])} />
                </Badge>
              )}
              {minFollowers > 0 && (
                <Badge variant="secondary" className="gap-1">
                  {minFollowers >= 1000000 ? `${minFollowers/1000000}M` : `${minFollowers/1000}K`}+ followers
                  <X className="w-3 h-3 cursor-pointer" onClick={() => setMinFollowers(0)} />
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
            {filteredCreators.length} creator{filteredCreators.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-muted rounded-full" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No creators found</h3>
            <p className="text-muted-foreground mb-4">Try adjusting your filters or search query</p>
            <Button variant="outline" onClick={clearFilters}>Clear Filters</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredCreators.map((creator) => (
              <Card 
                key={creator.id} 
                className="hover:border-neon-cyan/50 transition-all cursor-pointer group"
                onClick={() => navigate(`/@${creator.username}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <UserAvatar
                      src={creator.avatar_url}
                      fallback={creator.display_name?.[0] || '?'}
                      className="w-16 h-16"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold truncate group-hover:text-neon-cyan transition-colors">
                          {creator.display_name}
                        </h3>
                        {creator.is_verified && <VerifiedBadge />}
                      </div>
                      <p className="text-sm text-muted-foreground">@{creator.username}</p>
                      
                      {creator.rating && (
                        <div className="flex items-center gap-1 mt-1">
                          <Star className="w-3 h-3 fill-neon-yellow text-neon-yellow" />
                          <span className="text-sm font-medium">{creator.rating.toFixed(1)}</span>
                          <span className="text-xs text-muted-foreground">({creator.total_reviews})</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {creator.bio && (
                    <p className="text-sm text-muted-foreground mt-3 line-clamp-2">
                      {creator.bio}
                    </p>
                  )}

                  {creator.niches && creator.niches.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {creator.niches.slice(0, 3).map((niche) => (
                        <Badge key={niche} variant="outline" className="text-xs">
                          {niche}
                        </Badge>
                      ))}
                      {creator.niches.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{creator.niches.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                      {creator.instagram_handle && (
                        <div className="flex items-center gap-1">
                          <Instagram className="w-3 h-3" />
                          <span>{creator.follower_count ? `${(creator.follower_count/1000).toFixed(0)}K` : '-'}</span>
                        </div>
                      )}
                      {creator.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span className="truncate max-w-[80px]">{creator.location}</span>
                        </div>
                      )}
                    </div>
                    {creator.base_rate && (
                      <div className="flex items-center gap-1 text-neon-cyan font-medium">
                        <DollarSign className="w-3 h-3" />
                        <span>{creator.base_rate}</span>
                      </div>
                    )}
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
