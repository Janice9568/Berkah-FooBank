export type UserRole = 'user' | 'organizer';

export interface UserProfile {
  uid: string;
  name: string;
  phone?: string;
  ic?: string;
  preferredTamans?: string[];
  role: UserRole;
}

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'expired';

export interface DistributionEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  state: string;
  district: string;
  taman: string;
  fullAddress?: string;
  description: string;
  quota: number;
  currentCount: number;
  organizerName: string;
  organizerContact: string;
  organizerId: string;
  photos?: string[];
  status: EventStatus;
  createdAt: any;
}

export interface Registration {
  id: string;
  eventId: string;
  userId: string;
  name: string;
  phone: string;
  ic: string;
  rank: number;
  estimatedTime: string;
  attended: boolean;
  createdAt: any;
}

export type Language = 'en' | 'ms' | 'zh';

export interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}
