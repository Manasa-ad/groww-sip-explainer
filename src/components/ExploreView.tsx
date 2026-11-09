import React from 'react';
import {
  LayoutGrid,
  CalendarClock,
  Coins,
  TrendingUp,
  Building2,
  Store,
  Download,
  Megaphone,
  Percent,
  Scale,
  ShoppingCart,
} from 'lucide-react';

const popularFunds = [
  { name: 'Sample Silver ETF FoF Direct-Growth', pct: 36.22, color: '#00897B' },
  { name: 'Sample Mid Cap Fund', pct: 23.72, color: '#7C3AED' },
  { name: 'Sample Small Cap Fund', pct: 22.9, color: '#D97706' },
  { name: 'Sample Flexi Cap Direct Plan-Growth', pct: 17.31, color: '#2563EB' },
];

const browseFunds = [
  { name: 'Sample Small Cap Fund', category: 'Equity Small Cap', pct: 22.9, color: '#2563EB' },
  { name: 'Sample Flexi Cap Fund', category: 'Equity Flexi Cap', pct: 13.4, color: '#DC2626' },
];

const collections = [
  { label: 'All categories', icon: LayoutGrid },
  { label: 'SIP funds', icon: CalendarClock },
  { label: 'Gold & Silver Funds', icon: Coins },
  { label: 'Index funds', icon: TrendingUp },
  { label: 'Mid Cap', icon: Building2 },
  { label: 'Small Cap', icon: Store },
];

const tools = [
  { label: 'Import funds', icon: Download },
  { label: 'NFOs', icon: Megaphone, badge: 2 },
  { label: 'SIP calculator', icon: Percent },
  { label: 'Compare funds', icon: Scale },
  { label: 'Cart', icon: ShoppingCart, badge: 4 },
];

// Everything on this tab is a read-only, disabled preview — only the
// Dashboard tab's AI explainer flows are actually built in this prototype.
const DISABLED = 'opacity-60 cursor-not-allowed pointer-events-none';

export const ExploreView: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Recently viewed */}
      <div>
        <h2 className="font-bold text-sm text-slate-900 mb-2.5">Recently viewed</h2>
        <div
          className={`flex items-center gap-2.5 bg-white border border-slate-200 rounded-xl px-3 py-2.5 ${DISABLED}`}
        >
          <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
            S
          </div>
          <span className="text-sm font-medium text-slate-800">Sample Midcap Fund</span>
        </div>
      </div>

      {/* Popular Funds */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-bold text-sm text-slate-900">Popular Funds</h2>
          <span className={`text-xs font-semibold text-slate-500 ${DISABLED}`}>View all</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {popularFunds.map((fund) => (
            <div
              key={fund.name}
              className={`text-left bg-white rounded-[12px] p-3.5 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] ${DISABLED}`}
            >
              <div
                className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs mb-2.5"
                style={{ backgroundColor: fund.color }}
              >
                S
              </div>
              <h3 className="text-xs font-semibold text-slate-800 leading-snug line-clamp-2 h-8">
                {fund.name}
              </h3>
              <div className="flex items-center justify-between mt-2.5">
                <span className="text-sm font-bold text-emerald-600">+{fund.pct}%</span>
                <span className="text-[11px] text-slate-400">3Y</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div>
        <h2 className="font-bold text-sm text-slate-900 mb-2.5">Collections</h2>
        <div className="grid grid-cols-3 gap-3">
          {collections.map((c) => (
            <div key={c.label} className={`flex flex-col items-center gap-1.5 text-center ${DISABLED}`}>
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-700">
                <c.icon className="w-5 h-5" strokeWidth={1.8} />
              </div>
              <span className="text-[11px] font-medium text-slate-700 leading-tight">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Products & tools */}
      <div>
        <h2 className="font-bold text-sm text-slate-900 mb-2.5">Products &amp; tools</h2>
        <div className="flex justify-between">
          {tools.map((t) => (
            <div key={t.label} className={`flex flex-col items-center gap-1.5 text-center relative px-1 ${DISABLED}`}>
              <div className="relative text-slate-700">
                <t.icon className="w-5 h-5" strokeWidth={1.8} />
                {t.badge && (
                  <span className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full bg-slate-900 text-white text-[8px] font-bold flex items-center justify-center">
                    {t.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] font-medium text-slate-600 leading-tight max-w-[56px]">
                {t.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* All Mutual Funds */}
      <div>
        <h2 className="font-bold text-sm text-slate-900 mb-2.5">All Mutual Funds</h2>
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-1 mb-3">
          {['Sort by', 'Index only', 'Flexi Cap', 'Sector'].map((chip) => (
            <span
              key={chip}
              className={`text-xs font-medium bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-full whitespace-nowrap ${DISABLED}`}
            >
              {chip}
            </span>
          ))}
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400 mb-2 px-0.5">
          <span>1,700 funds</span>
          <span>3Y Returns</span>
        </div>
        <div className="bg-white rounded-[12px] border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
          {browseFunds.map((fund) => (
            <div key={fund.name} className={`w-full flex items-center gap-3 p-3 text-left ${DISABLED}`}>
              <div
                className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
                style={{ backgroundColor: fund.color }}
              >
                S
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-slate-900 truncate">{fund.name}</h3>
                <p className="text-[11px] text-slate-500">{fund.category}</p>
              </div>
              <span className="text-sm font-bold text-emerald-600 shrink-0">+{fund.pct}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
