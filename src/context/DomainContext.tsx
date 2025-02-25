// ROCKRLite-MVP/ROCKRLite-Core/src/context/DomainContext.tsx
import React, { createContext, useReducer } from 'react';
import {
  Domain,
  DomainState,
  DomainAction,
  DomainContextValue,
  DomainConfig
} from '../interfaces/domain/types';

const DomainContext = createContext<DomainContextValue | undefined>(undefined);

const initialState: DomainState = {
  currentDomain: null,
  domains: [],
  history: [],
  loading: false,
  error: null
};

const domainReducer = (state: DomainState, action: DomainAction): DomainState => {
  switch (action.type) {
    case 'SWITCH_DOMAIN':
      return {
        ...state,
        currentDomain: action.payload,
        history: [...state.history, action.payload]
      };
    case 'UPDATE_DOMAIN_CONFIG':
      return {
        ...state,
        domains: state.domains.map(domain =>
          domain.id === action.payload.id
            ? { ...domain, config: action.payload.config }
            : domain
        )
      };
    case 'ADD_DOMAIN':
      return {
        ...state,
        domains: [...state.domains, action.payload]
      };
    case 'UPDATE_DOMAIN_STATUS':
      return {
        ...state,
        domains: state.domains.map(domain =>
          domain.id === action.payload.id
            ? { ...domain, status: action.payload.status }
            : domain
        )
      };
    default:
      return state;
  }
};

export interface DomainProviderProps {
  children: React.ReactNode;
}

export const DomainProvider: React.FC<DomainProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(domainReducer, initialState);

  const value: DomainContextValue = {
    state,
    dispatch,
    operations: {
      switchDomain: async (domain: Domain) => {
        dispatch({ type: 'SWITCH_DOMAIN', payload: domain });
      },
      validateDomain: (domain: Domain) => {
        return domain.id && domain.emailPattern && domain.config ? true : false;
      },
      updateSettings: async (domain: Domain, settings: DomainConfig) => {
        dispatch({
          type: 'UPDATE_DOMAIN_CONFIG',
          payload: { id: domain.id, config: settings }
        });
      }
    },
    access: {
      validateAccess: (userId: string, domain: Domain) => {
        if (!domain.config.allowedRoles) return false;
        return true;
      },
      getDomainPermissions: (userId: string, domain: Domain) => {
        return domain.config.allowedRoles || [];
      },
      updatePermissions: async (userId: string, permissions: string[]) => {
        // Implementation for permission updates
      }
    },
    crossDomain: {
      shareExperience: async (experienceId: string, domains: Domain[]) => {
        // Implementation for experience sharing
      },
      validateCrossDomain: (source: Domain, target: Domain) => {
        return source.config.crossDomain.allowedDomains.includes(target.id);
      },
      syncDomainData: async (domains: Domain[]) => {
        // Implementation for domain data synchronization
      }
    }
  };

  return (
    <DomainContext.Provider value={value}>
      {children}
    </DomainContext.Provider>
  );
};

export default DomainContext;