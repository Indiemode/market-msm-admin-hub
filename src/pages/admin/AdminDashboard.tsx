import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  todayBets: number;
  totalEarnings: number;
  pendingPayouts: number;
  recentResults: number;
}

interface RecentActivity {
  id: string;
  action: string;
  time: string;
  type: string;
}

export const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    activeUsers: 0,
    todayBets: 0,
    totalEarnings: 0,
    pendingPayouts: 0,
    recentResults: 0,
  });
  const [loading, setLoading] = useState(true);

  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([
    { id: 'loading', action: "Loading recent activities...", time: "", type: "result" }
  ]);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      try {
        setLoading(true);
        
        // Get total users count from auth users
        const { count: authUsersCount, error: authError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
        
        if (authError) {
          console.error('Error fetching auth users:', authError);
          throw authError;
        }

        // Get bets placed today
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const { count: todayBets, error: betsError } = await supabase
          .from('bets')
          .select('*', { count: 'exact', head: true })
          .gte('created_at', today.toISOString());
        
        if (betsError) throw betsError;

        // Get pending transactions (assuming these are payouts requests)
        const { count: pendingPayouts, error: transactionsError } = await supabase
          .from('transactions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'pending')
          .eq('transaction_type', 'withdraw');
        
        if (transactionsError) throw transactionsError;
        
        // Get total earnings (sum of transaction amounts where type is deposit)
        const { data: earnings, error: earningsError } = await supabase
          .from('transactions')
          .select('amount')
          .eq('transaction_type', 'deposit')
          .eq('status', 'completed');
        
        if (earningsError) throw earningsError;
        
        const totalEarnings = earnings?.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) || 0;
        
        // Get recent results count
        const { count: recentResults, error: resultsError } = await supabase
          .from('results')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'declared')
          .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());
        
        if (resultsError) throw resultsError;

        // For active users, we'll count users with transactions or bets in the last 24 hours
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
        
        const { data: activeBetsUsers, error: activeBetsError } = await supabase
          .from('bets')
          .select('user_id')
          .gte('created_at', oneDayAgo)
          .order('user_id');
          
        if (activeBetsError) throw activeBetsError;
          
        const { data: activeTransactionUsers, error: activeTransError } = await supabase
          .from('transactions')
          .select('user_id')
          .gte('created_at', oneDayAgo)
          .order('user_id');
          
        if (activeTransError) throw activeTransError;
          
        // Combine and get unique active users
        const activeUserIds = new Set([
          ...activeBetsUsers?.map(bet => bet.user_id) || [],
          ...activeTransactionUsers?.map(trans => trans.user_id) || []
        ]);
          
        setStats({
          totalUsers: authUsersCount || 0,
          activeUsers: activeUserIds.size,
          todayBets: todayBets || 0,
          totalEarnings,
          pendingPayouts: pendingPayouts || 0,
          recentResults: recentResults || 0,
        });
      } catch (error: any) {
        console.error('Error fetching dashboard stats:', error);
        toast({
          title: "Error loading dashboard data",
          description: error.message || "Could not load dashboard statistics",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardStats();
  }, []);

  const dashboardCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      description: "Registered users",
      icon: Users,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
    {
      title: "Active Users (24h)",
      value: stats.activeUsers.toString(),
      description: "Users active today",
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Today's Bets",
      value: stats.todayBets.toString(),
      description: "Bets placed today",
      icon: DollarSign,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
    },
    {
      title: "Total Earnings",
      value: `₹${stats.totalEarnings.toLocaleString()}`,
      description: "Platform earnings",
      icon: TrendingUp,
      color: "text-orange-600",
      bgColor: "bg-orange-50",
    },
    {
      title: "Pending Payouts",
      value: stats.pendingPayouts.toString(),
      description: "Awaiting approval",
      icon: Clock,
      color: "text-red-600",
      bgColor: "bg-red-50",
    },
    {
      title: "Recent Results",
      value: stats.recentResults.toString(),
      description: "Declared today",
      icon: CheckCircle,
      color: "text-emerald-600",
      bgColor: "bg-emerald-50",
    },
  ];

  // Fetch recent activities from Supabase
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        // Fetch the most recent results
        const { data: recentResults, error: resultsError } = await supabase
          .from('results')
          .select('id, market_name, updated_at, status')
          .order('updated_at', { ascending: false })
          .limit(2);
          
        if (resultsError) throw resultsError;
        
        // Fetch the most recent transactions
        const { data: recentTransactions, error: transError } = await supabase
          .from('transactions')
          .select('id, transaction_type, amount, updated_at, status')
          .order('updated_at', { ascending: false })
          .limit(3);
          
        if (transError) throw transError;

        // Combine and format the activities
        const activities = [
          ...recentResults.map((result) => ({
            id: `result-${result.id}`,
            action: `Result ${result.status} for ${result.market_name}`,
            time: formatTimeAgo(new Date(result.updated_at)),
            type: 'result'
          })),
          ...recentTransactions.map((trans) => ({
            id: `trans-${trans.id}`,
            action: `${trans.transaction_type === 'deposit' ? 'Payment' : 'Payout'} of ₹${trans.amount} ${trans.status}`,
            time: formatTimeAgo(new Date(trans.updated_at)),
            type: trans.transaction_type === 'deposit' ? 'payment' : 'payout'
          }))
        ].sort((a, b) => {
          // Sort by time (most recent first)
          return new Date(b.time).getTime() - new Date(a.time).getTime();
        }).slice(0, 4); // Take only the 4 most recent activities
        
        if (activities.length > 0) {
          setRecentActivities(activities);
        }
      } catch (error) {
        console.error('Error fetching recent activities:', error);
      }
    };

    fetchRecentActivities();
  }, []);

  // Helper function to format time ago
  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + ' years ago';
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + ' months ago';
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + ' days ago';
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + ' hours ago';
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + ' minutes ago';
    
    return Math.floor(seconds) + ' seconds ago';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
          <p className="text-gray-600">Monitor your MSM Market operations in real-time</p>
        </div>
        <Badge variant="outline" className="text-green-600 border-green-600">
          System Online
        </Badge>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardCards.map((card, index) => {
          const IconComponent = card.icon;
          return (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {card.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <IconComponent className={`w-5 h-5 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-7 w-24 bg-gray-200 animate-pulse rounded"></div>
                ) : (
                  <div className="text-2xl font-bold text-gray-900">{card.value}</div>
                )}
                <p className="text-xs text-gray-500 mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Clock className="w-5 h-5" />
              <span>Recent Activities</span>
            </CardTitle>
            <CardDescription>Latest administrative actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                <div className="flex items-center space-x-3">
                  <div className={`w-2 h-2 rounded-full ${
                    activity.type === 'result' ? 'bg-blue-500' :
                    activity.type === 'payment' ? 'bg-green-500' :
                    activity.type === 'payout' ? 'bg-orange-500' :
                    'bg-red-500'
                  }`} />
                  <span className="text-sm text-gray-700">{activity.action}</span>
                </div>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5" />
              <span>System Alerts</span>
            </CardTitle>
            <CardDescription>Important notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">High Volume Alert</span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">Unusual betting activity detected in Kalyan game</p>
            </div>
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">System Update</span>
              </div>
              <p className="text-xs text-blue-700 mt-1">All systems running smoothly</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
