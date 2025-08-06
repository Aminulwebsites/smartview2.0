import { Check, Phone, MapPin, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { OrderStatus } from '@/lib/types';

interface TrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  status: OrderStatus;
  total: number;
}

export default function TrackingModal({ isOpen, onClose, orderId, status, total }: TrackingModalProps) {
  if (!isOpen) return null;

  const handleClose = () => {
    console.log('TrackingModal: Close button clicked');
    try {
      onClose();
    } catch (error) {
      console.error('Error closing modal:', error);
    }
  };

  const statusMap = {
    confirmed: { text: 'Order Confirmed', time: 'Now', active: true },
    preparing: { text: 'Preparing', time: '5 mins', active: status !== 'confirmed' },
    onTheWay: { text: 'On the Way', time: '25 mins', active: false },
    delivered: { text: 'Delivered', time: '30 mins', active: false }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
      onClick={handleClose}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 }}
    >
      <div 
        className="max-w-md w-full m-4 bg-white border border-gray-200 shadow-xl rounded-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          {/* MULTIPLE CLOSE BUTTONS FOR MAXIMUM VISIBILITY */}
          
          {/* Top Right Close Button - Red X */}
          <div className="absolute -top-3 -right-3 z-10">
            <button
              onClick={handleClose}
              className="bg-red-600 hover:bg-red-700 text-white rounded-full w-12 h-12 flex items-center justify-center text-3xl font-bold shadow-2xl transition-all transform hover:scale-110 border-4 border-white"
              title="Close Order Confirmation"
              style={{ fontSize: '24px', lineHeight: '1' }}
            >
              ×
            </button>
          </div>

          {/* Header Close Button - Inside the modal */}
          <div className="flex justify-end mb-4">
            <button
              onClick={handleClose}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-full w-8 h-8 flex items-center justify-center text-xl font-bold transition-colors"
              title="Close"
            >
              ×
            </button>
          </div>
          
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Order Confirmed!</h3>
            <p className="text-gray-600">Order #{orderId} has been placed successfully</p>
          </div>

          {/* Delivery Status */}
          <div className="mb-6">
            <img
              src="https://images.unsplash.com/photo-1565299585323-38174c8d0a5c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=200"
              alt="Delivery tracking"
              className="w-full h-32 object-cover rounded-lg mb-4"
            />
            
            <div className="space-y-4">
              {Object.entries(statusMap).map(([key, value]) => (
                <div key={key} className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-4 ${
                    value.active ? 'bg-green-600' : 'bg-gray-300'
                  }`} />
                  <div className="flex-1">
                    <p className={`font-medium ${value.active ? 'text-gray-900' : 'text-gray-400'}`}>
                      {value.text}
                    </p>
                    <p className={`text-sm ${value.active ? 'text-gray-600' : 'text-gray-400'}`}>
                      {key === 'confirmed' 
                        ? 'Your order has been received' 
                        : key === 'preparing' 
                        ? 'Restaurant is preparing your food'
                        : key === 'onTheWay'
                        ? 'Food is out for delivery'
                        : 'Enjoy your meal!'
                      }
                    </p>
                  </div>
                  <span className={`text-sm ${value.active ? 'text-gray-500' : 'text-gray-400'}`}>
                    {value.time}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Info */}
          <div className="bg-gray-50 mb-6 p-4 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="font-medium text-gray-900">Order Total (incl. taxes)</span>
              <span className="text-lg font-semibold text-gray-900">₹{total}</span>
            </div>
            <p className="text-sm text-gray-600 mt-2">Expected delivery: 25-30 minutes</p>
          </div>

          {/* Multiple Bottom Close Buttons */}
          <div className="space-y-3">
            <Button 
              variant="destructive" 
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 text-lg" 
              onClick={handleClose}
            >
              ✕ CLOSE ORDER CONFIRMATION
            </Button>
            
            <Button 
              variant="outline" 
              className="w-full border-2 border-red-500 text-red-600 hover:bg-red-50 font-semibold py-2" 
              onClick={handleClose}
            >
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}