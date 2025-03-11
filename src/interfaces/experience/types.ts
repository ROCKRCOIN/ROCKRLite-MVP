// src/interfaces/experience/types.ts
import type { Version, Feature, MigrationStrategy } from '../evolution/types';

// Core Type Definitions
export type ExperienceType =
  | 'lecture'
  | 'workshop'
  | 'seminar'
  | 'performance'
  | 'exhibition'
  | 'social';

export type ExperienceStep = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export type ExperienceSetting =
  | 'academic'
  | 'cultural'
  | 'social'
  | 'wellness'
  | 'professional';

export type ExperienceStatus =
  | 'draft'
  | 'published'
  | 'scheduled'
  | 'completed'
  | 'cancelled';

export type SlotStatus =
  | 'available'
  | 'booked'
  | 'pending'
  | 'unavailable';

export type ExperienceVisibility =
  | 'domain-only'
  | 'selected-domains'
  | 'public';

// Experience Core Types
export interface Experience {
  id: string;
  type: ExperienceType;
  setting: ExperienceSetting;
  subject?: string;
  subjectLevel?: string;
  genre?: string;
  capacity: {
    min: number;
    max: number;
    target: number;
  };
  location: Location;
  schedule: Schedule;
  rks: RKSAllocation;
  status: ExperienceStatus;
}

export interface Location {
  country: string;
  city: string;
  venue?: Venue;
  capacity: number;
  features: string[];
}

export interface Venue {
  id: string;
  name: string;
  type: string;
  capacity: number;
  features: string[];
  address: string;
}

export interface Schedule {
  slots: TimeSlot[];
  duration: number;
  timezone: string;
  preferences: SchedulePreference[];
}

export interface TimeSlot {
  start: Date;
  end: Date;
  duration: number;
  status: SlotStatus;
}

export interface SchedulePreference {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  priority: number;
}

export interface RKSAllocation {
  total: number;
  breakdown: {
    host: number;
    attendees: number;
    curator: number;
    venue: number;
    production: number;
    ai: number;
  };
  mining: {
    available: number;
    locked: number;
    distributed: number;
  };
}

// Enhanced RKS Allocation for X=Y Balance Support
export interface EnhancedRKSAllocation extends RKSAllocation {
  // UIMA eligibility
  isEligibleForUima: boolean;
  eligibilityReason?: string;
  
  // Variable locking
  locked: Record<string, boolean>;
  
  // Balance management
  xSide: {
    total: number;
    components: Record<string, number>;
  };
  ySide: {
    total: number;
    components: Record<string, number>;
  };
  
  // Reset capabilities
  resetToDefault: (variable: string) => void;
  resetAllToDefault: () => void;
}

export interface RKSEstimate {
  total: number;
  mining: number;
  distribution: {
    host: number;
    attendees: number;
    venue: number;
    curator: number;
    production: number;
  };
}

export interface AuctionConfig {
  startDate: Date;
  endDate: Date;
  minimumBid: number;
  reservedPercentage: number;
  status: 'pending' | 'active' | 'closed';
}

// Participant types - moved before EvolvableExperience
export interface HostParticipant {
  userId: string;
  role: string;
  status: 'confirmed' | 'pending' | 'declined';
  rksAllocation: number;
}

export interface AttendeeParticipant {
  userId: string;
  status: 'confirmed' | 'pending' | 'waitlist';
  bid: number;
}

export interface CuratorParticipant {
  userId: string;
  status: 'confirmed' | 'pending';
  rksAllocation: number;
}

export interface VenueParticipant {
  venueId: string;
  status: 'confirmed' | 'pending';
  rksAllocation: number;
}

export interface ProductionParticipant {
  userId: string;
  role: string;
  status: 'confirmed' | 'pending';
  rksAllocation: number;
}

// Enhanced Experience System
export interface EvolvableExperience extends Omit<Experience, 'rks'> {
  // Additional fields from Updated Part 3
  domainId: string;
  title: string;
  description: string;
  domain: {
    primary: string;
    visibility: ExperienceVisibility;
    allowedDomains: string[];
  };
  
  // Enhanced RKS Configuration
  rks: {
    targetSeatPrice: number;
    totalMining: number;
    allocation: RKSAllocation;
    auction: AuctionConfig;
  };
  
  // Participant Management
  participants: {
    hosts: HostParticipant[];
    attendees: AttendeeParticipant[];
    curator: CuratorParticipant;
    venue: VenueParticipant;
    production?: ProductionParticipant[];
  };
  
  // Evolution Support
  evolution: {
    version: Version;
    features: Feature[];
    migrations: MigrationStrategy[];
  };
}

// Template System - Enhanced to support full template functionality
export interface ExperienceTemplate {
  id: string;
  name: string;
  description: string;
  type: ExperienceType;
  setting: ExperienceSetting;
  // Added properties from specification requirements
  subject?: string;
  subjectLevel?: string;
  genre?: string;
  defaultCapacity: {
    min: number;
    max: number;
    target: number;
  };
  defaultRks: RKSAllocation;
  recommendedFor: string[]; // Profile types this template is suited for
  icon?: React.ReactNode;
  // Template customization tracking
  isCustomized?: boolean;
  sourceTemplateId?: string;
}

// Balance Management Types - Enhanced to support variable locking
export interface BalanceResult {
  xTotal: number;
  yTotal: number;
  isBalanced: boolean;
  difference: number;
  adjustableVariables: string[];
  // Added properties from specification requirements
  lockedVariables: string[];
  adjustments: Array<{
    variable: string;
    oldValue: number;
    newValue: number;
    reason: string;
  }>;
  timestamp: number;
}

// Experience UI Component Types
export interface ExperienceTypeOption {
  id: ExperienceType;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

export interface SettingOption {
  id: ExperienceSetting;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

export interface Step1Data {
  type: ExperienceType;
  setting: ExperienceSetting;
  capacity: {
    min: number;
    max: number;
    target: number;
  };
  location: Location;
  rks: RKSEstimate;
}

// Validation Types
export interface ValidationError {
  field: string;
  message: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationState {
  errors: ValidationError[];
  warnings: ValidationWarning[];
  lastChecked: number;
  isValid: boolean;
}

// Step-specific validation types
export interface StepValidation {
  step: ExperienceStep;
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  lastValidated: number;
}

// State Management Types
export interface ExperienceState {
  currentStep: number;
  data: Partial<Experience>;
  isDraft: boolean;
  validation: ValidationState;
  loading: boolean;
  error: string | null;
  evolution: {
    version: Version;
    features: string[];
  };
  
  // Navigation and step tracking
  steps: {
    currentStep: number;
    totalSteps: number;
    stepValidation: Record<ExperienceStep, boolean>;
    canNavigate: (toStep: ExperienceStep) => boolean;
  };
  
  // Template tracking
  template: {
    id: string;
    source: string;
    isCustomized: boolean;
    resetToTemplate: () => void;
  };
  
  // X=Y balance support
  balance: {
    xTotal: number;
    yTotal: number;
    isBalanced: boolean;
    lockedVariables: string[];
  };
}

export type ExperienceAction =
  | { type: 'UPDATE_STEP'; step: ExperienceStep; data: any }
  | { type: 'SAVE_DRAFT'; payload: Experience }
  | { type: 'PUBLISH'; payload: Experience }
  | { type: 'UPDATE_VALIDATION'; payload: ValidationResult }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'RESET' }
  | { type: 'NAVIGATE_TO_STEP'; step: ExperienceStep }
  | { type: 'LOCK_VARIABLE'; variable: string }
  | { type: 'UNLOCK_VARIABLE'; variable: string }
  | { type: 'APPLY_TEMPLATE'; template: ExperienceTemplate }
  | { type: 'RESET_VARIABLE'; variable: string }
  | { type: 'UPDATE_BALANCE'; balance: BalanceResult };

export interface ExperienceContextValue {
  state: ExperienceState;
  dispatch: React.Dispatch<ExperienceAction>;
  
  // Experience Management
  experience: {
    current: Experience;
    draft: Experience | null;
    history: Experience[];
    create: () => Promise<void>;
    update: (data: Partial<Experience>) => Promise<void>;
    publish: () => Promise<void>;
  };
  
  // Evolution Support
  evolution: {
    version: Version;
    features: string[];
    upgrade: (experience: Experience) => Promise<void>;
  };
  
  // Validation
  validation: {
    errors: ValidationError[];
    warnings: ValidationWarning[];
    validate: () => Promise<boolean>;
    validateStep: (step: ExperienceStep) => Promise<boolean>;
  };
  
  // Navigation
  navigation: {
    goToStep: (step: ExperienceStep) => Promise<boolean>;
    canNavigate: (fromStep: ExperienceStep, toStep: ExperienceStep) => boolean;
    saveCurrentStep: () => Promise<void>;
    getStepName: (step: ExperienceStep) => string;
  };
  
  // Template management
  templates: {
    available: ExperienceTemplate[];
    current: ExperienceTemplate | null;
    apply: (templateId: string) => Promise<void>;
    revertToTemplate: () => Promise<void>;
    customize: (customizations: Partial<ExperienceTemplate>) => Promise<void>;
  };
  
  // Balance management
  balance: {
    lockVariable: (variable: string) => Promise<boolean>;
    unlockVariable: (variable: string) => Promise<void>;
    updateVariable: (variable: string, value: any) => Promise<boolean>;
    getAdjustableVariables: () => string[];
    calculateBalance: () => BalanceResult;
  };
}

// UI Component Props
export interface Step1Props {
  onComplete: (data: Step1Data) => void;
  onSave: (data: Step1Data) => void;
  initialData?: Partial<Step1Data>;
}

export interface SettingSheetProps {
  type: ExperienceType;
  onSelect: (setting: ExperienceSetting) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface LocationSheetProps {
  country?: string;
  onSelect: (location: Location) => void;
  isOpen: boolean;
  onClose: () => void;
}

export interface TypeSelectorProps {
  types: ExperienceTypeOption[];
  selectedType: ExperienceType | null;
  onTypeSelect: (type: ExperienceType) => void;
  domain: string;
  features?: string[];
  className?: string;
}

export interface CapacitySelectorProps {
  minCapacity?: number;
  maxCapacity?: number;
  defaultCapacity?: number;
  onChange: (capacity: number) => void;
  className?: string;
}

export interface BasicDetailsProps {
  domain: string;
  onUpdate: (details: any) => void;
  features?: string[];
  className?: string;
}

// Multi-step Navigation Props
export interface StepNavigationProps {
  currentStep: ExperienceStep;
  totalSteps: number;
  stepValidation: Record<ExperienceStep, boolean>;
  onStepChange: (step: ExperienceStep) => void;
  className?: string;
}