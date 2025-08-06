import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Star, Clock, IndianRupee } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Restaurant, MenuItem } from '@shared/schema';
import MenuItemCard from './menu-item';

interface RestaurantDetailProps {
  restaurant: Restaurant;
}

export default function RestaurantDetail({ restaurant }: RestaurantDetailProps) {
  const [selectedCategory, setSelectedCategory] = useState('Appetizers');

  const { data: menuItems = [], isLoading } = useQuery<MenuItem[]>({
    queryKey: ['/api/restaurants', restaurant.id, 'menu'],
  });

  const categories = Array.from(new Set(menuItems.map(item => item.category)));
  const filteredItems = menuItems.filter(item => item.category === selectedCategory);

  if (isLoading) {
    return <div className="p-8">Loading menu...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Restaurant Header */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <img
              src={restaurant.image}
              alt={restaurant.name}
              className="w-full md:w-1/3 h-64 object-cover rounded-lg"
            />
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-dark-gray mb-2">{restaurant.name}</h2>
              <p className="text-gray-600 mb-4">
                {restaurant.description || "Delicious food made with love and fresh ingredients."}
              </p>
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="flex items-center">
                  <Star className="h-4 w-4 text-yellow-500 mr-1 fill-current" />
                  {restaurant.rating} (250+ reviews)
                </span>
                <span className="flex items-center">
                  <Clock className="h-4 w-4 text-gray-500 mr-1" />
                  {restaurant.deliveryTime}
                </span>
                <span className="flex items-center">
                  <IndianRupee className="h-4 w-4 text-gray-500 mr-1" />
                  ₹{restaurant.costForTwo} for two
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Menu Categories and Items */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Menu Categories */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardContent className="p-4">
              <h3 className="font-semibold text-dark-gray mb-4">Menu Categories</h3>
              <div className="space-y-2">
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? "default" : "ghost"}
                    className="w-full justify-start"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Menu Items */}
        <div className="lg:col-span-3">
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold text-dark-gray mb-4">{selectedCategory}</h3>
              <div className="grid gap-4">
                {filteredItems.map(item => (
                  <MenuItemCard key={item.id} item={item} />
                ))}
              </div>
              {filteredItems.length === 0 && (
                <p className="text-gray-500 text-center py-8">No items found in this category.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
