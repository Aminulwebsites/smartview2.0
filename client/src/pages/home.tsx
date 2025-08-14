import { useState, useMemo, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FoodItem } from '@shared/schema';
import { SortOption } from '@/lib/types';
import Header from '@/components/header';
import HeroSection from '@/components/hero-section';
import FoodItemCard from '@/components/food-item-card';
import CartSidebar from '@/components/cart-sidebar';
import CheckoutModal from '@/components/checkout-modal';
import Footer from '@/components/footer';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

export default function Home() {
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [showCheckout, setShowCheckout] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [timeLeft, setTimeLeft] = useState(30 * 60); // 30 minutes in seconds

  const { clearCart, total, items } = useCart();
  const { user } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  // Countdown timer effect
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const { data: foodItems = [], isLoading } = useQuery<FoodItem[]>({
    queryKey: ['/api/foods'],
  });

  // Food categories for filtering - dynamically extracted from food items
  const foodCategories = useMemo(() => {
    return Array.from(new Set(foodItems.map(item => item.category))).sort();
  }, [foodItems]);

  const handlePlaceOrder = async (paymentMethod: string, phoneNumber: string, deliveryAddress: string) => {
    // Calculate final total with taxes like in checkout modal
    const taxes = Math.round(total * 0.1);
    const finalTotal = total + taxes;
    
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Session-Id': localStorage.getItem('sessionId') || '',
        },
        body: JSON.stringify({
          items: JSON.stringify(items),
          total: finalTotal, // Send final total including taxes
          deliveryAddress,
          paymentMethod,
          customerName: user ? `${user.firstName} ${user.lastName}` : "Guest Customer", 
          customerPhone: phoneNumber
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
        // Redirect to order status page
        setLocation(`/order-status/${order.id}`);
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

  // Filter food items based on search query and category
  const filteredFoodItems = useMemo(() => {
    let filtered = foodItems;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (categoryFilter !== 'all') {
      filtered = filtered.filter(item =>
        item.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    return filtered;
  }, [foodItems, searchQuery, categoryFilter]);

  // Sort food items
  const sortedFoodItems = useMemo(() => {
    const items = [...filteredFoodItems];
    
    switch (sortBy) {
      case 'name':
        return items.sort((a, b) => a.name.localeCompare(b.name));
      case 'price_low':
        return items.sort((a, b) => a.price - b.price);
      case 'price_high':
        return items.sort((a, b) => b.price - a.price);
      case 'rating':
        return items.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
      default:
        return items;
    }
  }, [filteredFoodItems, sortBy]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
        <HeroSection />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg p-3 sm:p-4 animate-pulse">
                <div className="h-40 sm:h-48 bg-gray-200 rounded-lg mb-3 sm:mb-4"></div>
                <div className="h-3 sm:h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-2 sm:h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      <HeroSection />
      
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Countdown Banner */}
        {timeLeft > 0 && (
          <div className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg p-3 sm:p-4 mb-4 sm:mb-6 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
              <span className="text-base sm:text-lg font-semibold">Offer Ends In:</span>
              <div className="bg-white/20 px-2 sm:px-3 py-1 rounded-md">
                <span className="text-lg sm:text-xl font-bold font-mono">{formatTime(timeLeft)}</span>
              </div>
            </div>
            <p className="text-xs sm:text-sm mt-1 opacity-90">Limited time special offers on all food items!</p>
          </div>
        )}

        {/* Header with filters and sort */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
          <h1 className="text-xl sm:text-2xl font-bold text-dark-gray">Foods</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {foodCategories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="relevance">Relevance</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price_low">Price: Low to High</SelectItem>
                <SelectItem value="price_high">Price: High to Low</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Food Items Grid */}
        {sortedFoodItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {sortedFoodItems.map((item) => (
              <FoodItemCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-lg font-semibold text-gray-600 mb-2">No food items found</h3>
            <p className="text-gray-500">Try adjusting your search or filters</p>
          </div>
        )}
      </main>

      <Footer />
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