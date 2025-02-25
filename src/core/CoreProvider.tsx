// src/core/CoreProvider.tsx 
import React from 'react'; 
import { EvolutionProvider } from '../context/EvolutionContext'; 
import { DomainProvider } from '../context/DomainContext'; 
import { StateProvider } from '../context/StateContext'; 
import { ProfileProvider } from '../context/ProfileContext'; 
 
interface CoreProviderProps { 
  children: React.ReactNode; 
  initialState?: any; 
} 
 
export const CoreProvider: React.FC<CoreProviderProps> = ({ 
  children, 
  initialState = {} 
}) => { 
  return ( 
    <EvolutionProvider> 
        <DomainProvider> 
          <ProfileProvider> 
            {children} 
          </ProfileProvider> 
        </DomainProvider> 
      </StateProvider> 
    </EvolutionProvider> 
  ); 
}; 
