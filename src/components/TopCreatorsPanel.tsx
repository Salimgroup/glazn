import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Trophy, TrendingUp, Users } from "lucide-react";
import { FollowButton } from "./FollowButton";
import { useNavigate } from "react-router-dom";

interface TopCreator {
  id: string;
  username: string;
  display_name: string;
  avatar_url?: string;
  follower_count: number;
  content_count: number;
  bounties_completed: number;
  verified: boolean;
}

export const TopCreatorsPanel = () => {
  const [creators, setCreators] = useState<TopCreator[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopCreators();
  }, []);

  const fetchTopCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("profile_stats")
        .select("*")
        .eq("is_content_creator", true)
        .order("follower_count", { ascending: false })
        .limit(10);

      if (error) throw error;
      setCreators(data || []);
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

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Top Creators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-500" />
          Top Creators
        </CardTitle>
        <CardDescription>
          Creators with the most followers and quality content
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {creators.map((creator, index) => (
            <div
              key={creator.id}
              className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer"
              onClick={() => navigate(`/profile/${creator.username}`)}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="relative">
                  {index < 3 && (
                    <div className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center text-xs font-bold text-white">
                      {index + 1}
                    </div>
                  )}
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={creator.avatar_url} alt={creator.display_name} />
                    <AvatarFallback>
                      {creator.display_name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-sm truncate">
                      {creator.display_name}
                    </p>
                    {creator.verified && (
                      <Badge variant="secondary" className="h-5 px-1.5 text-xs">
                        ✓
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {creator.follower_count}
                    </span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {creator.bounties_completed}
                    </span>
                  </div>
                </div>
              </div>

              <div onClick={(e) => e.stopPropagation()}>
                <FollowButton userId={creator.id} size="sm" showIcon={false} />
              </div>
            </div>
          ))}

          {creators.length === 0 && (
            <p className="text-center text-muted-foreground py-4">
              No creators yet. Be the first to build your reputation!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
