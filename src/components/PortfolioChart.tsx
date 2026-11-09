import React, { useState } from 'react';
import { HelpCircle } from 'lucide-react';

interface PortfolioChartProps {
  onExplain: () => void;
}

// 12 months of mock portfolio value, ending at today's real total (₹47,084) —
// enough ups and downs to be a believable, explainable line, not just a ramp.
const MONTHLY_VALUES = [45200, 45800, 44600, 46100, 46900, 45700, 47300, 46200, 48100, 46800, 47600, 47084];
const MONTH_LABELS = ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov'];

const PERIODS = [
  { id: '1M', months: 1 },
  { id: '3M', months: 3 },
  { id: '6M', months: 6 },
  { id: '1Y', months: 12 },
] as const;

export const PortfolioChart: React.FC<PortfolioChartProps> = ({ onExplain }) => {
  const [period, setPeriod] = useState<(typeof PERIODS)[number]['id']>('1Y');
  const months = PERIODS.find((p) => p.id === period)?.months ?? 12;

  const values = MONTHLY_VALUES.slice(-months);
  const labels = MONTH_LABELS.slice(-months);

  const width = 320;
  const height = 110;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const stepX = values.length > 1 ? width / (values.length - 1) : width;

  const coords = values.map((v, i) => ({
    x: i * stepX,
    y: height - ((v - min) / range) * (height - 10) - 5,
  }));
  const linePoints = coords.map((c) => `${c.x},${c.y}`).join(' ');
  const areaPoints = `0,${height} ${linePoints} ${width},${height}`;

  const trendUp = values[values.length - 1] >= values[0];
  const lineColor = trendUp ? '#00B386' : '#E11D48';

  return (
    <div className="mt-3 pt-3 border-t border-slate-100">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] font-semibold text-slate-500">Portfolio value trend</span>
        <button
          onClick={onExplain}
          className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700"
          aria-label="Help me understand this graph"
          title="Help me understand this graph"
        >
          <HelpCircle className="w-3.5 h-3.5" />
          <span>Help me understand this graph</span>
        </button>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[90px]">
        <defs>
          <linearGradient id="portfolioFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={lineColor} stopOpacity="0.22" />
            <stop offset="100%" stopColor={lineColor} stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#portfolioFill)" />
        <polyline
          points={linePoints}
          fill="none"
          stroke={lineColor}
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx={coords[coords.length - 1].x} cy={coords[coords.length - 1].y} r={3} fill={lineColor} />
      </svg>

      <div className="flex items-center justify-between text-[10px] text-slate-400 -mt-1 mb-2 px-0.5">
        <span>{labels[0]}</span>
        <span>{labels[labels.length - 1]}</span>
      </div>

      <div className="flex items-center gap-1 bg-slate-50 p-0.5 rounded-lg border border-slate-200/70 w-fit">
        {PERIODS.map((p) => (
          <button
            key={p.id}
            onClick={() => setPeriod(p.id)}
            className={`px-2.5 py-1 text-[10px] font-bold rounded-md transition-colors ${
              period === p.id ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            {p.id}
          </button>
        ))}
      </div>
    </div>
  );
};
