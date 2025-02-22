// src/interfaces/state/types.ts

export interface StateSystem {
    version: string;
    features: string[];
    migrations: string[];
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
      version: string;
      features: string[];
      migrations: string[];
      migrateState: (migration: MigrationStrategy) => Promise<void>;
    };
  }
  
  export interface MigrationStrategy {
    id: string;
    version: string;
    steps: string[];
    rollback: string[];
  }