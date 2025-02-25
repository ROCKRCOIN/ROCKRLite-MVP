// src/interfaces/profile/types.ts
import { Version } from '../evolution/types';
import { Domain } from '../domain/types';

// Core role type definitions using const assertion for type safety
export const ROLE_TYPES = {
  EXPERIENCE_CURATOR: 'EXPERIENCE_CURATOR',
  EXPERIENCE_HOST: 'EXPERIENCE_HOST',
  EXPERIENCE_ATTENDEE: 'EXPERIENCE_ATTENDEE',
  EXPERIENCE_VENUE: 'EXPERIENCE_VENUE',
  EXPERIENCE_ORGANIZER: 'EXPERIENCE_ORGANIZER',
  EXPERIENCE_AUTHENTICATOR: 'EXPERIENCE_AUTHENTICATOR'
} as const;

export type ProfileRoleType = typeof ROLE_TYPES[keyof typeof ROLE_TYPES];

export const PROFILE_STATUS = {
  ACTIVE: 'ACTIVE',
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  SUSPENDED: 'SUSPENDED',
  UPGRADING: 'UPGRADING',
  MIGRATING: 'MIGRATING'
} as const;

export type ProfileStatus = typeof PROFILE_STATUS[keyof typeof PROFILE_STATUS];

// RKS/UIMA Types
export interface RKSAccount {
  id: string;
  balance: number;
  transactions: Transaction[];
  lockedAmount: number;
  status: AccountStatus;
}

export interface UIMAAccount extends RKSAccount {
  weeklyCredit: number;
  weeklyExpiration: Date;
  allocations: UIMAllocation[];
  miningPending: MiningTask[];
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
  timestamp: Date;
}

export interface UIMAllocation {
  experienceId: string;
  amount: number;
  type: 'bid' | 'mining';
  status: 'pending' | 'locked' | 'mined' | 'expired';
  expiryDate: Date;
}

export interface MiningTask {
  experienceId: string;
  amount: number;
  deadline: Date;
  status: 'pending' | 'completed' | 'failed';
}

export type AccountStatus = 'active' | 'locked' | 'suspended';
export type TransactionType = 'credit' | 'debit' | 'mining' | 'stake';
export type TransactionStatus = 'pending' | 'completed' | 'failed';

// Evolution-Ready Profile Interface
export interface Profile {
  id: string;
  roleType: ProfileRoleType;
  subRole?: string;
  displayName: string;
  status: ProfileStatus;
  domain: Domain;
  email: string;
  whatsappVerified: boolean;
  created: Date;
  lastActive: Date;
  evolution: {
    version: Version;
    features: string[];
    migrations: string[];
  };
  // RKS/UIMA Integration
  rks: {
    mainAccount: RKSAccount;
    uimaAccount: UIMAAccount;
    transactions: Transaction[];
  };
}

export interface ProfileContextValue {
  currentProfile: Profile | null;
  profiles: Profile[];
  loading: boolean;
  error: string | null;
  actions: {
    switchProfile: (profileId: string) => Promise<void>;
    updateProfile: (profile: Partial<Profile>) => Promise<void>;
    createProfile: (profile: Partial<Profile>) => Promise<void>;
    validateProfile: (profile: Profile) => boolean;
  };
  evolution: {
    version: Version;
    migrateProfile: (profile: Profile, version: Version) => Promise<void>;
    validateVersion: (profile: Profile, version: Version) => boolean;
  };
  rks: {
    calculateBalance: (profileId: string) => Promise<Balance>;
    processTransaction: (transaction: Transaction) => Promise<void>;
    updateStaking: (staking: StakeUpdate) => Promise<void>;
  };
}

export interface ProfileAction {
  type: 'SET_CURRENT_PROFILE' 
    | 'UPDATE_PROFILE' 
    | 'ADD_PROFILE' 
    | 'SET_LOADING' 
    | 'SET_ERROR'
    | 'UPDATE_RKS_BALANCE'
    | 'UPDATE_UIMA_BALANCE';
  payload: any;
}

export interface ProfileState {
  currentProfile: Profile | null;
  profiles: Profile[];
  loading: boolean;
  error: string | null;
}

export interface SubRole {
  id: string;
  roleType: ProfileRoleType;
  name: string;
  description?: string;
  requirements?: string[];
}

export interface Balance {
  main: number;
  uima: number;
  staked: number;
  locked: number;
  pending: number;
}

export interface StakeUpdate {
  amount: number;
  action: 'stake' | 'unstake';
  validatorId?: string;
}

export type RoleConfiguration = {
  [K in ProfileRoleType]?: SubRole[];
};