import { useState, useEffect } from 'react';
import { X, ChevronRight, Sparkles, Target, Crown, CheckCircle } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Dialog, DialogContent } from './ui/dialog';

interface OnboardingFlowProps {
  userType: 'creator' | 'requester';
  onComplete: () => void;
}

const ONBOARDING_STORAGE_KEY = 'glazn_onboarding_completed';

export function OnboardingFlow({ userType, onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Check if onboarding was already completed
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!completed) {
      // Show onboarding after a short delay
      setTimeout(() => setIsOpen(true), 500);
    }
  }, []);

  const creatorSteps = [
    {
      icon: <Sparkles className="w-12 h-12 text-neon-yellow" />,
      title: 'Welcome to Glazn!',
      description: 'The fastest way to earn from your creative skills. Browse bounties, submit work, and get paid instantly.',
      action: 'Get Started',
    },
    {
      icon: <Target className="w-12 h-12 text-neon-cyan" />,
      title: 'Find Perfect Matches',
      description: 'Our AI automatically finds bounties that match your skills. Look for the match percentage on each bounty card.',
      action: 'Next',
    },
    {
      icon: <Crown className="w-12 h-12 text-neon-pink" />,
      title: 'Submit & Earn',
      description: 'Submit your work with a single click. Once approved, payment goes directly to your wallet. Build your portfolio automatically!',
      action: 'Start Browsing',
    },
  ];

  const requesterSteps = [
    {
      icon: <Sparkles className="w-12 h-12 text-neon-yellow" />,
      title: 'Welcome to Glazn!',
      description: 'Get quality creative work from talented creators. Post bounties in seconds and receive submissions within 24 hours.',
      action: 'Get Started',
    },
    {
      icon: <Target className="w-12 h-12 text-neon-cyan" />,
      title: 'AI-Powered Bounty Creation',
      description: 'Describe what you need and our AI will generate a professional bounty request with suggested pricing.',
      action: 'Next',
    },
    {
      icon: <Crown className="w-12 h-12 text-neon-pink" />,
      title: 'Swipe to Approve',
      description: 'Review submissions with our Tinder-style interface. Swipe right to approve and automatically send payment!',
      action: 'Post Your First Bounty',
    },
  ];

  const steps = userType === 'creator' ? creatorSteps : requesterSteps;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handleComplete = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
    setIsOpen(false);
    onComplete();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-md p-0 overflow-hidden border-2 border-neon-purple/50 bg-card/95 backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-neon rounded-full blur-xl opacity-50" />
              <div className="relative bg-card/80 p-6 rounded-full">
                {currentStepData.icon}
              </div>
            </div>
          </div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl font-black bg-gradient-neon bg-clip-text text-transparent">
              {currentStepData.title}
            </h2>
            <p className="text-muted-foreground">
              {currentStepData.description}
            </p>
          </div>

          {/* Progress Dots */}
          <div className="flex justify-center gap-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-gradient-neon'
                    : 'w-2 bg-muted'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleNext}
              className="w-full bg-gradient-neon hover:shadow-glow text-white font-bold h-12"
            >
              {currentStepData.action}
              <ChevronRight className="w-5 h-5 ml-2" />
            </Button>
            {currentStep < steps.length - 1 && (
              <button
                onClick={handleSkip}
                className="w-full text-sm text-muted-foreground hover:text-foreground"
              >
                Skip tutorial
              </button>
            )}
          </div>
        </div>

        {/* Step Counter */}
        <div className="bg-muted/30 px-8 py-3 text-center text-xs text-muted-foreground">
          Step {currentStep + 1} of {steps.length}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to check if onboarding is needed
export function useOnboardingStatus() {
  const [needsOnboarding, setNeedsOnboarding] = useState(false);

  useEffect(() => {
    const completed = localStorage.getItem(ONBOARDING_STORAGE_KEY);
    setNeedsOnboarding(!completed);
  }, []);

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_STORAGE_KEY);
    setNeedsOnboarding(true);
  };

  return { needsOnboarding, resetOnboarding };
}
