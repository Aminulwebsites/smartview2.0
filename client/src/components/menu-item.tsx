import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { FoodItem } from '@shared/schema';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth-modal';

interface MenuItemProps {
  item: FoodItem;
}

export default function MenuItemCard({ item }: MenuItemProps) {
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
    <Card className="bg-white">
      <CardContent className="p-4 flex gap-4">
        <img
          src={item.image}
          alt={item.name}
          className="w-24 h-24 object-cover rounded-lg"
        />
        <div className="flex-1">
          <div className="flex items-start justify-between mb-2">
            <h4 className="font-semibold text-dark-gray">{item.name}</h4>
            {item.isVeg && (
              <div className="w-4 h-4 border-2 border-green-600 flex items-center justify-center">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
              </div>
            )}
          </div>
          <p className="text-gray-600 text-sm mb-2">{item.description}</p>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-primary">₹{item.price}</span>
            {isAuthenticated ? (
              <Button onClick={handleAddToCart} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add
              </Button>
            ) : (
              <AuthModal defaultTab="login">
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </AuthModal>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
