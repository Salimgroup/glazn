import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface Rating {
  id: string;
  rating: number;
  review_text: string | null;
  created_at: string;
  requester: {
    display_name: string;
    avatar_url: string | null;
  };
}

interface CreatorRatingProps {
  creatorId: string;
}

export const CreatorRating = ({ creatorId }: CreatorRatingProps) => {
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRatings();
  }, [creatorId]);

  const fetchRatings = async () => {
    try {
      const { data, error } = await supabase
        .from("bounty_ratings")
        .select(`
          id,
          rating,
          review_text,
          created_at,
          requester:requester_id (
            display_name,
            avatar_url
          )
        `)
        .eq("creator_id", creatorId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        setRatings(data as any);
        setTotalRatings(data.length);
        
        if (data.length > 0) {
          const avg = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
          setAverageRating(Math.round(avg * 10) / 10);
        }
      }
    } catch (error) {
      console.error("Error fetching ratings:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading ratings...</div>;
  }

  if (totalRatings === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        No ratings yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
          <span className="text-2xl font-bold">{averageRating}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          {totalRatings} {totalRatings === 1 ? "rating" : "ratings"}
        </div>
      </div>

      <div className="space-y-3">
        {ratings.map((rating) => (
          <Card key={rating.id} className="p-4">
            <div className="flex items-start gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={rating.requester?.avatar_url || ""} />
                <AvatarFallback>
                  {rating.requester?.display_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{rating.requester?.display_name || "Anonymous"}</p>
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= rating.rating
                              ? "fill-yellow-400 text-yellow-400"
                              : "text-muted-foreground"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
                  </span>
                </div>
                
                {rating.review_text && (
                  <p className="text-sm text-muted-foreground">{rating.review_text}</p>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
