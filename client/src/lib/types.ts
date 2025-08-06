export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
}

export interface DeliveryAddress {
  name: string;
  address: string;
  city: string;
  phone: string;
}

export interface FilterOptions {
  cuisine: string[];
  priceRange: [number, number];
  rating: number;
  fastDelivery: boolean;
}

export type SortOption = 'relevance' | 'rating' | 'name' | 'price_low' | 'price_high';
export type PaymentMethod = 'cash' | 'card' | 'upi';
export type OrderStatus = 'confirmed' | 'preparing' | 'onTheWay' | 'delivered';

export interface Order {
  id: string;
  userId?: string | null;
  items: string; // JSON string
  total: number;
  status: OrderStatus;
  deliveryAddress: string;
  paymentMethod: PaymentMethod;
  customerName?: string | null;
  customerPhone?: string | null;
  estimatedDeliveryTime?: number | null; // minutes
  actualDeliveryTime?: number | null; // minutes taken
  createdAt?: string;
  updatedAt?: string;
}
