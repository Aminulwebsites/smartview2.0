import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { Calendar, Package, CheckCircle, Clock, Truck, ArrowLeft, MapPin, Phone, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import Header from '@/components/header';
import Footer from '@/components/footer';
import { Order } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

const statusSteps = [
  { key: 'confirmed', label: 'Order Confirmed', icon: Clock, description: 'Your order has been received and confirmed' },
  { key: 'preparing', label: 'Preparing', icon: Package, description: 'Your food is being prepared with care' },
  { key: 'on_the_way', label: 'On the Way', icon: Truck, description: 'Your order is on its way to you' },
  { key: 'delivered', label: 'Delivered', icon: CheckCircle, description: 'Order delivered successfully' }
];

const statusConfig = {
  confirmed: { color: 'bg-blue-100 text-blue-800 border-blue-200', dotColor: 'bg-blue-500' },
  preparing: { color: 'bg-yellow-100 text-yellow-800 border-yellow-200', dotColor: 'bg-yellow-500' },
  on_the_way: { color: 'bg-purple-100 text-purple-800 border-purple-200', dotColor: 'bg-purple-500' },
  delivered: { color: 'bg-green-100 text-green-800 border-green-200', dotColor: 'bg-green-500' },
  cancelled: { color: 'bg-red-100 text-red-800 border-red-200', dotColor: 'bg-red-500' }
};

interface OrderStatusProps {
  params: { orderId: string };
}

export default function OrderStatus({ params }: OrderStatusProps) {
  const { orderId } = params;
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: order, isLoading: orderLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId && isAuthenticated,
    refetchInterval: 3000, // Real-time updates every 3 seconds
  });

  if (isLoading || orderLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading order details...</div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect via useEffect
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-red-600 mb-4">Order not found or you don't have permission to view this order.</div>
              <Button onClick={() => window.location.href = '/profile'} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Profile
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const items = JSON.parse(order.items);
  const currentStatusIndex = statusSteps.findIndex(step => step.key === order.status);
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-6">
          {/* Order Confirmation Header */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-green-900">Order Confirmed!</h2>
                  <p className="text-green-700">Order #{order.id.slice(-8).toUpperCase()} has been placed successfully</p>
                </div>
              </div>
              <Button 
                onClick={() => window.location.href = '/'} 
                variant="outline"
                className="bg-white hover:bg-gray-50 border-gray-300"
              >
                ✕ Close
              </Button>
            </div>
          </div>

          <div className="flex justify-between items-start mb-4">
            <Button 
              onClick={() => window.location.href = '/profile'} 
              variant="ghost"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Profile
            </Button>
            <Button 
              onClick={() => window.location.href = '/'} 
              variant="default"
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Continue Shopping
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Status</h1>
          <p className="text-gray-600">Track your order in real-time</p>
        </div>

        <div className="space-y-6">
          {/* Order Header */}
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-xl">Order #{order.id.slice(-8).toUpperCase()}</CardTitle>
                  <p className="text-gray-600 flex items-center gap-2 mt-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(order.createdAt || '').toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <Badge className={`${statusInfo?.color} border px-3 py-1`}>
                    {statusSteps.find(s => s.key === order.status)?.label || order.status}
                  </Badge>
                  <p className="text-xl font-bold mt-2">₹{order.total}</p>
                </div>
              </div>
            </CardHeader>
          </Card>

          {/* Order Progress */}
          <Card>
            <CardHeader>
              <CardTitle>Order Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statusSteps.map((step, index) => {
                  const isActive = index <= currentStatusIndex;
                  const isCurrent = index === currentStatusIndex;
                  const stepStatus = statusConfig[step.key as keyof typeof statusConfig];
                  const StepIcon = step.icon;

                  return (
                    <div key={step.key} className="flex items-start space-x-3">
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center border-2 ${
                        isActive 
                          ? `${stepStatus.dotColor} border-transparent` 
                          : 'bg-gray-100 border-gray-300'
                      }`}>
                        <StepIcon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-400'}`}>
                            {step.label}
                          </h3>
                          {isCurrent && (
                            <Badge variant="outline" className="text-xs">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className={`text-sm ${isActive ? 'text-gray-600' : 'text-gray-400'}`}>
                          {step.description}
                        </p>
                        {isCurrent && order.estimatedDeliveryTime && (
                          <p className="text-sm font-medium text-blue-600 mt-1">
                            Estimated delivery: {order.estimatedDeliveryTime} minutes
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Order Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {items.map((item: any, index: number) => (
                    <div key={index} className="flex justify-between items-center">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                      </div>
                      <p className="font-medium">₹{item.price * item.quantity}</p>
                    </div>
                  ))}
                  <Separator />
                  <div className="flex justify-between items-center font-semibold">
                    <span>Total</span>
                    <span>₹{order.total}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Delivery Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-4 w-4 mt-1 text-gray-400" />
                    <div>
                      <p className="font-medium">Delivery Address</p>
                      <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-4 w-4 mt-1 text-gray-400" />
                    <div>
                      <p className="font-medium">Contact</p>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-sm text-gray-600">{order.customerPhone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <CreditCard className="h-4 w-4 mt-1 text-gray-400" />
                    <div>
                      <p className="font-medium">Payment Method</p>
                      <p className="text-sm text-gray-600 capitalize">{order.paymentMethod.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}