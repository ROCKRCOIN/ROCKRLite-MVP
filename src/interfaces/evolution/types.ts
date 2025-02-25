// src/interfaces/evolution/types.ts 
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
