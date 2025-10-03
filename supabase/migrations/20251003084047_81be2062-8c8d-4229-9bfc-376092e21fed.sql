-- Add minimum_contribution field to requests table
ALTER TABLE public.requests 
ADD COLUMN minimum_contribution numeric DEFAULT 0 CHECK (minimum_contribution >= 0);

-- Update the submissions policy for contributors to check minimum contribution
DROP POLICY IF EXISTS "Contributors can view submissions for bounties they funded" ON public.submissions;

CREATE POLICY "Contributors can view submissions for bounties they funded"
ON public.submissions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 
    FROM public.bounty_contributions bc
    JOIN public.requests r ON r.id = bc.request_id
    WHERE bc.request_id = submissions.request_id
    AND bc.contributor_id = auth.uid()
    AND bc.status = 'accepted'
    AND bc.amount >= COALESCE(r.minimum_contribution, 0)
  )
);