import React, { forwardRef } from 'react';

const Square = forwardRef<HTMLDivElement, { 
  className?: string; 
  customKey?: string; 
  onClick: React.MouseEventHandler<HTMLDivElement>; 
  customCheck?: string;
  style: React.CSSProperties;
}>(({ className = '', customKey, onClick, customCheck ,style}, ref) => {
  return (
    <div 
      ref={ref} 
      className={className} 
      data-key={customKey} 
      data-active="false" 
      onClick={onClick} 
      data-check={customCheck}
      style={style}
    />
  );
});

Square.displayName = 'Square';

export default Square;
