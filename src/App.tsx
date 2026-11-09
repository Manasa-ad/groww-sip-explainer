import React, { useState, useEffect, useRef } from 'react';
import { Sidebar } from './components/Sidebar';
import { OverviewSection } from './components/OverviewSection';
import { TestLogSection } from './components/TestLogSection';
import { EvaluationView } from './components/EvaluationView';
import { PhoneFrame } from './components/PhoneFrame';
import { TopNav } from './components/TopNav';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { ExploreView } from './components/ExploreView';
import { SipsView } from './components/SipsView';
import { WatchlistView } from './components/WatchlistView';
import { ExplainSheet } from './components/ExplainSheet';
import { SipActionModal, SipActionResult } from './components/SipActionModal';
import { useEvalSuite } from './hooks/useEvalSuite';
import { mockHoldingsSummary, mockFunds } from './data/mockData';
import {
  FundHolding,
  AppTab,
  TestLogEntry,
  SipActionType,
  WorkspaceSection,
} from './types';

export default function App() {
  // Persistent left-sidebar workspace section — always visible from load,
  // never a click-to-reveal toggle. The phone prototype is just one section.
  const [workspaceSection, setWorkspaceSection] = useState<WorkspaceSection>('prototype');

  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');

  // Fund holdings as real state — Redeem/Skip/Cancel actions actually mutate
  // this, so the dashboard and SIPs screens reflect a real completed action.
  const [funds, setFunds] = useState<FundHolding[]>(mockFunds);

  // Explainer Bottom Sheet State with Request Nonce
  const [isExplainerOpen, setIsExplainerOpen] = useState(false);
  const [explainerQuestion, setExplainerQuestion] = useState<string | undefined>();
  const [explainerContextTitle, setExplainerContextTitle] = useState<string | undefined>();
  const [requestId, setRequestId] = useState<number>(0);

  // SIP Action Disambiguation Modal State
  const [isActionModalOpen, setIsActionModalOpen] = useState(false);
  const [actionFund, setActionFund] = useState<FundHolding | null>(null);
  const [actionType, setActionType] = useState<SipActionType>('skip');

  // Simulation of AI latency/failure for verification testing
  const [simulateFailure, setSimulateFailure] = useState(false);

  // Live Evidence Log: every real question/answer pair that actually ran, in order
  const [testLog, setTestLog] = useState<TestLogEntry[]>([]);

  // Shared live-eval state — Overview and Golden Set both read the SAME real
  // result, so neither can show a pass count that hasn't actually been run.
  const evalSuite = useEvalSuite();

  // Run the real suite once on load so Overview/Golden Set never sit in a
  // blank "Not yet run" state — the numbers are still genuinely computed,
  // just triggered automatically instead of waiting for a manual click.
  const hasAutoRunEval = useRef(false);
  useEffect(() => {
    if (hasAutoRunEval.current) return;
    hasAutoRunEval.current = true;
    evalSuite.runEvalSuite();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Trigger Explainer from any '?' icon with incrementing requestId nonce
  const handleOpenExplainer = (contextTitle?: string, initialQuestion?: string) => {
    setRequestId((prev) => prev + 1);
    setExplainerContextTitle(contextTitle);
    setExplainerQuestion(initialQuestion);
    setIsExplainerOpen(true);
  };

  // A Golden Set "Test in Explainer" click jumps into the live Prototype so the
  // user actually sees the guardrail play out, not just a written expectation.
  const handleTestInPrototype = (question: string) => {
    setWorkspaceSection('prototype');
    handleOpenExplainer('Golden Set Live Test', question);
  };

  // Record a real question/answer pair into the live Evidence Log as it happens
  const handleLogEntry = (entry: {
    question: string;
    answer: string;
    contextTitle?: string;
    guardrailLabel?: string;
    isFallback?: boolean;
    sourceId?: string;
    sourceUrl?: string;
  }) => {
    setTestLog((prev) => [
      ...prev,
      {
        id: `log-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        ...entry,
      },
    ]);
  };

  // Trigger SIP Action Screen (Screen 3)
  const handleInitiateSipAction = (fund: FundHolding, type: SipActionType) => {
    setActionFund(fund);
    setActionType(type);
    setIsActionModalOpen(true);
  };

  // "Explain this" inside the Redeem/Skip/Cancel modal should show the AI
  // screen in its place, not stack behind it — so close the modal first.
  const handleExplainFromAction = (contextTitle: string, question: string) => {
    setIsActionModalOpen(false);
    handleOpenExplainer(contextTitle, question);
  };

  // A real, completed action: mutate the actual fund state so the dashboard
  // and SIPs screens genuinely reflect it, instead of just closing with a toast.
  const handleActionComplete = (result: SipActionResult) => {
    setFunds((prev) =>
      prev.map((f) => {
        if (f.id !== result.fund.id) return f;
        if (result.type === 'cancel') return { ...f, status: 'Cancelled' as const };
        if (result.type === 'skip') return { ...f, skippedInstalmentDate: result.skippedInstalmentDate };
        if (result.type === 'redeem') return { ...f, redemptionNote: result.redemptionNote };
        return f;
      })
    );
  };

  const handleReset = () => {
    setActiveTab('dashboard');
    setIsExplainerOpen(false);
    setIsActionModalOpen(false);
    setExplainerQuestion(undefined);
    setExplainerContextTitle(undefined);
  };

  return (
    <div className="min-h-screen flex bg-[#F0F2F5] text-slate-900 font-sans">
      <Sidebar
        section={workspaceSection}
        onSectionChange={setWorkspaceSection}
        testLogCount={testLog.length}
      />

      <main className="flex-1 min-w-0">
        {workspaceSection === 'overview' && (
          <div className="p-6 sm:p-8 overflow-y-auto">
            <OverviewSection
              onNavigate={setWorkspaceSection}
              testLogCount={testLog.length}
              liveResults={evalSuite.liveResults}
              livePassCount={evalSuite.livePassCount}
              lastRunAt={evalSuite.lastRunAt}
              isRunning={evalSuite.isRunning}
              runEvalSuite={evalSuite.runEvalSuite}
            />
          </div>
        )}

        {workspaceSection === 'golden-set' && (
          <div className="p-6 sm:p-8 overflow-y-auto max-w-3xl">
            <EvaluationView
              onTestQuestion={handleTestInPrototype}
              showBanner={false}
              liveResults={evalSuite.liveResults}
              isRunning={evalSuite.isRunning}
              lastRunAt={evalSuite.lastRunAt}
              runEvalSuite={evalSuite.runEvalSuite}
              livePassCount={evalSuite.livePassCount}
            />
          </div>
        )}

        {workspaceSection === 'test-log' && (
          <div className="p-6 sm:p-8 overflow-y-auto">
            <TestLogSection testLog={testLog} />
          </div>
        )}

        {workspaceSection === 'prototype' && (
          <PhoneFrame
            onReset={handleReset}
            simulateFailure={simulateFailure}
            onToggleSimulateFailure={() => setSimulateFailure((prev) => !prev)}
          >
            {/* Groww Native Top Header (Clean, minimal, no badge clutter) */}
            <TopNav
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onOpenGeneralExplainer={() =>
                handleOpenExplainer('Holdings Overview', 'What does XIRR mean?')
              }
            />

            {/* Scrollable Screen Content inside Mobile Frame */}
            <main className="flex-1 p-3.5 sm:p-4 overflow-y-auto">
              {activeTab === 'explore' && <ExploreView />}

              {activeTab === 'dashboard' && (
                <DashboardView
                  summary={mockHoldingsSummary}
                  funds={funds.filter((f) => f.status !== 'Cancelled')}
                  onExplainMetric={handleOpenExplainer}
                  onOpenExplainer={handleOpenExplainer}
                  onInitiateAction={handleInitiateSipAction}
                  onViewEvaluation={() => setWorkspaceSection('golden-set')}
                />
              )}

              {activeTab === 'sips' && <SipsView funds={funds} />}

              {activeTab === 'watchlist' && <WatchlistView />}
            </main>

            {/* Groww-style Bottom Tab Bar (Stocks / F&O / Mutual Funds / Loans) */}
            <BottomNav />

            {/* Screen 2: Explain This Bottom Sheet inside Phone */}
            <ExplainSheet
              isOpen={isExplainerOpen}
              onClose={() => {
                setIsExplainerOpen(false);
                setExplainerQuestion(undefined);
              }}
              initialQuestion={explainerQuestion}
              contextTitle={explainerContextTitle}
              requestId={requestId}
              simulateFailure={simulateFailure}
              onLogEntry={handleLogEntry}
            />

            {/* Screen 3: SIP Action Modal — real Redeem/Skip/Cancel flow with a true result screen */}
            <SipActionModal
              isOpen={isActionModalOpen}
              onClose={() => setIsActionModalOpen(false)}
              fund={actionFund}
              actionType={actionType}
              onExplain={handleExplainFromAction}
              onComplete={handleActionComplete}
            />
          </PhoneFrame>
        )}
      </main>
    </div>
  );
}
