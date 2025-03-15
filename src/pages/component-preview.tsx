// src/pages/component-preview.jsx or .tsx
import React from 'react';
import ExperienceStep1 from '../components/experience/ExperienceStep1';
import ExperienceDetailsStep from '../components/experience/ExperienceDetailsStep';

// Mock minimal context to attempt rendering
const MockProvider = ({ children }) => {
  return children;
};

export default function ComponentPreview() {
  return (
    <div className="p-8 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-8">Component Preview</h1>
      
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">Step 1: Experience Type Selection</h2>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-red-500 mb-4">
            Note: This may not work until context is fixed, but will show rendering errors
          </div>
          <MockProvider>
            <ExperienceStep1 />
          </MockProvider>
        </div>
      </div>
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Step 2: Experience Details</h2>
        <div className="bg-white p-4 rounded shadow">
          <div className="text-red-500 mb-4">
            Note: This may not work until context is fixed, but will show rendering errors
          </div>
          <MockProvider>
            <ExperienceDetailsStep />
          </MockProvider>
        </div>
      </div>
    </div>
  );
}