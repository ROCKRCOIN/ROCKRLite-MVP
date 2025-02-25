import React from 'react';
import { IconProps } from './types';

export const Icon: React.FC<IconProps & { path: string }> = ({
  size = 24,
  color = 'currentColor',
  className = '',
  path,
  onClick
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      onClick={onClick}
      role={onClick ? 'button' : 'img'}
    >
      <path d={path} fill={color} />
    </svg>
  );
};
