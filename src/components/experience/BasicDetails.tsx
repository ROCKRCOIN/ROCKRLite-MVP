 // src/components/experience/BasicDetails.tsx
import React, { useState } from 'react';
import { useExperience } from '../../hooks/useExperience';
import { useDomain } from '../../hooks/useDomain';
import ExperienceTypeSelector from './ExperienceTypeSelector';
import SettingsBottomSheet from './SettingsBottomSheet';
import CapacitySelector from './CapacitySelector';
import { Button } from '../ui/button';
import type {
  ExperienceType,
  ExperienceSetting,
} from '../../interfaces/experience/types';
import type { ExperienceTypeOption } from './ExperienceTypeSelector';
import type { SettingOption } from './SettingsBottomSheet';

export interface BasicDetailsProps {
  domain: string;
  onUpdate: (details: any) => void;
  features?: string[];
  className?: string;
}

const BasicDetails: React.FC<BasicDetailsProps> = ({
  domain,
  onUpdate,
  features = [],
  className = ''
}) => {
  const { experience } = useExperience();
  const { operations } = useDomain();
  const [selectedType, setSelectedType] = useState<ExperienceType | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [selectedSetting, setSelectedSetting] = useState<SettingOption | null>(null);
  const [capacity, setCapacity] = useState(10);

  // From specification document example data
  const experienceTypes: ExperienceTypeOption[] = [
    { id: 'lecture', name: 'Lecture', description: 'Formal presentation of academic material' },
    { id: 'workshop', name: 'Workshop', description: 'Hands-on learning experience' },
    { id: 'seminar', name: 'Seminar', description: 'Discussion-based learning session' }
  ];

  const settings: SettingOption[] = [
    { id: 'academic', name: 'Academic', description: 'Educational and scholarly activities' },
    { id: 'social', name: 'Social', description: 'Community and networking events' },
    { id: 'cultural', name: 'Cultural', description: 'Arts, performances and exhibitions' }
  ];

  const handleTypeSelect = (type: ExperienceType) => {
    setSelectedType(type);
    onUpdate({ type });
    setIsSettingsOpen(true);
  };

  const handleSettingSelect = (setting: SettingOption) => {
    setSelectedSetting(setting);
    setIsSettingsOpen(false);
    onUpdate({ setting: setting.id });
  };

  const handleCapacityChange = (newCapacity: number) => {
    setCapacity(newCapacity);
    onUpdate({ capacity: newCapacity });
  };

  return (
    <div className={`space-y-8 ${className}`}>
      <div>
        <h2 className="text-lg font-medium mb-4">Select Experience Type</h2>
        <ExperienceTypeSelector
          types={experienceTypes}
          selectedType={selectedType}
          onTypeSelect={handleTypeSelect}
          domain={domain}
          features={features}
        />
      </div>

      {selectedSetting && (
        <div>
          <h2 className="text-lg font-medium mb-4">Experience Setting: {selectedSetting.name}</h2>
          <p className="text-gray-500 mb-4">{selectedSetting.description}</p>
        </div>
      )}

      {selectedSetting && (
        <div>
          <h2 className="text-lg font-medium mb-4">Experience Capacity</h2>
          <CapacitySelector
            minCapacity={5}
            maxCapacity={100}
            defaultCapacity={10}
            onChange={handleCapacityChange}
          />
        </div>
      )}

      <SettingsBottomSheet
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onSelect={handleSettingSelect}
        title="Select Experience Setting"
      />

      {selectedType && selectedSetting && (
        <div className="pt-4">
          <Button
            className="w-full h-10"
            onClick={() => experience.update({
              type: selectedType,
              setting: selectedSetting.id,
              capacity: { min: 5, max: 100, target: capacity }
            })}
          >
            Continue
          </Button>
        </div>
      )}
    </div>
  );
};

export default BasicDetails;
