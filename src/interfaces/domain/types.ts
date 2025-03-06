// src/interfaces/domain/types.ts
import { Version } from '../evolution/types';
import { MigrationStrategy } from '../evolution/types';
import React from 'react';

export interface FeatureMap {
  [key: string]: boolean;
}

export interface RoleAllocation {
  role: string;
  percentage: number;
}

// Updated Domain interface with config for experience utilities
export interface Domain {
  id: string;
  name: string;
  emailPattern: string; // e.g. "@ox.ac.uk"
  features: FeatureMap;
  restrictions: string[];
  config?: {
    eligibleExperienceTypes?: string[];
    eligibleExperienceSettings?: string[];
    eligibleSubjects?: string[];
    eligibleGenres?: string[];
    [key: string]: any;
  };
}

export interface DomainState {
  currentDomain: string | null;
  domains: string[];
  loading: boolean;
  error: string | null;
  features: FeatureMap;
  restrictions: string[];
  version: Version;
}

export interface DomainConfig {
  id: string;
  name: string;
  emailPattern: string;
  features: FeatureMap;
  restrictions: string[];
  rks: {
    weeklyUimaCredit: number;
    targetSeatPrice: number;
    roleAllocations: RoleAllocation[];
  };
}

export interface VerificationConfig {
  type: string;
  required: boolean;
  validationRules: string[];
}

export interface Permission {
  id: string;
  name: string;
  scope: string[];
}

export interface User {
  id: string;
  email: string;
  domains: string[];
}

export type DomainAction =
  | { type: 'SWITCH_DOMAIN'; payload: string }
  | { type: 'UPDATE_CONFIG'; payload: DomainConfig }
  | { type: 'UPDATE_VERSION'; payload: Version }
  | { type: 'SET_ERROR'; payload: string | null };

export interface DomainContextValue {
  state: DomainState;
  dispatch: React.Dispatch<DomainAction>;
  operations: {
    validateDomain: (domain: string) => boolean;
    getDomainConfig: (domain: string) => DomainConfig;
    checkDomainAccess: (domain: string, user: User) => boolean;
  };
  access: {
    validateAccess: (domain: string) => boolean;
    getDomainPermissions: (domain: string) => Permission[];
  };
  evolution: {
    validateVersion: (version: Version) => boolean;
    migrate: (migration: MigrationStrategy) => Promise<void>;
  };
}