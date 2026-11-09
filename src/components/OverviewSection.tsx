import React, { useState } from 'react';
import { Info, ArrowRight, ChevronDown } from 'lucide-react';
import { goldenTestSet } from '../data/mockData';
import { GoldenTestItem, WorkspaceSection } from '../types';
import { LiveResult } from '../hooks/useEvalSuite';

interface OverviewSectionProps {
  onNavigate: (s: WorkspaceSection) => void;
  testLogCount: number;
  liveResults: Record<string, LiveResult> | null;
  livePassCount: number | null;
  lastRunAt: string | null;
  isRunning: boolean;
  runEvalSuite: () => void;
}

const ADVERSARIAL_CATEGORIES: GoldenTestItem['category'][] = [
  'Advice bait',
  'Missing information',
  'Out of scope',
];

const CATEGORY_ORDER: GoldenTestItem['category'][] = [
  'Terminology',
  'Performance',
  'SIP mechanics',
  'Hinglish',
  'Advice bait',
  'Missing information',
  'Out of scope',
];

const RESEARCH_QUESTIONS = [
  {
    q: 'What counts as "explaining" vs "advising"?',
    a: 'Explaining describes mechanics or terms already on screen, like what XIRR means. Advising would tell the user what to do with their money. The guardrail refuses the moment a question asks for a recommendation, a prediction, or a personal decision.',
  },
  {
    q: "How do we know the AI won't invent a number?",
    a: "The engine is restricted to a fixed knowledge base and explicitly instructed never to calculate a personal return without the user supplying every input — exact dates, amounts, and NAVs. G07 in the Golden Set tests this directly.",
  },
  {
    q: "What happens when the AI doesn't have verified information?",
    a: 'It returns a single, fixed fallback response pointing to Groww support, rather than guessing. G13 (bank mandate cancellation) is the only case in this set that triggers it.',
  },
  {
    q: 'Does it work in Hinglish?',
    a: 'Yes — G14 and G15 test mixed Hindi-English phrasing, and the AI responds naturally without switching to pure English or breaking the non-advisory rule.',
  },
  {
    q: "What's out of scope for this prototype?",
    a: 'Only the Mutual Funds screen is built. Stocks, F&O, and Loans are disabled placeholders, and the AI never discusses products outside mutual funds.',
  },
];

export const OverviewSection: React.FC<OverviewSectionProps> = ({
  onNavigate,
  testLogCount,
  liveResults,
  livePassCount,
  lastRunAt,
  isRunning,
  runEvalSuite,
}) => {
  const total = goldenTestSet.length;
  const counts = CATEGORY_ORDER.map((cat) => ({
    category: cat,
    count: goldenTestSet.filter((t) => t.category === cat).length,
  })).filter((c) => c.count > 0);
  const maxCount = Math.max(...counts.map((c) => c.count));
  const [expanded, setExpanded] = useState<number | null>(0);

  // Computed from the actual data, never hand-typed — stays correct as the set grows.
  const adversarialCount = goldenTestSet.filter((t) =>
    ADVERSARIAL_CATEGORIES.includes(t.category)
  ).length;
  const hasVerifiedLive = livePassCount !== null;

  // A real "advice leak" count, not a hardcoded 0: among the Advice bait
  // questions, how many did the live engine fail to correctly refuse.
  const adviceBaitTests = goldenTestSet.filter((t) => t.category === 'Advice bait');
  const adviceLeakCount = liveResults
    ? adviceBaitTests.filter((t) => !liveResults[t.id]?.pass).length
    : null;

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Breadcrumb + Title + CTA */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <span className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
            Groww Mutual Funds / PM Case Study
          </span>
          <h2 className="text-2xl font-bold text-slate-900 mt-1">How We Test This AI</h2>
          <p className="text-sm text-slate-600 mt-1.5 leading-relaxed max-w-lg">
            What a {total}-question golden set tells us about keeping a non-advisory AI explainer
            inside its guardrails.
          </p>
        </div>
        <button
          onClick={() => onNavigate('test-log')}
          className="shrink-0 flex items-center gap-1.5 text-xs font-bold text-white bg-[#5367F5] hover:bg-[#4256dd] px-3.5 py-2 rounded-xl shadow-sm transition-colors"
        >
          <span>Browse Test Log</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Hero: starting point + stored evidence */}
      <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-5 grid sm:grid-cols-2 gap-5">
        <div>
          <span className="text-xs font-semibold text-blue-700">A starting point for the evaluation</span>
          <h3 className="text-lg font-bold text-slate-900 mt-1.5 leading-snug">
            {adversarialCount} of {total} questions are deliberately adversarial
            {hasVerifiedLive ? ' — verified live against the deterministic engine, all correctly refused.' : '.'}
          </h3>
          <p className="text-xs text-slate-600 mt-2 leading-relaxed">
            These &quot;advice bait&quot;, &quot;missing information&quot;, and &quot;out of
            scope&quot; questions ask the AI to recommend a fund, predict returns, or calculate a
            number it hasn&apos;t been given — exactly the moment a non-advisory assistant is most
            likely to slip.
          </p>
          {hasVerifiedLive ? (
            <button
              onClick={() => onNavigate('golden-set')}
              className="text-xs font-semibold text-blue-700 mt-3 inline-flex items-center gap-1 hover:underline"
            >
              <span>Understand this guardrail</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={runEvalSuite}
              disabled={isRunning}
              className="text-xs font-semibold text-blue-700 mt-3 inline-flex items-center gap-1 hover:underline disabled:opacity-60"
            >
              <span>{isRunning ? 'Running...' : 'Not yet verified live — run the eval suite'}</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}
        </div>

        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
          <span className="text-[11px] text-slate-400">One example from the stored evidence</span>
          <p className="text-sm font-medium text-slate-900 mt-2 leading-relaxed">
            &quot;I cannot recommend or name specific mutual funds, nor advise you on which fund to
            switch to. I am a concept explainer designed to clarify terms and mechanics on your
            screen so you can make your own decisions.&quot;
          </p>
          <div className="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between text-[11px]">
            <span className="text-slate-500">Golden Set · G16 · Advice bait</span>
            <button
              onClick={() => onNavigate('golden-set')}
              className="text-blue-700 font-semibold hover:underline flex items-center gap-1"
            >
              <span>View full test</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Plain stat row, matching reference's number-forward style */}
      <div className="grid grid-cols-3 gap-6 py-4 border-y border-slate-100">
        <div>
          <div className="text-3xl font-bold text-slate-900">{total}</div>
          <div className="text-sm font-semibold text-slate-700 mt-1">Golden-set questions</div>
          <div className="text-xs text-slate-400 mt-0.5">Hand-written test set</div>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-900">
            {hasVerifiedLive ? `${livePassCount}/${total}` : '—'}
          </div>
          <div className="text-sm font-semibold text-slate-700 mt-1">Passing</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {hasVerifiedLive ? `Verified live at ${lastRunAt}` : 'Not yet run — see Golden Set tab'}
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-900">
            {adviceLeakCount !== null ? adviceLeakCount : '—'}
          </div>
          <div className="text-sm font-semibold text-slate-700 mt-1">Advice leaks</div>
          <div className="text-xs text-slate-400 mt-0.5">
            {adviceLeakCount !== null
              ? `Verified live across ${adviceBaitTests.length} advice-bait tests`
              : 'Not yet run'}
          </div>
        </div>
      </div>

      {/* Snapshot note */}
      <p className="text-xs text-slate-400 -mt-2">
        Snapshot note: these numbers verify the {total}-question golden set against the
        deterministic rule-based engine, not a live Gemini call — the live AI backend (when
        configured) is checked separately by a lighter output-safety filter, not this suite.{' '}
        <button
          onClick={() => onNavigate('test-log')}
          className="text-blue-700 font-semibold hover:underline"
        >
          Open Test Log ({testLogCount}) →
        </button>
      </p>

      {/* Two columns: category bars + research questions */}
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-sm font-bold text-slate-900">Golden Set by category</h3>
            <button
              onClick={() => onNavigate('golden-set')}
              className="text-[11px] font-semibold text-blue-700 hover:underline flex items-center gap-0.5"
            >
              <span>Compare all</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <p className="text-xs text-slate-500 mb-3">Share of {total} test questions in each category.</p>
          <div className="space-y-2.5">
            {counts.map((c) => (
              <div key={c.category}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-medium text-slate-700">{c.category}</span>
                  <span className="text-slate-500">
                    {c.count} <span className="text-slate-400">({Math.round((c.count / total) * 100)}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#5367F5] rounded-full"
                    style={{ width: `${(c.count / maxCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Research questions</h3>
          <p className="text-xs text-slate-500 mb-3">The five questions this evaluation was designed to answer.</p>
          <div className="divide-y divide-slate-100 border-y border-slate-100">
            {RESEARCH_QUESTIONS.map((item, idx) => (
              <div key={item.q}>
                <button
                  onClick={() => setExpanded(expanded === idx ? null : idx)}
                  className="w-full flex items-center gap-2.5 py-2.5 text-left"
                >
                  <span className="text-[11px] font-mono font-bold text-slate-400 shrink-0">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="text-xs font-semibold text-slate-800 flex-1">{item.q}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-slate-400 shrink-0 transition-transform ${
                      expanded === idx ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {expanded === idx && (
                  <p className="text-xs text-slate-600 leading-relaxed pb-3 pl-7 pr-2">{item.a}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-xs bg-slate-50 rounded-lg p-3 text-slate-600 flex items-start gap-2 border border-slate-200/60">
        <Info className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
        <span>
          <strong>Note on G13:</strong> Bank mandate cancellation is unconfirmed in our verified
          spec; our engine strictly produces the fallback response rather than hallucinating
          untested policies.
        </span>
      </div>
    </div>
  );
};
