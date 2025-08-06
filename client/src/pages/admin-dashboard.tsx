import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, ShoppingBag, Store, TrendingUp, DollarSign, Clock, Star, RotateCcw } from 'lucide-react';
import { Order, User, Restaurant } from '@shared/schema';
import AdminLayout from '@/components/admin/admin-layout';
import AdminAuth from '@/components/admin/admin-auth';
import OrderManagement from '@/components/admin/order-management';
import UserManagement from '@/components/admin/user-management';
import FoodManagement from '@/components/admin/food-management';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

interface AdminStats {
  orders: {
    total: number;
    today: number;
    weekly: number;
    monthly: number;
    byStatus: {
      confirmed: number;
      preparing: number;
      onTheWay: number;
      delivered: number;
    };
    recent: Order[];
  };
  revenue: {
    total: number;
    today: number;
    weekly: number;
    monthly: number;
  };
  users: {
    total: number;
    newToday: number;
  };
  foods: {
    total: number;
    available: number;
  };
  popularItems: Array<{ name: string; count: number }>;
  lastUpdated: string;
}


export default function AdminDashboard() {
  const { isAdminAuthenticated, isLoading, authenticateAdmin } = useAdminAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Real-time statistics with auto-refresh every 30 seconds
  const { data: stats, refetch: refetchStats, error: statsError, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: isAdminAuthenticated,
    refetchInterval: 30000, // Refresh every 30 seconds
    refetchOnWindowFocus: true,
  });

  // Debug logging
  console.log('Admin Stats Debug:', {
    isAdminAuthenticated,
    stats,
    statsError,
    statsLoading,
    ordersTotal: stats?.orders?.total,
    revenueTotal: stats?.revenue?.total
  });

  const { data: orders = [] } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    enabled: isAdminAuthenticated,
    refetchInterval: 60000, // Refresh every minute
  });

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['/api/admin/users'],
    enabled: isAdminAuthenticated,
    refetchInterval: 120000, // Refresh every 2 minutes
  });

  // Reset website mutation
  const resetWebsiteMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest('DELETE', '/api/admin/orders');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] });
      toast({
        title: "Success",
        description: "All order data has been reset successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to reset website data",
        variant: "destructive",
      });
    }
  });

  const handleResetWebsite = () => {
    const confirmed = window.confirm(
      'Are you sure you want to reset the website? This will delete ALL orders and cannot be undone.\n\nThis action will:\n- Delete all customer orders\n- Reset all statistics\n- Clear order history\n\nType "RESET" to confirm this destructive action.'
    );
    
    if (confirmed) {
      const secondConfirm = window.prompt('Please type "RESET" to confirm this action:');
      if (secondConfirm === 'RESET') {
        resetWebsiteMutation.mutate();
      } else {
        toast({
          title: "Reset Cancelled",
          description: "Website reset was cancelled - confirmation text did not match",
        });
      }
    }
  };

  // Update current time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Show loading or authentication screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Show authentication screen if not authenticated
  if (!isAdminAuthenticated) {
    return <AdminAuth onAuthenticated={authenticateAdmin} />;
  }

  const formatCurrency = (amount: number) => `₹${amount.toLocaleString()}`;
  const getStatusColor = (status: string) => {
    const colors = {
      confirmed: 'bg-blue-100 text-blue-800',
      preparing: 'bg-yellow-100 text-yellow-800', 
      onTheWay: 'bg-purple-100 text-purple-800',
      delivered: 'bg-green-100 text-green-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <AdminLayout>
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Admin Dashboard</h1>
          <p className="text-gray-600">Real-time food delivery platform statistics</p>
        </div>
        <div className="flex items-start gap-4">
          <Button
            variant="outline"
            className="border-red-300 text-red-700 hover:bg-red-50"
            onClick={handleResetWebsite}
            disabled={resetWebsiteMutation.isPending}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            {resetWebsiteMutation.isPending ? 'Resetting...' : 'Reset Website'}
          </Button>
          <div className="text-right">
            <p className="text-sm text-gray-500">Current Time</p>
            <p className="text-lg font-mono">{currentTime.toLocaleTimeString()}</p>
            {stats?.lastUpdated && (
              <p className="text-xs text-gray-400">
                Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.orders.today || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.orders.total || 0} total orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.revenue.today || 0)}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(stats?.revenue.total || 0)} total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.users.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              +{stats?.users.newToday || 0} new today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Menu Items</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.foods.total || 0}</div>
            <p className="text-xs text-muted-foreground">
              {stats?.foods.available || 0} available
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Order Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.orders.byStatus && Object.entries(stats.orders.byStatus).map(([status, count]) => (
                <div key={status} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Badge className={getStatusColor(status)}>
                      {status.replace(/([A-Z])/g, ' $1').trim()}
                    </Badge>
                  </div>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Revenue Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Today</span>
                <span className="font-semibold">{formatCurrency(stats?.revenue.today || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Week</span>
                <span className="font-semibold">{formatCurrency(stats?.revenue.weekly || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">This Month</span>
                <span className="font-semibold">{formatCurrency(stats?.revenue.monthly || 0)}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium">Total</span>
                <span className="font-bold">{formatCurrency(stats?.revenue.total || 0)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">Popular Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats?.popularItems.slice(0, 5).map((item, index) => (
                <div key={item.name} className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                      #{index + 1}
                    </span>
                    <span className="text-sm truncate">{item.name}</span>
                  </div>
                  <span className="text-sm font-semibold">{item.count} sold</span>
                </div>
              )) || (
                <p className="text-sm text-gray-500">No order data available</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Management Tabs */}
      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="orders">Order Management</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="foods">Food Management</TabsTrigger>
        </TabsList>

        <TabsContent value="orders">
          <OrderManagement />
        </TabsContent>

        <TabsContent value="users">
          <UserManagement />
        </TabsContent>

        <TabsContent value="foods">
          <FoodManagement />
        </TabsContent>
      </Tabs>
    </AdminLayout>
  );
}