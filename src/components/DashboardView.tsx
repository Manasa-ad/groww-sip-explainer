import React from 'react';
import { Sparkles, ShieldCheck, ArrowRight } from 'lucide-react';
import { HoldingsCard } from './HoldingsCard';
import { FundCard } from './FundCard';
import { HoldingsSummary, FundHolding, SipActionType } from '../types';

interface DashboardViewProps {
  summary: HoldingsSummary;
  funds: FundHolding[];
  onExplainMetric: (contextTitle: string, question: string) => void;
  onOpenExplainer: (contextTitle: string, question: string) => void;
  onInitiateAction: (fund: FundHolding, type: SipActionType) => void;
  onViewEvaluation: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  summary,
  funds,
  onExplainMetric,
  onOpenExplainer,
  onInitiateAction,
  onViewEvaluation,
}) => {
  return (
    <div>
      {/* Screen 1: Holdings Summary Card */}
      <HoldingsCard summary={summary} onExplainMetric={onExplainMetric} />

      {/* Fund List Header */}
      <div className="flex items-center justify-between mt-4 mb-2 px-1">
        <div className="flex items-center gap-1.5">
          <h2 className="font-bold text-sm text-slate-800">Your Active SIPs</h2>
          <span className="text-[11px] bg-slate-200/80 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
            {funds.length}
          </span>
        </div>

        <button
          onClick={() =>
            onOpenExplainer('SIP Guidance', "What's the difference between pausing and cancelling?")
          }
          className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 hover:underline cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
          <span>SIP FAQs</span>
        </button>
      </div>

      {/* Fund Items */}
      <div className="space-y-3">
        {funds.map((fund) => (
          <FundCard
            key={fund.id}
            fund={fund}
            onExplainMetric={onExplainMetric}
            onInitiateAction={onInitiateAction}
          />
        ))}
      </div>

      {/* PM Prototype Context Callout */}
      <div className="mt-5 p-3.5 bg-white rounded-xl border border-slate-200 text-xs text-slate-600 shadow-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-900 mb-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Groww AI PM Case Study</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-relaxed">
          Demonstrating a strict non-advisory boundary: AI explains mechanics and terms without
          ever recommending funds, forecasting returns, or inventing personal numbers.
        </p>
        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={onViewEvaluation}
            className="text-[11px] font-semibold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View 20 Golden-Set Evaluation Tests</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
};
