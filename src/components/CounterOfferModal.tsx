import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CounterOfferModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  originalBounty: number;
  requestTitle: string;
  onSuccess?: () => void;
}

export function CounterOfferModal({ 
  open, 
  onOpenChange, 
  requestId, 
  originalBounty, 
  requestTitle,
  onSuccess 
}: CounterOfferModalProps) {
  const [counterAmount, setCounterAmount] = useState<string>('');
  const [message, setMessage] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(counterAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'Invalid amount',
        description: 'Please enter a valid counter-offer amount',
        variant: 'destructive',
      });
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase
        .from('requests')
        .update({
          counter_offer_amount: amount,
          counter_offer_status: 'pending',
          counter_offered_at: new Date().toISOString(),
        })
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: 'Counter-offer submitted!',
        description: `Your counter-offer of $${amount.toLocaleString()} has been sent to the requester.`,
      });

      onOpenChange(false);
      setCounterAmount('');
      setMessage('');
      onSuccess?.();
    } catch (error) {
      console.error('Error submitting counter-offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit counter-offer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const difference = counterAmount ? parseFloat(counterAmount) - originalBounty : 0;
  const percentChange = counterAmount ? ((difference / originalBounty) * 100).toFixed(1) : '0';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-2 border-neon-cyan/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
            Submit Counter-Offer
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Propose a different bounty amount for: <span className="font-semibold text-foreground">{requestTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <div className="bg-muted/50 border-2 border-neon-yellow/40 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Original Bounty</p>
                <p className="text-2xl font-black text-neon-yellow">
                  ${originalBounty.toLocaleString()}
                </p>
              </div>
              {counterAmount && (
                <div className="text-right">
                  <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                    {difference >= 0 ? 'Increase' : 'Decrease'}
                  </p>
                  <p className={`text-xl font-black ${difference >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {difference >= 0 ? '+' : ''}{percentChange}%
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="counter-amount" className="text-foreground font-semibold">
              Your Counter-Offer Amount
            </Label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                id="counter-amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter amount"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                className="pl-10 text-lg font-bold border-2 border-border focus:border-neon-cyan"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-foreground font-semibold">
              Message (Optional)
            </Label>
            <Textarea
              id="message"
              placeholder="Explain your counter-offer reasoning..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="min-h-[100px] border-2 border-border focus:border-neon-cyan resize-none"
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground text-right">
              {message.length}/500 characters
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border hover:bg-muted"
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !counterAmount}
              className="flex-1 bg-gradient-neon text-white font-bold shadow-neon hover:shadow-glow"
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              {submitting ? 'Submitting...' : 'Submit Counter-Offer'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
