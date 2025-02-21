import { useContext } from 'react';
import { DomainContext } from '../context/DomainContext';

export const useDomain = () => {
  const context = useContext(DomainContext);
  if (context === undefined) {
    throw new Error('useDomain must be used within a DomainProvider');
  }
  return context;
};

export const useDomainConfig = (domainId: string) => {
  const { state } = useDomain();
  return React.useMemo(() => {
    const domain = state.domains.find(d => d.id === domainId);
    return domain?.config;
  }, [state.domains, domainId]);
};