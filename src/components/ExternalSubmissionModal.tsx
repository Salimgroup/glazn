import { useState } from 'react';
import { X, Link, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ExternalSubmissionModalProps {
  requestId: string;
  requestTitle: string;
  onClose: () => void;
  onSubmit: () => void;
}

export function ExternalSubmissionModal({ 
  requestId, 
  requestTitle, 
  onClose,
  onSubmit 
}: ExternalSubmissionModalProps) {
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    externalUrl: '',
    platformName: '',
    title: '',
    description: '',
    previewNotes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.externalUrl || !formData.title) {
      toast.error('Please fill in required fields');
      return;
    }

    setSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error('You must be logged in to submit');
        return;
      }

      const { error } = await supabase
        .from('submissions')
        .insert({
          request_id: requestId,
          creator_id: user.id,
          submission_type: 'external_url',
          external_url: formData.externalUrl,
          platform_name: formData.platformName,
          title: formData.title,
          description: formData.description,
          preview_notes: formData.previewNotes,
          status: 'pending'
        });

      if (error) throw error;

      toast.success('Preview submission sent! Waiting for approval');
      onSubmit();
      onClose();
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Failed to submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-purple-100 bg-gradient-to-r from-purple-50 to-pink-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-2 rounded-lg">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Submit External Content</h2>
                <p className="text-sm text-gray-600">For: {requestTitle}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Content URL <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                type="url"
                value={formData.externalUrl}
                onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                placeholder="https://onlyfans.com/your-content-link"
                className="pl-10"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Link to your content on OnlyFans, Instagram, or other platforms
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Platform Name
            </label>
            <Input
              type="text"
              value={formData.platformName}
              onChange={(e) => setFormData({ ...formData, platformName: e.target.value })}
              placeholder="e.g., OnlyFans, Instagram, TikTok"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Submission Title <span className="text-red-500">*</span>
            </label>
            <Input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Brief title for this submission"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what's in this content..."
              rows={3}
              className="w-full px-4 py-2.5 border border-input rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview Notes (For Requester)
            </label>
            <textarea
              value={formData.previewNotes}
              onChange={(e) => setFormData({ ...formData, previewNotes: e.target.value })}
              placeholder="Add any notes about why this content matches their request..."
              rows={3}
              className="w-full px-4 py-2.5 border border-input rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-semibold text-blue-900 mb-1">Preview Submission</h4>
            <p className="text-xs text-blue-700">
              The requester will review your content link. If approved, you can use this as your deliverable.
              You'll be notified of their decision.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-600"
            >
              {submitting ? 'Submitting...' : 'Submit for Review'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}