export interface Domain {
    id: string;
    name: string;
    type: 'primary' | 'secondary';
    status: DomainStatus;
    emailPattern: string;
    config: DomainConfig;
    features: FeatureFlag[];
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
      weeklyUimaCredit: number;
      targetSeatPrice: number;
      roleAllocations: RoleAllocation[];
    };
  
    // Experience Settings
    experience: {
      allowedTypes: ExperienceType[];
      allowedSettings: ExperienceSetting[];
      defaultCapacity: number;
      maxCapacity: number;
    };
  
    // Cross-Domain Settings
    crossDomain: {
      allowSharing: boolean;
      allowedDomains: string[];
      experienceVisibility: 'private' | 'public' | 'selective';
    };
  }
  
  export type DomainStatus = 'active' | 'pending' | 'suspended' | 'archived';
  
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
    dispatch: React.Dispatch<DomainAction>;
    operations: {
      switchDomain: (domain: Domain) => Promise<void>;
      validateDomain: (domain: Domain) => boolean;
      updateSettings: (domain: Domain, settings: DomainConfig) => Promise<void>;
    };
    access: {
      validateAccess: (user: User, domain: Domain) => boolean;
      getDomainPermissions: (user: User, domain: Domain) => Permission[];
      updatePermissions: (user: User, permissions: Permission[]) => Promise<void>;
    };
    crossDomain: {
      shareExperience: (experience: Experience, domains: Domain[]) => Promise<void>;
      validateCrossDomain: (source: Domain, target: Domain) => boolean;
      syncDomainData: (domains: Domain[]) => Promise<void>;
    };
  }