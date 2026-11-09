import React from 'react';
import { LineChart, Repeat, PieChart, Landmark } from 'lucide-react';

// Matches the real Groww app's 4-item bottom bar exactly (SIP lives inside
// the Mutual Funds segmented tabs, not as its own bottom-nav icon).
const TABS = [
  { id: 'stocks', label: 'Stocks', icon: LineChart },
  { id: 'fo', label: 'F&O', icon: Repeat },
  { id: 'mutual-funds', label: 'Mutual Funds', icon: PieChart },
  { id: 'loans', label: 'Loans', icon: Landmark },
] as const;

// Only Mutual Funds is built in this prototype — the rest are disabled,
// not clickable, with no notice needed since disabled already says so.
export const BottomNav: React.FC = () => {
  return (
    <nav className="sticky bottom-0 z-30 bg-white border-t border-slate-100 shrink-0 flex items-stretch px-1 pt-1.5 pb-1">
      {TABS.map((tab) => {
        const isActive = tab.id === 'mutual-funds';
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            disabled={!isActive}
            className={`flex-1 flex flex-col items-center gap-0.5 py-1 transition-colors ${
              isActive
                ? 'text-[#5367F5]'
                : 'text-slate-300 cursor-not-allowed opacity-60'
            }`}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon className="w-5 h-5" strokeWidth={isActive ? 2.4 : 2} />
            <span className={`text-[10px] leading-tight ${isActive ? 'font-bold' : 'font-medium'}`}>
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
