import React from 'react';
import { StepIconProps } from '../base/types';
import { experienceIconPaths } from './paths';

export const ExperienceStepIcon: React.FC<StepIconProps & { type: keyof typeof experienceIconPaths }> = ({
  type,
  active,
  completed,
  editable,
  stepNumber,
  size = 24,
  color = 'currentColor',
  className = '',
  onClick
}) => {
  const path = experienceIconPaths[type];

  return (
    <div className="inline-flex flex-col items-center">
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`
          transition-colors
          ${active ? 'text-primary' : ''}
          ${completed ? 'text-success' : ''}
          ${editable ? 'cursor-pointer hover:text-primary' : ''}
          ${className}
        `}
        onClick={onClick}
        role={onClick ? 'button' : 'img'}
      >
        {/* Handle special icons with multiple parts */}
        {typeof path === 'string' ? (
          <path d={path} fill={color} />
        ) : type === 'rks' ? (
          <>
            <path d={path.circle} fill={color} />
            <text
              x={path.text.x}
              y={path.text.y}
              fontSize="8"
              textAnchor="middle"
              fill={color}
              fontWeight="bold"
            >
              {path.text.content}
            </text>
          </>
        ) : type === 'publish' ? (
          <>
            <path d={path.circle} fill={color} />
            <path d={path.check} stroke={color} strokeWidth="3" fill="none" />
          </>
        ) : null}
      </svg>
      {stepNumber && (
        <span className="text-xs mt-1 text-muted-foreground">
          Step {stepNumber}
        </span>
      )}
    </div>
  );
};
