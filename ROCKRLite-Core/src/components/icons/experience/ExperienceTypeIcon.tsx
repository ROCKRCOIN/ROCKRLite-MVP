import React from 'react';
import { iconPaths, IconType } from './paths';

interface ExperienceTypeIconProps {
  type: IconType;
  size?: number;
  className?: string;
}

export const ExperienceTypeIcon: React.FC<ExperienceTypeIconProps> = ({
  type,
  size = 24,
  className = ''
}) => {
  const iconData = iconPaths[type];
  
  const renderElement = (element: any) => {
    if (element.type === 'text') {
      return (
        <text
          key="text"
          {...element.attributes}
        >
          {element.content}
        </text>
      );
    }
    
    return (
      <element.type
        key={`${element.type}-${JSON.stringify(element.attributes)}`}
        {...element.attributes}
      />
    );
  };

  return (
    <svg
      viewBox={iconData.viewBox}
      width={size}
      height={size}
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {iconData.path ? (
        <path d={iconData.path} fill={iconData.color} />
      ) : (
        iconData.elements?.map(element => renderElement(element))
      )}
    </svg>
  );
};

export default ExperienceTypeIcon;
