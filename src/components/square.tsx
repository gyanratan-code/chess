import React, { forwardRef } from 'react';

const CustomDiv = forwardRef<HTMLDivElement, { 
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
CustomDiv.displayName = 'CustomDiv';

export default CustomDiv;
