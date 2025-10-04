import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { DollarSign, Check, X, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface CounterOfferResponseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  requestTitle: string;
  originalBounty: number;
  counterOfferAmount: number;
  onSuccess?: () => void;
}

export function CounterOfferResponseModal({ 
  open, 
  onOpenChange, 
  requestId,
  requestTitle,
  originalBounty, 
  counterOfferAmount,
  onSuccess 
}: CounterOfferResponseModalProps) {
  const [responding, setResponding] = useState(false);

  const handleResponse = async (accept: boolean) => {
    setResponding(true);

    try {
      const updateData: any = {
        counter_offer_status: accept ? 'accepted' : 'rejected',
      };

      // If accepting, update the bounty to the counter-offer amount
      if (accept) {
        updateData.bounty = counterOfferAmount;
      }

      const { error } = await supabase
        .from('requests')
        .update(updateData)
        .eq('id', requestId);

      if (error) throw error;

      toast({
        title: accept ? 'Counter-offer accepted!' : 'Counter-offer rejected',
        description: accept 
          ? `The bounty has been updated to $${counterOfferAmount.toLocaleString()}`
          : 'The original bounty amount remains unchanged.',
      });

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      console.error('Error responding to counter-offer:', error);
      toast({
        title: 'Error',
        description: 'Failed to respond to counter-offer. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setResponding(false);
    }
  };

  const difference = counterOfferAmount - originalBounty;
  const percentChange = ((difference / originalBounty) * 100).toFixed(1);
  const isIncrease = difference > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-card/95 backdrop-blur-xl border-2 border-neon-yellow/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-neon-yellow to-neon-pink bg-clip-text text-transparent">
            Counter-Offer Received
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            The content creator has proposed a different amount for: <span className="font-semibold text-foreground">{requestTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 border-2 border-border rounded-xl p-4">
              <p className="text-xs text-muted-foreground uppercase tracking-wider mb-2">Original Bounty</p>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-muted-foreground" />
                <p className="text-2xl font-black text-foreground">
                  {originalBounty.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="bg-neon-yellow/10 border-2 border-neon-yellow/40 rounded-xl p-4">
              <p className="text-xs text-neon-yellow uppercase tracking-wider mb-2">Counter-Offer</p>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-neon-yellow" />
                <p className="text-2xl font-black text-neon-yellow">
                  {counterOfferAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className={`rounded-xl p-4 border-2 ${isIncrease ? 'bg-red-500/10 border-red-500/40' : 'bg-green-500/10 border-green-500/40'}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-xs uppercase tracking-wider font-semibold ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                  {isIncrease ? 'Increase Requested' : 'Savings Offered'}
                </p>
                <p className={`text-lg font-black mt-1 ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                  {isIncrease ? '+' : ''}{percentChange}%
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground uppercase tracking-wider">Difference</p>
                <p className={`text-xl font-black ${isIncrease ? 'text-red-500' : 'text-green-500'}`}>
                  {isIncrease ? '+' : ''}${Math.abs(difference).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-muted/30 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> If you accept this counter-offer, 
              the bounty amount will be updated to ${counterOfferAmount.toLocaleString()} and funds will be adjusted accordingly.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              onClick={() => handleResponse(false)}
              variant="outline"
              className="flex-1 border-red-500/40 text-red-500 hover:bg-red-500/10"
              disabled={responding}
            >
              <X className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => handleResponse(true)}
              className="flex-1 bg-gradient-to-r from-neon-yellow to-neon-pink text-white font-bold shadow-neon hover:shadow-glow"
              disabled={responding}
            >
              <Check className="w-4 h-4 mr-2" />
              {responding ? 'Processing...' : 'Accept Counter-Offer'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
