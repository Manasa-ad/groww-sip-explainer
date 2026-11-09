import { useState } from 'react';
import { goldenTestSet } from '../data/mockData';
import { evaluateQuestion, EngineResult } from '../utils/explainerEngine';

export interface LiveResult {
  pass: boolean;
  result: EngineResult;
}

// Shared live-eval state so every view that claims a pass count (Overview,
// Golden Set) shows the SAME real result, never a separately hard-coded number.
//
// Scope: this calls evaluateQuestion() directly, so it verifies the deterministic
// rule-based engine only. It does NOT exercise the live Gemini backend path in
// server.ts (/api/explain) — when a real Gemini API key is configured, the AI's
// actual generated text still only goes through the lighter output-safety filter
// in server.ts, not this golden-set check. Any UI that surfaces these results
// must label them as a deterministic-engine evaluation, not an AI-backend one.
export function useEvalSuite() {
  const [liveResults, setLiveResults] = useState<Record<string, LiveResult> | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [lastRunAt, setLastRunAt] = useState<string | null>(null);

  const runEvalSuite = () => {
    setIsRunning(true);
    setTimeout(() => {
      const results: Record<string, LiveResult> = {};
      for (const item of goldenTestSet) {
        const result = evaluateQuestion(item.question);
        results[item.id] = { pass: result.sourceId === item.id, result };
      }
      setLiveResults(results);
      setLastRunAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setIsRunning(false);
    }, 650);
  };

  const livePassCount = liveResults ? Object.values(liveResults).filter((r) => r.pass).length : null;

  return { liveResults, isRunning, lastRunAt, runEvalSuite, livePassCount, total: goldenTestSet.length };
}
