import React, { forwardRef } from 'react';
export default forwardRef<HTMLDivElement, { className?: string; customKey?: string; onClick:React.MouseEventHandler<HTMLDivElement>; }>(
  ({ className = '', customKey,onClick }, ref) => {
    return (
      <div ref={ref} className={className} data-key={customKey} data-active="false" onClick={onClick}>
      </div>
    );
  }
);
