import React from 'react';
import { Search, Sparkles, CircleUserRound } from 'lucide-react';
import { AppTab } from '../types';

interface TopNavProps {
  activeTab: AppTab;
  onTabChange: (tab: AppTab) => void;
  onOpenGeneralExplainer: () => void;
}

const SEGMENTED_TABS: { id: AppTab; label: string }[] = [
  { id: 'explore', label: 'Explore' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'sips', label: 'SIPs' },
  { id: 'watchlist', label: 'Watchlist' },
];

// Groww's real logo mark (exact asset, not a redrawn approximation)
const GrowwLogo: React.FC = () => (
  <img
    src="/groww-logo.png"
    alt="Groww"
    className="w-8 h-8 rounded-full shrink-0 object-cover"
  />
);

export const TopNav: React.FC<TopNavProps> = ({
  activeTab,
  onTabChange,
  onOpenGeneralExplainer,
}) => {
  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-30 shrink-0">
      {/* Real Native App Header (Minimal, Authentic, No Clutter) */}
      <div className="px-4 pt-3 pb-2 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <GrowwLogo />
          <span className="font-bold text-base tracking-tight text-slate-900">
            Mutual Funds
          </span>
        </div>

        {/* Right Action Icons: Search, Explore swirl, Profile Avatar (matches real Groww header) */}
        <div className="flex items-center gap-1">
          <button
            onClick={onOpenGeneralExplainer}
            className="p-1.5 text-slate-800 hover:text-slate-900 hover:bg-slate-100 rounded-full transition-colors"
            title="Search"
            aria-label="Search"
          >
            <Search className="w-[18px] h-[18px]" strokeWidth={2.2} />
          </button>

          <button
            onClick={onOpenGeneralExplainer}
            className="p-1.5 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-full transition-colors"
            title="Ask AI"
            aria-label="Ask the AI explainer"
          >
            <Sparkles className="w-[18px] h-[18px]" strokeWidth={2} />
          </button>

          <button
            className="w-7 h-7 ml-1 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center shadow-xs hover:bg-slate-200 transition-colors"
            aria-label="Profile"
            title="Profile"
          >
            <CircleUserRound className="w-5 h-5" strokeWidth={1.8} />
          </button>
        </div>
      </div>

      {/* Native Segmented Tabs — mirrors the real Groww Mutual Funds screen exactly.
          The PM "How we test the AI" evaluation view is NOT one of these tabs; it's
          reached only via the outer case-study toolbar, since a real Groww screen
          would never show it. */}
      <div className="flex border-t border-slate-100 px-4 gap-5 text-xs font-semibold overflow-x-auto scrollbar-none">
        {SEGMENTED_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`py-2.5 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
