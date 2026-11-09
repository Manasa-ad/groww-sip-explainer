import React from 'react';

interface SparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
}

// Tiny inline trend line for a single fund's NAV history — no axes, just a shape.
export const Sparkline: React.FC<SparklineProps> = ({ data, width = 72, height = 28, color }) => {
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data
    .map((v, i) => `${i * stepX},${height - ((v - min) / range) * height}`)
    .join(' ');

  const trendUp = data[data.length - 1] >= data[0];
  const strokeColor = color || (trendUp ? '#00B386' : '#E11D48');

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} className="shrink-0">
      <polyline points={points} fill="none" stroke={strokeColor} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};
