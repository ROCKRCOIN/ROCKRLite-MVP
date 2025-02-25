// ROCKRLite-MVP/ROCKRLite-Core/src/hooks/useStateContext.ts
import { useContext } from 'react';
import { StateContext } from '../context/StateContext';
import {
  StateSystem,
  StateContextValue,
  StateBackup,
  StateConflict
} from '../interfaces/state/types';

export const useStateContext = (): StateContextValue => {
  const context = useContext(StateContext);
  
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  
  return context;
};

export const useStateOperations = () => {
  const { operations } = useStateContext();
  return operations;
};

export const useStateSync = () => {
  const { sync } = useStateContext();
  return sync;
};

export const useStateEvolution = () => {
  const { evolution } = useStateContext();
  return evolution;
};

export const useStateBackup = () => {
  const { operations } = useStateContext();
  return {
    backup: operations.backup,
    restore: operations.restore,
    validate: operations.validate
  };
};

export const useStateMigration = () => {
  const { evolution } = useStateContext();
  return {
    migrateState: evolution.migrateState,
    version: evolution.version,
    features: evolution.features,
    migrations: evolution.migrations
  };
};