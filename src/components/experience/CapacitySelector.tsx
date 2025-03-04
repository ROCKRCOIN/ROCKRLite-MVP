 // src/components/experience/CapacitySelector.tsx
import React, { useState } from 'react';
import { Button } from '../ui/button';

export interface CapacitySelectorProps {
  minCapacity?: number;
  maxCapacity?: number;
  defaultCapacity?: number;
  onChange: (capacity: number) => void;
  className?: string;
}

const CapacitySelector: React.FC<CapacitySelectorProps> = ({
  minCapacity = 1,
  maxCapacity = 100,
  defaultCapacity = 10,
  onChange,
  className = ''
}) => {
  const [capacity, setCapacity] = useState(defaultCapacity);

  const handleDecrease = () => {
    if (capacity > minCapacity) {
      const newCapacity = capacity - 1;
      setCapacity(newCapacity);
      onChange(newCapacity);
    }
  };

  const handleIncrease = () => {
    if (capacity < maxCapacity) {
      const newCapacity = capacity + 1;
      setCapacity(newCapacity);
      onChange(newCapacity);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= minCapacity && value <= maxCapacity) {
      setCapacity(value);
      onChange(value);
    }
  };

  return (
    <div className={`flex items-center ${className}`}>
      <Button
        variant="outline"
        className="h-10 w-10 rounded-l-md"
        onClick={handleDecrease}
        disabled={capacity <= minCapacity}
      >
        -
      </Button>
      <input
        type="text"
        value={capacity}
        onChange={handleChange}
        className="h-10 w-16 text-center border-y border-x-0"
      />
      <Button
        variant="outline"
        className="h-10 w-10 rounded-r-md"
        onClick={handleIncrease}
        disabled={capacity >= maxCapacity}
      >
        +
      </Button>
    </div>
  );
};

export default CapacitySelector;
