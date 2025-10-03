import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Crown, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export default function Auth() {
  const { user, signInWithGoogle, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error: any) {
      toast.error(error.message || 'Failed to sign in with Google');
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

          {/* Google Sign In Button */}
          <Button
            onClick={handleGoogleSignIn}
            className="w-full h-12 text-base font-black bg-gradient-to-r from-neon-pink to-neon-purple hover:from-neon-purple hover:to-neon-pink shadow-neon hover:shadow-glow transition-all duration-300"
            size="lg"
          >
            <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continue with Google
          </Button>

          {/* Footer */}
          <div className="text-center mt-6 space-y-3">
            <button
              onClick={() => navigate('/how-to')}
              className="text-neon-cyan hover:text-neon-yellow transition-colors font-medium text-sm"
            >
              New to Glazn? Learn How It Works →
            </button>
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our Terms of Service and{' '}
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
                Our quantum AI automatically matches your portfolio with relevant requests across the galaxy. Upload once, earn forever.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
