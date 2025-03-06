// src/interfaces/state/types.ts
import { Version, Feature, MigrationStrategy } from '../evolution/types';

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
  resolution?: any; // Added to match newer interface
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

export interface StateProviderProps {
  children: React.ReactNode;
  initialState?: Partial<StateSystem>;
}