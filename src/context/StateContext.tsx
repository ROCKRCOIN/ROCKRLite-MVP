// Full path: src/context/StateContext.tsx

import React, { createContext, useContext, useReducer, useRef, useEffect } from 'react';
import {
  StateSystem,
  StateAction,
  StateContextValue,
  StateBackup,
  StateConflict,
  MigrationStrategy
} from '../interfaces/state/types';

const StateContext = createContext<StateContextValue | undefined>(undefined);

export interface StateProviderProps {
  children: React.ReactNode;
  initialState: Partial<StateSystem>;
}

const stateReducer = (state: StateSystem, action: StateAction): StateSystem => {
  switch (action.type) {
    case 'UPDATE_STATE':
      return { ...state, ...action.payload };
    case 'RESTORE_STATE':
      return action.payload;
    default:
      return state;
  }
};

const validateBackup = (backup: StateBackup): boolean => {
  return !!backup && !!backup.state && !!backup.timestamp;
};

const validateState = (state: StateSystem): boolean => {
  return !!state && !!state.version;
};

const validateStateSync = (localState: any, remoteState: any): boolean => {
  return !!localState && !!remoteState;
};

const synchronizeStates = async (
  localState: StateSystem,
  remoteState: any
): Promise<StateSystem> => {
  return { ...localState, ...remoteState };
};

const resolveStateConflicts = async (
  state: StateSystem,
  conflicts: StateConflict[]
): Promise<StateSystem> => {
  return state;
};

const executeMigration = async (
  state: StateSystem,
  migration: MigrationStrategy
): Promise<StateSystem> => {
  return {
    ...state,
    version: migration.version
  };
};

export const StateProvider: React.FC<StateProviderProps> = ({
  children,
  initialState
}) => {
  const [state, dispatch] = useReducer(stateReducer, {
    version: {
      major: 1,
      minor: 0,
      patch: 0,
      timestamp: Date.now()
    },
    features: [],
    migrations: [],
    timestamp: Date.now(),
    data: {},
    ...initialState
  } as StateSystem);

  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const value = {
    state,
    dispatch,
    operations: {
      backup: async () => {
        const backup = {
          state: stateRef.current,
          timestamp: Date.now()
        };
        localStorage.setItem('state_backup', JSON.stringify(backup));
      },
      restore: async (backup: StateBackup) => {
        if (validateBackup(backup)) {
          dispatch({ type: 'RESTORE_STATE', payload: backup.state });
        }
      },
      validate: () => {
        return validateState(stateRef.current);
      }
    },
    sync: {
      synchronize: async (remoteState: any) => {
        const mergedState = await synchronizeStates(stateRef.current, remoteState);
        dispatch({ type: 'UPDATE_STATE', payload: mergedState });
      },
      validate: (localState: any, remoteState: any) => {
        return validateStateSync(localState, remoteState);
      },
      resolveConflicts: async (conflicts: StateConflict[]) => {
        const resolvedState = await resolveStateConflicts(stateRef.current, conflicts);
        dispatch({ type: 'UPDATE_STATE', payload: resolvedState });
      }
    },
    evolution: {
      version: state.version,
      features: state.features,
      migrations: state.migrations,
      migrateState: async (migration: MigrationStrategy) => {
        const migratedState = await executeMigration(stateRef.current, migration);
        dispatch({ type: 'UPDATE_STATE', payload: migratedState });
      }
    }
  };

  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
};

export const useStateContext = () => {
  const context = useContext(StateContext);
  if (context === undefined) {
    throw new Error('useStateContext must be used within a StateProvider');
  }
  return context;
};