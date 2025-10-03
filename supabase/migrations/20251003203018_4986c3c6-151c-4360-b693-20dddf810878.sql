-- Add platform and anonymous fields to requests table
ALTER TABLE public.requests 
ADD COLUMN IF NOT EXISTS platform TEXT,
ADD COLUMN IF NOT EXISTS is_anonymous BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS content_creator_id UUID REFERENCES auth.users(id);

-- Add content creator info to profiles
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS is_content_creator BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS creator_platforms TEXT[];

-- Create content_creator_requests view
CREATE OR REPLACE VIEW public.content_creator_requests AS
SELECT 
  r.*,
  CASE 
    WHEN r.is_anonymous THEN 'Anonymous'
    ELSE p.display_name
  END as requester_name
FROM public.requests r
LEFT JOIN public.profiles p ON r.user_id = p.id
WHERE r.content_creator_id IS NOT NULL;

-- Content creators can view requests targeted to them
DROP POLICY IF EXISTS "Content creators can view their requests" ON public.requests;
CREATE POLICY "Content creators can view their requests"
ON public.requests FOR SELECT
TO authenticated
USING (
  content_creator_id = auth.uid() OR
  user_id = auth.uid() OR
  public.has_role(auth.uid(), 'admin')
);

-- Grant access to content_creator_requests view
GRANT SELECT ON public.content_creator_requests TO authenticated;