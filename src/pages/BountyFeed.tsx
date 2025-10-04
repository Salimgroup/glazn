import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Filter, X, DollarSign, Clock, User, Heart, Share2, Bookmark, MessageCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import { BountyReactions } from '@/components/BountyReactions';
import { ShareableBountyLink } from '@/components/ShareableBountyLink';
import { ExternalSubmissionModal } from '@/components/ExternalSubmissionModal';
import { toast } from 'sonner';

interface Bounty {
  id: string;
  title: string;
  description: string;
  bounty: number;
  category: string;
  deadline: string;
  status: string;
  platform?: string;
  is_anonymous: boolean;
  created_at: string;
  view_count: number;
  user_id?: string;
  content_creator_id?: string;
}

export default function BountyFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bounties, setBounties] = useState<Bounty[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [minBounty, setMinBounty] = useState<number>(0);
  const [maxBounty, setMaxBounty] = useState<number>(10000);
  const containerRef = useRef<HTMLDivElement>(null);
  const [showShare, setShowShare] = useState<{ id: string; title: string } | null>(null);
  const [showSubmission, setShowSubmission] = useState<{ id: string; title: string } | null>(null);

  const categories = ['All', 'Photography', 'Video', 'Digital Art', 'Graphic Design', '3D Rendering', 'Animation', 'Writing', 'Music'];

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }
    fetchBounties();
  }, [user, navigate, selectedCategory, minBounty, maxBounty]);

  const fetchBounties = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .gte('bounty', minBounty)
        .lte('bounty', maxBounty)
        .order('created_at', { ascending: false });

      if (selectedCategory !== 'All') {
        query = query.eq('category', selectedCategory);
      }

      const { data, error } = await query;

      if (error) throw error;

      setBounties((data || []) as Bounty[]);
    } catch (error) {
      console.error('Error fetching bounties:', error);
      toast.error('Failed to load bounties');
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: React.WheelEvent<HTMLDivElement>) => {
    if (e.deltaY > 0 && currentIndex < bounties.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (e.deltaY < 0 && currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleTouchStart = useRef<number>(0);
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    const touchEnd = e.touches[0].clientY;
    const diff = handleTouchStart.current - touchEnd;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < bounties.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex(currentIndex - 1);
      }
      handleTouchStart.current = touchEnd;
    }
  };

  const currentBounty = bounties[currentIndex];

  const applyFilters = () => {
    setShowFilters(false);
    fetchBounties();
  };

  const resetFilters = () => {
    setSelectedCategory('All');
    setMinBounty(0);
    setMaxBounty(10000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-space flex items-center justify-center">
        <div className="text-neon-cyan text-xl font-bold animate-pulse">Loading bounties...</div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-gradient-space">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/60 to-transparent p-4">
        <div className="flex items-center justify-between">
          <Button
            onClick={() => navigate('/bounties')}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          <div className="text-white font-bold text-lg">Bounty Feed</div>
          <Button
            onClick={() => setShowFilters(true)}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <Filter className="w-6 h-6" />
          </Button>
        </div>
      </div>

      {/* Bounty Card Container */}
      <div
        ref={containerRef}
        className="h-full w-full flex items-center justify-center"
        onWheel={handleScroll}
        onTouchStart={(e) => (handleTouchStart.current = e.touches[0].clientY)}
        onTouchMove={handleTouchMove}
      >
        {currentBounty && (
          <div className="relative w-full max-w-lg h-full flex flex-col animate-fade-in">
            {/* Bounty Content */}
            <div className="flex-1 flex flex-col justify-center px-6 pb-32">
              {/* Category Badge */}
              <div className="mb-4">
                <span className="px-4 py-2 bg-neon-purple/20 text-neon-purple rounded-full text-sm font-bold border-2 border-neon-purple/40">
                  {currentBounty.category}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-4xl font-black text-white mb-4 leading-tight">
                {currentBounty.title}
              </h1>

              {/* Description */}
              <p className="text-white/80 text-lg mb-6 line-clamp-4">
                {currentBounty.description}
              </p>

              {/* Bounty Amount */}
              <div className="flex items-center gap-4 mb-6">
                <div className="bg-gradient-neon p-4 rounded-2xl shadow-glow">
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-8 h-8 text-white" />
                    <span className="text-3xl font-black text-white">
                      {currentBounty.bounty.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-white/80 mt-1">Bounty</div>
                </div>

                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-white/80">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{currentBounty.deadline}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <User className="w-4 h-4" />
                    <span className="text-sm">
                      {currentBounty.is_anonymous ? 'Anonymous' : 'Requester'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Reactions */}
              <div className="mb-4">
                <BountyReactions requestId={currentBounty.id} />
              </div>
            </div>

            {/* Bottom Action Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
              <div className="flex items-center justify-around gap-4">
                <Button
                  onClick={() => setShowShare({ id: currentBounty.id, title: currentBounty.title })}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-12 w-12"
                >
                  <Share2 className="w-6 h-6" />
                </Button>

                <Button
                  onClick={() => setShowSubmission({ id: currentBounty.id, title: currentBounty.title })}
                  className="flex-1 bg-gradient-neon text-white font-bold py-6 rounded-2xl shadow-glow hover:shadow-neon transition-all"
                >
                  Submit Work
                </Button>

                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-12 w-12"
                >
                  <Bookmark className="w-6 h-6" />
                </Button>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="absolute top-20 right-4 flex flex-col gap-1">
              {bounties.map((_, index) => (
                <div
                  key={index}
                  className={`h-2 w-2 rounded-full transition-all ${
                    index === currentIndex ? 'bg-neon-cyan w-8' : 'bg-white/30'
                  }`}
                />
              ))}
            </div>
          </div>
        )}

        {bounties.length === 0 && (
          <div className="text-center text-white">
            <p className="text-xl font-bold mb-4">No bounties found</p>
            <Button onClick={resetFilters} className="bg-gradient-neon text-white">
              Reset Filters
            </Button>
          </div>
        )}
      </div>

      {/* Filter Modal */}
      {showFilters && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-end">
          <div className="bg-card w-full rounded-t-3xl p-6 animate-slide-in-right">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-black text-foreground">Filters</h2>
              <Button
                onClick={() => setShowFilters(false)}
                variant="ghost"
                size="icon"
              >
                <X className="w-6 h-6" />
              </Button>
            </div>

            {/* Category Filter */}
            <div className="mb-6">
              <label className="text-sm font-bold text-foreground mb-2 block">Category</label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-xl font-bold transition-all ${
                      selectedCategory === cat
                        ? 'bg-gradient-neon text-white shadow-glow'
                        : 'bg-card/60 text-foreground border-2 border-neon-purple/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Bounty Range */}
            <div className="mb-6">
              <label className="text-sm font-bold text-foreground mb-2 block">Bounty Range</label>
              <div className="flex gap-4">
                <input
                  type="number"
                  value={minBounty.toString()}
                  onChange={(e) => setMinBounty(Number(e.target.value))}
                  placeholder="Min"
                  className="flex-1 px-4 py-2 bg-card/60 border-2 border-neon-cyan/40 rounded-xl text-foreground"
                />
                <input
                  type="number"
                  value={maxBounty.toString()}
                  onChange={(e) => setMaxBounty(Number(e.target.value))}
                  placeholder="Max"
                  className="flex-1 px-4 py-2 bg-card/60 border-2 border-neon-cyan/40 rounded-xl text-foreground"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={resetFilters}
                variant="outline"
                className="flex-1 border-neon-pink/40"
              >
                Reset
              </Button>
              <Button
                onClick={applyFilters}
                className="flex-1 bg-gradient-neon text-white shadow-glow"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showShare && (
        <ShareableBountyLink
          bountyId={showShare.id}
          bountyTitle={showShare.title}
          isOpen={true}
          onClose={() => setShowShare(null)}
        />
      )}

      {showSubmission && (
        <ExternalSubmissionModal
          requestId={showSubmission.id}
          requestTitle={showSubmission.title}
          onClose={() => setShowSubmission(null)}
          onSubmit={() => {
            toast.success('Submission created successfully!');
            setShowSubmission(null);
          }}
        />
      )}
    </div>
  );
}
