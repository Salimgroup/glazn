import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity, TrendingUp, Award, DollarSign, Target } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ActivityItem {
  id: string;
  user_id: string;
  activity_type: string;
  title: string;
  description: string | null;
  created_at: string;
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    loadActivities();

    const channel = supabase
      .channel('activity-feed')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'activity_feed'
        },
        (payload) => {
          setActivities(prev => [payload.new as ActivityItem, ...prev].slice(0, 10));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadActivities = async () => {
    const { data } = await supabase
      .from('activity_feed')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    if (data) setActivities(data);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'bounty_posted':
        return <Target className="w-4 h-4 text-neon-yellow" />;
      case 'bounty_completed':
        return <Award className="w-4 h-4 text-neon-cyan" />;
      case 'submission_accepted':
        return <TrendingUp className="w-4 h-4 text-neon-pink" />;
      case 'contribution_made':
        return <DollarSign className="w-4 h-4 text-neon-purple" />;
      default:
        return <Activity className="w-4 h-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="bg-card/80 backdrop-blur-xl rounded-2xl border-2 border-neon-cyan/40 p-6 shadow-cyan">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-gradient-to-r from-neon-cyan to-neon-purple p-2 rounded-xl shadow-cyan">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-lg font-black text-foreground">Live Activity</h2>
          <p className="text-xs text-muted-foreground">Real-time updates from the cosmos</p>
        </div>
      </div>

      <div className="space-y-3 max-h-[400px] overflow-y-auto">
        {activities.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No activity yet. Be the first to post a bounty!
          </p>
        ) : (
          activities.map((activity) => (
            <div
              key={activity.id}
              className="flex items-start gap-3 p-3 bg-gradient-space/30 rounded-xl border border-neon-purple/20 hover:border-neon-cyan/40 transition-all animate-fade-in"
            >
              <div className="mt-0.5">{getActivityIcon(activity.activity_type)}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">{activity.title}</p>
                {activity.description && (
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                    {activity.description}
                  </p>
                )}
                <p className="text-xs text-muted-foreground/70 mt-1">
                  {formatDistanceToNow(new Date(activity.created_at), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
