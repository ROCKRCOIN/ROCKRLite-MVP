// Full path: src/interfaces/state/types.ts

export interface Version {
    major: number;
    minor: number;
    patch: number;
    timestamp: number;
  }
  
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
  
  export interface Feature {
    id: string;
    name: string;
    enabled: boolean;
    config: any;
    dependencies: string[];
  }
  
  export interface MigrationStrategy {
    id: string;
    version: Version;
    steps: MigrationStep[];
    rollback: RollbackStep[];
  }
  
  export interface MigrationStep {
    id: string;
    type: string;
    action: string;
  }
  
  export interface RollbackStep {
    id: string;
    type: string;
    action: string;
  }
  
  export type StateAction =
    | { type: 'UPDATE_STATE'; payload: any }
    | { type: 'RESTORE_STATE'; payload: StateSystem };
  
  export interface StateContextValue {
    state: StateSystem;
    dispatch: React.Dispatch<StateAction>;
    operations: {
      backup: () => Promise<void>;
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