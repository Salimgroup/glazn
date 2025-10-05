import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UserPlus, UserMinus } from "lucide-react";

interface FollowButtonProps {
  userId: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
}

export const FollowButton = ({ 
  userId, 
  variant = "outline", 
  size = "sm",
  showIcon = true 
}: FollowButtonProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    checkFollowStatus();
  }, [userId]);

  const checkFollowStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("follows")
        .select("id")
        .eq("follower_id", user.id)
        .eq("following_id", userId)
        .maybeSingle();

      setIsFollowing(!!data);
    } catch (error) {
      console.error("Error checking follow status:", error);
    }
  };

  const handleFollow = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to follow users",
          variant: "destructive",
        });
        return;
      }

      if (user.id === userId) {
        toast({
          title: "Invalid Action",
          description: "You cannot follow yourself",
          variant: "destructive",
        });
        return;
      }

      if (isFollowing) {
        // Unfollow
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", userId);

        if (error) throw error;

        setIsFollowing(false);
        toast({
          title: "Unfollowed",
          description: "You have unfollowed this creator",
        });
      } else {
        // Follow
        const { error } = await supabase
          .from("follows")
          .insert({
            follower_id: user.id,
            following_id: userId,
          });

        if (error) throw error;

        setIsFollowing(true);
        toast({
          title: "Following",
          description: "You are now following this creator",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleFollow}
      disabled={loading}
    >
      {showIcon && (
        isFollowing ? <UserMinus className="h-4 w-4 mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />
      )}
      {isFollowing ? "Following" : "Follow"}
    </Button>
  );
};
