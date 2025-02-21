import type { Dispatch } from 'react';

export interface Domain {
  id: string;
  name: string;
  type: 'primary' | 'secondary';
  status: DomainStatus;
  emailPattern: string; // e.g. "@ox.ac.uk"
  config: DomainConfig;
  venues: VenueConfig[];
  roles: RoleConfig[];
  features: string[];
  created: Date;
  lastModified: Date;
}

export interface DomainConfig {
  // Core Settings
  name: string;
  displayName: string;
  description?: string;
    
  // Access Control
  allowedRoles: string[];
  allowedProfileTypes: ProfileType[];
  maxProfiles: number;
    
  // Verification Requirements    
  verification: {
    emailRequired: boolean;
    whatsappRequired: boolean;
    additionalVerification?: VerificationConfig[];
  };

  // RKS Configuration  
  rks: {
    weeklyUimaCredit: number; // Default 18000 for MVP
    targetSeatPrice: number;  // Default 3000 for MVP
    roleAllocations: RoleAllocation[];
  };

  // Experience Settings
  experience: {
    allowedTypes: string[];
    allowedSettings: ExperienceSetting[];
    defaultCapacity: number;
    maxCapacity: number;
    venues: VenueConfig[];
  };

  // Cross-Domain Settings
  crossDomain: {
    allowSharing: boolean;
    allowedDomains: string[];
    experienceVisibility: 'private' | 'public' | 'selective';
  };
}

export type ProfileType = 
  | 'curator'
  | 'host'
  | 'attendee'
  | 'venue'
  | 'organizer'
  | 'authenticator';

export type ExperienceSetting = 
  | 'academic'
  | 'professional'
  | 'cultural'
  | 'social'
  | 'athletic';

export interface VerificationConfig {
  type: string;
  required: boolean;
  validationRules: string[];
}

export interface RoleAllocation {
  role: ProfileType;
  percentage: number;
  minAmount: number;
  maxAmount: number;
}

export interface VenueConfig {
  id: string;
  name: string;
  type: string;
  capacity: number;
  features: string[];
}

export interface RoleConfig {
  id: string;
  name: string;
  permissions: string[];
  features: string[];
}

export type DomainStatus = 
  | 'active' 
  | 'pending' 
  | 'suspended' 
  | 'archived';

// State Management Types
export interface DomainState {
  currentDomain: Domain | null;
  domains: Domain[];
  history: Domain[];
  loading: boolean;
  error: string | null;
}

export interface DomainAction {
  type: 'SWITCH_DOMAIN' 
    | 'UPDATE_DOMAIN_CONFIG' 
    | 'ADD_DOMAIN' 
    | 'UPDATE_DOMAIN_STATUS';
  payload: any;
}

export interface DomainContextValue {
  state: DomainState;
  dispatch: Dispatch<DomainAction>;
  operations: {
    switchDomain: (domain: Domain) => Promise<void>;
    validateDomain: (domain: Domain) => boolean;
    updateSettings: (domain: Domain, settings: DomainConfig) => Promise<void>;
  };
  access: {
    validateAccess: (userId: string, domain: Domain) => boolean;
    getDomainPermissions: (userId: string, domain: Domain) => string[];
    updatePermissions: (userId: string, permissions: string[]) => Promise<void>;
  };
  crossDomain: {
    shareExperience: (experienceId: string, domains: Domain[]) => Promise<void>;
    validateCrossDomain: (source: Domain, target: Domain) => boolean;
    syncDomainData: (domains: Domain[]) => Promise<void>;
  };
}