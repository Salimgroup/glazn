-- Add counter-offer functionality to requests table
ALTER TABLE public.requests 
ADD COLUMN counter_offer_amount NUMERIC,
ADD COLUMN counter_offer_status TEXT CHECK (counter_offer_status IN ('pending', 'accepted', 'rejected')) DEFAULT NULL,
ADD COLUMN counter_offered_at TIMESTAMP WITH TIME ZONE;

-- Add comment for documentation
COMMENT ON COLUMN public.requests.counter_offer_amount IS 'The amount proposed by the content creator as a counter-offer';
COMMENT ON COLUMN public.requests.counter_offer_status IS 'Status of the counter-offer: pending, accepted, or rejected';
COMMENT ON COLUMN public.requests.counter_offered_at IS 'Timestamp when the counter-offer was made';

-- Update RLS policy to allow content creators to update their counter-offer
CREATE POLICY "Content creators can submit counter-offers"
ON public.requests
FOR UPDATE
USING (auth.uid() = content_creator_id)
WITH CHECK (auth.uid() = content_creator_id);