// src/context/StateContext.tsx
import React, { createContext, useReducer, useRef, useEffect } from 'react';
import {
  StateSystem,
  StateAction,
  StateContextValue,
  StateBackup,
  StateConflict
} from '../interfaces/state/state-types-new';
import { MigrationStrategy } from '../interfaces/evolution/types';

export const StateContext = createContext<StateContextValue | undefined>(undefined);

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
  
  const value: StateContextValue = {
    state,
    dispatch,
    operations: {
      backup: async () => ({
        state: { ...state },
        timestamp: Date.now()
      }),
      restore: async (backup: StateBackup) => {
        dispatch({ type: 'RESTORE_STATE', payload: backup.state });
      },
      validate: () => {
        return (
          !!state.version &&
          Array.isArray(state.features) &&
          Array.isArray(state.migrations)
        );
      }
    },
    sync: {
      synchronize: async (remoteState: any) => {
        dispatch({ type: 'UPDATE_STATE', payload: remoteState });
      },
      validate: (localState: any, remoteState: any) => {
        return !!localState && !!remoteState;
      },
      resolveConflicts: async (conflicts: StateConflict[]) => {
        const resolutions = conflicts.map(conflict => ({
          ...conflict,
          resolution: conflict.remote || conflict.local
        }));
        const resolvedState = resolutions.reduce((acc, curr) => ({
          ...acc,
          [curr.path]: curr.resolution
        }), {});
        dispatch({ type: 'UPDATE_STATE', payload: resolvedState });
      }
    },
    evolution: {
      version: state.version,
      features: state.features,
      migrations: state.migrations,
      migrateState: async (migration: MigrationStrategy) => {
        dispatch({ 
          type: 'UPDATE_STATE',
          payload: { version: migration.version }
        });
      }
    }
  };

  return (
    <StateContext.Provider value={value}>
      {children}
    </StateContext.Provider>
  );
};