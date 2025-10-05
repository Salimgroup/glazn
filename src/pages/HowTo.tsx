import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Crown, DollarSign, FileCheck, Users, Shield, Zap, Target, Award } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowTo() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-space">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button
            onClick={() => navigate('/')}
            variant="outline"
            className="mb-4 border-neon-purple/40 hover:bg-neon-purple/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Bounties
          </Button>
          
          <div className="text-center mb-6">
            <h1 className="text-5xl font-black bg-gradient-to-r from-neon-yellow via-neon-pink to-neon-cyan bg-clip-text text-transparent mb-4">
              Welcome to Glazn
            </h1>
            <p className="text-xl text-muted-foreground">
              The cosmic marketplace for bespoke content creation
            </p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* What is Glazn */}
          <section className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-pink/40 p-6 shadow-neon">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-neon p-3 rounded-xl shadow-neon">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-foreground">What is Glazn?</h2>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              Glazn is a futuristic bounty marketplace where requesters post requests for bespoke content and creators submit custom work. 
              Our AI automatically matches requests with creator portfolios, making the process seamless and efficient.
            </p>
          </section>

          {/* How It Works */}
          <section className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-cyan/40 p-6 shadow-cyan">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-neon-cyan to-neon-purple p-3 rounded-xl shadow-cyan">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-foreground">How It Works</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-3">
                <div className="bg-neon-yellow/20 border-2 border-neon-yellow/40 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-neon-yellow">
                  1
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">Request Bespoke Content</h3>
                  <p className="text-sm text-muted-foreground">
                    Describe your custom content needs, set your budget, and deadline. Be specific for better AI matches!
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-neon-pink/20 border-2 border-neon-pink/40 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-neon-pink">
                  2
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">AI Matches Creators</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI instantly scans creator portfolios and auto-submits matching bespoke content to your request.
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="bg-neon-cyan/20 border-2 border-neon-cyan/40 rounded-full w-8 h-8 flex items-center justify-center flex-shrink-0 font-black text-neon-cyan">
                  3
                </div>
                <div>
                  <h3 className="font-bold text-foreground mb-1">Review & Accept</h3>
                  <p className="text-sm text-muted-foreground">
                    Review submissions and accept the best one. The creator gets paid minus a 20% platform fee.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Bounty Contributions */}
          <section className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-purple/40 p-6 shadow-neon">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-neon-yellow to-neon-pink p-3 rounded-xl shadow-neon">
                <DollarSign className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Bounty Contributions</h2>
            </div>
            <p className="text-muted-foreground mb-4 leading-relaxed">
              Others can add funds to your bounty to increase the reward! Here's how it works:
            </p>
            <ul className="space-y-3">
              <li className="flex gap-2">
                <Shield className="w-5 h-5 text-neon-yellow flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">You Stay In Control:</strong> The original bounty creator approves or rejects all contribution requests
                </span>
              </li>
              <li className="flex gap-2">
                <Users className="w-5 h-5 text-neon-cyan flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Minimum Contributions:</strong> You can set a minimum amount contributors must pledge to access submissions
                </span>
              </li>
              <li className="flex gap-2">
                <FileCheck className="w-5 h-5 text-neon-pink flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Submission Access:</strong> Approved contributors who meet the minimum can view submissions
                </span>
              </li>
              <li className="flex gap-2">
                <Crown className="w-5 h-5 text-neon-purple flex-shrink-0 mt-0.5" />
                <span className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Final Say:</strong> Only the original bounty creator can accept the winning submission
                </span>
              </li>
            </ul>
          </section>

          {/* Rules & Guidelines */}
          <section className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-yellow/40 p-6 shadow-glow">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-gradient-to-r from-neon-purple to-neon-pink p-3 rounded-xl shadow-neon">
                <Award className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-black text-foreground">Rules & Guidelines</h2>
            </div>
            <div className="space-y-3">
              <div className="bg-gradient-space/30 p-4 rounded-xl border border-neon-purple/30">
                <h3 className="font-bold text-neon-yellow mb-2">Platform Fee</h3>
                <p className="text-sm text-muted-foreground">
                  Glazn charges 20% on all bounties. If a bounty is $100, the creator receives $80.
                </p>
              </div>
              <div className="bg-gradient-space/30 p-4 rounded-xl border border-neon-cyan/30">
                <h3 className="font-bold text-neon-cyan mb-2">Submission Requirements</h3>
                <p className="text-sm text-muted-foreground">
                  All submissions must be relevant to the bounty. Spam or irrelevant content may result in account suspension.
                </p>
              </div>
              <div className="bg-gradient-space/30 p-4 rounded-xl border border-neon-pink/30">
                <h3 className="font-bold text-neon-pink mb-2">Payment & Deadlines</h3>
                <p className="text-sm text-muted-foreground">
                  Bounties have deadlines. Accept submissions before the deadline expires to ensure creators are compensated.
                </p>
              </div>
              <div className="bg-gradient-space/30 p-4 rounded-xl border border-neon-yellow/30">
                <h3 className="font-bold text-neon-yellow mb-2">Contribution Control</h3>
                <p className="text-sm text-muted-foreground">
                  You can enable/disable contributions when creating a bounty. Set minimum amounts to ensure serious contributors.
                </p>
              </div>
            </div>
          </section>

          {/* Get Started */}
          <section className="bg-gradient-neon p-8 rounded-2xl text-center shadow-neon">
            <h2 className="text-3xl font-black text-white mb-4">Ready to Get Started?</h2>
            <p className="text-white/90 mb-6 max-w-2xl mx-auto">
              Join the cosmic marketplace and start posting bounties or submitting your creative work today!
            </p>
            <Button
              onClick={() => navigate('/')}
              size="lg"
              className="bg-white text-purple-900 hover:bg-white/90 font-black text-lg px-8 shadow-glow"
            >
              <Crown className="w-5 h-5 mr-2" />
              Enter Glazn
            </Button>
          </section>
        </div>
      </div>
    </div>
  );
}
