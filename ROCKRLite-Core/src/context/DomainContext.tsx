// Full path: src/context/DomainContext.tsx

import React, { createContext, useReducer, useRef, useEffect } from 'react';
import type { DomainState, DomainAction, DomainContextValue } from '../interfaces/domain/types';
import { validateDomainAccess, getDomainConfiguration, getPermissions } from '../utils/domain';
import { validateVersion, executeMigration } from '../utils/evolution';

const initialState: DomainState = {
  currentDomain: null,
  domains: [],
  loading: false,
  error: null,
  features: {},
  restrictions: [],
  version: {
    major: 1,
    minor: 0,
    patch: 0
  }
};

export const DomainContext = createContext<DomainContextValue | undefined>(undefined);

function domainReducer(state: DomainState, action: DomainAction): DomainState {
  switch (action.type) {
    case 'SWITCH_DOMAIN':
      return {
        ...state,
        currentDomain: action.payload
      };
    case 'UPDATE_CONFIG':
      return {
        ...state,
        features: action.payload.features,
        restrictions: action.payload.restrictions
      };
    case 'UPDATE_VERSION':
      return {
        ...state,
        version: action.payload
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload
      };
    default:
      return state;
  }
}

export function DomainProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(domainReducer, initialState);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const value: DomainContextValue = {
    state,
    dispatch,
    operations: {
      validateDomain: validateDomainAccess,
      getDomainConfig: getDomainConfiguration,
      checkDomainAccess: validateDomainAccess
    },
    access: {
      validateAccess: validateDomainAccess,
      getDomainPermissions: getPermissions
    },
    evolution: {
      validateVersion,
      migrate: executeMigration
    }
  };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
}