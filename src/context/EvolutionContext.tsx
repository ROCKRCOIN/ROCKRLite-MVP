import React, { createContext, useReducer, useRef, useEffect } from 'react';
import type {
  EvolutionContextValue,
  EvolutionAction,
  Version,
  Feature,
  MigrationStrategy
} from '../interfaces/evolution/types';
import { validateVersion, executeMigration } from '../utils/evolution';

const initialState = {
  version: {
    major: 1,
    minor: 0,
    patch: 0,
    timestamp: Date.now()
  },
  features: [],
  migrations: []
};

export const EvolutionContext = createContext<EvolutionContextValue | undefined>(undefined);

function evolutionReducer(state: any, action: EvolutionAction) {
  switch (action.type) {
    case 'UPDATE_VERSION':
      return { ...state, version: action.payload };
    case 'ENABLE_FEATURE':
      return {
        ...state,
        features: { ...state.features, [action.payload]: true }
      };
    case 'DISABLE_FEATURE':
      return {
        ...state,
        features: { ...state.features, [action.payload]: false }
      };
    case 'EXECUTE_MIGRATION':
      return { ...state, version: action.payload.version };
    default:
      return state;
  }
}

export function EvolutionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(evolutionReducer, initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const value: EvolutionContextValue = {
    state: {
      current: state,
      migrateState: (state, migration) => executeMigration(state, migration),
      validateState: (state, version) => validateVersion(version)
    },
    versions: {
      current: state.version,
      supported: [],
      upgrade: async (target) => {
        dispatch({ type: 'UPDATE_VERSION', payload: target });
      },
      rollback: async (version) => {
        dispatch({ type: 'UPDATE_VERSION', payload: version });
      }
    },
    features: {
      active: state.features.filter((f: Feature) => f.enabled),
      pending: state.features.filter((f: Feature) => !f.enabled),
      enable: async (feature) => {
        dispatch({ type: 'ENABLE_FEATURE', payload: feature.id });
      },
      disable: async (feature) => {
        dispatch({ type: 'DISABLE_FEATURE', payload: feature.id });
      }
    },
    migrations: {
      strategies: state.migrations,
      execute: async (strategy) => {
        dispatch({ type: 'EXECUTE_MIGRATION', payload: strategy });
      },
      validate: () => true,
      rollback: async (strategy) => {
        const previousVersion = strategy.rollback[0]?.action;
        if (previousVersion) {
          dispatch({ type: 'UPDATE_VERSION', payload: previousVersion });
        }
      }
    }
  };

  return (
    <EvolutionContext.Provider value={value}>
      {children}
    </EvolutionContext.Provider>
  );
}