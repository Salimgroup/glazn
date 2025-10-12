import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RatingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  requestId: string;
  creatorId: string;
  requesterId: string;
  creatorName: string;
  existingRating?: {
    rating: number;
    review_text: string | null;
  };
}

export const RatingModal = ({
  open,
  onOpenChange,
  requestId,
  creatorId,
  requesterId,
  creatorName,
  existingRating,
}: RatingModalProps) => {
  const [rating, setRating] = useState(existingRating?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [reviewText, setReviewText] = useState(existingRating?.review_text || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please select a star rating before submitting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (existingRating) {
        const { error } = await supabase
          .from("bounty_ratings")
          .update({
            rating,
            review_text: reviewText || null,
            updated_at: new Date().toISOString(),
          })
          .eq("request_id", requestId)
          .eq("requester_id", requesterId);

        if (error) throw error;

        toast({
          title: "Rating updated",
          description: "Your rating has been updated successfully.",
        });
      } else {
        const { error } = await supabase
          .from("bounty_ratings")
          .insert({
            request_id: requestId,
            creator_id: creatorId,
            requester_id: requesterId,
            rating,
            review_text: reviewText || null,
          });

        if (error) throw error;

        toast({
          title: "Rating submitted",
          description: "Thank you for rating this creator!",
        });
      }

      onOpenChange(false);
    } catch (error) {
      console.error("Error submitting rating:", error);
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {existingRating ? "Update Rating" : "Rate Creator"}
          </DialogTitle>
          <DialogDescription>
            {existingRating
              ? `Update your rating for ${creatorName}`
              : `How was your experience with ${creatorName}?`}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="transition-transform hover:scale-110"
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoveredRating || rating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>

          <div>
            <Textarea
              placeholder="Share your experience (optional)..."
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">
              {reviewText.length}/500 characters
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || rating === 0}>
            {isSubmitting ? "Submitting..." : existingRating ? "Update" : "Submit Rating"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
