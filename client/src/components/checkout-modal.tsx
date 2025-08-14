import { useState } from 'react';
import { X, Banknote, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useCart } from '@/hooks/use-cart';
import { PaymentMethod, DeliveryAddress } from '@/lib/types';

interface CheckoutModalProps {
  onClose: () => void;
  onPlaceOrder: (paymentMethod: PaymentMethod, phoneNumber: string, deliveryAddress: string) => void;
}

export default function CheckoutModal({ onClose, onPlaceOrder }: CheckoutModalProps) {
  const { items, total } = useCart();
  const paymentMethod = 'cash'; // Fixed to cash on delivery only
  const [phoneNumber, setPhoneNumber] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [addressError, setAddressError] = useState('');



  const taxes = Math.round(total * 0.1);
  const finalTotal = total + taxes;

  const validatePhoneNumber = (phone: string) => {
    const phoneRegex = /^[+]?[1-9]\d{1,14}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  };

  const handlePlaceOrder = () => {
    let hasErrors = false;

    if (!phoneNumber.trim()) {
      setPhoneError('Phone number is required');
      hasErrors = true;
    } else if (!validatePhoneNumber(phoneNumber)) {
      setPhoneError('Please enter a valid phone number');
      hasErrors = true;
    } else {
      setPhoneError('');
    }

    if (!deliveryAddress.trim()) {
      setAddressError('Delivery address is required');
      hasErrors = true;
    } else {
      setAddressError('');
    }

    if (hasErrors) return;

    onPlaceOrder(paymentMethod, phoneNumber, deliveryAddress);
  };



  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <Card className="max-w-md w-full m-4 max-h-[90vh] overflow-y-auto bg-white border border-gray-200 shadow-xl">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-gray-900">Checkout</h3>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
                Phone Number *
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={phoneNumber}
                onChange={(e) => {
                  setPhoneNumber(e.target.value);
                  if (phoneError) setPhoneError('');
                }}
                className={phoneError ? 'border-red-500 focus:border-red-500' : ''}
              />
              {phoneError && (
                <p className="text-sm text-red-600">{phoneError}</p>
              )}
              <p className="text-xs text-gray-500">We'll use this number to contact you about your order</p>
            </div>
          </div>

          {/* Delivery Address */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Delivery Address</h4>
            <div className="space-y-2">
              <Label htmlFor="address" className="text-sm font-medium text-gray-700">
                Full Address *
              </Label>
              <textarea
                id="address"
                placeholder="Enter your complete delivery address"
                value={deliveryAddress}
                onChange={(e) => {
                  setDeliveryAddress(e.target.value);
                  if (addressError) setAddressError('');
                }}
                className={`w-full min-h-[80px] px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  addressError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300'
                }`}
                rows={3}
              />
              {addressError && (
                <p className="text-sm text-red-600">{addressError}</p>
              )}
              <p className="text-xs text-gray-500">Include building name, street, area, and city</p>
            </div>
          </div>

          {/* Payment Method */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Payment Method</h4>
            <Card className="p-4 bg-green-50 border-green-200">
              <div className="flex items-center space-x-3">
                <Banknote className="h-6 w-6 text-green-600" />
                <div>
                  <Label className="font-medium text-green-800">Cash on Delivery</Label>
                  <p className="text-sm text-green-600">Pay when your order arrives</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-3">Order Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Items ({items.length})</span>
                <span>₹{total}</span>
              </div>
              <div className="flex justify-between">
                <span>Delivery Fee</span>
                <span>Free</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes & Fees</span>
                <span>₹{taxes}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg border-t pt-2">
                <span>Total</span>
                <span>₹{finalTotal}</span>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <h4 className="font-medium text-blue-900">Estimated Delivery Time</h4>
            </div>
            <p className="text-blue-700 text-sm">Your order will be delivered in 30-45 minutes</p>
          </div>
          
          <Button 
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3" 
            onClick={handlePlaceOrder}
          >
            Place Order - Cash on Delivery
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
