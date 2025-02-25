// ROCKRLite-MVP/ROCKRLite-Core/src/context/EvolutionContext.tsx
import React, { createContext, useReducer } from 'react';
import {
 EvolutionState,
 EvolutionAction, 
 EvolutionContextValue,
 Version,
 Feature,
 MigrationStrategy
} from '../interfaces/evolution/types';

export const EvolutionContext = createContext<EvolutionContextValue | undefined>(undefined);

const initialState: EvolutionState = {
 version: {
   major: 1,
   minor: 0,
   patch: 0,
   timestamp: Date.now()
 },
 features: {
   enabled: [],
   pending: []
 },
 migrations: {
   current: '',
   history: [],
   pending: []
 }
};

const evolutionReducer = (state: EvolutionState, action: EvolutionAction): EvolutionState => {
 switch (action.type) {
   case 'UPGRADE_VERSION':
     return {
       ...state,
       version: action.payload
     };
   case 'ENABLE_FEATURE':
     return {
       ...state,
       features: {
         ...state.features,
         enabled: [...state.features.enabled, action.payload]
       }
     };
   case 'DISABLE_FEATURE':
     return {
       ...state,
       features: {
         ...state.features,
         enabled: state.features.enabled.filter(f => f.id !== action.payload.id)
       }
     };
   case 'ADD_MIGRATION':
     return {
       ...state,
       migrations: {
         ...state.migrations,
         pending: [...state.migrations.pending, action.payload.id]
       }
     };
   default:
     return state;
 }
};

export interface EvolutionProviderProps {
 children: React.ReactNode;
}

export const EvolutionProvider: React.FC<EvolutionProviderProps> = ({ children }) => {
 const [state, dispatch] = useReducer(evolutionReducer, initialState);

 const value: EvolutionContextValue = {
   state,
   dispatch,
   versions: {
     current: state.version,
     supported: [],
     upgrade: async (target: Version) => {
       dispatch({ type: 'UPGRADE_VERSION', payload: target });
     },
     rollback: async (version: Version) => {
       dispatch({ type: 'UPGRADE_VERSION', payload: version });
     }
   },
   features: {
     active: state.features.enabled,
     pending: state.features.pending,
     enable: async (feature: Feature) => {
       dispatch({ type: 'ENABLE_FEATURE', payload: feature });
     },
     disable: async (feature: Feature) => {
       dispatch({ type: 'DISABLE_FEATURE', payload: feature });
     }
   },
   migrations: {
     strategies: [],
     execute: async (strategy: MigrationStrategy) => {
       dispatch({ type: 'ADD_MIGRATION', payload: strategy });
     },
     validate: (strategy: MigrationStrategy) => true
   }
 };

 return (
   <EvolutionContext.Provider value={value}>
     {children}
   </EvolutionContext.Provider>
 );
};

export default EvolutionContext;