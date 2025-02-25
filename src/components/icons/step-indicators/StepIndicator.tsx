import React from 'react';
import { StepIconProps } from '../base/types';
import { Icon } from '../base/Icon';

export const StepIndicator: React.FC<StepIconProps & { path: string }> = ({
  active,
  completed,
  editable,
  stepNumber,
  path,
  ...props
}) => {
  const baseClasses = 'transition-colors';
  const stateClasses = active 
    ? 'text-primary' 
    : completed 
    ? 'text-success' 
    : 'text-muted-foreground';
  const interactionClasses = editable ? 'cursor-pointer hover:text-primary' : '';

  return (
    <div className="inline-flex flex-col items-center">
      <Icon 
        path={path}
        className={`${baseClasses} ${stateClasses} ${interactionClasses}`}
        {...props}
      />
      {stepNumber && (
        <span className="text-xs mt-1 text-muted-foreground">
          Step {stepNumber}
        </span>
      )}
    </div>
  );
};
