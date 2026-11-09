import React from 'react';
import { ScrollText, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import { TestLogEntry } from '../types';

export const TestLogSection: React.FC<{ testLog: TestLogEntry[] }> = ({ testLog }) => {
  if (testLog.length === 0) {
    return (
      <div className="max-w-2xl flex flex-col items-center text-center py-16 text-slate-400">
        <ScrollText className="w-10 h-10 mb-3" strokeWidth={1.5} />
        <p className="text-sm font-medium text-slate-600">No questions tested yet</p>
        <p className="text-xs mt-1 max-w-sm">
          Open the Prototype tab and tap any <strong>?</strong> or &quot;Explain&quot; button, or
          run a question from the Golden Set tab — every real question and answer will show up
          here as live evidence, in the order it happened.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-slate-900">
          Live Test Log <span className="text-slate-400 font-medium">({testLog.length} runs)</span>
        </h2>
        <span className="text-[11px] text-slate-400">Newest first</span>
      </div>
      {[...testLog].reverse().map((entry) => (
        <div
          key={entry.id}
          className="bg-white rounded-xl border border-slate-200/90 p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
        >
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-[11px] text-slate-400">{entry.timestamp}</span>
            {entry.contextTitle && (
              <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                {entry.contextTitle}
              </span>
            )}
          </div>
          <p className="text-sm font-semibold text-slate-900">&quot;{entry.question}&quot;</p>
          <p className="text-xs text-slate-600 mt-1.5 leading-relaxed bg-slate-50/70 rounded-lg p-2 border border-slate-100 whitespace-pre-wrap">
            {entry.answer}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-slate-400">
            {entry.isFallback ? (
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
            ) : (
              <Shield className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span>
              Source: {entry.sourceId ? `${entry.sourceId} · ` : ''}
              {entry.guardrailLabel || 'Verified Knowledge Base'}
            </span>
          </div>
          {entry.sourceUrl && (
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-[11px] text-emerald-600 hover:underline mt-0.5 ml-5"
            >
              <ExternalLink className="w-3 h-3" />
              <span>{entry.sourceUrl.replace('https://', '')}</span>
            </a>
          )}
        </div>
      ))}
    </div>
  );
};
