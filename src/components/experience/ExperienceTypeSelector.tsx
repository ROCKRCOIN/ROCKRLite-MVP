 // src/components/experience/ExperienceTypeSelector.tsx
import React from 'react';
import { Check } from 'lucide-react';
import type { ExperienceType } from '../../interfaces/experience/types';

export interface ExperienceTypeOption {
  id: ExperienceType;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

export interface TypeSelectorProps {
  types: ExperienceTypeOption[];
  selectedType: ExperienceType | null;
  onTypeSelect: (type: ExperienceType) => void;
  domain: string;
  features?: string[];
  className?: string;
}

const ExperienceTypeSelector: React.FC<TypeSelectorProps> = ({
  types,
  selectedType,
  onTypeSelect,
  domain,
  features = [],
  className = ''
}) => {
  return (
    <div className={`space-y-4 ${className}`}>
      {types.map(type => (
        <div
          key={type.id}
          className={`p-4 border rounded-lg transition-colors ${
            selectedType === type.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-200'
          }`}
        >
          <button
            type="button"
            onClick={() => onTypeSelect(type.id)}
            className="flex-1 flex items-center text-left w-full"
          >
            <div className={`
              h-5 w-5 rounded border flex items-center justify-center mr-3
              ${selectedType === type.id
                ? 'bg-blue-500 border-blue-500'
                : 'border-gray-300'
              }
            `}>
              {selectedType === type.id && (
                <Check className="h-3 w-3 text-white" />
              )}
            </div>
            <div>
              <span className="font-medium text-gray-900">
                {type.name}
              </span>
              <span className="block mt-1 text-sm text-gray-500">
                {type.description}
              </span>
            </div>
          </button>
        </div>
      ))}
    </div>
  );
};

export default ExperienceTypeSelector;
