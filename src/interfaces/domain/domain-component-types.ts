// src/interfaces/domain/domain-component-types.ts

import { Domain, DomainConfig } from './types';
import { Version } from '../evolution/types';

// Domain Switcher Component Types
export interface DomainSwitcherProps {
  currentDomain?: Domain;
  availableDomains?: Domain[];
  onDomainChange?: (domain: Domain) => void;
  onSettingsClick?: () => void;
  className?: string;
  disabled?: boolean;
}

// Domain Validation Component Types
export interface ValidationRule {
  id: string;
  name: string;
  description: string;
  validate: (value: any, domain: Domain) => boolean;
  errorMessage: string;
}

export interface DomainValidationProps {
  domain: Domain;
  rules?: ValidationRule[];
  value?: any;
  onValidationChange?: (isValid: boolean) => void;
  className?: string;
}

// Domain Settings Component Types
export interface DomainSettingsProps {
  domain: Domain;
  onSave?: (config: Partial<DomainConfig>) => void;
  onCancel?: () => void;
  className?: string;
}

export interface SettingsSection {
  id: string;
  title: string;
  description?: string;
  fields: SettingsField[];
}

export interface SettingsField {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'toggle' | 'checkbox';
  value: any;
  options?: { label: string; value: any }[];
  onChange: (value: any) => void;
  validation?: ValidationRule[];
}

// Cross-Domain Manager Component Types
export interface CrossDomainManagerProps {
  primaryDomain: Domain;
  availableDomains: Domain[];
  allowedDomains: string[];
  onAllowedDomainsChange?: (domains: string[]) => void;
  onSave?: () => void;
  onCancel?: () => void;
  className?: string;
}

export interface DomainRelationship {
  sourceDomain: Domain;
  targetDomain: Domain;
  allowed: boolean;
  restrictions?: string[];
  version: Version;
}