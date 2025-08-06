import { useParams } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'wouter';
import { Button } from '@/components/ui/button';
import { Restaurant } from '@shared/schema';
import Header from '@/components/header';
import RestaurantDetail from '@/components/restaurant-detail';
import CartSidebar from '@/components/cart-sidebar';
import CheckoutModal from '@/components/checkout-modal';
import TrackingModal from '@/components/tracking-modal';
import Footer from '@/components/footer';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';

export default function RestaurantPage() {
  const { id } = useParams<{ id: string }>();
  const [showCheckout, setShowCheckout] = useState(false);
  const [showTracking, setShowTracking] = useState(false);
  const [orderId, setOrderId] = useState('');

  const { clearCart, total } = useCart();

  const { data: restaurant, isLoading, error } = useQuery<Restaurant>({
    queryKey: ['/api/restaurants', id],
  });

  const handlePlaceOrder = async (paymentMethod: string) => {
    const newOrderId = `FH${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
    setOrderId(newOrderId);
    setShowCheckout(false);
    setShowTracking(true);
    clearCart();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex gap-6">
                <div className="w-1/3 h-64 bg-gray-300 rounded-lg"></div>
                <div className="flex-1 space-y-4">
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-300 rounded w-full"></div>
                  <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Restaurant not found</h2>
            <Link href="/">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Restaurants
          </Button>
        </Link>
      </div>

      <RestaurantDetail restaurant={restaurant} />
      
      <Footer />
      
      <CartSidebar onCheckout={() => setShowCheckout(true)} />
      
      <CheckoutModal
        isOpen={showCheckout}
        onClose={() => setShowCheckout(false)}
        onPlaceOrder={handlePlaceOrder}
      />
      
      <TrackingModal
        isOpen={showTracking}
        onClose={() => setShowTracking(false)}
        orderId={orderId}
        status="confirmed"
        total={total}
      />
    </div>
  );
}
