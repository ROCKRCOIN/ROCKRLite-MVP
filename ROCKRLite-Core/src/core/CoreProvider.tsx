import React from 'react';
import { StateProvider } from '../context/StateContext';
import { EvolutionProvider } from '../context/EvolutionContext';
import { DomainProvider } from '../context/DomainContext';
import { StateSystem } from '../interfaces/state/types';
import { EvolutionState } from '../interfaces/evolution/types';
import { DomainState } from '../interfaces/domain/types';

export interface CoreProviderProps {
  children: React.ReactNode;
  initialState?: Partial<StateSystem>;
  initialEvolutionState?: Partial<EvolutionState>;
  initialDomainState?: Partial<DomainState>;
}

export const CoreProvider: React.FC<CoreProviderProps> = ({
  children,
  initialState = {},
  initialEvolutionState = {},
  initialDomainState = {}
}) => {
  return (
    <StateProvider initialState={initialState}>
      <EvolutionProvider initialState={initialEvolutionState}>
        <DomainProvider initialState={initialDomainState}>
          {children}
        </DomainProvider>
      </EvolutionProvider>
    </StateProvider>
  );
};

// Utility to create initial state
export const createInitialState = () => {
  const version = {
    major: 1,
    minor: 0,
    patch: 0,
    hash: '',
    timestamp: Date.now(),
    features: [],
    breaking: false
  };

  return {
    state: {
      version,
      features: {},
      migrations: {
        pending: [],
        completed: [],
        failed: []
      },
      monetaryPolicy: {
        // Add initial monetary policy configuration
      },
      systemHealth: {
        // Add initial health metrics
      }
    } as Partial<StateSystem>,
    
    evolution: {
      version,
      features: {
        enabled: [],
        pending: [],
        deprecated: []
      },
      migrations: {
        current: '',
        history: [],
        pending: []
      },
      compatibility: {
        minVersion: '1.0.0',
        maxVersion: '2.0.0',
        domains: []
      }
    } as Partial<EvolutionState>,
    
    domain: {
      currentDomain: null,
      domains: [],
      history: [],
      loading: false,
      error: null
    } as Partial<DomainState>
  };
};