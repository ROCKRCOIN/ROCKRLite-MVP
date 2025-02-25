// src/hooks/useEvolution.ts
import { useContext } from 'react';
import { EvolutionContext } from '../context/EvolutionContext';
import type { EvolutionContextValue } from '../interfaces/evolution/types';

export const useEvolution = (): EvolutionContextValue => {
  const context = useContext(EvolutionContext);
  if (context === undefined) {
    throw new Error('useEvolution must be used within an EvolutionProvider');
  }
  return context;
};