-- Create enum for submission status
CREATE TYPE public.submission_status AS ENUM ('pending', 'approved', 'rejected');

-- Create enum for submission type
CREATE TYPE public.submission_type AS ENUM ('upload', 'external_url');

-- Create requests table
CREATE TABLE public.requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  bounty DECIMAL NOT NULL CHECK (bounty > 0),
  category TEXT NOT NULL,
  deadline TEXT NOT NULL,
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Create submissions table for external content
CREATE TABLE public.submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.requests(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  submission_type public.submission_type NOT NULL DEFAULT 'external_url',
  external_url TEXT,
  platform_name TEXT,
  title TEXT NOT NULL,
  description TEXT,
  preview_notes TEXT,
  status public.submission_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for requests
CREATE POLICY "Anyone can view open requests"
  ON public.requests FOR SELECT
  USING (status = 'open' OR auth.uid() = user_id);

CREATE POLICY "Users can create their own requests"
  ON public.requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own requests"
  ON public.requests FOR UPDATE
  USING (auth.uid() = user_id);

-- RLS Policies for submissions
CREATE POLICY "Creators can view their own submissions"
  ON public.submissions FOR SELECT
  USING (auth.uid() = creator_id);

CREATE POLICY "Request owners can view all submissions for their requests"
  ON public.submissions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = submissions.request_id
      AND requests.user_id = auth.uid()
    )
  );

CREATE POLICY "Creators can create submissions"
  ON public.submissions FOR INSERT
  WITH CHECK (auth.uid() = creator_id);

CREATE POLICY "Request owners can update submission status (approve/reject)"
  ON public.submissions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = submissions.request_id
      AND requests.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.requests
      WHERE requests.id = submissions.request_id
      AND requests.user_id = auth.uid()
    )
  );

-- Timestamps trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers
CREATE TRIGGER update_requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_submissions_request_id ON public.submissions(request_id);
CREATE INDEX idx_submissions_creator_id ON public.submissions(creator_id);
CREATE INDEX idx_submissions_status ON public.submissions(status);
CREATE INDEX idx_requests_user_id ON public.requests(user_id);
CREATE INDEX idx_requests_status ON public.requests(status);