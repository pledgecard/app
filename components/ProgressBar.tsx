import React from 'react';

interface ProgressBarProps {
  target: number;
  raised: number;
  pledged: number;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({ target, raised, pledged }) => {
  const raisedPercent = Math.min((raised / target) * 100, 100);
  const pledgedPercent = Math.min((pledged / target) * 100, 100 - raisedPercent);

  return (
    <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden flex shadow-inner">
      <div
        className="h-full bg-brand-500 rounded-l-full relative"
        style={{ width: `${raisedPercent}%` }}
        title={`Raised: UGX ${raised.toLocaleString()}`}
      >
        <div className="absolute inset-0 bg-white/20"></div>
      </div>
      <div
        className="h-full bg-accent-400 opacity-90 relative"
        style={{ width: `${pledgedPercent}%` }}
        title={`Pledged: UGX ${pledged.toLocaleString()}`}
      >
        <div className="absolute inset-0 bg-white/10"></div>
      </div>
    </div>
  );
};