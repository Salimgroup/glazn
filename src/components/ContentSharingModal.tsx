import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Share2, Lock } from "lucide-react";

interface ContentSharingModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  requestId: string;
  creatorId: string;
  title: string;
  externalUrl?: string;
  platformName?: string;
  onApprovalComplete: () => void;
}

export const ContentSharingModal = ({
  isOpen,
  onClose,
  submissionId,
  requestId,
  creatorId,
  title,
  externalUrl,
  platformName,
  onApprovalComplete,
}: ContentSharingModalProps) => {
  const [allowOwnerReshare, setAllowOwnerReshare] = useState(true);
  const [allowPublicShare, setAllowPublicShare] = useState(false);
  const [sharingTerms, setSharingTerms] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      // Update submission with sharing permissions
      const { error: submissionError } = await supabase
        .from("submissions")
        .update({
          status: "approved",
          allow_owner_reshare: allowOwnerReshare,
          allow_public_share: allowPublicShare,
          sharing_terms: sharingTerms || null,
          reviewed_at: new Date().toISOString(),
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
        })
        .eq("id", submissionId);

      if (submissionError) throw submissionError;

      // Create content post if owner reshare is allowed
      if (allowOwnerReshare) {
        const { data: { user } } = await supabase.auth.getUser();
        const { error: postError } = await supabase
          .from("content_posts")
          .insert({
            owner_id: user?.id,
            submission_id: submissionId,
            request_id: requestId,
            creator_id: creatorId,
            title,
            external_url: externalUrl,
            platform_name: platformName,
            is_public: allowPublicShare,
          });

        if (postError) throw postError;
      }

      toast({
        title: "Submission Approved",
        description: "Content has been approved with sharing permissions set.",
      });

      onApprovalComplete();
      onClose();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            Content Sharing Permissions
          </DialogTitle>
          <DialogDescription>
            Set how this content can be shared after approval
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex items-start space-x-3">
            <Checkbox
              id="owner-reshare"
              checked={allowOwnerReshare}
              onCheckedChange={(checked) => setAllowOwnerReshare(checked as boolean)}
            />
            <div className="space-y-1">
              <Label htmlFor="owner-reshare" className="text-sm font-medium cursor-pointer">
                Add to My Collection
              </Label>
              <p className="text-sm text-muted-foreground">
                Add this content to your profile collection for display and reposting
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-3">
            <Checkbox
              id="public-share"
              checked={allowPublicShare}
              onCheckedChange={(checked) => setAllowPublicShare(checked as boolean)}
              disabled={!allowOwnerReshare}
            />
            <div className="space-y-1">
              <Label
                htmlFor="public-share"
                className={`text-sm font-medium ${!allowOwnerReshare ? 'opacity-50' : 'cursor-pointer'}`}
              >
                Allow Public Sharing
              </Label>
              <p className="text-sm text-muted-foreground">
                Let others see and share this content publicly
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="terms" className="text-sm font-medium">
              Sharing Terms (Optional)
            </Label>
            <Textarea
              id="terms"
              placeholder="Add any specific terms or conditions for content usage..."
              value={sharingTerms}
              onChange={(e) => setSharingTerms(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {!allowOwnerReshare && (
            <div className="flex items-start gap-2 p-3 bg-muted rounded-lg">
              <Lock className="h-4 w-4 mt-0.5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Content will be approved but not added to your collection. Creator retains exclusive rights.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button onClick={handleApprove} disabled={isProcessing}>
            {isProcessing ? "Processing..." : "Approve & Set Permissions"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
