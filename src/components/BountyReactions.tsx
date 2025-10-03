import { useState, useEffect } from 'react';
import { Heart, Bookmark, Eye } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface BountyReactionsProps {
  requestId: string;
}

export function BountyReactions({ requestId }: BountyReactionsProps) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [watching, setWatching] = useState(false);
  const [counts, setCounts] = useState({ likes: 0, bookmarks: 0, watching: 0 });

  useEffect(() => {
    loadReactions();
  }, [requestId, user]);

  const loadReactions = async () => {
    // Load reaction counts
    const { count: likesCount } = await supabase
      .from('bounty_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .eq('reaction_type', 'like');

    const { count: bookmarksCount } = await supabase
      .from('bounty_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .eq('reaction_type', 'bookmark');

    const { count: watchingCount } = await supabase
      .from('bounty_reactions')
      .select('*', { count: 'exact', head: true })
      .eq('request_id', requestId)
      .eq('reaction_type', 'watching');

    setCounts({
      likes: likesCount || 0,
      bookmarks: bookmarksCount || 0,
      watching: watchingCount || 0
    });

    // Check user's reactions
    if (user) {
      const { data } = await supabase
        .from('bounty_reactions')
        .select('reaction_type')
        .eq('request_id', requestId)
        .eq('user_id', user.id);

      if (data) {
        setLiked(data.some(r => r.reaction_type === 'like'));
        setBookmarked(data.some(r => r.reaction_type === 'bookmark'));
        setWatching(data.some(r => r.reaction_type === 'watching'));
      }
    }
  };

  const toggleReaction = async (type: 'like' | 'bookmark' | 'watching') => {
    if (!user) {
      toast.error('Please sign in to react to bounties');
      return;
    }

    const isActive = type === 'like' ? liked : type === 'bookmark' ? bookmarked : watching;

    try {
      if (isActive) {
        const { error } = await supabase
          .from('bounty_reactions')
          .delete()
          .eq('request_id', requestId)
          .eq('user_id', user.id)
          .eq('reaction_type', type);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('bounty_reactions')
          .insert([{
            request_id: requestId as any,
            user_id: user.id,
            reaction_type: type
          }]);

        if (error) throw error;
      }

      loadReactions();
      
      if (type === 'like') setLiked(!isActive);
      if (type === 'bookmark') setBookmarked(!isActive);
      if (type === 'watching') setWatching(!isActive);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error toggling reaction:', error);
      }
      toast.error('Failed to update reaction. Please try again.');
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => toggleReaction('like')}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          liked
            ? 'bg-neon-pink/20 text-neon-pink border border-neon-pink/40'
            : 'bg-card/60 text-muted-foreground border border-neon-purple/20 hover:border-neon-pink/40'
        }`}
      >
        <Heart className={`w-3.5 h-3.5 ${liked ? 'fill-neon-pink' : ''}`} />
        {counts.likes}
      </button>

      <button
        onClick={() => toggleReaction('bookmark')}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          bookmarked
            ? 'bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40'
            : 'bg-card/60 text-muted-foreground border border-neon-purple/20 hover:border-neon-cyan/40'
        }`}
      >
        <Bookmark className={`w-3.5 h-3.5 ${bookmarked ? 'fill-neon-cyan' : ''}`} />
        {counts.bookmarks}
      </button>

      <button
        onClick={() => toggleReaction('watching')}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
          watching
            ? 'bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/40'
            : 'bg-card/60 text-muted-foreground border border-neon-purple/20 hover:border-neon-yellow/40'
        }`}
      >
        <Eye className={`w-3.5 h-3.5 ${watching ? 'fill-neon-yellow' : ''}`} />
        {counts.watching}
      </button>
    </div>
  );
}
