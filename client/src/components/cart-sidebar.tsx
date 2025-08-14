import { X, Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useCart } from '@/hooks/use-cart';
import { useAuth } from '@/hooks/useAuth';
import AuthModal from '@/components/auth-modal';
import { useState } from 'react';

interface CartSidebarProps {
  onCheckout: () => void;
}

export default function CartSidebar({ onCheckout }: CartSidebarProps) {
  const { items, isOpen, total, updateQuantity, removeItem, setCartOpen } = useCart();
  const { isAuthenticated } = useAuth();
  const [deliveryOption, setDeliveryOption] = useState('standard');

  const deliveryFee = deliveryOption === 'express' ? 50 : 0;
  const taxes = Math.round(total * 0.1);
  const finalTotal = total + deliveryFee + taxes;

  if (!isOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full w-full sm:w-96 bg-white shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Your Order</h3>
          <Button variant="ghost" size="sm" onClick={() => setCartOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-6">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 6M7 13l-1.5-6m0 0L4 5M7 13h10m0 0v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6z" />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">Your cart is empty</p>
              <p className="text-sm text-gray-500 mb-6">Add some delicious items to get started</p>
            </div>
            <Button 
              onClick={() => {
                setCartOpen(false);
                window.location.href = '/';
              }}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2"
            >
              Start Shopping
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map(item => (
              <Card key={item.id} className="bg-gray-50">
                <CardContent className="p-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{item.name}</h4>
                      <p className="text-sm text-gray-600">₹{item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 p-0 border-gray-300 hover:bg-gray-100"
                      >
                        <Minus className="h-3 w-3 text-gray-700" />
                      </Button>
                      <span className="w-8 text-center font-medium text-gray-900">{item.quantity}</span>
                      <Button
                        size="sm"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 p-0 bg-red-600 hover:bg-red-700 text-white border-red-600"
                      >
                        <Plus className="h-3 w-3 text-white" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Delivery Options */}
            <Card className="mt-6">
              <CardContent className="p-4">
                <h4 className="font-medium text-gray-900 mb-3">Delivery Options</h4>
                <img
                  src="https://images.unsplash.com/photo-1565299585323-38174c8d0a5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
                  alt="Food delivery"
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <RadioGroup value={deliveryOption} onValueChange={setDeliveryOption}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="text-sm">
                      Standard Delivery (30-40 mins) - Free
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="text-sm">
                      Express Delivery (15-20 mins) - ₹50
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {items.length > 0 && (
        <div className="p-4 border-t">
          <div className="space-y-2 mb-4">
            <div className="flex justify-between text-sm">
              <span>Subtotal</span>
              <span>₹{total}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Delivery Fee</span>
              <span>{deliveryFee === 0 ? 'Free' : `₹${deliveryFee}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Taxes</span>
              <span>₹{taxes}</span>
            </div>
            <div className="flex justify-between font-semibold text-lg border-t pt-2">
              <span>Total</span>
              <span>₹{finalTotal}</span>
            </div>
          </div>
          {isAuthenticated ? (
            <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3" onClick={onCheckout}>
              Proceed to Checkout
            </Button>
          ) : (
            <AuthModal defaultTab="login">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3">
                Login to Checkout
              </Button>
            </AuthModal>
          )}
        </div>
      )}
    </div>
  );
}
