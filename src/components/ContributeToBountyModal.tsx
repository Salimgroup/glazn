import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { DollarSign, Users } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface ContributeToBountyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bountyId: string;
  bountyTitle: string;
  currentBounty: number;
  minimumContribution?: number;
}

export const ContributeToBountyModal = ({
  open,
  onOpenChange,
  bountyId,
  bountyTitle,
  currentBounty,
  minimumContribution = 1
}: ContributeToBountyModalProps) => {
  const navigate = useNavigate();
  const [amount, setAmount] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleContribute = async () => {
    const contributionAmount = parseFloat(amount);
    
    if (!contributionAmount || contributionAmount < minimumContribution) {
      toast.error(`Minimum contribution is $${minimumContribution}`);
      return;
    }

    setIsSubmitting(true);

    try {
      const { data, error } = await supabase.functions.invoke('contribute-to-bounty', {
        body: {
          request_id: bountyId,
          amount: contributionAmount,
          message: message || null
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(`Successfully contributed $${contributionAmount} to the bounty!`);
      onOpenChange(false);
      setAmount('');
      setMessage('');
    } catch (error: any) {
      console.error('Error contributing to bounty:', error);
      const errorMsg = error.message || 'Failed to contribute to bounty';
      
      if (errorMsg.includes('Insufficient balance') || errorMsg.includes('Wallet not found')) {
        toast.error('Please deposit funds to your wallet first');
        setTimeout(() => navigate('/wallet'), 2000);
      } else {
        toast.error(errorMsg);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Contribute to Bounty
          </DialogTitle>
          <DialogDescription>
            Split this bounty by adding your own contribution. The creator will receive the combined total.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4">
            <h3 className="font-semibold mb-1">{bountyTitle}</h3>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <DollarSign className="w-4 h-4 text-primary" />
              <span>Current Bounty: <span className="font-bold text-foreground">${currentBounty}</span></span>
            </div>
            {minimumContribution > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                Minimum contribution: ${minimumContribution}
              </p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Your Contribution Amount ($)</label>
            <Input
              type="number"
              placeholder={`Min: ${minimumContribution}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={minimumContribution}
              step="0.01"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Message (Optional)</label>
            <Textarea
              placeholder="Add a note with your contribution..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>

          {amount && parseFloat(amount) >= minimumContribution && (
            <div className="bg-primary/10 rounded-lg p-3 border border-primary/20">
              <p className="text-sm font-medium">New Total Bounty</p>
              <p className="text-2xl font-bold text-primary">
                ${(currentBounty + parseFloat(amount)).toFixed(2)}
              </p>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={() => onOpenChange(false)}
              variant="outline"
              className="flex-1"
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleContribute}
              className="flex-1"
              disabled={isSubmitting || !amount}
            >
              {isSubmitting ? 'Processing...' : `Contribute $${amount || '0'}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
