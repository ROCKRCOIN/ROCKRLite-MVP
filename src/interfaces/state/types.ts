// src/interfaces/state/state-types-new.ts
import { Version, Feature, MigrationStrategy } from '../evolution/types';

// No local declaration of MigrationStrategy

export interface StateSystem {
  version: Version;
  features: Feature[];
  migrations: MigrationStrategy[];
  timestamp: number;
  data: any;
}

export interface StateBackup {
  state: StateSystem;
  timestamp: number;
}

export interface StateConflict {
  path: string;
  local: any;
  remote: any;
}

export type StateAction =
  | { type: 'UPDATE_STATE'; payload: any }
  | { type: 'RESTORE_STATE'; payload: StateSystem };

export interface StateContextValue {
  state: StateSystem;
  dispatch: React.Dispatch<StateAction>;
  operations: {
    backup: () => Promise<StateBackup>;
    restore: (backup: StateBackup) => Promise<void>;
    validate: () => boolean;
  };
  sync: {
    synchronize: (remoteState: any) => Promise<void>;
    validate: (localState: any, remoteState: any) => boolean;
    resolveConflicts: (conflicts: StateConflict[]) => Promise<void>;
  };
  evolution: {
    version: Version;
    features: Feature[];
    migrations: MigrationStrategy[];
    migrateState: (migration: MigrationStrategy) => Promise<void>;
  };
}