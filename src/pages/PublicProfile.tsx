import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Crown, CheckCircle, MapPin, Link as LinkIcon, Award, Target, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserAvatar } from '@/components/UserAvatar';
import { StatusBadge } from '@/components/StatusBadge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  verified: boolean;
  is_content_creator: boolean;
  creator_platforms: string[];
  portfolio_url: string;
  bounties_completed: number;
  total_earnings: number;
  reputation_score: number;
}

interface UserStatus {
  creator_points: number;
  creator_tier: string;
  bounties_completed: number;
}

export default function PublicProfile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [userStatus, setUserStatus] = useState<UserStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;

      try {
        // Remove @ from username if present
        const cleanUsername = username.replace('@', '');

        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('username', cleanUsername)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch user status
        const { data: statusData } = await supabase
          .from('user_status')
          .select('creator_points, creator_tier, bounties_completed')
          .eq('user_id', profileData.id)
          .single();

        if (statusData) {
          setUserStatus(statusData);
        }
      } catch (error) {
        console.error('Error fetching profile:', error);
        toast.error('Profile not found');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-space py-12">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="p-8">
            <div className="flex items-start gap-6 mb-6">
              <Skeleton className="w-24 h-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-20 w-full" />
              </div>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-space flex items-center justify-center">
        <Card className="p-12 text-center max-w-md">
          <h2 className="text-2xl font-black text-foreground mb-4">
            Profile Not Found
          </h2>
          <p className="text-muted-foreground mb-6">
            The profile you're looking for doesn't exist.
          </p>
          <Link to="/">
            <Button className="bg-gradient-neon">
              Back to Home
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-space py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Profile Header */}
        <Card className="p-8 mb-6 bg-card/80 backdrop-blur-xl border-2 border-neon-purple/30">
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <UserAvatar ethnicity="mixed" size="lg" />
              {profile.verified && (
                <div className="absolute -bottom-2 -right-2 bg-neon-cyan rounded-full p-1">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-black bg-gradient-neon bg-clip-text text-transparent">
                  {profile.display_name}
                </h1>
                {userStatus && (
                  <StatusBadge 
                    tier={userStatus.creator_tier as any}
                    title={userStatus.creator_tier.replace('glass_', '').replace('_', ' ')}
                    showTitle={false}
                  />
                )}
              </div>
              
              <p className="text-neon-cyan font-bold mb-3">@{profile.username}</p>
              
              {profile.bio && (
                <p className="text-muted-foreground mb-4">{profile.bio}</p>
              )}

              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-sm text-neon-cyan hover:text-neon-cyan/80 font-medium"
                >
                  <LinkIcon className="w-4 h-4" />
                  {profile.portfolio_url}
                </a>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-6 border-t border-border">
            <div className="text-center">
              <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text mb-1">
                {userStatus?.bounties_completed || 0}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Bounties Completed
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text mb-1">
                {userStatus?.creator_points || 0}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Glazn Points
              </div>
            </div>
            
            <div className="text-center">
              <div className="text-3xl font-black text-transparent bg-gradient-neon bg-clip-text mb-1">
                {profile.reputation_score}
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider">
                Reputation
              </div>
            </div>
          </div>
        </Card>

        {/* Creator Info */}
        {profile.is_content_creator && (
          <Card className="p-6 bg-card/80 backdrop-blur-xl border-2 border-neon-cyan/30">
            <h2 className="text-xl font-black text-foreground mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-neon-cyan" />
              Creator Profile
            </h2>
            
            {profile.creator_platforms && profile.creator_platforms.length > 0 && (
              <div className="mb-4">
                <p className="text-sm text-muted-foreground mb-2">Active on:</p>
                <div className="flex flex-wrap gap-2">
                  {profile.creator_platforms.map((platform) => (
                    <span
                      key={platform}
                      className="px-3 py-1 bg-neon-cyan/10 text-neon-cyan text-sm font-bold rounded-full border border-neon-cyan/30"
                    >
                      {platform}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <Link to="/bounties" className="flex-1">
                <Button className="w-full bg-gradient-neon hover:shadow-glow">
                  <Award className="w-4 h-4 mr-2" />
                  View Available Bounties
                </Button>
              </Link>
            </div>
          </Card>
        )}

        {/* Back to Home */}
        <div className="text-center mt-8">
          <Link to="/">
            <Button variant="outline" className="border-neon-purple/50">
              Back to Glazn
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
