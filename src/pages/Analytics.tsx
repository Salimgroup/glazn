"use client";

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, DollarSign, Users, Eye, ThumbsUp, BarChart3, 
  ArrowUpRight, ArrowDownRight, Calendar, Download 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

interface AnalyticsData {
  totalEarnings: number;
  earningsChange: number;
  totalCampaigns: number;
  campaignsChange: number;
  totalImpressions: number;
  impressionsChange: number;
  engagementRate: number;
  engagementChange: number;
  earningsOverTime: { date: string; amount: number }[];
  campaignsByType: { name: string; value: number }[];
  topPerformingContent: { title: string; earnings: number; impressions: number }[];
}

const COLORS = ['#FF6B9D', '#00D9FF', '#FFD93D', '#6BCB77', '#9D4EDD'];

export default function Analytics() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [period, setPeriod] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [loading, setLoading] = useState(true);
  const [userType, setUserType] = useState<'creator' | 'brand'>('creator');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    totalEarnings: 0,
    earningsChange: 0,
    totalCampaigns: 0,
    campaignsChange: 0,
    totalImpressions: 0,
    impressionsChange: 0,
    engagementRate: 0,
    engagementChange: 0,
    earningsOverTime: [],
    campaignsByType: [],
    topPerformingContent: [],
  });

  useEffect(() => {
    if (user) {
      fetchUserType();
      fetchAnalytics();
    }
  }, [user, period]);

  const fetchUserType = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('is_content_creator')
      .eq('id', user?.id)
      .single();
    
    if (data) {
      setUserType(data.is_content_creator ? 'creator' : 'brand');
    }
  };

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      // In production, this would fetch real analytics data
      // For now, we'll use sample data
      const sampleData: AnalyticsData = {
        totalEarnings: 12450,
        earningsChange: 23.5,
        totalCampaigns: 18,
        campaignsChange: 12,
        totalImpressions: 458000,
        impressionsChange: -5.2,
        engagementRate: 4.8,
        engagementChange: 0.3,
        earningsOverTime: generateEarningsData(period),
        campaignsByType: [
          { name: 'Product Review', value: 35 },
          { name: 'Story Mention', value: 25 },
          { name: 'Reel/TikTok', value: 20 },
          { name: 'Unboxing', value: 12 },
          { name: 'Other', value: 8 },
        ],
        topPerformingContent: [
          { title: 'Summer Fashion Haul', earnings: 2500, impressions: 125000 },
          { title: 'Skincare Routine', earnings: 1800, impressions: 98000 },
          { title: 'Tech Review - iPhone', earnings: 1500, impressions: 87000 },
          { title: 'Fitness Challenge', earnings: 1200, impressions: 76000 },
          { title: 'Travel Vlog', earnings: 900, impressions: 54000 },
        ],
      };

      setAnalytics(sampleData);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEarningsData = (period: string) => {
    const days = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 90 : 365;
    const data = [];
    const baseAmount = 300;
    
    for (let i = days; i >= 0; i -= (days > 30 ? 7 : 1)) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      data.push({
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        amount: Math.floor(baseAmount + Math.random() * 200),
      });
    }
    return data;
  };

  const StatCard = ({ 
    title, 
    value, 
    change, 
    icon: Icon, 
    prefix = '',
    suffix = '' 
  }: { 
    title: string; 
    value: number; 
    change: number; 
    icon: any;
    prefix?: string;
    suffix?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-1">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            <div className={`flex items-center gap-1 mt-2 text-sm ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {change >= 0 ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
              <span>{Math.abs(change)}%</span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-gradient-to-br from-neon-pink/20 to-neon-purple/20 rounded-lg flex items-center justify-center">
            <Icon className="w-6 h-6 text-neon-pink" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gradient-space">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-card/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
              <p className="text-sm text-muted-foreground">
                {userType === 'creator' ? 'Track your performance and earnings' : 'Monitor your campaign performance'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Tabs value={period} onValueChange={(v) => setPeriod(v as any)}>
                <TabsList>
                  <TabsTrigger value="7d">7D</TabsTrigger>
                  <TabsTrigger value="30d">30D</TabsTrigger>
                  <TabsTrigger value="90d">90D</TabsTrigger>
                  <TabsTrigger value="1y">1Y</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" onClick={() => navigate('/')}>
                Back to Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title={userType === 'creator' ? 'Total Earnings' : 'Total Spent'}
            value={analytics.totalEarnings}
            change={analytics.earningsChange}
            icon={DollarSign}
            prefix="$"
          />
          <StatCard
            title="Campaigns"
            value={analytics.totalCampaigns}
            change={analytics.campaignsChange}
            icon={BarChart3}
          />
          <StatCard
            title="Total Impressions"
            value={analytics.totalImpressions}
            change={analytics.impressionsChange}
            icon={Eye}
          />
          <StatCard
            title="Engagement Rate"
            value={analytics.engagementRate}
            change={analytics.engagementChange}
            icon={ThumbsUp}
            suffix="%"
          />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Earnings Over Time */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-neon-cyan" />
                {userType === 'creator' ? 'Earnings Over Time' : 'Spending Over Time'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.earningsOverTime}>
                    <defs>
                      <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#FF6B9D" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#FF6B9D" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="date" stroke="#666" fontSize={12} />
                    <YAxis stroke="#666" fontSize={12} tickFormatter={(v) => `$${v}`} />
                    <Tooltip
                      contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                      formatter={(value: number) => [`$${value}`, 'Amount']}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#FF6B9D"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorAmount)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Campaigns by Type */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neon-pink" />
                Campaigns by Type
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.campaignsByType}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {analytics.campaignsByType.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ background: '#1a1a2e', border: '1px solid #333', borderRadius: '8px' }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Performing Content */}
        <Card>
          <CardHeader>
            <CardTitle>Top Performing Content</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analytics.topPerformingContent.map((content, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-4">
                    <span className="text-2xl font-bold text-muted-foreground">#{index + 1}</span>
                    <div>
                      <p className="font-medium">{content.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {content.impressions.toLocaleString()} impressions
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-neon-cyan">${content.earnings.toLocaleString()}</p>
                    <p className="text-sm text-muted-foreground">earned</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
