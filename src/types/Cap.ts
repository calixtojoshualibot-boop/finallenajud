export type CapCondition =
  | 'deadstock'
  | 'near-mint'
  | 'excellent'
  | 'good'
  | 'fair'
  | 'beater'
  | 'renovated'
  | 'Rennovate';

export interface Cap {
  id: string;
  name: string;
  team: string;
  year: number;
  condition: CapCondition;
  price: number;
  description: string;
  image: string;
  featured: boolean;
}

export interface SellerContact {
  shopName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
  messengerUsername: string;
  bio: string;
}

export type UserRole = 'admin' | 'user';

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  phone?: string;
  address?: string;
}

export type PaymentMethod = 'cash' | 'gcash';
export type DeliveryType = 'pickup' | 'cod';
export type OrderStatus = 'pending' | 'repacking' | 'processing' | 'shipped' | 'completed' | 'cancelled';

export interface OrderItem extends Cap {
  quantity: number;
}

export interface Order {
  id: string;
  userId: string;
  userName: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  address: string;
  phone: string;
  notes?: string;
  date: string;
}
