import type { Dispatch } from 'react';

export interface Version {
  major: number;
  minor: number;
  patch: number;
  hash?: string;
  timestamp?: number;
}

export interface RolloutPhase {
  id: string;
  name: string;
  duration: number;
  percentage: number;
}

export interface RolloutCondition {
  type: string;
  value: any;
  operator: string;
}

export interface MetricThreshold {
  metric: string;
  min?: number;
  max?: number;
  target: number;
}

export interface AlertConfig {
  type: string;
  threshold: number;
  action: string;
}

export interface MigrationStep {
  id: string;
  type: string;
  action: string;
  rollback: string;
}

export interface ValidationStep {
  id: string;
  type: string;
  criteria: string[];
}

export interface RollbackStep {
  id: string;
  type: string;
  action: string;
}

export interface EvolutionState {
  version: Version;
  features: {
    enabled: Feature[];
    pending: Feature[];
    deprecated: Feature[];
  };
  migrations: {
    current: string;
    history: string[];
    pending: string[];
  };
  compatibility: {
    minVersion: string;
    maxVersion: string;
    domains: string[];
  };
}

export interface Feature {
  id: string;
  name: string;
  enabled: boolean;
  config: any;
  dependencies: string[];
  rolloutStrategy: RolloutStrategy;
}

export interface RolloutStrategy {
  type: 'immediate' | 'gradual' | 'scheduled';
  schedule?: {
    startDate: Date;
    endDate: Date;
    phases: RolloutPhase[];
  };
  targeting?: {
    userGroups: string[];
    domains: string[];
    conditions: RolloutCondition[];
  };
  monitoring: {
    metrics: string[];
    thresholds: MetricThreshold[];
    alerts: AlertConfig[];
  };
}

export interface MigrationStrategy {
  id: string;
  name: string;
  fromVersion: Version;
  toVersion: Version;
  steps: MigrationStep[];
  validation: ValidationStep[];
  rollback: RollbackStep[];
  dependencies: string[];
}

export interface EvolutionAction {
  type: 'UPGRADE_VERSION' 
      | 'ENABLE_FEATURE' 
      | 'DISABLE_FEATURE' 
      | 'ADD_MIGRATION';
  payload: any;
}

export interface EvolutionContextValue {
  state: EvolutionState;
  dispatch: Dispatch<EvolutionAction>;
  versions: {
    current: Version;
    supported: Version[];
    upgrade: (target: Version) => Promise<void>;
    rollback: (version: Version) => Promise<void>;
  };
  features: {
    active: Feature[];
    pending: Feature[];
    enable: (feature: Feature) => Promise<void>;
    disable: (feature: Feature) => Promise<void>;
  };
  migrations: {
    strategies: MigrationStrategy[];
    execute: (strategy: MigrationStrategy) => Promise<void>;
    validate: (strategy: MigrationStrategy) => boolean;
  };
}