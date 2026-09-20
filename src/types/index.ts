import type { Database } from '@/lib/supabase/database.types';

export type UserRole = Database['public']['Enums']['user_role'];
export type FarmStatus = Database['public']['Enums']['farm_status'];
export type GoatGender = Database['public']['Enums']['goat_gender'];
export type GoatPurpose = Database['public']['Enums']['goat_purpose'];
export type GoatStatus = Database['public']['Enums']['goat_status'];
export type BookingStatus = Database['public']['Enums']['booking_status'];
export type PaymentStatus = Database['public']['Enums']['payment_status'];
export type PaymentType = Database['public']['Enums']['payment_type'];
export type ReportStatus = Database['public']['Enums']['report_status'];
export type ReportTargetType = Database['public']['Enums']['report_target_type'];

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: UserRole;
  farmId: string | null;
  avatarUrl: string | null;
  isSuspended: boolean;
  createdAt: string;
}

export interface Farm {
  id: string;
  name: string;
  ownerId: string | null;
  tagline: string | null;
  description: string | null;
  locationDistrict: string;
  locationState: string;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  contactPhone: string;
  contactEmail: string | null;
  status: FarmStatus;
  isAmmalOwnFarm: boolean;
  verifiedAt: string | null;
  rating: number;
  reviewCount: number;
  logoUrl: string | null;
  bannerUrl: string | null;
  goatListingLimit: number;
  farmCode: string;
  createdAt: string;
  updatedAt: string;
}

export interface Goat {
  id: string;
  farmId: string;
  farmName?: string;
  farmCode?: string;
  farmLocation?: string;
  farmContact?: string;
  name: string;
  breedId: string | null;
  breedName: string;
  gender: GoatGender;
  ageMonths: number;
  weightKg: number;
  purpose: GoatPurpose;
  price: number;
  discountPercentage: number;
  finalPrice: number;
  hasDiscount: boolean;
  status: GoatStatus;
  description: string | null;
  vaccinationStatus: string | null;
  dewormedDate: string | null;
  parentageFatherTag: string | null;
  parentageMotherTag: string | null;
  isApprovedByAdmin: boolean;
  isFeatured: boolean;
  rating: number;
  reviewCount: number;
  goatCode: string;
  photos: string[];
  primaryPhoto: string;
  createdAt: string;
  updatedAt: string;
}

export interface Booking {
  id: string;
  goatId: string | null;
  goatName?: string;
  goatCode?: string;
  goatBreed?: string;
  goatPhoto?: string;
  farmId: string;
  farmName?: string;
  farmCode?: string;
  farmContact?: string;
  customerId: string | null;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  status: BookingStatus;
  bookingDate: string;
  holdExpiresAt: string;
  totalPrice: number;
  depositPaid: number;
  customerNotes: string | null;
  adminNotes: string | null;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  bookingCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface WishlistItem {
  id: string;
  userId: string;
  goatId: string;
  createdAt: string;
  goat?: Goat;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  body: string;
  linkType: string | null;
  linkId: string | null;
  isRead: boolean;
  eventKey: string | null;
  createdAt: string;
}

export interface PlatformReport {
  id: string;
  reporterId: string | null;
  reporterName?: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  resolutionNotes: string | null;
  resolvedBy: string | null;
  createdAt: string;
}

export interface Breed {
  id: string;
  name: string;
  origin: string | null;
  primaryPurpose: GoatPurpose | null;
  description: string | null;
  avgWeightKg: number | null;
  isActive: boolean;
}

export interface PlatformStats {
  totalGoats: number;
  activeFarms: number;
  pendingFarms: number;
  suspendedFarms: number;
  pendingListings: number;
  totalBookings: number;
  activeBookings: number;
  completedBookings: number;
  totalCustomers: number;
  totalRevenue: number;
  totalReports: number;
}

export type SortOption =
  | 'newest'
  | 'price_low_high'
  | 'price_high_low'
  | 'weight_heaviest'
  | 'age_youngest'
  | 'top_rated';

export interface GoatFilterCriteria {
  searchQuery?: string;
  breed?: string;
  gender?: GoatGender | 'ALL';
  purpose?: GoatPurpose | 'ALL';
  farmId?: string;
  minPrice?: number;
  maxPrice?: number;
  minAgeMonths?: number;
  maxAgeMonths?: number;
  minWeightKg?: number;
  maxWeightKg?: number;
  locationDistrict?: string;
  sortBy?: SortOption;
}

/**
 * Calculates final price consistently with database logic:
 * ROUND(price * (1.0 - (discount / 100.0)), 2)
 */
export function calculateFinalPrice(price: number, discountPercentage: number = 0): number {
  if (!discountPercentage || discountPercentage <= 0) return Math.max(0, price);
  const clampedDiscount = Math.min(100, Math.max(0, discountPercentage));
  const discounted = price * (1 - clampedDiscount / 100);
  return Math.round(Math.max(0, discounted));
}
