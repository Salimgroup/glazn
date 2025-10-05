-- Create content posts table for bounty payer's content collection
CREATE TABLE public.content_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  external_url TEXT,
  platform_name TEXT,
  is_public BOOLEAN DEFAULT false,
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(owner_id, submission_id)
);

-- Add sharing permissions to submissions
ALTER TABLE public.submissions
ADD COLUMN allow_owner_reshare BOOLEAN DEFAULT true,
ADD COLUMN allow_public_share BOOLEAN DEFAULT false,
ADD COLUMN sharing_terms TEXT;

-- Enable RLS on content_posts
ALTER TABLE public.content_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for content_posts
CREATE POLICY "Users can view their own posts"
ON public.content_posts
FOR SELECT
USING (auth.uid() = owner_id);

CREATE POLICY "Public posts are viewable by everyone"
ON public.content_posts
FOR SELECT
USING (is_public = true);

CREATE POLICY "Users can create their own posts"
ON public.content_posts
FOR INSERT
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own posts"
ON public.content_posts
FOR UPDATE
USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own posts"
ON public.content_posts
FOR DELETE
USING (auth.uid() = owner_id);

-- Add follower count tracking to profiles (computed via view)
CREATE OR REPLACE VIEW public.profile_stats AS
SELECT 
  p.id,
  p.username,
  p.display_name,
  p.avatar_url,
  p.bio,
  p.portfolio_url,
  p.is_content_creator,
  p.verified,
  p.reputation_score,
  p.bounties_completed,
  p.bounties_posted,
  COUNT(DISTINCT f.follower_id) as follower_count,
  COUNT(DISTINCT cp.id) as content_count,
  p.created_at
FROM public.profiles p
LEFT JOIN public.follows f ON f.following_id = p.id
LEFT JOIN public.content_posts cp ON cp.creator_id = p.id AND cp.is_public = true
GROUP BY p.id, p.username, p.display_name, p.avatar_url, p.bio, 
         p.portfolio_url, p.is_content_creator, p.verified, p.reputation_score,
         p.bounties_completed, p.bounties_posted, p.created_at;

-- Create trigger for updating content_posts updated_at
CREATE TRIGGER update_content_posts_updated_at
BEFORE UPDATE ON public.content_posts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add index for better performance
CREATE INDEX idx_content_posts_owner ON public.content_posts(owner_id);
CREATE INDEX idx_content_posts_creator ON public.content_posts(creator_id);
CREATE INDEX idx_content_posts_public ON public.content_posts(is_public) WHERE is_public = true;
CREATE INDEX idx_follows_follower ON public.follows(follower_id);
CREATE INDEX idx_follows_following ON public.follows(following_id);