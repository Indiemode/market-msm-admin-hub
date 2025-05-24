
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, DollarSign, Clock, AlertTriangle, CheckCircle } from 'lucide-react';

interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  todayBets: number;
  totalEarnings: number;
  pendingPayouts: number;
  recentResults: number;
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

  useEffect(() => {
    // Mock data - in production this would fetch from Supabase
    setStats({
      totalUsers: 1247,
      activeUsers: 89,
      todayBets: 234,
      totalEarnings: 45670,
      pendingPayouts: 12,
      recentResults: 3,
    });
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

  const recentActivities = [
    { id: 1, action: "Result declared for Kalyan Morning", time: "2 hours ago", type: "result" },
    { id: 2, action: "Payment verified for user #1234", time: "3 hours ago", type: "payment" },
    { id: 3, action: "Payout approved for ₹5,000", time: "4 hours ago", type: "payout" },
    { id: 4, action: "User flagged for suspicious activity", time: "5 hours ago", type: "flag" },
  ];

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
                <div className="text-2xl font-bold text-gray-900">{card.value}</div>
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
