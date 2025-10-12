import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ExternalLink, Eye, Globe, Lock, Trash2 } from "lucide-react";
import { ShareButton } from "@/components/ShareButton";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

interface ContentPost {
  id: string;
  title: string;
  description?: string;
  external_url?: string;
  platform_name?: string;
  is_public: boolean;
  view_count: number;
  created_at: string;
  creator_id: string;
  creator: {
    display_name: string;
    username: string;
  };
}

export const ContentCollection = () => {
  const [content, setContent] = useState<ContentPost[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("content_posts")
        .select(`
          *,
          profiles!content_posts_creator_id_fkey (
            display_name,
            username
          )
        `)
        .eq("owner_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      // Map the data to match our interface
      const mappedData = (data || []).map(post => ({
        ...post,
        creator: post.profiles
      }));
      
      setContent(mappedData as any);
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

  useEffect(() => {
    fetchContent();
  }, []);

  const togglePublic = async (postId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("content_posts")
        .update({ is_public: !currentStatus })
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Updated",
        description: `Content is now ${!currentStatus ? "public" : "private"}`,
      });
      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const deletePost = async (postId: string) => {
    try {
      const { error } = await supabase
        .from("content_posts")
        .delete()
        .eq("id", postId);

      if (error) throw error;

      toast({
        title: "Deleted",
        description: "Content removed from your collection",
      });
      fetchContent();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your collection...</div>;
  }

  if (content.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Content Collection</CardTitle>
          <CardDescription>
            Approved bounty content you own will appear here
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            No content in your collection yet. Approve bounties to start building your portfolio!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Your Content Collection</h2>
          <p className="text-muted-foreground">
            {content.length} {content.length === 1 ? "piece" : "pieces"} of content
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {content.map((post) => (
          <Card key={post.id} className="overflow-hidden">
            <CardHeader>
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">{post.title}</CardTitle>
                {post.is_public ? (
                  <Badge variant="secondary" className="shrink-0">
                    <Globe className="h-3 w-3 mr-1" />
                    Public
                  </Badge>
                ) : (
                  <Badge variant="outline" className="shrink-0">
                    <Lock className="h-3 w-3 mr-1" />
                    Private
                  </Badge>
                )}
              </div>
              <CardDescription className="flex items-center gap-2 text-xs">
                By {post.creator.display_name}
                {post.platform_name && (
                  <Badge variant="outline" className="text-xs">
                    {post.platform_name}
                  </Badge>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Eye className="h-4 w-4" />
                {post.view_count} views
              </div>

              <div className="flex gap-2">
                {post.external_url && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => window.open(post.external_url, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4 mr-1" />
                    View
                  </Button>
                )}
                <ShareButton
                  title={post.title}
                  description={post.description}
                  url={`/@${post.creator.username}`}
                  type="content"
                  size="sm"
                  variant="outline"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => togglePublic(post.id, post.is_public)}
                >
                  {post.is_public ? <Lock className="h-4 w-4" /> : <Globe className="h-4 w-4" />}
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="outline">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Content</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure? This will remove the content from your collection permanently.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deletePost(post.id)}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
