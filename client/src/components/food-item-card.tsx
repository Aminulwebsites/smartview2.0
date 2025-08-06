import { Plus, Clock, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FoodItem } from '@shared/schema';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth-modal';

interface FoodItemProps {
  item: FoodItem;
}

export default function FoodItemCard({ item }: FoodItemProps) {
  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      return; // Will be handled by AuthModal wrapper
    }
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
    });
  };

  return (
    <Card className="bg-white hover:shadow-lg transition-shadow duration-200">
      <CardContent className="p-0">
        {/* Image */}
        <div className="relative">
          <img
            src={item.image}
            alt={item.name}
            className="w-full h-40 sm:h-48 object-cover rounded-t-lg"
          />
          {item.isVeg && (
            <div className="absolute top-2 sm:top-3 left-2 sm:left-3 w-4 h-4 sm:w-5 sm:h-5 border-2 border-green-600 flex items-center justify-center bg-white rounded-sm">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-600 rounded-full"></div>
            </div>
          )}
          <Badge 
            variant="secondary" 
            className="absolute top-2 sm:top-3 right-2 sm:right-3 bg-white/90 text-gray-700 border text-xs"
          >
            {item.category}
          </Badge>
        </div>

        {/* Content */}
        <div className="p-3 sm:p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-semibold text-base sm:text-lg text-dark-gray line-clamp-1 flex-1 mr-2">
              {item.name}
            </h3>
            <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-600 flex-shrink-0">
              <Star className="h-3 w-3 fill-yellow-400 stroke-yellow-400" />
              <span>{item.rating}</span>
            </div>
          </div>

          <p className="text-gray-600 text-xs sm:text-sm mb-2 sm:mb-3 line-clamp-2">
            {item.description}
          </p>

          <div className="flex items-center gap-2 mb-2 sm:mb-3 text-xs sm:text-sm text-gray-500">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{item.prepTime}</span>
          </div>

          {/* Badges for veg status and availability */}
          <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-3 sm:mb-4">
            <Badge 
              variant={item.isVeg ? 'default' : 'secondary'}
              className={item.isVeg 
                ? 'bg-green-100 text-green-800 border-green-200 font-bold px-2 py-0.5 text-xs' 
                : 'bg-red-100 text-red-800 border-red-200 font-bold px-2 py-0.5 text-xs'
              }
            >
              {item.isVeg ? '🟢 Veg' : '🔴 Non-Veg'}
            </Badge>
            <Badge 
              variant={item.available ? 'default' : 'destructive'}
              className={item.available 
                ? 'bg-blue-100 text-blue-800 border-blue-200 font-bold px-2 py-0.5 text-xs' 
                : 'bg-red-100 text-red-800 border-red-200 font-bold px-2 py-0.5 text-xs'
              }
            >
              {item.available ? 'Available' : 'Unavailable'}
            </Badge>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-lg sm:text-xl font-bold text-primary">₹{item.price}</span>
            {isAuthenticated ? (
              <Button 
                onClick={handleAddToCart} 
                size="sm" 
                className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
              >
                <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Add to Cart</span>
                <span className="xs:hidden">Add</span>
              </Button>
            ) : (
              <AuthModal defaultTab="login">
                <Button 
                  size="sm" 
                  className="bg-primary hover:bg-primary/90 text-white flex items-center gap-1 text-xs sm:text-sm px-2 sm:px-3"
                >
                  <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="hidden xs:inline">Add to Cart</span>
                  <span className="xs:hidden">Add</span>
                </Button>
              </AuthModal>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}