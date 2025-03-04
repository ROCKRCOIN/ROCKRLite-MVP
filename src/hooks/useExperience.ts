 // src/hooks/useExperience.ts
import { useContext } from 'react';
import { ExperienceContext } from '../context/ExperienceContext';
import type { ExperienceContextValue } from '../interfaces/experience/types';

export const useExperience = (): ExperienceContextValue => {
  const context = useContext(ExperienceContext);
  if (context === undefined) {
    throw new Error('useExperience must be used within an ExperienceProvider');
  }
  return context;
};
