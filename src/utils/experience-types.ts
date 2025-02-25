import { 
  GraduationCap, 
  Tv, 
  Group,
  Medal,
  ShoppingBag,
  HeartPulse
} from 'lucide-react';

// Type definitions
interface ExperienceType {
  id: string;
  label: string;
  icon: string;
  settings: ExperienceSetting[];
}

interface ExperienceSetting {
  id: string;
  label: string;
  capacity_default: number[];
}

// Utility functions
export const loadExperienceTypes = async () => {
  try {
    const response = await fetch('/data/experience-types/types.json');
    const data = await response.json();
    return Object.values(data.types);
  } catch (error) {
    console.error('Error loading experience types:', error);
    return [];
  }
};

export const getExperienceSettings = async (typeId: string) => {
  try {
    const response = await fetch('/data/experience-types/types.json');
    const data = await response.json();
    return data.types[typeId]?.settings || [];
  } catch (error) {
    console.error('Error loading settings:', error);
    return [];
  }
};

export const getIconComponent = (iconName: string) => {
  const icons = {
    GraduationCap,
    Tv,
    Group,
    Medal,
    ShoppingBag,
    HeartPulse
  };
  return icons[iconName] || GraduationCap;
};
