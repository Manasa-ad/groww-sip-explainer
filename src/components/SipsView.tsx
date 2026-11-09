import React from 'react';
import { FundHolding } from '../types';

interface SipsViewProps {
  funds: FundHolding[];
}

const fundInitialsAndColor = (name: string, idx: number) => {
  const palette = ['#5367F5', '#D97706', '#DC2626', '#00897B'];
  return { initial: name[0].toUpperCase(), color: palette[idx % palette.length] };
};

export const SipsView: React.FC<SipsViewProps> = ({ funds }) => {
  const activeFunds = funds.filter((f) => f.status !== 'Cancelled');
  const cancelledFunds = funds.filter((f) => f.status === 'Cancelled');
  const monthlyTotal = activeFunds.reduce((sum, f) => sum + f.sipAmount, 0);

  return (
    <div className="space-y-5 pb-8">
      {/* Monthly SIP Amount Summary */}
      <div className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          Monthly SIP Amount
        </span>
        <div className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
          ₹{monthlyTotal.toLocaleString('en-IN')}
        </div>
      </div>

      {/* Active SIPs */}
      <div>
        <div className="flex items-center justify-between mb-2.5">
          <h2 className="font-bold text-sm text-slate-900">Active SIPs ({activeFunds.length})</h2>
          <span className="text-xs font-medium text-slate-400 opacity-60 cursor-not-allowed">
            Sort by: Due date
          </span>
        </div>
        <div className="bg-white rounded-[12px] border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
          {activeFunds.map((fund, idx) => {
            const { initial, color } = fundInitialsAndColor(fund.name, idx);
            return (
              <div key={fund.id} className="flex items-center gap-3 p-3.5">
                <div
                  className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
                  style={{ backgroundColor: color }}
                >
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900 truncate">{fund.name}</h3>
                  <p className="text-[11px] text-slate-500">
                    ₹{fund.sipAmount.toLocaleString('en-IN')}
                    {fund.skippedInstalmentDate && ` • Skipped ${fund.skippedInstalmentDate}`}
                  </p>
                </div>
                <div className="shrink-0 border border-slate-200 rounded-lg px-2 py-1 text-center">
                  <div className="text-xs font-bold text-slate-900">{fund.sipDueDay}</div>
                  <div className="text-[9px] text-slate-500 uppercase">
                    {fund.skippedInstalmentDate ? 'Jan' : 'Nov'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cancelled SIPs — populated by real Cancel actions taken on the Dashboard */}
      {cancelledFunds.length > 0 && (
        <div>
          <h2 className="font-bold text-sm text-slate-900 mb-2.5">
            SIPs cancelled by you ({cancelledFunds.length})
          </h2>
          <div className="bg-white rounded-[12px] border border-slate-200/80 divide-y divide-slate-100 overflow-hidden">
            {cancelledFunds.map((fund, idx) => {
              const { initial, color } = fundInitialsAndColor(fund.name, idx);
              return (
                <div key={fund.id} className="flex items-center gap-3 p-3.5">
                  <div
                    className="w-8 h-8 rounded-lg text-white flex items-center justify-center font-bold text-xs shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {initial}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 truncate">{fund.name}</h3>
                    <p className="text-[11px] text-slate-500">
                      ₹{fund.sipAmount.toLocaleString('en-IN')} • Cancelled
                    </p>
                  </div>
                  <button
                    disabled
                    className="shrink-0 text-xs font-semibold text-slate-400 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg opacity-60 cursor-not-allowed"
                  >
                    Restart
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <p className="text-center text-[11px] text-slate-400">Information only, not investment advice.</p>
    </div>
  );
};
