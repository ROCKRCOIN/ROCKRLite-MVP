import React from 'react';
import { 
  GraduationCap, 
  Tv, 
  Group,
  Medal,
  ShoppingBag,
  HeartPulse
} from 'lucide-react';
import { IconProps } from '../base/types';

const iconMap = {
  GraduationCap,
  Tv,
  Group,
  Medal,
  ShoppingBag,
  HeartPulse
};

export interface ExperienceTypeIconProps extends IconProps {
  type: keyof typeof iconMap;
  state?: 'default' | 'selected' | 'disabled';
  size?: 'small' | 'default' | 'large';
}

const sizeMap = {
  small: 'h-4 w-4',
  default: 'h-8 w-8',
  large: 'h-12 w-12'
};

const stateMap = {
  default: 'text-gray-600',
  selected: 'text-blue-600',
  disabled: 'text-gray-300'
};

export const ExperienceTypeIcon: React.FC<ExperienceTypeIconProps> = ({
  type,
  state = 'default',
  size = 'default',
  className = '',
  ...props
}) => {
  const Icon = iconMap[type] || GraduationCap;
  
  return (
    <Icon 
      className={`${sizeMap[size]} ${stateMap[state]} ${className}`}
      {...props}
    />
  );
};
