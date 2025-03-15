import React, { useState } from 'react';
import ExperienceStep1 from '../components/experience/ExperienceStep1';
import ExperienceDetailsStep from '../components/experience/ExperienceDetailsStep';
import { ExperienceProvider } from '../context/ExperienceContext';
import { DomainProvider } from '../context/DomainContext';
import { EvolutionProvider } from '../context/EvolutionContext';
import { RKSProvider } from '../context/RKSContext';

export default function ExperienceDemo() {
  const [currentStep, setCurrentStep] = useState(1);

  return (
    <EvolutionProvider>
      <DomainProvider>
        <RKSProvider>
          <ExperienceProvider>
            <div className="min-h-screen bg-gray-50 p-8">
              <div className="max-w-2xl mx-auto space-y-8">
                <div className="flex justify-between mb-8">
                  <button 
                    onClick={() => setCurrentStep(1)}
                    className={`px-4 py-2 ${currentStep === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
                  >
                    Step 1
                  </button>
                  <button 
                    onClick={() => setCurrentStep(2)}
                    className={`px-4 py-2 ${currentStep === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'} rounded`}
                  >
                    Step 2
                  </button>
                </div>
                
                {currentStep === 1 && <ExperienceStep1 />}
                {currentStep === 2 && <ExperienceDetailsStep />}
              </div>
            </div>
          </ExperienceProvider>
        </RKSProvider>
      </DomainProvider>
    </EvolutionProvider>
  );
}