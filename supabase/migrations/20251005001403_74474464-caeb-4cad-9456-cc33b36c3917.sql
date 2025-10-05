-- Fix security definer view by recreating as security invoker
DROP VIEW IF EXISTS public.profile_stats;

CREATE VIEW public.profile_stats 
WITH (security_invoker = true)
AS
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