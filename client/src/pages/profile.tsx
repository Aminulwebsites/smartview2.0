import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { User, Mail, Phone, Calendar, Package, Eye, Truck, LogOut, CheckCircle, Search, Filter, ArrowUpDown, RefreshCw, ShoppingCart } from 'lucide-react';
import { User as UserType } from '@shared/schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import Header from '@/components/header';
import Footer from '@/components/footer';
import CartSidebar from '@/components/cart-sidebar';
import CheckoutModal from '@/components/checkout-modal';

import OrderTracking from '@/components/order-tracking';
import ProfileEditDialog from '@/components/profile-edit-dialog';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useCart } from '@/hooks/use-cart';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

export default function Profile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const { clearCart, total, items, addItem } = useCart();
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'total' | 'status'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedOrderForDetails, setSelectedOrderForDetails] = useState<Order | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Type the user properly
  const typedUser = user as UserType;

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Session Expired",
        description: "Please log in again to continue",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: orders = [], refetch: refetchOrders } = useQuery<Order[]>({
    queryKey: ['/api/orders'],
    enabled: isAuthenticated,
    retry: false,
    refetchInterval: 10000, // Refetch every 10 seconds to show real-time updates
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'preparing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'ontheway':
      case 'on_the_way':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'confirmed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Filter and sort orders
  const filteredAndSortedOrders = orders
    .filter(order => {
      if (!searchTerm) return true;
      const searchLower = searchTerm.toLowerCase();
      return (
        order.id.toLowerCase().includes(searchLower) ||
        (order as any).customerName?.toLowerCase().includes(searchLower) ||
        order.status.toLowerCase().includes(searchLower) ||
        (typeof order.items === 'string' ? order.items : JSON.stringify(order.items)).toLowerCase().includes(searchLower)
      );
    })
    .sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.createdAt || '').getTime() - new Date(b.createdAt || '').getTime();
          break;
        case 'total':
          comparison = a.total - b.total;
          break;
        case 'status':
          comparison = a.status.localeCompare(b.status);
          break;
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  const handleReorder = async (order: Order) => {
    try {
      let items;
      try {
        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
      } catch (e) {
        items = [];
      }
      
      // Clear cart and add items from the order
      clearCart();
      for (const item of items) {
        // We need to get the full food item details to add to cart
        const response = await fetch('/api/foods');
        const foodItems = await response.json();
        const foodItem = foodItems.find((f: any) => f.name === item.name);
        
        if (foodItem) {
          for (let i = 0; i < item.quantity; i++) {
            addItem(foodItem);
          }
        }
      }
      
      toast({
        title: "Items Added to Cart",
        description: `${items.length} items from your previous order have been added to your cart.`,
      });
      
      // Redirect to home page to complete the order
      window.location.href = '/';
    } catch (error) {
      toast({
        title: "Reorder Failed",
        description: "Unable to add items to cart. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handlePlaceOrder = async (paymentMethod: string, phoneNumber: string, deliveryAddress: string) => {
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': localStorage.getItem('sessionId') || '',
        },
        body: JSON.stringify({
          items: JSON.stringify(items.map(item => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price
          }))),
          total,
          deliveryAddress,
          paymentMethod,
          customerName: `${user?.firstName} ${user?.lastName}`,
          customerPhone: phoneNumber,
        }),
      });

      if (response.ok) {
        const order = await response.json();
        setShowCheckout(false);
        clearCart();
        toast({
          title: "Order Placed Successfully!",
          description: `Your order #${order.id.slice(-8).toUpperCase()} has been confirmed.`,
        });
        // Redirect to order status/tracking page immediately
        setTimeout(() => {
          window.location.href = `/order-status/${order.id}`;
        }, 1000);
      } else {
        throw new Error('Failed to place order');
      }
    } catch (error) {
      toast({
        title: "Order Failed",
        description: "Unable to place your order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your account and view your order history</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Profile Information */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center mb-6">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarImage src={typedUser?.profilePicture || ''} alt="Profile picture" />
                  <AvatarFallback className="bg-primary text-white text-xl">
                    {typedUser?.firstName?.[0] || ''}{typedUser?.lastName?.[0] || ''}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-semibold">{typedUser?.firstName || ''} {typedUser?.lastName || ''}</h3>
                <p className="text-gray-500 text-sm">Customer</p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">{typedUser?.email || ''}</span>
                </div>
                
                {typedUser?.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{typedUser.phone}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="text-sm">
                    Joined {typedUser?.createdAt ? new Date(typedUser.createdAt).toLocaleDateString() : 'Recently'}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <ProfileEditDialog user={typedUser} />
                <Button 
                  variant="outline" 
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  onClick={() => {
                    localStorage.removeItem('sessionId');
                    toast({
                      title: "Logged out",
                      description: "You have been successfully logged out",
                    });
                    window.location.href = '/';
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Order Statistics */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Order Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">{orders.length}</div>
                  <div className="text-sm text-gray-500">Total Orders</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    ₹{orders.reduce((sum, order) => sum + order.total, 0)}
                  </div>
                  <div className="text-sm text-gray-500">Total Spent</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {orders.filter(order => order.status === 'delivered').length}
                  </div>
                  <div className="text-sm text-gray-500">Completed</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Orders Section with Tabs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                My Orders ({orders.length})
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  setIsRefreshing(true);
                  try {
                    await refetchOrders();
                    toast({
                      title: "Orders Refreshed",
                      description: "Your order list has been updated.",
                    });
                  } catch (error) {
                    toast({
                      title: "Refresh Failed",
                      description: "Unable to refresh orders. Please try again.",
                      variant: "destructive",
                    });
                  } finally {
                    // Keep animation for at least 1 second for visual feedback
                    setTimeout(() => setIsRefreshing(false), 1000);
                  }
                }}
                disabled={isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Search and Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search orders by ID, item name, or status..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={sortBy} onValueChange={(value) => setSortBy(value as 'date' | 'total' | 'status')}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date">Sort by Date</SelectItem>
                  <SelectItem value="total">Sort by Total</SelectItem>
                  <SelectItem value="status">Sort by Status</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="gap-2"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              </Button>
            </div>

            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Orders</TabsTrigger>
                <TabsTrigger value="active">Active</TabsTrigger>
                <TabsTrigger value="delivered">Delivered</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="mt-6">
                <div className="space-y-4">
                  {filteredAndSortedOrders.map((order) => {
                    let items;
                    try {
                      items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                    } catch (e) {
                      items = [];
                    }
                    return (
                      <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h3>
                              <Badge className={`${getStatusColor(order.status)} border`}>
                                {order.status.replace(/([A-Z])/g, ' $1').replace('_', ' ').trim()}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {items.length} item{items.length > 1 ? 's' : ''} • ₹{order.total}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(order.createdAt || '').toLocaleString()}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedOrderId(order.id)}
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                >
                                  <Truck className="h-4 w-4 mr-2" />
                                  Track Order
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                                <DialogHeader>
                                  <DialogTitle className="text-gray-900 font-semibold text-lg">Order Tracking</DialogTitle>
                                </DialogHeader>
                                {selectedOrderId && <OrderTracking orderId={selectedOrderId} />}
                              </DialogContent>
                            </Dialog>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => setSelectedOrderForDetails(order)}
                                  className="text-gray-600 hover:text-gray-900"
                                >
                                  <Eye className="h-4 w-4 mr-2" />
                                  Details
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Order Details #{order.id.slice(-8).toUpperCase()}</DialogTitle>
                                </DialogHeader>
                                {selectedOrderForDetails && (
                                  <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                      <div>
                                        <span className="font-medium">Status:</span>
                                        <Badge className={`ml-2 ${getStatusColor(selectedOrderForDetails.status)} border`}>
                                          {selectedOrderForDetails.status.replace(/([A-Z])/g, ' $1').replace('_', ' ').trim()}
                                        </Badge>
                                      </div>
                                      <div>
                                        <span className="font-medium">Total:</span>
                                        <span className="ml-2 font-bold">₹{selectedOrderForDetails.total}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium">Order Date:</span>
                                        <span className="ml-2">{new Date(selectedOrderForDetails.createdAt || '').toLocaleString()}</span>
                                      </div>
                                      <div>
                                        <span className="font-medium">Payment:</span>
                                        <span className="ml-2 capitalize">{(selectedOrderForDetails as any).paymentMethod?.replace('_', ' ') || 'Not specified'}</span>
                                      </div>
                                    </div>
                                    
                                    <div>
                                      <span className="font-medium">Delivery Address:</span>
                                      <p className="text-sm text-gray-600 mt-1">{(selectedOrderForDetails as any).deliveryAddress || 'Not specified'}</p>
                                    </div>
                                    
                                    <div>
                                      <span className="font-medium">Items Ordered:</span>
                                      <div className="mt-2 space-y-2">
                                        {(() => {
                                          let items;
                                          try {
                                            items = typeof selectedOrderForDetails.items === 'string' 
                                              ? JSON.parse(selectedOrderForDetails.items) 
                                              : selectedOrderForDetails.items;
                                          } catch (e) {
                                            items = [];
                                          }
                                          return items.map((item: any, index: number) => (
                                            <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                              <div>
                                                <span className="font-medium">{item.name}</span>
                                                <span className="text-sm text-gray-600 ml-2">x{item.quantity}</span>
                                              </div>
                                              <span className="font-medium">₹{item.price * item.quantity}</span>
                                            </div>
                                          ));
                                        })()}
                                      </div>
                                    </div>
                                    
                                    <div className="flex justify-end gap-2 pt-4 border-t">
                                      <Button
                                        variant="outline"
                                        onClick={() => handleReorder(selectedOrderForDetails)}
                                        className="gap-2"
                                      >
                                        <ShoppingCart className="h-4 w-4" />
                                        Reorder
                                      </Button>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                        
                        {/* Order Items Preview */}
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className="text-sm text-gray-600">
                            {items.slice(0, 2).map((item: any, index: number) => (
                              <span key={index}>
                                {item.name} x {item.quantity}
                                {index < Math.min(items.length, 2) - 1 ? ', ' : ''}
                              </span>
                            ))}
                            {items.length > 2 && <span> and {items.length - 2} more item{items.length > 3 ? 's' : ''}</span>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  
                  {filteredAndSortedOrders.length === 0 && orders.length > 0 && (
                    <div className="text-center py-8">
                      <Search className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No orders match your search</p>
                      <p className="text-sm text-gray-400">Try adjusting your search criteria</p>
                    </div>
                  )}
                  
                  {orders.length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No orders found</p>
                      <p className="text-sm text-gray-400">Your order history will appear here</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="active" className="mt-6">
                <div className="space-y-4">
                  {filteredAndSortedOrders
                    .filter(order => !['delivered', 'cancelled'].includes(order.status))
                    .map((order) => {
                      let items;
                      try {
                        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                      } catch (e) {
                        items = [];
                      }
                      return (
                        <div key={order.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h3>
                                <Badge className={getStatusColor(order.status)}>
                                  {order.status.replace('_', ' ')}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {items.length} item{items.length > 1 ? 's' : ''} • ₹{order.total}
                              </p>
                            </div>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button 
                                  variant="outline" 
                                  size="sm"
                                  onClick={() => setSelectedOrderId(order.id)}
                                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                                >
                                  <Truck className="h-4 w-4 mr-2" />
                                  Track
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
                                <DialogHeader>
                                  <DialogTitle className="text-gray-900 font-semibold text-lg">Order Tracking</DialogTitle>
                                </DialogHeader>
                                {selectedOrderId && <OrderTracking orderId={selectedOrderId} />}
                              </DialogContent>
                            </Dialog>
                          </div>
                        </div>
                      );
                    })}
                  
                  {orders.filter(order => !['delivered', 'cancelled'].includes(order.status)).length === 0 && (
                    <div className="text-center py-8">
                      <Truck className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No active orders</p>
                      <p className="text-sm text-gray-400">Your active orders will appear here</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="delivered" className="mt-6">
                <div className="space-y-4">
                  {filteredAndSortedOrders
                    .filter(order => order.status === 'delivered')
                    .map((order) => {
                      let items;
                      try {
                        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                      } catch (e) {
                        items = [];
                      }
                      return (
                        <div key={order.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h3>
                                <Badge className={getStatusColor(order.status)}>
                                  Delivered
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {items.length} item{items.length > 1 ? 's' : ''} • ₹{order.total}
                              </p>
                              <p className="text-xs text-gray-500">
                                Delivered on {new Date(order.createdAt || '').toLocaleDateString()}
                              </p>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-green-700 border-green-300 hover:bg-green-50 gap-2"
                              onClick={() => handleReorder(order)}
                            >
                              <ShoppingCart className="h-4 w-4" />
                              Reorder
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  
                  {orders.filter(order => order.status === 'delivered').length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No delivered orders</p>
                      <p className="text-sm text-gray-400">Your completed orders will appear here</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="cancelled" className="mt-6">
                <div className="space-y-4">
                  {filteredAndSortedOrders
                    .filter(order => order.status === 'cancelled')
                    .map((order) => {
                      let items;
                      try {
                        items = typeof order.items === 'string' ? JSON.parse(order.items) : order.items;
                      } catch (e) {
                        items = [];
                      }
                      return (
                        <div key={order.id} className="border rounded-lg p-4 opacity-75">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-semibold">Order #{order.id.slice(-8).toUpperCase()}</h3>
                                <Badge className="bg-red-100 text-red-800">
                                  Cancelled
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600">
                                {items.length} item{items.length > 1 ? 's' : ''} • ₹{order.total}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  
                  {orders.filter(order => order.status === 'cancelled').length === 0 && (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500">No cancelled orders</p>
                      <p className="text-sm text-gray-400">Your cancelled orders will appear here</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>

          </CardContent>
        </Card>
      </div>

      <Footer />
      
      {/* Cart and Checkout Components */}
      <CartSidebar onCheckout={() => setShowCheckout(true)} />
      {showCheckout && (
        <CheckoutModal
          onClose={() => setShowCheckout(false)}
          onPlaceOrder={handlePlaceOrder}
        />
      )}

    </div>
  );
}