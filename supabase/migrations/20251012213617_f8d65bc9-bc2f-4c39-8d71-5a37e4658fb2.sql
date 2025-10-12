-- Create ratings table for bounty payers to rate creators
CREATE TABLE public.bounty_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  requester_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(request_id, requester_id)
);

-- Enable RLS
ALTER TABLE public.bounty_ratings ENABLE ROW LEVEL SECURITY;

-- Requesters can create ratings for their own bounties
CREATE POLICY "Requesters can rate creators for their bounties"
ON public.bounty_ratings
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = requester_id AND
  EXISTS (
    SELECT 1 FROM public.requests r
    INNER JOIN public.submissions s ON s.request_id = r.id
    WHERE r.id = request_id 
    AND r.user_id = auth.uid()
    AND s.status = 'approved'
  )
);

-- Requesters can update their own ratings
CREATE POLICY "Requesters can update their own ratings"
ON public.bounty_ratings
FOR UPDATE
TO authenticated
USING (auth.uid() = requester_id)
WITH CHECK (auth.uid() = requester_id);

-- Everyone can view ratings
CREATE POLICY "Ratings are viewable by everyone"
ON public.bounty_ratings
FOR SELECT
TO authenticated
USING (true);

-- Trigger to update updated_at
CREATE TRIGGER update_bounty_ratings_updated_at
BEFORE UPDATE ON public.bounty_ratings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();