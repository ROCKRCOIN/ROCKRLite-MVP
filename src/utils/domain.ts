import type { DomainConfig, Permission, User } from '../interfaces/domain/types';

export const validateDomainAccess = (domain: string, user?: User): boolean => {
  if (!domain) return false;
  if (!user) return false;
  return user.domains.includes(domain);
};

export const getDomainConfiguration = (domain: string): DomainConfig => {
  return {
    id: domain,
    name: domain,
    emailPattern: `@${domain}`,
    features: {},
    restrictions: [],
    rks: {
      weeklyUimaCredit: 18000,
      targetSeatPrice: 3000,
      roleAllocations: []
    }
  };
};

export const getPermissions = (domain: string): Permission[] => {
  return [];
};