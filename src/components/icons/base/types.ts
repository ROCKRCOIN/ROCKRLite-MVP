export interface IconProps {
  size?: number;
  color?: string;
  className?: string;
  onClick?: () => void;
}

export interface StepIconProps extends IconProps {
  active?: boolean;
  completed?: boolean;
  editable?: boolean;
  stepNumber?: number;
}

export type ExperienceStepType = 
  | 'details'
  | 'rks'
  | 'calendar'
  | 'location'
  | 'hosts'
  | 'participants'
  | 'authentication'
  | 'publish';

export interface StepConfig {
  id: ExperienceStepType;
  label: string;
  editable: boolean;
  order: number;
}
