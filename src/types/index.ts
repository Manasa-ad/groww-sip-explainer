// Real-app-style segmented tabs, inside the phone's own screen.
export type AppTab = 'explore' | 'dashboard' | 'sips' | 'watchlist';

// Top-level case-study workspace sections, always reachable from the persistent
// left sidebar — the phone prototype is just one of these, not a separate shell.
export type WorkspaceSection = 'overview' | 'prototype' | 'golden-set' | 'test-log';

export interface FundHolding {
  id: string;
  name: string;
  category: string;
  sipAmount: number;
  sipFrequency: 'Monthly';
  sipDueDay: number;
  invested: number;
  currentValue: number;
  totalReturns: number;
  totalReturnsPct: number;
  oneDayReturns: number;
  oneDayReturnsPct: number;
  oneMonthReturnsPct?: number;
  xirr: number;
  nav: number;
  navDate: string;
  status: 'Active' | 'Cancelled';
  /** Set after a real "Skip Installment" action — the next debit this SIP skips */
  skippedInstalmentDate?: string;
  /** Set after a real Redeem action — shown as a pending-request note on the card */
  redemptionNote?: string;
}

export interface HoldingsSummary {
  totalValue: number;
  totalInvested: number;
  oneDayReturns: number;
  oneDayReturnsPct: number;
  totalReturns: number;
  totalReturnsPct: number;
  xirr: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  contextTag?: string;
  guardrailLabel?: string;
  isFallback?: boolean;
  sourceId?: string;
  sourceUrl?: string;
}

// A real, timestamped record of an actual question sent through the explainer
// and the actual answer it returned — this is the live Evidence Log, distinct
// from the pre-written Golden Set expectations below.
export interface TestLogEntry {
  id: string;
  timestamp: string;
  contextTitle?: string;
  question: string;
  answer: string;
  guardrailLabel?: string;
  isFallback?: boolean;
  sourceId?: string;
  sourceUrl?: string;
}

export interface GoldenTestItem {
  id: string;
  category: 'Terminology' | 'Performance' | 'SIP mechanics' | 'Hinglish' | 'Advice bait' | 'Missing information' | 'Out of scope';
  question: string;
  expectedBehavior: string;
  status: 'Pass' | 'Fail';
  verificationDetail: string;
}

// The three real actions this prototype supports end-to-end.
// "skip" matches Groww's actual feature — Groww has no general multi-month
// "pause"; you can only skip one upcoming instalment at a time.
export type SipActionType = 'skip' | 'cancel' | 'redeem';

export type DisambiguationOptionId =
  | 'not_satisfied'
  | 'withdraw'
  | 'skip'
  | 'change_amount'
  | 'goal_complete'
  | 'something_else';

export interface DisambiguationOption {
  id: DisambiguationOptionId;
  title: string;
  subtitle: string;
  iconName: string;
  associatedQuestion: string;
}
