-- Make user_id nullable for system-generated bounties
ALTER TABLE public.requests ALTER COLUMN user_id DROP NOT NULL;

-- Add a flag to identify system-generated bounties
ALTER TABLE public.requests ADD COLUMN IF NOT EXISTS is_system_generated boolean DEFAULT false;

-- Update RLS policy to allow viewing system-generated bounties
DROP POLICY IF EXISTS "Anyone can view open requests" ON public.requests;

CREATE POLICY "Anyone can view open or system-generated requests"
ON public.requests
FOR SELECT
USING (
  status = 'open' 
  OR auth.uid() = user_id 
  OR is_system_generated = true
);

-- Insert sample app-generated bounties across different categories
INSERT INTO public.requests (user_id, title, description, bounty, category, deadline, status, platform, is_anonymous, featured, allow_contributions, minimum_contribution, trending_score, is_system_generated) VALUES
-- FITNESS influencers
(NULL, '30-Day Resistance Band Challenge', 'Create a complete 30-day workout program using only resistance bands. Perfect for home workouts!', 250.00, 'Fitness', '2025-12-31', 'open', 'instagram', true, true, true, 10.00, 95, true),
(NULL, 'Outdoor Park Workout Series', 'Film a series of creative workouts using only park equipment (benches, bars, stairs)', 180.00, 'Fitness', '2025-11-30', 'open', 'youtube', true, true, true, 15.00, 88, true),
(NULL, 'Kettlebell Form Tutorial', 'Detailed tutorial on proper kettlebell form for beginners - safety first!', 150.00, 'Fitness', '2025-10-31', 'open', 'tiktok', true, true, true, 10.00, 82, true),

-- MAKEUP influencers
(NULL, 'Drugstore Makeup Challenge Under $50', 'Create a full face of makeup using only drugstore products under $50 total', 200.00, 'Beauty', '2025-11-15', 'open', 'instagram', true, true, true, 10.00, 92, true),
(NULL, 'Natural Lighting Makeup Tutorial', 'Show the difference between natural lighting vs. ring light makeup application', 175.00, 'Beauty', '2025-10-20', 'open', 'youtube', true, true, true, 15.00, 87, true),
(NULL, 'Korean Glass Skin Routine', 'Step-by-step tutorial for achieving Korean glass skin with product recommendations', 220.00, 'Beauty', '2025-12-15', 'open', 'tiktok', true, true, true, 10.00, 90, true),

-- FASHION influencers
(NULL, 'Thrift Store Style Challenge', 'Create 5 complete outfits using only thrift store finds under $100', 280.00, 'Fashion', '2025-11-30', 'open', 'instagram', true, true, true, 20.00, 94, true),
(NULL, 'Capsule Wardrobe for Minimalists', 'Build a 30-piece capsule wardrobe that works for all seasons', 300.00, 'Fashion', '2025-12-31', 'open', 'youtube', true, true, true, 25.00, 89, true),
(NULL, 'Sustainable Fashion Lookbook', 'Showcase eco-friendly fashion brands and create inspiring sustainable outfits', 250.00, 'Fashion', '2025-10-31', 'open', 'tiktok', true, true, true, 15.00, 91, true),

-- WELLNESS influencers
(NULL, 'Morning Routine for Better Mental Health', 'Share your science-backed morning routine that improves mental wellness', 190.00, 'Wellness', '2025-11-15', 'open', 'instagram', true, true, true, 10.00, 86, true),
(NULL, 'Natural Remedies for Better Sleep', 'Review and test natural sleep aids - what actually works?', 210.00, 'Wellness', '2025-12-01', 'open', 'youtube', true, true, true, 15.00, 88, true),
(NULL, 'Stress Relief Products Review', 'Honest reviews of popular stress relief products (weighted blankets, aromatherapy, etc.)', 175.00, 'Wellness', '2025-10-31', 'open', 'tiktok', true, true, true, 10.00, 84, true),

-- GAMING influencers
(NULL, 'Budget Gaming Setup Under $500', 'Build a complete gaming setup for under $500 - PC, peripherals, everything!', 320.00, 'Gaming', '2025-11-30', 'open', 'youtube', true, true, true, 20.00, 93, true),
(NULL, 'Best Controller Settings Guide', 'Comprehensive guide to controller settings for competitive gaming', 150.00, 'Gaming', '2025-10-15', 'open', 'twitch', true, true, true, 10.00, 85, true),

-- COOKING influencers
(NULL, 'One-Pot Meals for College Students', 'Easy, affordable one-pot recipes perfect for dorm cooking', 180.00, 'Cooking', '2025-11-15', 'open', 'tiktok', true, true, true, 10.00, 87, true),
(NULL, 'Meal Prep Sundays on a Budget', 'Meal prep for the entire week under $40 - healthy and delicious', 200.00, 'Cooking', '2025-12-01', 'open', 'youtube', true, true, true, 15.00, 90, true),

-- TECH influencers
(NULL, 'Best Budget Tech Under $100', 'Review the best budget tech gadgets and accessories under $100', 240.00, 'Tech', '2025-11-30', 'open', 'youtube', true, true, true, 15.00, 89, true),
(NULL, 'Phone Photography Masterclass', 'Teach how to take professional-looking photos using only a smartphone', 190.00, 'Tech', '2025-10-31', 'open', 'instagram', true, true, true, 10.00, 86, true),

-- TRAVEL influencers
(NULL, 'Hidden Gems in Your City', 'Discover and showcase 10 hidden gem locations that locals love', 270.00, 'Travel', '2025-12-15', 'open', 'instagram', true, true, true, 20.00, 91, true),
(NULL, 'Budget Travel Hacks', 'Share your best tips for traveling on a tight budget - flights, accommodation, food', 230.00, 'Travel', '2025-11-30', 'open', 'youtube', true, true, true, 15.00, 88, true);