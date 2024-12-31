import React, { forwardRef } from 'react';

const Square = forwardRef<HTMLDivElement, { 
  className?: string; 
  customKey?: string; 
  onClick: React.MouseEventHandler<HTMLDivElement>; 
  customCheck?: string;
}>(({ className = '', customKey, onClick, customCheck }, ref) => {
  return (
    <div 
      ref={ref} 
      className={className} 
      data-key={customKey} 
      data-active="false" 
      onClick={onClick} 
      data-check={customCheck} 
    />
  );
});

// Set displayName for better debugging
Square.displayName = 'Square';

export default Square;
