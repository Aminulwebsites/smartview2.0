import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Clock, Package, Truck, CheckCircle, MapPin, Phone, CreditCard, Calendar, ShoppingBag } from 'lucide-react';
import { Order } from '@shared/schema';

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

interface OrderTrackingProps {
  orderId: string;
}

export default function OrderTracking({ orderId }: OrderTrackingProps) {
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: [`/api/orders/${orderId}`],
    enabled: !!orderId,
    refetchInterval: 3000, // Refetch every 3 seconds for real-time tracking
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-pulse">Loading order details...</div>
        </CardContent>
      </Card>
    );
  }

  if (error || !order) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="text-red-600">Order not found or you don't have permission to view this order.</div>
        </CardContent>
      </Card>
    );
  }

  const items = JSON.parse(order.items);
  const currentStatusIndex = statusSteps.findIndex(step => step.key === order.status);
  const statusInfo = statusConfig[order.status as keyof typeof statusConfig];

  return (
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
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Order Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStatusIndex;
              const isCurrent = index === currentStatusIndex;
              const StepIcon = step.icon;

              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                        isCompleted
                          ? statusConfig[step.key as keyof typeof statusConfig]?.dotColor + ' text-white'
                          : 'bg-gray-200 text-gray-400'
                      }`}
                    >
                      <StepIcon className="h-5 w-5" />
                    </div>
                    {index < statusSteps.length - 1 && (
                      <div
                        className={`w-px h-8 mt-2 transition-colors ${
                          isCompleted ? 'bg-gray-300' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                  <div className="flex-1 pb-4">
                    <h3
                      className={`font-medium ${
                        isCompleted ? 'text-gray-900' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </h3>
                    <p
                      className={`text-sm ${
                        isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      {step.description}
                    </p>
                    {isCurrent && order.status !== 'cancelled' && (
                      <p className="text-sm text-blue-600 font-medium mt-1">
                        Current Status
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
      <div className="grid md:grid-cols-2 gap-6">
        {/* Items */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" />
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
                  <div className="text-right">
                    <p className="font-medium">₹{item.price * item.quantity}</p>
                    <p className="text-sm text-gray-600">₹{item.price} each</p>
                  </div>
                </div>
              ))}
              <Separator />
              <div className="flex justify-between items-center font-bold">
                <span>Total Amount</span>
                <span>₹{order.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Delivery & Payment Info */}
        <Card>
          <CardHeader>
            <CardTitle>Delivery & Payment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <MapPin className="h-4 w-4" />
                Delivery Address
              </h4>
              <p className="text-gray-600 pl-6">{order.deliveryAddress}</p>
            </div>

            {order.customerPhone && (
              <div>
                <h4 className="font-medium flex items-center gap-2 mb-2">
                  <Phone className="h-4 w-4" />
                  Contact Number
                </h4>
                <p className="text-gray-600 pl-6">{order.customerPhone}</p>
              </div>
            )}

            <div>
              <h4 className="font-medium flex items-center gap-2 mb-2">
                <CreditCard className="h-4 w-4" />
                Payment Method
              </h4>
              <p className="text-gray-600 pl-6 capitalize">{order.paymentMethod}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Estimated Delivery Time */}
      {order.status !== 'delivered' && order.status !== 'cancelled' && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <h4 className="font-medium text-blue-900">Estimated Delivery Time</h4>
                <p className="text-blue-700 text-sm">
                  {order.estimatedDeliveryTime ? 
                    `Your order will be delivered in approximately ${order.estimatedDeliveryTime} minutes` :
                    'Your order will be delivered within 30-45 minutes'
                  }
                </p>
                {order.status === 'confirmed' && (
                  <p className="text-blue-600 text-xs mt-1">
                    Estimated arrival: {new Date(new Date(order.createdAt!).getTime() + (order.estimatedDeliveryTime || 35) * 60000).toLocaleTimeString()}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}