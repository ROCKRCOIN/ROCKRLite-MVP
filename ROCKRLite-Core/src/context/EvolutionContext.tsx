import React, { createContext, useContext, useReducer } from 'react';
import { EvolutionState, EvolutionAction, EvolutionContextValue } from '../interfaces/evolution/types';
import { useStateContext } from './StateContext';

const EvolutionContext = createContext<EvolutionContextValue | undefined>(undefined);

export interface EvolutionProviderProps {
  children: React.ReactNode;
  initialState: Partial<EvolutionState>;
}

export const EvolutionProvider: React.FC<EvolutionProviderProps> = ({
  children,
  initialState
}) => {
  const [state, dispatch] = useReducer(evolutionReducer, initialState as EvolutionState);
  const { state: globalState } = useStateContext();

  const value = {
    state,
    dispatch,
    versions: {
      current: state.version,
      supported: calculateSupportedVersions(state),
      upgrade: async (target: Version) => {
        // Implementation
        const migration = await planUpgrade(state.version, target);
        await executeMigration(migration);
        dispatch({ type: 'UPGRADE_VERSION', payload: target });
      },
      rollback: async (version: Version) => {
        // Implementation
        const rollback = await planRollback(state.version, version);
        await executeRollback(rollback);
        dispatch({ type: 'UPGRADE_VERSION', payload: version });
      }
    },
    features: {
      active: state.features.enabled,
      pending: state.features.pending,
      enable: async (feature: Feature) => {
        // Implementation
        if (await validateFeature(feature)) {
          dispatch({ type: 'ENABLE_FEATURE', payload: feature });
        }
      },
      disable: async (feature: Feature) => {
        // Implementation
        dispatch({ type: 'DISABLE_FEATURE', payload: feature });
      }
    },
    migrations: {
      strategies: getMigrationStrategies(state),
      execute: async (strategy: MigrationStrategy) => {
        // Implementation
        if (validateMigration(strategy)) {
          await executeMigration(strategy);
          dispatch({ type: 'ADD_MIGRATION', payload: strategy });
        }
      },
      validate: (strategy: MigrationStrategy) => {
        // Implementation
        return validateMigration(strategy);
      }
    }
  };

  return (
    <EvolutionContext.Provider value={value}>
      {children}
    </EvolutionContext.Provider>
  );
};

export const useEvolution = () => {
  const context = useContext(EvolutionContext);
  if (context === undefined) {
    throw new Error('useEvolution must be used within an EvolutionProvider');
  }
  return context;
};