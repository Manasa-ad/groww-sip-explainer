import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { HoldingsSummary } from '../types';
import { PortfolioChart } from './PortfolioChart';

interface HoldingsCardProps {
  summary: HoldingsSummary;
  onExplainMetric: (metricName: string, initialQuestion: string) => void;
}

export const HoldingsCard: React.FC<HoldingsCardProps> = ({
  summary,
  onExplainMetric,
}) => {
  return (
    <div className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] mb-4">
      {/* Demo data disclaimer — this is illustrative data, never real account holdings */}
      <div className="text-[10px] font-semibold text-amber-700 bg-amber-50 border border-amber-200/70 rounded-md px-2 py-1 mb-2.5 inline-block">
        Demo portfolio — illustrative data, not real investment holdings
      </div>

      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Current Value
          </span>
          <div className="text-2xl font-bold text-slate-900 tracking-tight mt-0.5">
            ₹{summary.totalValue.toLocaleString('en-IN')}
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-medium text-slate-500">Total Invested</span>
          <div className="text-sm font-semibold text-slate-700 mt-0.5">
            ₹{summary.totalInvested.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      {/* Grid of Key Metrics */}
      <div className="grid grid-cols-3 gap-2 pt-3">
        {/* 1D Returns */}
        <div className="bg-slate-50/70 rounded-lg p-2.5">
          <div className="text-[11px] font-medium text-slate-500 mb-0.5">1D Returns</div>
          <div className="text-xs sm:text-sm font-bold text-[#00D09C] flex flex-col leading-tight">
            <span className="whitespace-nowrap">+₹{summary.oneDayReturns}</span>
            <span className="text-[10px] font-semibold text-emerald-600">
              (+{summary.oneDayReturnsPct}%)
            </span>
          </div>
        </div>

        {/* Total Returns */}
        <div className="bg-slate-50/70 rounded-lg p-2.5">
          <div className="text-[11px] font-medium text-slate-500 mb-0.5">Total Returns</div>
          <div className="text-xs sm:text-sm font-bold text-[#00D09C] flex flex-col leading-tight">
            <span className="whitespace-nowrap">+₹{summary.totalReturns.toLocaleString('en-IN')}</span>
            <span className="text-[10px] font-semibold text-emerald-600">
              (+{summary.totalReturnsPct}%)
            </span>
          </div>
        </div>

        {/* XIRR with small '?' icon */}
        <div className="bg-slate-50/70 rounded-lg p-2.5 relative group border border-emerald-100/60">
          <div className="flex items-center justify-between text-[11px] font-medium text-slate-500 mb-0.5">
            <span>XIRR</span>
            <button
              onClick={() => onExplainMetric('XIRR', 'What does XIRR mean?')}
              className="inline-flex items-center justify-center w-4 h-4 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors"
              aria-label="Explain XIRR metric"
              title="Explain XIRR"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold text-slate-900">
              {summary.xirr}%
            </span>
            <button
              onClick={() => onExplainMetric('XIRR', 'What does XIRR mean?')}
              className="text-[10px] font-semibold text-emerald-600 hover:underline flex items-center gap-0.5"
            >
              <span>Explain</span>
            </button>
          </div>
        </div>
      </div>

      <PortfolioChart onExplain={() => onExplainMetric('Portfolio Value Graph', 'Help me understand this graph')} />

      {/* Contextual Prototype Banner */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>Tap any <strong className="text-slate-700">?</strong> to understand returns & terms</span>
        </div>
        <button
          onClick={() => onExplainMetric('General', 'Why is my return negative/lower this month?')}
          className="text-emerald-600 font-semibold hover:underline"
        >
          Ask AI
        </button>
      </div>
    </div>
  );
};
