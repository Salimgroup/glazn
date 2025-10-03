import { Star, DollarSign, MapPin, Clock, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useContentCreatorRequests } from '@/hooks/useContentCreatorRequests';
import { Skeleton } from '@/components/ui/skeleton';

export function ContentCreatorDashboard() {
  const { requests, loading, error } = useContentCreatorRequests();

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-xl p-6 text-center">
        <p className="text-destructive font-medium">Error loading requests</p>
        <p className="text-sm text-muted-foreground mt-2">{error}</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="bg-card/60 backdrop-blur-xl rounded-2xl border-2 border-neon-cyan/40 p-12 text-center">
        <Star className="w-16 h-16 text-neon-cyan mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-bold text-foreground mb-2">
          No Requests Yet
        </h3>
        <p className="text-muted-foreground">
          You haven't received any content requests yet. When someone targets you for content, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-neon-cyan to-neon-pink bg-clip-text text-transparent">
            Your Content Requests
          </h2>
          <p className="text-muted-foreground text-sm mt-1">
            Requests specifically targeted to your profile
          </p>
        </div>
        <Badge variant="outline" className="border-neon-cyan/40 text-neon-cyan text-lg px-4 py-2">
          {requests.length} Active
        </Badge>
      </div>

      <div className="grid gap-4">
        {requests.map((request) => (
          <Card
            key={request.id}
            className="bg-card/80 backdrop-blur-xl border-2 border-neon-pink/40 hover:border-neon-cyan/60 transition-all p-6 hover:shadow-cyan"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-foreground">
                    {request.title}
                  </h3>
                  <Badge variant="outline" className="border-neon-yellow/40 text-neon-yellow">
                    {request.category}
                  </Badge>
                  {request.status === 'open' && (
                    <Badge className="bg-green-500/20 text-green-500 border-green-500/40">
                      Open
                    </Badge>
                  )}
                </div>
                <p className="text-muted-foreground text-sm">
                  {request.description}
                </p>
              </div>
              <div className="text-right ml-4">
                <div className="flex items-center gap-2 text-neon-yellow mb-1">
                  <DollarSign className="w-5 h-5" />
                  <span className="text-2xl font-black">${request.bounty}</span>
                </div>
                <span className="text-xs text-neon-yellow/70 font-medium">Bounty</span>
              </div>
            </div>

            <div className="flex items-center gap-6 mb-4 text-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="w-4 h-4" />
                <span className="font-medium">
                  {request.is_anonymous ? '🕶️ Anonymous' : request.requester_name}
                </span>
              </div>
              {request.platform && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="w-4 h-4" />
                  <span>{request.platform}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="w-4 h-4" />
                <span>Deadline: {request.deadline}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                className="flex-1 bg-gradient-neon text-white font-bold shadow-neon hover:shadow-glow transition-all"
              >
                Submit Content
              </Button>
              <Button
                variant="outline"
                className="border-neon-cyan/40 hover:bg-neon-cyan/10"
              >
                View Details
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
