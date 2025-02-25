// src/hooks/useCore.ts
import { useMemo } from 'react';
import { useEvolution } from './useEvolution';
import { useDomain } from './useDomain';
import { useStateContext } from './useStateContext';
import { useProfile } from './useProfile';

export const useCore = () => {
  const evolution = useEvolution();
  const domain = useDomain();
  const state = useStateContext();
  const profile = useProfile();

  return useMemo(() => ({
    evolution,
    domain,
    state,
    profile,
    isReady: !!(evolution && domain && state && profile)
  }), [evolution, domain, state, profile]);
};