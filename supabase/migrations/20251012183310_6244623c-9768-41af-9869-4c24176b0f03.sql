-- Create verified social accounts table for social media profile verification
CREATE TABLE public.verified_social_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL CHECK (platform IN ('google', 'linkedin', 'twitter', 'facebook', 'github', 'snapchat', 'tiktok')),
  platform_user_id TEXT NOT NULL,
  platform_username TEXT,
  platform_email TEXT,
  platform_avatar_url TEXT,
  verified_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, platform),
  UNIQUE(platform, platform_user_id)
);

-- Enable RLS
ALTER TABLE public.verified_social_accounts ENABLE ROW LEVEL SECURITY;

-- Users can view their own verified accounts
CREATE POLICY "Users can view own verified accounts"
ON public.verified_social_accounts
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Public can view verified accounts (for profile verification display)
CREATE POLICY "Public can view verified accounts"
ON public.verified_social_accounts
FOR SELECT
TO public
USING (true);

-- Users can insert their own verified accounts (via OAuth flow)
CREATE POLICY "Users can insert own verified accounts"
ON public.verified_social_accounts
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Users can update their own verified accounts
CREATE POLICY "Users can update own verified accounts"
ON public.verified_social_accounts
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can delete their own verified accounts
CREATE POLICY "Users can delete own verified accounts"
ON public.verified_social_accounts
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Create trigger for updating updated_at timestamp
CREATE TRIGGER update_verified_social_accounts_updated_at
BEFORE UPDATE ON public.verified_social_accounts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_verified_social_accounts_user_id ON public.verified_social_accounts(user_id);
CREATE INDEX idx_verified_social_accounts_platform ON public.verified_social_accounts(platform);

-- Create function to automatically create/update verified social account after OAuth login
CREATE OR REPLACE FUNCTION public.handle_social_login()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_provider TEXT;
  v_provider_user_id TEXT;
  v_username TEXT;
  v_email TEXT;
  v_avatar_url TEXT;
BEGIN
  -- Extract provider info from auth.users metadata
  v_provider := NEW.raw_app_meta_data->>'provider';
  
  -- Map provider names to our platform names
  v_provider := CASE v_provider
    WHEN 'google' THEN 'google'
    WHEN 'linkedin_oidc' THEN 'linkedin'
    WHEN 'twitter' THEN 'twitter'
    WHEN 'facebook' THEN 'facebook'
    WHEN 'github' THEN 'github'
    ELSE v_provider
  END;
  
  -- Only process if it's a supported social provider
  IF v_provider IN ('google', 'linkedin', 'twitter', 'facebook', 'github', 'snapchat', 'tiktok') THEN
    v_provider_user_id := NEW.raw_user_meta_data->>'sub';
    v_username := COALESCE(
      NEW.raw_user_meta_data->>'user_name',
      NEW.raw_user_meta_data->>'preferred_username',
      NEW.raw_user_meta_data->>'name'
    );
    v_email := NEW.email;
    v_avatar_url := NEW.raw_user_meta_data->>'avatar_url';
    
    -- Upsert the verified social account
    INSERT INTO public.verified_social_accounts (
      user_id,
      platform,
      platform_user_id,
      platform_username,
      platform_email,
      platform_avatar_url,
      metadata
    ) VALUES (
      NEW.id,
      v_provider,
      COALESCE(v_provider_user_id, NEW.id::TEXT),
      v_username,
      v_email,
      v_avatar_url,
      NEW.raw_user_meta_data
    )
    ON CONFLICT (user_id, platform)
    DO UPDATE SET
      platform_user_id = EXCLUDED.platform_user_id,
      platform_username = EXCLUDED.platform_username,
      platform_email = EXCLUDED.platform_email,
      platform_avatar_url = EXCLUDED.platform_avatar_url,
      metadata = EXCLUDED.metadata,
      verified_at = now(),
      updated_at = now();
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to handle social login
CREATE TRIGGER on_auth_user_social_login
AFTER INSERT OR UPDATE ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.handle_social_login();