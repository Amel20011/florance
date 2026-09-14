export type ProductCategory =
  | 'pulsa'
  | 'paket-data'
  | 'sewa-bot'
  | 'bot-whatsapp'
  | 'token'
  | 'layanan';

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  description?: string;
  badge?: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  category: ProductCategory;
  categoryLabel: string;
  shortDescription: string;
  fullDescription: string;
  iconName: string;
  basePrice: number;
  badge?: 'Promo' | 'Populer' | 'Terlaris' | null;
  isAvailable: boolean;
  rating: number;
  soldCount: number;
  features: string[];
  variants: ProductVariant[];
  targetFieldLabel: string;
  targetFieldPlaceholder: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'EXPIRED';

export interface Order {
  id: string;
  invoice: string;
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  targetAccount: string;
  productId: string;
  productName: string;
  variantId: string;
  variantName: string;
  quantity: number;
  amount: number;
  adminFee: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: PaymentStatus;
  paymentGateway: string;
  gatewayTransactionId: string;
  qrUrl: string;
  qrDataUrl?: string;
  paymentUrl?: string;
  createdAt: string;
  paidAt?: string;
  expiredAt: string;
  fulfillmentStatus?: 'COMPLETED' | 'PROCESSING' | 'PENDING' | 'FAILED' | 'CANCELLED';
  fulfillmentData?: {
    licenseKey?: string;
    botWebhookUrl?: string;
    instructions?: string;
    snNumber?: string;
  };
}

export interface WebhookEvent {
  id: string;
  event_id: string;
  transaction_id: string;
  processed_at: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar: string;
  balance?: number;
  provider?: 'google' | 'apple' | 'email';
  isVerified?: boolean;
  verifiedAt?: string;
  bio?: string;
  phone?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai' | 'cs';
  text: string;
  timestamp: string;
  productRecommendation?: Product;
  actionButton?: {
    label: string;
    action: string;
    url?: string;
  };
}
