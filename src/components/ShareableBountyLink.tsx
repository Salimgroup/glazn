import React, { useState } from 'react';
import { Link as LinkIcon, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ShareableBountyLinkProps {
  bountyId: number;
  bountyTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export const ShareableBountyLink: React.FC<ShareableBountyLinkProps> = ({
  bountyId,
  bountyTitle,
  isOpen,
  onClose
}) => {
  const [copied, setCopied] = useState(false);
  
  const shareUrl = `${window.location.origin}/bounty/${bountyId}`;
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card/95 backdrop-blur-xl border-2 border-neon-cyan/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent flex items-center gap-2">
            <LinkIcon className="w-6 h-6 text-neon-cyan" />
            Share Bounty
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Share this bounty with creators outside the platform
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="bg-muted/50 rounded-xl p-4 border border-border">
            <p className="text-sm text-muted-foreground mb-2">Bounty Title</p>
            <p className="font-bold text-foreground">{bountyTitle}</p>
          </div>
          
          <div className="bg-gradient-to-r from-neon-cyan/10 to-neon-pink/10 rounded-xl p-4 border-2 border-neon-cyan/40">
            <p className="text-sm text-muted-foreground mb-2">Shareable Link</p>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={shareUrl}
                readOnly
                className="flex-1 bg-input border border-border rounded-lg px-3 py-2 text-sm text-foreground font-mono"
              />
              <Button
                onClick={handleCopy}
                className="bg-gradient-to-r from-neon-cyan to-neon-purple hover:from-neon-purple hover:to-neon-cyan shrink-0"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <div className="bg-neon-yellow/10 rounded-xl p-4 border border-neon-yellow/40">
            <p className="text-xs text-neon-yellow font-bold uppercase tracking-wider mb-2">
              💡 How it works
            </p>
            <ul className="text-sm text-foreground space-y-1 list-disc list-inside">
              <li>Recipients can view bounty details without signing up</li>
              <li>They'll need to create an account to submit</li>
              <li>Track all submissions in your dashboard</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
