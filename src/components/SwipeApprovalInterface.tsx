import { useState } from 'react';
import { Check, X, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface Submission {
  id: number;
  title: string;
  description: string;
  external_url: string;
  creator_id: string;
  platform_name?: string;
  preview_notes?: string;
}

interface SwipeApprovalInterfaceProps {
  submissions: Submission[];
  bountyAmount: number;
  onApprove: (submissionId: number) => Promise<void>;
  onReject: (submissionId: number, reason?: string) => Promise<void>;
  onClose: () => void;
}

export function SwipeApprovalInterface({
  submissions,
  bountyAmount,
  onApprove,
  onReject,
  onClose
}: SwipeApprovalInterfaceProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const currentSubmission = submissions[currentIndex];

  const handleSwipe = async (direction: 'approve' | 'reject') => {
    if (isProcessing || !currentSubmission) return;

    setIsProcessing(true);
    setSwipeDirection(direction === 'approve' ? 'right' : 'left');

    try {
      if (direction === 'approve') {
        await onApprove(currentSubmission.id);
        toast.success('✅ Submission approved & payment sent!', { duration: 3000 });
      } else {
        await onReject(currentSubmission.id);
        toast.success('❌ Submission rejected', { duration: 2000 });
      }

      setTimeout(() => {
        if (currentIndex < submissions.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setSwipeDirection(null);
        } else {
          toast.success('All submissions reviewed!', { duration: 3000 });
          onClose();
        }
        setIsProcessing(false);
      }, 300);
    } catch (error) {
      console.error('Error processing submission:', error);
      toast.error('Failed to process submission');
      setSwipeDirection(null);
      setIsProcessing(false);
    }
  };

  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < submissions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  if (!currentSubmission) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No submissions to review</p>
        <Button onClick={onClose} className="mt-4">Close</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-bold text-foreground">
            {currentIndex + 1} of {submissions.length}
          </span>
          <span className="text-sm text-muted-foreground">
            Bounty: ${bountyAmount}
          </span>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-gradient-neon h-2 rounded-full transition-all duration-300"
            style={{ width: `${((currentIndex + 1) / submissions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Submission Card */}
      <Card 
        className={`relative overflow-hidden transition-all duration-300 ${
          swipeDirection === 'left' ? 'translate-x-[-120%] opacity-0' :
          swipeDirection === 'right' ? 'translate-x-[120%] opacity-0' :
          'translate-x-0 opacity-100'
        }`}
      >
        <div className="p-6 space-y-4">
          <div>
            <h3 className="text-xl font-black text-foreground mb-2">
              {currentSubmission.title}
            </h3>
            {currentSubmission.description && (
              <p className="text-sm text-muted-foreground">
                {currentSubmission.description}
              </p>
            )}
          </div>

          {currentSubmission.preview_notes && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <p className="text-sm font-medium text-foreground">
                Creator Notes:
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {currentSubmission.preview_notes}
              </p>
            </div>
          )}

          <div className="flex items-center justify-between py-4 border-t border-b border-border">
            <span className="text-sm text-muted-foreground">
              Platform: {currentSubmission.platform_name || 'External'}
            </span>
            <a
              href={currentSubmission.external_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-neon-cyan hover:text-neon-cyan/80 font-bold text-sm"
            >
              View Submission
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>

          {/* Swipe Actions */}
          <div className="flex gap-4 pt-4">
            <Button
              onClick={() => handleSwipe('reject')}
              disabled={isProcessing}
              variant="outline"
              className="flex-1 h-16 text-lg font-bold border-2 border-red-500/50 hover:bg-red-500/10 hover:border-red-500"
            >
              <X className="w-6 h-6 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleSwipe('approve')}
              disabled={isProcessing}
              className="flex-1 h-16 text-lg font-bold bg-gradient-neon hover:shadow-glow"
            >
              <Check className="w-6 h-6 mr-2" />
              Approve & Pay
            </Button>
          </div>
        </div>

        {/* Swipe Indicators (Tinder-style) */}
        {swipeDirection && (
          <div className={`absolute inset-0 flex items-center justify-center pointer-events-none ${
            swipeDirection === 'right' ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <div className={`text-6xl font-black ${
              swipeDirection === 'right' ? 'text-green-500' : 'text-red-500'
            }`}>
              {swipeDirection === 'right' ? '✓' : '✗'}
            </div>
          </div>
        )}
      </Card>

      {/* Navigation */}
      <div className="flex justify-center gap-4 mt-6">
        <Button
          onClick={goToPrevious}
          disabled={currentIndex === 0 || isProcessing}
          variant="outline"
          size="icon"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          onClick={goToNext}
          disabled={currentIndex === submissions.length - 1 || isProcessing}
          variant="outline"
          size="icon"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Keyboard Hints */}
      <div className="text-center mt-6 text-xs text-muted-foreground">
        <p>Swipe left to reject • Swipe right to approve & pay</p>
      </div>
    </div>
  );
}
