import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { DollarSign, Send } from 'lucide-react';
import { contributionSchema } from '@/lib/validation';

interface ContributeToBountyModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
  currentBounty: number;
  minimumContribution?: number;
}

export function ContributeToBountyModal({
  isOpen,
  onClose,
  requestId,
  requestTitle,
  currentBounty,
  minimumContribution = 0,
}: ContributeToBountyModalProps) {
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    const contributionAmount = parseFloat(amount);
    
    // Validate with Zod schema
    const validation = contributionSchema.safeParse({
      amount: contributionAmount,
      message: message || undefined,
    });

    if (!validation.success) {
      const firstError = validation.error.issues[0];
      toast({
        title: 'Validation Error',
        description: firstError.message,
        variant: 'destructive',
      });
      return;
    }

    // Additional minimum contribution check
    if (minimumContribution > 0 && contributionAmount < minimumContribution) {
      toast({
        title: 'Amount too low',
        description: `Minimum contribution is $${minimumContribution}`,
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
          amount: validation.data.amount,
          message: validation.data.message || null,
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
      toast({
        title: 'Failed to contribute',
        description: 'An error occurred while processing your contribution',
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
            {minimumContribution > 0 && (
              <div className="mt-3 pt-3 border-t border-neon-purple/30">
                <p className="text-xs text-muted-foreground mb-1">Minimum Contribution Required</p>
                <p className="text-lg font-bold text-neon-cyan">
                  ${minimumContribution.toLocaleString()}
                </p>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground">
              Your Contribution Amount
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="number"
                min={minimumContribution || 1}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={minimumContribution > 0 ? `Min: $${minimumContribution}` : "Enter amount"}
                className="pl-10 bg-background/50 border-neon-cyan/30 focus:border-neon-cyan"
                maxLength={10}
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
              maxLength={1000}
            />
            <p className="text-xs text-muted-foreground">{message.length}/1000 characters</p>
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
