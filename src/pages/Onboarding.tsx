"use client";

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, Building2, User, Sparkles, ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type UserType = 'creator' | 'brand' | null;

const creatorNiches = [
  'Fashion & Style',
  'Beauty & Skincare', 
  'Fitness & Health',
  'Food & Cooking',
  'Travel & Adventure',
  'Tech & Gaming',
  'Music & Entertainment',
  'Lifestyle & Wellness',
  'Business & Finance',
  'Art & Design',
  'Comedy & Memes',
  'Education & Learning',
];

const brandCategories = [
  'Fashion & Apparel',
  'Beauty & Cosmetics',
  'Food & Beverage',
  'Technology',
  'Health & Wellness',
  'Travel & Hospitality',
  'Entertainment',
  'Finance & Fintech',
  'Sports & Fitness',
  'Home & Living',
  'Automotive',
  'Other',
];

export default function Onboarding() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [userType, setUserType] = useState<UserType>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Creator fields
  const [creatorData, setCreatorData] = useState({
    displayName: '',
    username: '',
    bio: '',
    niches: [] as string[],
    instagramHandle: '',
    tiktokHandle: '',
    youtubeHandle: '',
    twitterHandle: '',
    baseRate: '',
  });

  // Brand fields
  const [brandData, setBrandData] = useState({
    companyName: '',
    website: '',
    description: '',
    category: '',
    budgetRange: '',
    contactName: '',
    contactEmail: '',
  });

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setStep(2);
  };

  const toggleNiche = (niche: string) => {
    setCreatorData(prev => ({
      ...prev,
      niches: prev.niches.includes(niche)
        ? prev.niches.filter(n => n !== niche)
        : [...prev.niches, niche].slice(0, 5) // Max 5 niches
    }));
  };

  const handleCreatorSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'creator',
          display_name: creatorData.displayName,
          username: creatorData.username.toLowerCase().replace(/[^a-z0-9_]/g, ''),
          bio: creatorData.bio,
          niches: creatorData.niches,
          instagram_handle: creatorData.instagramHandle,
          tiktok_handle: creatorData.tiktokHandle,
          youtube_handle: creatorData.youtubeHandle,
          twitter_handle: creatorData.twitterHandle,
          base_rate: creatorData.baseRate ? parseFloat(creatorData.baseRate) : null,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Welcome to Glazn, Creator! 🎉');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandSubmit = async () => {
    if (!user) return;
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          user_type: 'brand',
          company_name: brandData.companyName,
          website: brandData.website,
          bio: brandData.description,
          category: brandData.category,
          budget_range: brandData.budgetRange,
          contact_name: brandData.contactName,
          contact_email: brandData.contactEmail,
          onboarding_completed: true,
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Welcome to Glazn, Brand Partner! 🎉');
      navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete setup');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-space flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-neon-yellow rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-neon-pink rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Step 1: Choose User Type */}
        {step === 1 && (
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-pink/40 p-8 shadow-neon">
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-neon p-4 rounded-2xl shadow-neon">
                  <Crown className="w-12 h-12 text-white" />
                </div>
              </div>
              <h1 className="text-3xl font-black bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-cyan bg-clip-text text-transparent mb-2">
                Welcome to Glazn
              </h1>
              <p className="text-muted-foreground">
                How would you like to use Glazn?
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Creator Option */}
              <button
                onClick={() => handleUserTypeSelect('creator')}
                className="group p-6 rounded-xl border-2 border-neon-cyan/30 hover:border-neon-cyan bg-card/50 transition-all duration-300 hover:shadow-cyan text-left"
              >
                <div className="bg-gradient-to-br from-neon-cyan to-neon-purple p-3 rounded-lg w-fit mb-4">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-neon-cyan transition-colors">
                  I'm a Creator
                </h3>
                <p className="text-sm text-muted-foreground">
                  Showcase your content, connect with brands, and earn money through campaigns and bounties.
                </p>
                <div className="mt-4 flex items-center text-neon-cyan opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </button>

              {/* Brand Option */}
              <button
                onClick={() => handleUserTypeSelect('brand')}
                className="group p-6 rounded-xl border-2 border-neon-pink/30 hover:border-neon-pink bg-card/50 transition-all duration-300 hover:shadow-neon text-left"
              >
                <div className="bg-gradient-to-br from-neon-pink to-neon-yellow p-3 rounded-lg w-fit mb-4">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-neon-pink transition-colors">
                  I'm a Brand
                </h3>
                <p className="text-sm text-muted-foreground">
                  Find authentic creators, launch campaigns, and connect with your target audience.
                </p>
                <div className="mt-4 flex items-center text-neon-pink opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-sm font-medium">Get Started</span>
                  <ArrowRight className="w-4 h-4 ml-2" />
                </div>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Creator Onboarding */}
        {step === 2 && userType === 'creator' && (
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-cyan/40 p-8 shadow-cyan">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                ← Back
              </button>
              <div className="flex-1" />
              <span className="text-sm text-muted-foreground">Step 2 of 2</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-6">Set Up Your Creator Profile</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Display Name *</Label>
                  <Input
                    placeholder="Your name or brand"
                    value={creatorData.displayName}
                    onChange={(e) => setCreatorData(prev => ({ ...prev, displayName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Username *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">@</span>
                    <Input
                      className="pl-8"
                      placeholder="username"
                      value={creatorData.username}
                      onChange={(e) => setCreatorData(prev => ({ ...prev, username: e.target.value }))}
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Bio</Label>
                <Textarea
                  placeholder="Tell brands about yourself and your content..."
                  value={creatorData.bio}
                  onChange={(e) => setCreatorData(prev => ({ ...prev, bio: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label>Your Niches (select up to 5)</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {creatorNiches.map((niche) => (
                    <button
                      key={niche}
                      onClick={() => toggleNiche(niche)}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        creatorData.niches.includes(niche)
                          ? 'bg-neon-cyan text-black font-medium'
                          : 'bg-card border border-border hover:border-neon-cyan/50'
                      }`}
                    >
                      {creatorData.niches.includes(niche) && <Check className="w-3 h-3 inline mr-1" />}
                      {niche}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Social Handles</Label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Input
                    placeholder="Instagram @handle"
                    value={creatorData.instagramHandle}
                    onChange={(e) => setCreatorData(prev => ({ ...prev, instagramHandle: e.target.value }))}
                  />
                  <Input
                    placeholder="TikTok @handle"
                    value={creatorData.tiktokHandle}
                    onChange={(e) => setCreatorData(prev => ({ ...prev, tiktokHandle: e.target.value }))}
                  />
                  <Input
                    placeholder="YouTube channel"
                    value={creatorData.youtubeHandle}
                    onChange={(e) => setCreatorData(prev => ({ ...prev, youtubeHandle: e.target.value }))}
                  />
                  <Input
                    placeholder="Twitter/X @handle"
                    value={creatorData.twitterHandle}
                    onChange={(e) => setCreatorData(prev => ({ ...prev, twitterHandle: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Base Rate ($ per post)</Label>
                <Input
                  type="number"
                  placeholder="e.g., 500"
                  value={creatorData.baseRate}
                  onChange={(e) => setCreatorData(prev => ({ ...prev, baseRate: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground mt-1">Optional - you can negotiate per campaign</p>
              </div>

              <Button
                onClick={handleCreatorSubmit}
                disabled={!creatorData.displayName || !creatorData.username || isLoading}
                className="w-full h-12 bg-gradient-to-r from-neon-cyan to-neon-purple hover:opacity-90"
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Brand Onboarding */}
        {step === 2 && userType === 'brand' && (
          <div className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-pink/40 p-8 shadow-neon">
            <div className="flex items-center gap-3 mb-6">
              <button onClick={() => setStep(1)} className="text-muted-foreground hover:text-foreground">
                ← Back
              </button>
              <div className="flex-1" />
              <span className="text-sm text-muted-foreground">Step 2 of 2</span>
            </div>

            <h2 className="text-2xl font-bold text-foreground mb-6">Set Up Your Brand Profile</h2>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Company Name *</Label>
                  <Input
                    placeholder="Your company name"
                    value={brandData.companyName}
                    onChange={(e) => setBrandData(prev => ({ ...prev, companyName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Website</Label>
                  <Input
                    placeholder="https://yourcompany.com"
                    value={brandData.website}
                    onChange={(e) => setBrandData(prev => ({ ...prev, website: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Company Description</Label>
                <Textarea
                  placeholder="Tell creators about your brand..."
                  value={brandData.description}
                  onChange={(e) => setBrandData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              <div>
                <Label>Industry Category *</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {brandCategories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setBrandData(prev => ({ ...prev, category }))}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        brandData.category === category
                          ? 'bg-neon-pink text-black font-medium'
                          : 'bg-card border border-border hover:border-neon-pink/50'
                      }`}
                    >
                      {brandData.category === category && <Check className="w-3 h-3 inline mr-1" />}
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label>Typical Campaign Budget</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {['Under $1K', '$1K - $5K', '$5K - $10K', '$10K - $25K', '$25K+'].map((range) => (
                    <button
                      key={range}
                      onClick={() => setBrandData(prev => ({ ...prev, budgetRange: range }))}
                      className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                        brandData.budgetRange === range
                          ? 'bg-neon-yellow text-black font-medium'
                          : 'bg-card border border-border hover:border-neon-yellow/50'
                      }`}
                    >
                      {range}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label>Contact Name *</Label>
                  <Input
                    placeholder="Your name"
                    value={brandData.contactName}
                    onChange={(e) => setBrandData(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Contact Email *</Label>
                  <Input
                    type="email"
                    placeholder="you@company.com"
                    value={brandData.contactEmail}
                    onChange={(e) => setBrandData(prev => ({ ...prev, contactEmail: e.target.value }))}
                  />
                </div>
              </div>

              <Button
                onClick={handleBrandSubmit}
                disabled={!brandData.companyName || !brandData.category || !brandData.contactName || !brandData.contactEmail || isLoading}
                className="w-full h-12 bg-gradient-to-r from-neon-pink to-neon-yellow hover:opacity-90"
              >
                {isLoading ? 'Setting up...' : 'Complete Setup'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
