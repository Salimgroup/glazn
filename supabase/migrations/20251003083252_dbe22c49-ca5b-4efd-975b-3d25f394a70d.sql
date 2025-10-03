-- Add allow_contributions field to requests table
ALTER TABLE public.requests 
ADD COLUMN allow_contributions boolean DEFAULT true;

-- Create bounty_contributions table
CREATE TABLE public.bounty_contributions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id uuid NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  contributor_id uuid NOT NULL,
  amount numeric NOT NULL CHECK (amount > 0),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  message text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bounty_contributions ENABLE ROW LEVEL SECURITY;

-- Contributors can create contributions
CREATE POLICY "Contributors can create contributions"
ON public.bounty_contributions
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = contributor_id);

-- Contributors can view their own contributions
CREATE POLICY "Contributors can view their own contributions"
ON public.bounty_contributions
FOR SELECT
TO authenticated
USING (auth.uid() = contributor_id);

-- Request owners can view all contributions for their requests
CREATE POLICY "Request owners can view contributions for their requests"
ON public.bounty_contributions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = bounty_contributions.request_id
    AND requests.user_id = auth.uid()
  )
);

-- Request owners can update contribution status
CREATE POLICY "Request owners can update contribution status"
ON public.bounty_contributions
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = bounty_contributions.request_id
    AND requests.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.requests
    WHERE requests.id = bounty_contributions.request_id
    AND requests.user_id = auth.uid()
  )
);

-- Contributors who have accepted contributions can view submissions
CREATE POLICY "Contributors can view submissions for bounties they funded"
ON public.submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.bounty_contributions
    WHERE bounty_contributions.request_id = submissions.request_id
    AND bounty_contributions.contributor_id = auth.uid()
    AND bounty_contributions.status = 'accepted'
  )
);

-- Create trigger for updated_at
CREATE TRIGGER update_bounty_contributions_updated_at
BEFORE UPDATE ON public.bounty_contributions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to calculate total bounty amount
CREATE OR REPLACE FUNCTION public.get_total_bounty(request_id_param uuid)
RETURNS numeric
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT bounty FROM requests WHERE id = request_id_param),
    0
  ) + COALESCE(
    (SELECT SUM(amount) FROM bounty_contributions 
     WHERE request_id = request_id_param 
     AND status = 'accepted'),
    0
  );
$$;