import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Play,
  Filter,
  Info,
  Loader2,
  Zap,
} from 'lucide-react';
import { goldenTestSet } from '../data/mockData';
import { LiveResult } from '../hooks/useEvalSuite';

interface EvaluationViewProps {
  onTestQuestion: (question: string) => void;
  showBanner?: boolean;
  liveResults: Record<string, LiveResult> | null;
  isRunning: boolean;
  lastRunAt: string | null;
  runEvalSuite: () => void;
  livePassCount: number | null;
}

export const EvaluationView: React.FC<EvaluationViewProps> = ({
  onTestQuestion,
  showBanner = true,
  liveResults,
  isRunning,
  lastRunAt,
  runEvalSuite,
  livePassCount,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchFilter, setSearchFilter] = useState('');

  const categories = [
    'All',
    'Terminology',
    'Performance',
    'SIP mechanics',
    'Hinglish',
    'Advice bait',
    'Missing information',
    'Out of scope',
  ];

  const filteredTests = goldenTestSet.filter((item) => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      item.expectedBehavior.toLowerCase().includes(searchFilter.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-4 pb-12">
      {showBanner && (
        <div className="bg-white rounded-[12px] p-4 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900">How We Test This AI</h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Golden Set v1.0
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                Every answer is checked before being shown: it must come only from our verified
                knowledge base, never invent a number, never recommend a fund or predict returns, and
                must say so when it doesn&apos;t have enough verified information.
              </p>
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200/70 rounded-md px-2 py-1 mt-2 leading-relaxed">
                <strong>Scope note:</strong> the suite below runs against the deterministic
                rule-based engine, not a live Gemini call. When a real Gemini API key is
                configured, the AI&apos;s own generated text is checked only by a lighter,
                phrase-based output filter (see Test Log for how that path is labeled) — it is not
                re-verified against this golden set.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Run Eval Suite — the actual eval gate, not a claim about one */}
      <div className="bg-slate-900 rounded-[12px] p-4 text-white flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-1.5 font-bold text-sm">
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Live Eval Suite (Deterministic Engine)</span>
          </div>
          <p className="text-[11px] text-slate-300 mt-0.5">
            {livePassCount === null
              ? `Runs all ${goldenTestSet.length} questions through the real rule-based engine right now, no hand-written labels — this verifies the engine, not a live Gemini call.`
              : `${livePassCount}/${goldenTestSet.length} passing — verified live at ${lastRunAt} (deterministic engine, not Gemini)`}
          </p>
        </div>
        <button
          onClick={runEvalSuite}
          disabled={isRunning}
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-900 px-3.5 py-2 rounded-xl transition-colors"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Running...</span>
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{liveResults ? 'Run Again' : 'Run Eval Suite'}</span>
            </>
          )}
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="bg-white rounded-[12px] p-3 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.04)] space-y-2.5">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
          <span className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Categories:</span>
          </span>
          <span className="text-[11px] text-slate-400">Showing {filteredTests.length} tests</span>
        </div>

        {/* Category Pills */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-2.5 py-1 rounded-full whitespace-nowrap font-medium transition-colors shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Golden Set Test Questions Table / Card List */}
      <div className="space-y-2.5">
        {filteredTests.map((test) => {
          const live = liveResults?.[test.id];
          return (
            <div
              key={test.id}
              className={`bg-white rounded-[12px] p-3.5 border shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-colors ${
                live ? (live.pass ? 'border-emerald-200' : 'border-rose-300') : 'border-slate-200/90 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                    {test.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      test.category === 'Advice bait'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : test.category === 'Hinglish'
                        ? 'bg-purple-50 text-purple-700 border border-purple-200'
                        : test.category === 'Missing information'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-blue-50 text-blue-700 border border-blue-200'
                    }`}
                  >
                    {test.category}
                  </span>
                </div>

                {/* Status Badge — live result once the suite has run, otherwise the written expectation */}
                {live ? (
                  <div
                    className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold border ${
                      live.pass
                        ? 'text-emerald-700 bg-emerald-50 border-emerald-200/70'
                        : 'text-rose-700 bg-rose-50 border-rose-200'
                    }`}
                  >
                    {live.pass ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#00D09C]" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    )}
                    <span>{live.pass ? 'Pass (live)' : 'Fail (live)'}</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1 text-slate-400 bg-slate-50 px-2 py-0.5 rounded-full text-[11px] font-semibold border border-slate-200">
                    <span>Not yet run</span>
                  </div>
                )}
              </div>

              {/* Question Text */}
              <h3 className="font-semibold text-slate-900 text-sm mt-2 leading-snug">
                &quot;{test.question}&quot;
              </h3>

              {/* Expected Behavior */}
              <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-slate-50/70 rounded-lg p-2 border border-slate-100">
                <strong className="text-slate-700">Guardrail Rule: </strong>
                {test.expectedBehavior}
              </p>

              {/* Live actual answer, once the suite has run — real evidence, not a claim */}
              {live && (
                <div className="mt-2 text-xs text-slate-700 leading-relaxed bg-white rounded-lg p-2 border border-slate-200">
                  <strong className="text-slate-500 text-[10px] uppercase tracking-wide">
                    Actual live output:
                  </strong>
                  <p className="mt-1">{live.result.text}</p>
                  {!live.pass && (
                    <p className="mt-1.5 text-[11px] text-rose-600 flex items-start gap-1">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                      <span>
                        Expected to match {test.id}, but the engine matched{' '}
                        {live.result.sourceId || 'no specific knowledge-base entry'} instead.
                      </span>
                    </p>
                  )}
                </div>
              )}

              {/* Verification Detail & Interactive Test Button */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-[11px] text-slate-400 truncate mr-2">
                  {test.verificationDetail}
                </span>

                <button
                  onClick={() => onTestQuestion(test.question)}
                  className="inline-flex items-center gap-1 font-semibold text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 px-2.5 py-1 rounded-lg transition-colors shrink-0"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test in Explainer</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
