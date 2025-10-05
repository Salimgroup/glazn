import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, LogOut, Wallet, Search, DollarSign, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ExternalSubmissionModal } from '@/components/ExternalSubmissionModal';
import { SubmissionsManagementModal } from '@/components/SubmissionsManagementModal';
import { UserAvatar } from '@/components/UserAvatar';
import { NotificationBell } from '@/components/NotificationBell';
import { ContentCollection } from '@/components/ContentCollection';
import { TopCreatorsPanel } from '@/components/TopCreatorsPanel';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface Request {
  id: string;
  title: string;
  description: string;
  bounty: number;
  category: string;
  deadline: string;
  status: string;
  is_anonymous: boolean;
  created_at: string;
  user_id: string;
}

export default function Index() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  const [activeTab, setActiveTab] = useState('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [requests, setRequests] = useState<Request[]>([]);
  const [myRequests, setMyRequests] = useState<Request[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showExternalSubmission, setShowExternalSubmission] = useState<{ id: string; title: string } | null>(null);
  const [showSubmissionsManagement, setShowSubmissionsManagement] = useState<{ id: string; title: string; userId: string } | null>(null);

  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    bounty: '',
    category: 'Photography',
    deadline: '7'
  });

  const categories = ['All', 'Photography', 'Video', 'Digital Art', 'Graphic Design', '3D Rendering', 'Animation', 'Writing', 'Music'];

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchMyRequests();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('status', 'open')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests((data || []) as Request[]);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoadingRequests(false);
    }
  };

  const fetchMyRequests = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMyRequests((data || []) as Request[]);
    } catch (error) {
      console.error('Error fetching my requests:', error);
    }
  };

  const handleCreateRequest = async () => {
    if (!newRequest.title || !newRequest.description || !newRequest.bounty) {
      toast.error('Please fill in all required fields');
      return;
    }

    const bountyAmount = parseFloat(newRequest.bounty);
    if (isNaN(bountyAmount) || bountyAmount <= 0) {
      toast.error('Please enter a valid bounty amount');
      return;
    }

    try {
      const { data, error } = await supabase.functions.invoke('create-bounty-with-payment', {
        body: {
          title: newRequest.title,
          description: newRequest.description,
          bounty: bountyAmount,
          category: newRequest.category,
          deadline: `${newRequest.deadline} days`,
          is_anonymous: false
        }
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      toast.success(`Bounty posted! Payment of $${bountyAmount} processed`);
      setShowCreateModal(false);
      setNewRequest({ title: '', description: '', bounty: '', category: 'Photography', deadline: '7' });
      fetchRequests();
      fetchMyRequests();
    } catch (error: any) {
      console.error('Error creating bounty:', error);
      const errorMsg = error.message || 'Failed to create bounty';
      
      if (errorMsg.includes('Insufficient balance') || errorMsg.includes('Wallet not found')) {
        toast.error('Please deposit funds to your wallet first');
        setTimeout(() => navigate('/wallet'), 2000);
      } else {
        toast.error(errorMsg);
      }
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = 
      selectedCategory === 'All' || request.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-space flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Header */}
      <header className="bg-card/40 backdrop-blur-xl border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <UserAvatar ethnicity="mixed" size="md" />
              <h1 className="text-xl font-black bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                Glazn
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <NotificationBell />
              <Button
                onClick={() => navigate('/wallet')}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Wallet className="w-4 h-4" />
                Wallet
              </Button>
              <Button
                onClick={async () => {
                  await signOut();
                  toast.success('Signed out successfully');
                  navigate('/auth');
                }}
                variant="outline"
                size="icon"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="browse">Browse Bounties</TabsTrigger>
              <TabsTrigger value="my-requests">My Requests</TabsTrigger>
            </TabsList>

            <Button
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Post Bounty
            </Button>
          </div>

          {/* Browse Bounties Tab */}
          <TabsContent value="browse" className="space-y-4">
            {/* Filters */}
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search bounties..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Bounties Grid */}
            {loadingRequests ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto" />
              </div>
            ) : filteredRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">No bounties found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {filteredRequests.map(request => (
                  <Card key={request.id} className="hover:border-primary/50 transition-colors">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{request.title}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.description}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="font-bold text-foreground">${request.bounty}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{request.deadline}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{request.is_anonymous ? 'Anonymous' : 'Requester'}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowExternalSubmission({ id: request.id, title: request.title })}
                          size="sm"
                        >
                          Submit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Top Creators Sidebar */}
            <div className="mt-8">
              <TopCreatorsPanel />
            </div>
          </TabsContent>

          {/* My Requests Tab */}
          <TabsContent value="my-requests" className="space-y-4">
            {myRequests.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground mb-4">You haven't posted any bounties yet</p>
                  <Button onClick={() => setShowCreateModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Post Your First Bounty
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {myRequests.map(request => (
                  <Card key={request.id}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{request.title}</CardTitle>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.description}
                          </p>
                        </div>
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          request.status === 'open' ? 'bg-green-500/20 text-green-500' : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {request.status}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4 text-primary" />
                            <span className="font-bold text-foreground">${request.bounty}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{request.deadline}</span>
                          </div>
                        </div>
                        <Button
                          onClick={() => setShowSubmissionsManagement({ 
                            id: request.id, 
                            title: request.title,
                            userId: request.user_id 
                          })}
                          size="sm"
                          variant="outline"
                        >
                          Manage Submissions
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Content Collection */}
            {user && (
              <div className="mt-8">
                <ContentCollection />
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Create Bounty Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Post a New Bounty</DialogTitle>
            <DialogDescription>
              Create a request for content. Funds will be held in escrow until you approve a submission.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 mt-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Title</label>
              <Input
                placeholder="E.g., Sunset Beach Photography"
                value={newRequest.title}
                onChange={(e) => setNewRequest({ ...newRequest, title: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <Textarea
                placeholder="Describe what you're looking for..."
                value={newRequest.description}
                onChange={(e) => setNewRequest({ ...newRequest, description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={newRequest.category} onValueChange={(value) => setNewRequest({ ...newRequest, category: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.filter(c => c !== 'All').map(cat => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Bounty Amount ($)</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={newRequest.bounty}
                  onChange={(e) => setNewRequest({ ...newRequest, bounty: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Deadline (days)</label>
              <Select value={newRequest.deadline} onValueChange={(value) => setNewRequest({ ...newRequest, deadline: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">7 days</SelectItem>
                  <SelectItem value="14">14 days</SelectItem>
                  <SelectItem value="30">30 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleCreateRequest} className="flex-1">
                Post Bounty
              </Button>
              <Button onClick={() => setShowCreateModal(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modals */}
      {showExternalSubmission && (
        <ExternalSubmissionModal
          requestId={showExternalSubmission.id}
          requestTitle={showExternalSubmission.title}
          onClose={() => setShowExternalSubmission(null)}
          onSubmit={() => {
            toast.success('Submission created successfully!');
            setShowExternalSubmission(null);
          }}
        />
      )}

      {showSubmissionsManagement && (
        <SubmissionsManagementModal
          requestId={showSubmissionsManagement.id}
          requestTitle={showSubmissionsManagement.title}
          requestOwnerId={showSubmissionsManagement.userId}
          onClose={() => setShowSubmissionsManagement(null)}
        />
      )}
    </div>
  );
}
