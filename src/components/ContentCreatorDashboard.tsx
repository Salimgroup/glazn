import { useState } from 'react';
import { DollarSign, Clock, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useContentCreatorRequests } from '@/hooks/useContentCreatorRequests';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalSubmissionModal } from './ExternalSubmissionModal';
import { toast } from 'sonner';

export function ContentCreatorDashboard() {
  const { requests, loading, error } = useContentCreatorRequests();
  const [showSubmission, setShowSubmission] = useState<{ id: string; title: string } | null>(null);

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
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-destructive">Error loading requests</p>
        </CardContent>
      </Card>
    );
  }

  if (!requests || requests.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground">No requests yet</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <Card key={request.id}>
          <CardHeader>
            <CardTitle className="text-lg">{request.title}</CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2">
              {request.description}
            </p>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <DollarSign className="w-4 h-4 text-primary" />
                  <span className="font-bold">${request.bounty}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">{request.deadline}</span>
                </div>
                <div className="flex items-center gap-1">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {request.is_anonymous ? 'Anonymous' : 'Requester'}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => setShowSubmission({ id: request.id, title: request.title })}
                size="sm"
              >
                Submit Content
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {showSubmission && (
        <ExternalSubmissionModal
          requestId={showSubmission.id}
          requestTitle={showSubmission.title}
          onClose={() => setShowSubmission(null)}
          onSubmit={() => {
            toast.success('Submission created successfully!');
            setShowSubmission(null);
          }}
        />
      )}
    </div>
  );
}
