import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Eye, Clock, CheckCircle, Truck, Package, Trash2 } from 'lucide-react';
import { Order } from '@shared/schema';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';

const statusConfig = {
  confirmed: { label: 'Confirmed', color: 'bg-blue-100 text-blue-800', icon: Clock },
  preparing: { label: 'Preparing', color: 'bg-yellow-100 text-yellow-800', icon: Package },
  on_the_way: { label: 'On the Way', color: 'bg-purple-100 text-purple-800', icon: Truck },
  delivered: { label: 'Delivered', color: 'bg-green-100 text-green-800', icon: CheckCircle },
  cancelled: { label: 'Cancelled', color: 'bg-red-100 text-red-800', icon: Clock }
};

export default function OrderManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingDeliveryTime, setEditingDeliveryTime] = useState<string | null>(null);
  const [newDeliveryTime, setNewDeliveryTime] = useState('');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ['/api/admin/orders'],
    refetchInterval: 5000, // Refetch every 5 seconds for real-time updates
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: string }) => {
      return await apiRequest('PATCH', `/api/admin/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] }); // Also refresh customer orders
      toast({
        title: "Success",
        description: "Order status updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive",
      });
    }
  });

  const updateDeliveryTimeMutation = useMutation({
    mutationFn: async ({ orderId, deliveryTime }: { orderId: string; deliveryTime: number }) => {
      return await apiRequest('PATCH', `/api/admin/orders/${orderId}/delivery-time`, { estimatedDeliveryTime: deliveryTime });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      setEditingDeliveryTime(null);
      setNewDeliveryTime('');
      toast({
        title: "Success",
        description: "Delivery time updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update delivery time",
        variant: "destructive",
      });
    }
  });

  const deleteOrderMutation = useMutation({
    mutationFn: async (orderId: string) => {
      return await apiRequest('DELETE', `/api/admin/orders/${orderId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/orders'] });
      queryClient.invalidateQueries({ queryKey: ['/api/orders'] }); // Also refresh customer orders
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] }); // Refresh admin stats
      toast({
        title: "Success",
        description: "Order deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete order",
        variant: "destructive",
      });
    }
  });

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.slice(-8).toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customerPhone?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleStatusUpdate = (orderId: string, status: string) => {
    updateStatusMutation.mutate({ orderId, status });
  };

  const handleDeliveryTimeUpdate = (orderId: string) => {
    const deliveryTime = parseInt(newDeliveryTime);
    if (isNaN(deliveryTime) || deliveryTime <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid delivery time in minutes",
        variant: "destructive",
      });
      return;
    }
    updateDeliveryTimeMutation.mutate({ orderId, deliveryTime });
  };

  const startEditingDeliveryTime = (orderId: string, currentTime: number | null) => {
    setEditingDeliveryTime(orderId);
    setNewDeliveryTime((currentTime || 35).toString());
  };

  const handleDeleteOrder = (orderId: string) => {
    if (window.confirm('Are you sure you want to delete this order? This action cannot be undone.')) {
      deleteOrderMutation.mutate(orderId);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-gray-900 font-medium">Loading orders...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search by order ID, customer name, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="preparing">Preparing</SelectItem>
            <SelectItem value="on_the_way">On the Way</SelectItem>
            <SelectItem value="delivered">Delivered</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Orders List */}
      <div className="grid gap-4">
        {filteredOrders.map(order => {
          const statusInfo = statusConfig[order.status as keyof typeof statusConfig];
          const StatusIcon = statusInfo?.icon || Clock;
          const items = JSON.parse(order.items);

          return (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                    <p className="text-sm text-gray-600">
                      {order.customerName} • {order.customerPhone}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(order.createdAt || '').toLocaleString()}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                    <Badge className={statusInfo?.color}>
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo?.label}
                    </Badge>
                    <span className="font-semibold">₹{order.total}</span>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div>
                    <h4 className="font-medium mb-2">Items:</h4>
                    <div className="text-sm text-gray-600 space-y-1">
                      {items.map((item: any, index: number) => (
                        <div key={index} className="flex justify-between">
                          <span>{item.name} x {item.quantity}</span>
                          <span>₹{item.price * item.quantity}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h4 className="font-medium mb-1">Delivery Address:</h4>
                    <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h4 className="font-medium mb-1">Payment Method:</h4>
                    <p className="text-sm text-gray-600 capitalize">{order.paymentMethod}</p>
                  </div>

                  {/* Delivery Time Management */}
                  {order.status !== 'delivered' && order.status !== 'cancelled' && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Estimated Delivery Time:</h4>
                      {editingDeliveryTime === order.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            type="number"
                            placeholder="Minutes"
                            value={newDeliveryTime}
                            onChange={(e) => setNewDeliveryTime(e.target.value)}
                            className="w-24"
                          />
                          <span className="text-sm text-gray-600">minutes</span>
                          <Button size="sm" onClick={() => handleDeliveryTimeUpdate(order.id)}>
                            Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => setEditingDeliveryTime(null)}>
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-blue-600" />
                          <span className="text-sm">{order.estimatedDeliveryTime || 35} minutes</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEditingDeliveryTime(order.id, order.estimatedDeliveryTime)}
                          >
                            Edit Time
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Status Update and Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t">
                    <Select
                      value={order.status}
                      onValueChange={(status) => handleStatusUpdate(order.id, status)}
                    >
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="preparing">Preparing</SelectItem>
                        <SelectItem value="on_the_way">On the Way</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="border-red-300 text-red-700 hover:bg-red-50"
                      onClick={() => handleDeleteOrder(order.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {filteredOrders.length === 0 && (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-700 font-medium">No orders found matching your criteria.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}