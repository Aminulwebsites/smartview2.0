import { Star, Clock, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Restaurant } from '@shared/schema';
import { Link } from 'wouter';

interface RestaurantCardProps {
  restaurant: Restaurant;
}

export default function RestaurantCard({ restaurant }: RestaurantCardProps) {
  return (
    <Link href={`/restaurant/${restaurant.id}`}>
      <Card className="bg-white hover:shadow-lg transition-shadow cursor-pointer">
        <img
          src={restaurant.image}
          alt={restaurant.name}
          className="w-full h-48 object-cover rounded-t-lg"
        />
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <h4 className="text-lg font-semibold text-dark-gray">{restaurant.name}</h4>
            <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm font-medium flex items-center">
              {restaurant.rating}
              <Star className="h-3 w-3 ml-1 fill-current" />
            </span>
          </div>
          <p className="text-gray-600 text-sm mb-2">{restaurant.cuisine}</p>
          <div className="flex justify-between items-center text-sm text-gray-500">
            <span className="flex items-center">
              <Clock className="h-3 w-3 mr-1" />
              {restaurant.deliveryTime}
            </span>
            <span className="flex items-center">
              <IndianRupee className="h-3 w-3 mr-1" />
              {restaurant.costForTwo} for two
            </span>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <span className={`text-sm font-medium ${
              restaurant.deliveryFee === 0 ? 'text-green-600' : 'text-orange-600'
            }`}>
              {restaurant.deliveryFee === 0 ? 'Free Delivery' : `₹${restaurant.deliveryFee} Delivery Fee`}
            </span>
            <span className="text-primary text-sm">View Menu →</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
