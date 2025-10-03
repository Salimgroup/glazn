import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Send } from 'lucide-react';

interface ContributeToBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
  currentBounty: number;
}

export function ContributeToBountyModal({
  isOpen,
  onClose,
  requestId,
  requestTitle,
  currentBounty,
}: ContributeToBountyModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const contributionAmount = parseFloat(amount);
    
    if (!contributionAmount || contributionAmount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid contribution amount',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('bounty_contributions')
        .insert({
          request_id: requestId,
          contributor_id: user.id,
          amount: contributionAmount,
          message: message.trim() || null,
        });

      if (error) throw error;

      toast({
        title: 'Contribution sent!',
        description: 'Your contribution request has been sent to the bounty owner for approval.',
      });

      setAmount('');
      setMessage('');
      onClose();
    } catch (error) {
      console.error('Error submitting contribution:', error);
      toast({
        title: 'Failed to contribute',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-2 border-neon-cyan/40 shadow-cyan max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-neon bg-clip-text text-transparent">
            Contribute to Bounty
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Add to the bounty for "{requestTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="bg-gradient-space/30 p-4 rounded-xl border border-neon-purple/30">
            <p className="text-sm text-muted-foreground mb-1">Current Bounty</p>
            <p className="text-2xl font-bold text-neon-yellow">
              ${currentBounty.toLocaleString()}
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your Contribution Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                min="1"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                className="pl-10 bg-background/50 border-neon-cyan/30 focus:border-neon-cyan"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Message (Optional)
            </label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Add a message to the bounty owner..."
              className="bg-background/50 border-neon-cyan/30 focus:border-neon-cyan resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 border-neon-purple/40 hover:bg-neon-purple/10"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !amount}
              className="flex-1 bg-gradient-neon shadow-neon hover:shadow-glow"
            >
              {isSubmitting ? (
                'Sending...'
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Send Request
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
