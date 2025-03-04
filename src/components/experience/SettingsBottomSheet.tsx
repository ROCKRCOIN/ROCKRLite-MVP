 // src/components/experience/SettingsBottomSheet.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import type { ExperienceSetting } from '../../interfaces/experience/types';

export interface SettingOption {
  id: ExperienceSetting;
  name: string;
  description: string;
  icon?: React.ReactNode;
}

export interface SettingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingOption[];
  onSelect: (setting: SettingOption) => void;
  title: string;
}

const SettingsBottomSheet: React.FC<SettingSheetProps> = ({
  isOpen,
  onClose,
  settings,
  onSelect,
  title
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {settings.map(setting => (
            <div
              key={setting.id}
              className="flex items-start p-4 border rounded-lg cursor-pointer hover:border-blue-500"
              onClick={() => onSelect(setting)}
            >
              {setting.icon && <div className="mr-4">{setting.icon}</div>}
              <div>
                <h3 className="font-medium">{setting.name}</h3>
                <p className="text-sm text-gray-500">{setting.description}</p>
              </div>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsBottomSheet;
