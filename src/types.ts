export interface Accommodation {
  id: string;
  name: string;
  location: string;
  type: string;
  ecoScore: number;
  price: number;
  certification: string;
  mission: string;
  imageUrl: string;
  isPremium?: boolean;
  status?: 'pending' | 'approved' | 'rejected';
  sustainabilityParams?: {
    energy: 'none' | 'partial' | 'full';
    water: 'basic' | 'advanced' | 'closed';
    waste: 'basic' | 'advanced' | 'circular';
  };
  maxGuests?: number;
  impactType?: 'fauna' | 'energy' | 'indigenous';
  ecoDescription?: string;
  foundation?: string;
  missions?: { title: string; points: number }[];
  isSecret?: boolean;
}

export interface SearchFilters {
  priceRange: [number, number];
  energy: 'all' | 'partial' | 'full';
  water: 'all' | 'advanced' | 'closed';
  type: string;
  location: string;
  guests: number;
  minEcoScore: number;
  impactType: 'all' | 'fauna' | 'energy' | 'indigenous';
}

export interface Booking {
  id: string;
  userId: string;
  accommodationId: string;
  accommodationName: string;
  date: string;
  nights: number;
  guests: {
    adults: number;
    children: number;
    seniors: number;
  };
  totalAmount: number;
  commission: number;
  donationAmount: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  extraPoints?: number;
}

export interface UserProfile {
  uid: string;
  displayName: string;
  email: string;
  photoURL?: string;
  isPremium?: boolean;
  ecoPoints?: number;
  ecoCredits?: number;
  badges?: string[];
  completedMissionsCount?: number;
  role?: 'visitor' | 'host' | 'admin';
  // Host specific fields
  businessName?: string;
  certificationStatus?: 'pending' | 'verified' | 'rejected';
  views?: number;
  bookingsCount?: number;
}

export type InputType = 'TOUCH' | 'VOICE';

export interface AssistantResponse {
  recognition: string;
  result: {
    name: string;
    location: string;
    ecoScore: number;
  };
  filters?: {
    maxPrice?: number;
    energy?: 'partial' | 'full';
    water?: 'advanced' | 'closed';
    location?: string;
    guests?: number;
    minEcoScore?: number;
    impactType?: 'fauna' | 'energy' | 'indigenous';
  };
  impact: string;
  gamification: string;
  voice: string;
}
