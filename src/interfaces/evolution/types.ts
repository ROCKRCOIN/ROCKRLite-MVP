// src/interfaces/evolution/types.ts
import { StateSystem } from '../state/types';

export interface Version {
  major: number;
  minor: number;
  patch: number;
  timestamp: number;
}

export interface Feature {
  id: string;
  name: string;
  enabled: boolean;
  config: any;
  dependencies: string[];
}

export interface MigrationStep {
  id: string;
  type: string;
  action: any;
}

export interface ValidationStep {
  id: string;
  type: string;
  criteria: string[];
}

export interface RollbackStep {
  id: string;
  type: string;
  action: any;
}

export interface MigrationStrategy {
  id: string;
  version: Version;
  steps: MigrationStep[];
  validation: ValidationStep[];
  rollback: RollbackStep[];
}

export interface EvolutionContextValue {
  state: {
    current: StateSystem;
    migrateState: (state: StateSystem, migration: MigrationStrategy) => Promise<void>;
    validateState: (state: StateSystem, version: Version) => boolean;
  };
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
    rollback: (strategy: MigrationStrategy) => Promise<void>;
  };
}

export type EvolutionAction =
  | { type: 'UPDATE_VERSION'; payload: Version }
  | { type: 'ENABLE_FEATURE'; payload: string }
  | { type: 'DISABLE_FEATURE'; payload: string }
  | { type: 'EXECUTE_MIGRATION'; payload: MigrationStrategy };