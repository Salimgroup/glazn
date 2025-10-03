import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Check, X, DollarSign, MessageSquare, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Contribution {
  id: string;
  contributor_id: string;
  amount: number;
  message: string | null;
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
}

interface ContributionsManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  requestId: string;
  requestTitle: string;
}

export function ContributionsManagementModal({
  isOpen,
  onClose,
  requestId,
  requestTitle,
}: ContributionsManagementModalProps) {
  const [contributions, setContributions] = useState<Contribution[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen) {
      loadContributions();
    }
  }, [isOpen, requestId]);

  const loadContributions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('bounty_contributions')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setContributions((data || []) as Contribution[]);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading contributions:', error);
      }
      toast({
        title: 'Failed to load contributions',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (contributionId: string, status: 'accepted' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('bounty_contributions')
        .update({ status })
        .eq('id', contributionId);

      if (error) throw error;

      toast({
        title: status === 'accepted' ? 'Contribution accepted' : 'Contribution rejected',
        description: `You have ${status} this contribution.`,
      });

      loadContributions();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error updating contribution:', error);
      }
      toast({
        title: 'Failed to update contribution',
        description: error instanceof Error ? error.message : 'An error occurred',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'accepted':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/40">Accepted</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/40">Rejected</Badge>;
      default:
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/40">Pending</Badge>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-2 border-neon-pink/40 shadow-neon max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-neon bg-clip-text text-transparent">
            Manage Contributions
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Review and manage contribution requests for "{requestTitle}"
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 mt-4">
          {isLoading ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="w-8 h-8 animate-spin mx-auto mb-2" />
              Loading contributions...
            </div>
          ) : contributions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No contributions yet</p>
            </div>
          ) : (
            contributions.map((contribution) => (
              <div
                key={contribution.id}
                className="bg-gradient-space/30 p-4 rounded-xl border border-neon-purple/30 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-neon-yellow" />
                      <span className="text-xl font-bold text-neon-yellow">
                        ${contribution.amount.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(contribution.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {getStatusBadge(contribution.status)}
                </div>

                {contribution.message && (
                  <div className="bg-background/30 p-3 rounded-lg">
                    <div className="flex items-start gap-2">
                      <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5" />
                      <p className="text-sm text-foreground">{contribution.message}</p>
                    </div>
                  </div>
                )}

                {contribution.status === 'pending' && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(contribution.id, 'accepted')}
                      className="flex-1 bg-green-500/20 hover:bg-green-500/30 text-green-400 border border-green-500/40"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(contribution.id, 'rejected')}
                      className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/40"
                    >
                      <X className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="pt-4 border-t border-neon-purple/30">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-neon shadow-neon hover:shadow-glow"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
