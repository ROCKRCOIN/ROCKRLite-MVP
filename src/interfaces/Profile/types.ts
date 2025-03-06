// src/interfaces/profile/types.ts
import type { Version, Feature, MigrationStrategy } from '../evolution/types';
import type { Domain } from '../domain/types';

// Profile Types
export type ProfileType = 
  | 'curator'
  | 'host'
  | 'attendee'
  | 'venue'
  | 'organizer'
  | 'authenticator';

export type ProfileStatus = 
  | 'active'
  | 'pending'
  | 'verified'
  | 'suspended';

// RKS/UIMA Types
export type TransactionType = 
  | 'deposit'
  | 'withdrawal'
  | 'transfer'
  | 'mining'
  | 'bid'
  | 'reward';

export type TransactionStatus = 
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled';

export type AccountStatus = 
  | 'active'
  | 'locked'
  | 'suspended';

// RKS/UIMA Interfaces
export interface RKSAccount {
  id: string;
  userId: string;
  balance: number;
  lockedAmount: number;
  transactions: Transaction[];
  status: AccountStatus;
}

export interface UIMAAccount extends RKSAccount {
  weeklyCredit: number; // Default 18000 for MVP
  weeklyExpiration: Date;
  allocations: UIMAllocation[];
  miningPending: MiningPendingTask[];
}

export interface UIMAllocation {
  experienceId: string;
  amount: number;
  type: 'bid' | 'mining';
  status: 'pending' | 'locked' | 'mined' | 'expired';
  expiryDate: Date;
}

export interface Transaction {
  id: string;
  timestamp: Date;
  type: TransactionType;
  amount: number;
  status: TransactionStatus;
  metadata: Record<string, any>;
}

export interface MiningPendingTask {
  id: string;
  experienceId: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  completedAt?: Date;
}

// Core Profile Interface
export interface Profile {
  id: string;
  type: ProfileType;
  role?: string;
  status: ProfileStatus;
  domain: string;
  verified: boolean;
  created: Date;
  lastActive: Date;
  // Evolution-ready fields
  evolution?: {
    version: Version;
    features: Feature[];
  };
  // RKS accounts and transactions
  rks?: {
    mainAccount: RKSAccount;
    uimaAccount: UIMAAccount;
    transactions: Transaction[];
  };
}

// Review Metrics
export interface ReviewMetrics {
  rating: number;
  responseRate: number;
  responseTime: number;
  experienceCount: number;
  lastUpdated: Date;
}

// Role-Specific Profiles
export interface HostProfile extends Profile {
  specializations: string[];
  availability: Availability[];
  brand?: string;
}

export interface AttendeeProfile extends Profile {
  interests: string[];
  preferences: Preference[];
}

export interface VenueProfile extends Profile {
  location: string;
  capacity: number;
  features: string[];
}

export interface CuratorProfile extends Profile {
  domains: string[];
  specialties: string[];
}

// Supporting Types
export interface Availability {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  recurring: boolean;
}

export interface Preference {
  category: string;
  value: string;
  priority: number;
}

// Profile State Management
export interface ProfileState {
  activeProfile: Profile | null;
  profiles: Profile[];
  loading: boolean;
  error: string | null;
}

export type ProfileAction = 
  | { type: 'SWITCH_PROFILE'; payload: string }
  | { type: 'UPDATE_PROFILE'; payload: Partial<Profile> }
  | { type: 'ADD_PROFILE'; payload: Profile }
  | { type: 'REMOVE_PROFILE'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null };

// Profile Context Interface
export interface ProfileContextValue {
  state: ProfileState;
  dispatch: React.Dispatch<ProfileAction>;
  
  // Profile Management
  profiles: {
    active: Profile | null;
    available: Profile[];
    switch: (profileId: string) => Promise<void>;
    update: (profile: Partial<Profile>) => Promise<void>;
    create: (profile: Partial<Profile>) => Promise<void>;
    remove: (profileId: string) => Promise<void>;
  };
  
  // Domain Integration
  domains: {
    current: string | null;
    available: string[];
    switchDomain: (domain: string) => Promise<void>;
    getProfilesForDomain: (domain: string) => Profile[];
  };
  
  // Evolution Support
  evolution: {
    version: Version;
    features: string[];
    upgrade: (profile: Profile) => Promise<void>;
  };
  
  // RKS/UIMA Support
  rks?: {
    mainAccount: (profileId?: string) => RKSAccount | undefined;
    uimaAccount: (profileId?: string) => UIMAAccount | undefined;
    getTransactions: (profileId?: string) => Transaction[];
    getPendingTasks: (profileId?: string) => MiningPendingTask[];
  };
}