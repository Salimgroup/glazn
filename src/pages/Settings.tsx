import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Crown, Shield, Link2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { SocialLoginButtons } from '@/components/SocialLoginButtons';
import { VerifiedBadge } from '@/components/VerifiedBadge';
import { useAuth } from '@/hooks/useAuth';
import { useVerifiedAccounts } from '@/hooks/useVerifiedAccounts';
import { toast } from 'sonner';

export default function Settings() {
  const { 
    user,
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithTwitter,
    signInWithFacebook,
    signInWithGitHub,
    loading 
  } = useAuth();
  const navigate = useNavigate();
  const { accounts: verifiedAccounts, loading: accountsLoading } = useVerifiedAccounts(user?.id);

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const handleSocialLink = async (provider: string, linkFunc: () => Promise<void>) => {
    try {
      await linkFunc();
      toast.success(`Linking ${provider} account...`);
    } catch (error: any) {
      toast.error(error.message || `Failed to link ${provider} account`);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-gradient-space flex items-center justify-center">
        <div className="animate-pulse">
          <Crown className="w-12 h-12 text-neon-pink" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-space py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <Link to="/">
            <Button variant="outline" size="sm" className="mb-4">
              ← Back to Glazn
            </Button>
          </Link>
          <h1 className="text-4xl font-black bg-gradient-neon bg-clip-text text-transparent mb-2">
            Account Settings
          </h1>
          <p className="text-muted-foreground">
            Manage your profile verification and connected accounts
          </p>
        </div>

        {/* Verified Accounts Section */}
        <Card className="p-8 mb-6 bg-card/80 backdrop-blur-xl border-2 border-neon-cyan/30">
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-gradient-to-br from-neon-cyan to-neon-purple p-2 rounded-lg">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-foreground">Verified Accounts</h2>
              <p className="text-sm text-muted-foreground">
                Link your social media accounts to verify your identity to bounty providers
              </p>
            </div>
          </div>

          {/* Currently Verified Accounts */}
          {!accountsLoading && verifiedAccounts.length > 0 && (
            <div className="mb-6 p-4 bg-muted/30 rounded-lg">
              <h3 className="text-sm font-bold text-foreground mb-3">Connected & Verified</h3>
              <div className="space-y-2">
                {verifiedAccounts.map((account) => (
                  <div key={account.id} className="flex items-center justify-between p-2 bg-background/50 rounded">
                    <div className="flex items-center gap-3">
                      <VerifiedBadge 
                        platform={account.platform}
                        username={account.platform_username}
                        size="lg"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {account.platform.charAt(0).toUpperCase() + account.platform.slice(1)}
                        </p>
                        {account.platform_username && (
                          <p className="text-xs text-muted-foreground">@{account.platform_username}</p>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-neon-cyan">✓ Verified</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Link More Accounts */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Link2 className="w-5 h-5 text-neon-purple" />
              <h3 className="text-sm font-bold text-foreground">
                {verifiedAccounts.length > 0 ? 'Link More Accounts' : 'Verify Your Identity'}
              </h3>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Linking your social media accounts helps bounty providers verify you control the profiles you're creating content for.
            </p>
            <SocialLoginButtons
              onGoogleClick={() => handleSocialLink('Google', signInWithGoogle)}
              onLinkedInClick={() => handleSocialLink('LinkedIn', signInWithLinkedIn)}
              onTwitterClick={() => handleSocialLink('Twitter', signInWithTwitter)}
              onFacebookClick={() => handleSocialLink('Facebook', signInWithFacebook)}
              onGitHubClick={() => handleSocialLink('GitHub', signInWithGitHub)}
            />
          </div>
        </Card>

        {/* Information Card */}
        <Card className="p-6 bg-card/60 backdrop-blur-xl border-2 border-neon-yellow/30">
          <h3 className="text-lg font-black text-foreground mb-2">Why verify your accounts?</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan">•</span>
              <span>Prove you own the social media profiles you're creating content for</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan">•</span>
              <span>Build trust with bounty providers and increase your credibility</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan">•</span>
              <span>Get higher priority for relevant bounties matched to your platforms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-neon-cyan">•</span>
              <span>Your verification status is displayed on your public profile</span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}
