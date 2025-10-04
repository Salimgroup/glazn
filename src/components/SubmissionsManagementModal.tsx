import { useState, useEffect } from 'react';
import { X, ExternalLink, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface Submission {
  id: string;
  external_url: string;
  platform_name: string;
  title: string;
  description: string;
  preview_notes: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  creator_id: string;
  rejection_reason?: string;
}

interface SubmissionsManagementModalProps {
  requestId: string;
  requestTitle: string;
  requestOwnerId: string; // SECURITY: Verify user authorization
  onClose: () => void;
}

export function SubmissionsManagementModal({ 
  requestId, 
  requestTitle,
  requestOwnerId, 
  onClose 
}: SubmissionsManagementModalProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // SECURITY: Verify current user is the request owner
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUserId(user?.id || null);
      
      if (user?.id !== requestOwnerId) {
        toast.error('Unauthorized: You can only manage submissions for your own requests');
        onClose();
      }
    };
    getCurrentUser();
  }, [requestOwnerId, onClose]);

  useEffect(() => {
    loadSubmissions();
  }, [requestId]);

  const loadSubmissions = async () => {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('request_id', requestId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSubmissions(data || []);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error loading submissions:', error);
      }
      toast.error('Failed to load submissions');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (submissionId: string) => {
    // SECURITY: Double-check authorization before approval
    if (currentUserId !== requestOwnerId) {
      toast.error('Unauthorized: You can only approve submissions for your own requests');
      return;
    }

    setActionLoading(submissionId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'approved',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString()
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Content approved! Creator can now use this as deliverable');
      loadSubmissions();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error approving:', error);
      }
      toast.error('Failed to approve submission');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (submissionId: string) => {
    // SECURITY: Double-check authorization before rejection
    if (currentUserId !== requestOwnerId) {
      toast.error('Unauthorized: You can only reject submissions for your own requests');
      return;
    }

    const reason = prompt('Optional: Reason for rejection?');
    
    setActionLoading(submissionId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from('submissions')
        .update({
          status: 'rejected',
          reviewed_by: user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: reason || null
        })
        .eq('id', submissionId);

      if (error) throw error;

      toast.success('Submission rejected');
      loadSubmissions();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Error rejecting:', error);
      }
      toast.error('Failed to reject submission');
    } finally {
      setActionLoading(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">
            <CheckCircle className="w-3 h-3" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full">
            <XCircle className="w-3 h-3" />
            Rejected
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full">
            <Clock className="w-3 h-3" />
            Pending Review
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50 sticky top-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Content Submissions</h2>
              <p className="text-sm text-gray-600">For: {requestTitle}</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="text-center py-12 text-gray-500">Loading submissions...</div>
          ) : submissions.length === 0 ? (
            <div className="text-center py-12">
              <ExternalLink className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No submissions yet</h3>
              <p className="text-gray-600">Creators haven't submitted any external content for review.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {submissions.map((submission) => (
                <div key={submission.id} className="border border-gray-200 rounded-xl p-4 hover:border-purple-200 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-bold text-lg text-gray-900">{submission.title}</h3>
                      {submission.platform_name && (
                        <p className="text-sm text-gray-500">Platform: {submission.platform_name}</p>
                      )}
                    </div>
                    {getStatusBadge(submission.status)}
                  </div>

                  {submission.description && (
                    <p className="text-sm text-gray-600 mb-3">{submission.description}</p>
                  )}

                  {submission.preview_notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                      <p className="text-xs font-semibold text-blue-900 mb-1">Creator's Notes:</p>
                      <p className="text-sm text-blue-700">{submission.preview_notes}</p>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-3">
                    <a
                      href={submission.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      View Content
                    </a>
                    <span className="text-xs text-gray-400">
                      {new Date(submission.created_at).toLocaleDateString()}
                    </span>
                  </div>

                  {submission.status === 'pending' && (
                    <div className="flex gap-2 pt-3 border-t border-gray-200">
                      <Button
                        onClick={() => handleApprove(submission.id)}
                        disabled={actionLoading === submission.id}
                        className="flex-1 bg-green-600 hover:bg-green-700"
                        size="sm"
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleReject(submission.id)}
                        disabled={actionLoading === submission.id}
                        variant="outline"
                        className="flex-1 border-red-300 text-red-600 hover:bg-red-50"
                        size="sm"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}

                  {submission.status === 'rejected' && submission.rejection_reason && (
                    <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
                      <p className="text-xs font-semibold text-red-900 mb-1">Rejection Reason:</p>
                      <p className="text-sm text-red-700">{submission.rejection_reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}