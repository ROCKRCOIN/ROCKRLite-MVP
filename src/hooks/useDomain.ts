// src/hooks/useDomain.ts
import { useContext } from 'react';
import { DomainContextValue } from '../interfaces/domain/types';
// Change the import to use the default export
import DomainContext from '../context/DomainContext';
import { Domain } from '../interfaces/domain/types';

export const useDomain = (): DomainContextValue => {
  const context = useContext(DomainContext);
  
  if (!context) {
    throw new Error('useDomain must be used within a DomainProvider');
  }

  return context;
};

// Keep the rest of your hooks unchanged
export const useDomainValidation = (domain: Domain): boolean => {
  const { operations } = useDomain();
  return operations.validateDomain(domain);
};

export const useDomainAccess = (userId: string, domain: Domain) => {
  const { access } = useDomain();
  return {
    canAccess: access.validateAccess(userId, domain),
    permissions: access.getDomainPermissions(userId, domain)
  };
};

export const useDomainCrossAccess = (source: Domain, target: Domain) => {
  const { crossDomain } = useDomain();
  return {
    canShare: crossDomain.validateCrossDomain(source, target),
    sync: () => crossDomain.syncDomainData([source, target])
  };
};