import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { SocialLoginButtons } from '@/components/SocialLoginButtons';
import { toast } from 'sonner';

export default function Auth() {
  const { 
    user, 
    signInWithGoogle,
    signInWithLinkedIn,
    signInWithTwitter,
    signInWithFacebook,
    signInWithGitHub,
    signInWithEmail, 
    signUpWithEmail, 
    resetPassword, 
    loading 
  } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSocialSignIn = async (provider: string, signInFunc: () => Promise<void>) => {
    try {
      await signInFunc();
    } catch (error: any) {
      toast.error(error.message || `Failed to sign in with ${provider}`);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signInWithEmail(email, password);
      if (error) {
        toast.error(error.message || 'Failed to sign in');
      } else {
        toast.success('Signed in successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { error } = await signUpWithEmail(email, password);
      if (error) {
        toast.error(error.message || 'Failed to sign up');
      } else {
        toast.success('Account created! You can now sign in.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign up');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }
    setIsLoading(true);
    try {
      const { error } = await resetPassword(email);
      if (error) {
        toast.error(error.message || 'Failed to send reset email');
      } else {
        toast.success('Password reset link sent! Check your email.');
        setShowForgotPassword(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-space flex items-center justify-center">
        <div className="animate-pulse">
          <Crown className="w-12 h-12 text-neon-pink" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-space flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Stars */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute top-20 left-10 w-2 h-2 bg-neon-cyan rounded-full animate-pulse" />
        <div className="absolute top-40 right-20 w-1 h-1 bg-neon-yellow rounded-full animate-pulse" style={{ animationDelay: '0.5s' }} />
        <div className="absolute bottom-32 left-1/4 w-2 h-2 bg-neon-pink rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-60 right-1/3 w-1 h-1 bg-neon-purple rounded-full animate-pulse" style={{ animationDelay: '1.5s' }} />
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-pink/40 p-8 shadow-neon">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-neon rounded-2xl blur-xl opacity-75" />
              <div className="relative bg-gradient-neon p-4 rounded-2xl shadow-neon">
                <Crown className="w-12 h-12 text-white" />
              </div>
              <Sparkles className="w-6 h-6 text-neon-yellow absolute -top-2 -right-2 animate-pulse" />
            </div>
          </div>

          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-black bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-cyan bg-clip-text text-transparent mb-2 animate-pulse">
              Welcome to Glazn
            </h1>
            <p className="text-muted-foreground">
              Enter the cosmic bounty marketplace
            </p>
          </div>

          {/* Auth Tabs */}
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              {!showForgotPassword ? (
                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">Email</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setShowForgotPassword(true)}
                      className="text-sm text-neon-cyan hover:text-neon-yellow transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-black bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink shadow-neon hover:shadow-glow transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reset-email">Email</Label>
                    <Input
                      id="reset-email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter your email to receive a password reset link
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full h-12 text-base font-black bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink shadow-neon hover:shadow-glow transition-all duration-300"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Sending...' : 'Send Reset Link'}
                  </Button>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="text-sm text-neon-cyan hover:text-neon-yellow transition-colors w-full text-center"
                  >
                    ← Back to sign in
                  </button>
                </form>
              )}

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Verify your profile with</span>
                </div>
              </div>

              <SocialLoginButtons
                onGoogleClick={() => handleSocialSignIn('Google', signInWithGoogle)}
                onLinkedInClick={() => handleSocialSignIn('LinkedIn', signInWithLinkedIn)}
                onTwitterClick={() => handleSocialSignIn('Twitter', signInWithTwitter)}
                onFacebookClick={() => handleSocialSignIn('Facebook', signInWithFacebook)}
                onGitHubClick={() => handleSocialSignIn('GitHub', signInWithGitHub)}
              />
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleEmailSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 6 characters
                  </p>
                </div>
                <Button
                  type="submit"
                  className="w-full h-12 text-base font-black bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink shadow-neon hover:shadow-glow transition-all duration-300"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Create Account'}
                </Button>
              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-muted" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Verify your profile with</span>
                </div>
              </div>

              <SocialLoginButtons
                onGoogleClick={() => handleSocialSignIn('Google', signInWithGoogle)}
                onLinkedInClick={() => handleSocialSignIn('LinkedIn', signInWithLinkedIn)}
                onTwitterClick={() => handleSocialSignIn('Twitter', signInWithTwitter)}
                onFacebookClick={() => handleSocialSignIn('Facebook', signInWithFacebook)}
                onGitHubClick={() => handleSocialSignIn('GitHub', signInWithGitHub)}
              />
            </TabsContent>
          </Tabs>

          {/* Footer */}
          <div className="text-center mt-6 space-y-3">
            <button
              onClick={() => navigate('/how-to')}
              className="text-neon-cyan hover:text-neon-yellow transition-colors font-medium text-sm"
            >
              New to Glazn? Learn How It Works →
            </button>
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our{' '}
              <Link to="/terms-of-service" className="text-neon-cyan hover:text-neon-yellow transition-colors underline">
                Terms of Service
              </Link>
              {' '}and{' '}
              <Link to="/privacy-policy" className="text-neon-cyan hover:text-neon-yellow transition-colors underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>

        {/* AI Feature Highlight */}
        <div className="mt-6 bg-card/60 backdrop-blur-xl rounded-xl p-4 border-2 border-neon-cyan/40 shadow-cyan">
          <div className="flex items-start gap-3">
            <div className="bg-gradient-to-br from-neon-cyan to-neon-purple p-2 rounded-lg">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground mb-1 bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
                AI-Powered Cosmic Matching
              </p>
              <p className="text-xs text-muted-foreground">
                Our quantum AI automatically matches your portfolio with relevant bespoke, on-demand content requests across the galaxy. Upload once, earn forever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
