export interface Category {
  id: number;
  name: string;
  description?: string;
  item_count?: number;
  created_at: string;
}

export interface MenuItem {
  id: number;
  name: string;
  description?: string;
  price: number;
  category_id: number;
  category_name?: string;
  image_url?: string;
  is_available: boolean;
  preparation_time: number;
  ingredients?: string;
  allergens?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id?: number;
  menu_item_id: number;
  quantity: number;
  price: number;
  special_instructions?: string;
  name?: string;
  description?: string;
  preparation_time?: number;
}

export interface Order {
  id?: number;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  table_number?: number;
  total_amount: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  notes?: string;
  items: OrderItem[];
  item_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface OrderStats {
  total_orders: number;
  pending_orders: number;
  preparing_orders: number;
  ready_orders: number;
  delivered_orders: number;
  total_revenue: number;
  average_order_value: number;
}

export interface CartItem {
  menu_item: MenuItem;
  quantity: number;
  special_instructions?: string;
}