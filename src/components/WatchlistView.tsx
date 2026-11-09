import React from 'react';
import { Binoculars, Bookmark } from 'lucide-react';

const trendingFunds = [
  'Sample Silver FoF Direct-Growth',
  'Sample Silver ETF FoF Direct-Growth',
  'Sample Defence Fund',
  'Sample Pharma And Healthcare Fund',
  'Sample Healthcare Opportunities Fund',
];

export const WatchlistView: React.FC = () => {
  return (
    <div className="space-y-6 pb-8">
      {/* Empty state */}
      <div className="flex flex-col items-center text-center py-6">
        <div className="w-16 h-10 rounded-full bg-gradient-to-r from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-400 mb-3">
          <Binoculars className="w-6 h-6" strokeWidth={1.6} />
        </div>
        <p className="text-sm text-slate-500">Start adding funds to Watchlist</p>
      </div>

      {/* Trending */}
      <div>
        <h2 className="font-bold text-xs text-slate-900 tracking-wider mb-1">TRENDING</h2>
        <div className="divide-y divide-slate-100">
          {trendingFunds.map((name) => (
            <div key={name} className="flex items-center justify-between py-3.5">
              <span className="text-sm text-slate-800">{name}</span>
              <button
                disabled
                aria-label={`Add ${name} to watchlist (disabled in this prototype)`}
                className="text-slate-300 opacity-60 cursor-not-allowed p-1"
              >
                <Bookmark className="w-4 h-4" strokeWidth={1.8} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
