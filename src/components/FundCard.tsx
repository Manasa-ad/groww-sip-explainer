import React from 'react';
import { HelpCircle, PauseCircle, XCircle, ArrowDownToLine, ArrowUpRight } from 'lucide-react';
import { FundHolding, SipActionType } from '../types';
import { Sparkline } from './Sparkline';

interface FundCardProps {
  fund: FundHolding;
  onExplainMetric: (contextTitle: string, question: string) => void;
  onInitiateAction: (fund: FundHolding, actionType: SipActionType) => void;
}

// Deterministic mock NAV history per fund (ends at today's real NAV) so the
// sparkline is stable across re-renders instead of using Math.random().
const navHistory = (fund: FundHolding) => {
  const seed = fund.id.length + fund.sipDueDay;
  const base = fund.nav * 0.9;
  return [0, 1, 2, 3, 4, 5].map((i) => {
    const wobble = Math.sin(seed + i) * fund.nav * 0.04;
    return base + ((fund.nav - base) * i) / 5 + wobble;
  }).concat(fund.nav);
};

export const FundCard: React.FC<FundCardProps> = ({
  fund,
  onExplainMetric,
  onInitiateAction,
}) => {
  const fundInitials = fund.name
    .split(' ')
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
  const iconPalette = ['#5367F5', '#F59E0B', '#00B386', '#EC4899', '#8B5CF6'];
  const iconColor = iconPalette[fund.id.length % iconPalette.length];
  const isCancelled = fund.status === 'Cancelled';

  return (
    <div
      className={`bg-white rounded-[12px] p-4 border shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-3 relative ${
        isCancelled ? 'border-slate-200/50 opacity-70' : 'border-slate-200/80'
      }`}
    >
      {/* Top row: Fund Icon, Name, SIP Tag, NAV sparkline */}
      <div className="flex items-start gap-2.5">
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0 mt-0.5"
          style={{ backgroundColor: iconColor }}
        >
          {fundInitials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${
                isCancelled
                  ? 'bg-slate-100 text-slate-500 border-slate-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
              }`}
            >
              {isCancelled ? 'Cancelled' : 'SIP'}
            </span>
            <span className="text-[11px] text-slate-500 font-medium">
              {isCancelled
                ? `₹${fund.sipAmount.toLocaleString('en-IN')}/mo`
                : fund.skippedInstalmentDate
                ? `Resumes ${fund.sipDueDay} Jan • Skipped ${fund.skippedInstalmentDate}`
                : `₹${fund.sipAmount.toLocaleString('en-IN')}/mo • Due ${fund.sipDueDay}th`}
            </span>
          </div>
          <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-1">
            {fund.name}
          </h3>
          <p className="text-[11px] text-slate-500">{fund.category}</p>
        </div>
        <Sparkline data={navHistory(fund)} />
      </div>

      {fund.redemptionNote && (
        <div className="mt-2.5 text-[11px] text-blue-700 bg-blue-50 border border-blue-200/70 rounded-lg px-2.5 py-1.5">
          Redemption pending: {fund.redemptionNote}
        </div>
      )}

      {/* Financial Details Row */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-100">
        <div>
          <div className="text-[11px] text-slate-500">Current Value</div>
          <div className="text-sm font-bold text-slate-900 mt-0.5">
            ₹{fund.currentValue.toLocaleString('en-IN')}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">
            Invested ₹{fund.invested.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="text-right">
          <div className="text-[11px] text-slate-500">Total Returns</div>
          <div className="text-sm font-bold text-[#00D09C] mt-0.5 flex items-center justify-end gap-1">
            +₹{fund.totalReturns.toLocaleString('en-IN')}
            <span className="text-[10px] font-semibold">
              (+{fund.totalReturnsPct}%)
            </span>
          </div>
          {fund.oneMonthReturnsPct !== undefined && (
            <div className="text-[10px] text-rose-500 font-semibold mt-0.5 flex items-center justify-end gap-1">
              <span>1M: {fund.oneMonthReturnsPct}%</span>
              <button
                onClick={() =>
                  onExplainMetric(
                    fund.name,
                    'Why is my return negative/lower this month?'
                  )
                }
                className="text-rose-400 hover:text-rose-600 inline-flex items-center"
                aria-label="Explain 1 month negative return"
                title="Explain why return is lower this month"
              >
                <HelpCircle className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* XIRR with '?' and Quick Explain button */}
      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 text-[11px] font-medium">XIRR:</span>
          <span className="font-bold text-slate-800 text-[12px]">{fund.xirr}%</span>
          <button
            onClick={() =>
              onExplainMetric(fund.name, 'What does XIRR mean?')
            }
            className="text-emerald-600 hover:text-emerald-700 p-0.5 rounded transition-colors"
            aria-label={`Explain XIRR for ${fund.name}`}
            title="Explain XIRR calculation"
          >
            <HelpCircle className="w-3.5 h-3.5" />
          </button>
        </div>

        <button
          onClick={() =>
            onExplainMetric(fund.name, 'What does XIRR mean?')
          }
          className="text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 hover:underline flex items-center gap-1"
        >
          <span>Explain this</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      </div>

      {/* Manage SIP — Redeem / Skip / Cancel are visible, primary actions, not hidden behind a menu.
          Hidden once cancelled: a cancelled SIP has nothing left to manage. */}
      {!isCancelled && (
        <div className="mt-3 pt-3 border-t border-slate-100/80 grid grid-cols-3 gap-2">
          <button
            onClick={() => onInitiateAction(fund, 'redeem')}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg py-1.5 transition-colors"
          >
            <ArrowDownToLine className="w-3.5 h-3.5" />
            <span>Redeem</span>
          </button>
          <button
            onClick={() => onInitiateAction(fund, 'skip')}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg py-1.5 transition-colors"
          >
            <PauseCircle className="w-3.5 h-3.5" />
            <span>Skip</span>
          </button>
          <button
            onClick={() => onInitiateAction(fund, 'cancel')}
            className="flex items-center justify-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg py-1.5 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Cancel</span>
          </button>
        </div>
      )}
    </div>
  );
};
