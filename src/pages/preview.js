// src/pages/preview.js
import React from 'react';
import { EvolutionProvider } from '../context/EvolutionContext';
import { DomainProvider } from '../context/DomainContext';
import { RKSProvider } from '../context/RKSContext';
import { ExperienceProvider } from '../context/ExperienceContext';
import { useDomain } from '../hooks/useDomain';
import { useExperience } from '../hooks/useExperience';
import { useRKS } from '../hooks/useRKS';

// Component using all hooks
const HooksTestComponent = () => {
  const domain = useDomain();
  const experience = useExperience();
  const rks = useRKS();
  
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">Domain Context</h3>
        <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto max-h-40">
          {JSON.stringify(domain.state, null, 2)}
        </pre>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold">Experience Context</h3>
        <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto max-h-40">
          {JSON.stringify(experience, null, 2)}
        </pre>
      </div>
      
      <div>
        <h3 className="text-lg font-semibold">RKS Context</h3>
        <pre className="mt-2 p-3 bg-gray-100 rounded overflow-auto max-h-40">
          {JSON.stringify(rks, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default function Preview() {
  return (
    <EvolutionProvider>
      <DomainProvider>
        <RKSProvider>
          <ExperienceProvider>
            <div className="p-6 max-w-4xl mx-auto">
              <h1 className="text-2xl font-bold mb-6">All Hooks Test</h1>
              <div className="border p-4 rounded-lg shadow-sm">
                <HooksTestComponent />
              </div>
            </div>
          </ExperienceProvider>
        </RKSProvider>
      </DomainProvider>
    </EvolutionProvider>
  );
}