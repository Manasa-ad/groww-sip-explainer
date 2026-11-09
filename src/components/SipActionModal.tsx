import React, { useEffect, useState } from 'react';
import {
  X,
  ArrowDownToLine,
  PauseCircle,
  CalendarClock,
  CheckCircle2,
  HelpCircle,
  TrendingDown,
  CheckCircle,
  Info,
} from 'lucide-react';
import { FundHolding, SipActionType } from '../types';
import { cancelReasons } from '../data/mockData';

export interface SipActionResult {
  type: SipActionType;
  fund: FundHolding;
  skippedInstalmentDate?: string;
  redemptionNote?: string;
}

interface SipActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  fund: FundHolding | null;
  actionType: SipActionType;
  onExplain: (contextTitle: string, question: string) => void;
  onComplete: (result: SipActionResult) => void;
}

const getReasonIcon = (name: string) => {
  switch (name) {
    case 'TrendingDown':
      return <TrendingDown className="w-5 h-5 text-rose-500" />;
    case 'ArrowDownToLine':
      return <ArrowDownToLine className="w-5 h-5 text-blue-500" />;
    case 'PauseCircle':
      return <PauseCircle className="w-5 h-5 text-amber-500" />;
    case 'CalendarClock':
      return <CalendarClock className="w-5 h-5 text-blue-500" />;
    case 'CheckCircle2':
      return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    default:
      return <HelpCircle className="w-5 h-5 text-slate-500" />;
  }
};

export const SipActionModal: React.FC<SipActionModalProps> = ({
  isOpen,
  onClose,
  fund,
  actionType,
  onExplain,
  onComplete,
}) => {
  const [step, setStep] = useState<'input' | 'result'>('input');
  const [selectedReasonId, setSelectedReasonId] = useState<string | null>(null);
  const [redeemMode, setRedeemMode] = useState<'full' | 'partial'>('full');
  const [redeemAmount, setRedeemAmount] = useState('');

  // Reset to a clean first step every time a new action opens
  useEffect(() => {
    if (isOpen) {
      setStep('input');
      setSelectedReasonId(null);
      setRedeemMode('full');
      setRedeemAmount('');
    }
  }, [isOpen, fund?.id, actionType]);

  if (!isOpen || !fund) return null;

  const selectedReason = cancelReasons.find((r) => r.id === selectedReasonId);
  const redeemValue = redeemMode === 'full' ? fund.currentValue : Number(redeemAmount) || 0;

  const handlePrimaryAction = () => {
    if (actionType === 'skip') {
      onComplete({ type: 'skip', fund, skippedInstalmentDate: `${fund.sipDueDay} Dec` });
      setStep('result');
      return;
    }
    if (actionType === 'cancel') {
      onComplete({ type: 'cancel', fund });
      setStep('result');
      return;
    }
    if (actionType === 'redeem') {
      const note = `₹${redeemValue.toLocaleString('en-IN')} requested on ${fund.navDate}`;
      onComplete({ type: 'redeem', fund, redemptionNote: note });
      setStep('result');
    }
  };

  const titleByType = {
    skip: 'Skip Next Instalment',
    cancel: 'Cancel SIP',
    redeem: 'Redeem',
  }[actionType];

  const accentByType = {
    skip: { badge: 'bg-amber-50 text-amber-700 border-amber-200', btn: 'bg-amber-600 hover:bg-amber-700' },
    cancel: { badge: 'bg-rose-50 text-rose-700 border-rose-200', btn: 'bg-rose-600 hover:bg-rose-700' },
    redeem: { badge: 'bg-blue-50 text-blue-700 border-blue-200', btn: 'bg-blue-600 hover:bg-blue-700' },
  }[actionType];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="sip-action-title"
      className="absolute inset-0 z-50 flex items-center justify-center p-3 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-[390px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/60">
          <div>
            <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded border ${accentByType.badge}`}>
              {titleByType}
            </span>
            <h2 id="sip-action-title" className="text-base font-bold text-slate-900 mt-1">
              {step === 'result'
                ? {
                    skip: 'Instalment Skipped',
                    cancel: 'SIP Cancelled',
                    redeem: 'Redemption Submitted',
                  }[actionType]
                : fund.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {step === 'input' && (
          <>
            {/* Fund context */}
            <div className="px-4 py-2.5 bg-slate-100/50 border-b border-slate-100 text-xs text-slate-600 flex items-center justify-between">
              <span className="font-semibold text-slate-800 truncate mr-2">{fund.name}</span>
              <span className="text-slate-500 shrink-0">₹{fund.sipAmount.toLocaleString('en-IN')}/mo</span>
            </div>

            {/* SKIP: single-step confirm, matching Groww's real "Skip Instalment" (not a multi-month pause) */}
            {actionType === 'skip' && (
              <div className="p-4">
                <p className="text-sm text-slate-700 leading-relaxed">
                  Your next instalment of <strong>₹{fund.sipAmount.toLocaleString('en-IN')}</strong>, due{' '}
                  <strong>{fund.sipDueDay} Dec</strong>, will be skipped.
                </p>
                <div className="mt-3 bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Groww doesn&apos;t have a multi-month pause — this skips only the next instalment.
                    Your SIP resumes automatically on {fund.sipDueDay} Jan.
                  </span>
                </div>
                <button
                  onClick={() => onExplain(fund.name, 'What happens if I skip my next SIP instalment?')}
                  className="text-xs font-semibold text-emerald-600 hover:underline mt-3"
                >
                  Explain this
                </button>
              </div>
            )}

            {/* CANCEL: real reason-first flow with honest nudges, not a jump straight to chat */}
            {actionType === 'cancel' && (
              <div className="p-4">
                <p className="text-xs text-slate-500 mb-3">Tell us why you&apos;re cancelling:</p>
                <div className="space-y-2">
                  {cancelReasons.map((reason) => (
                    <button
                      key={reason.id}
                      onClick={() => setSelectedReasonId(reason.id)}
                      className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                        selectedReasonId === reason.id
                          ? 'border-rose-300 bg-rose-50/40'
                          : 'border-slate-200/90 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
                        {getReasonIcon(reason.iconName)}
                      </div>
                      <span className="text-xs sm:text-sm font-semibold text-slate-900">{reason.title}</span>
                    </button>
                  ))}
                </div>

                {selectedReason && selectedReason.nudge && (
                  <div className="mt-3 bg-blue-50/60 border border-blue-100 rounded-xl p-3 text-xs text-slate-700 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-blue-500 shrink-0 mt-0.5" />
                    <span>{selectedReason.nudge}</span>
                  </div>
                )}
                {selectedReason && (
                  <button
                    onClick={() => onExplain(fund.name, selectedReason.associatedQuestion)}
                    className="text-xs font-semibold text-emerald-600 hover:underline mt-2"
                  >
                    Explain this
                  </button>
                )}
              </div>
            )}

            {/* REDEEM: real enter-amount flow, matching Groww's actual "Confirm Withdrawal" */}
            {actionType === 'redeem' && (
              <div className="p-4">
                <div className="flex gap-2 mb-3">
                  <button
                    onClick={() => setRedeemMode('full')}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors ${
                      redeemMode === 'full'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Redeem all (₹{fund.currentValue.toLocaleString('en-IN')})
                  </button>
                  <button
                    onClick={() => setRedeemMode('partial')}
                    className={`flex-1 text-xs font-semibold py-2 rounded-lg border transition-colors ${
                      redeemMode === 'partial'
                        ? 'bg-blue-50 border-blue-300 text-blue-700'
                        : 'bg-white border-slate-200 text-slate-600'
                    }`}
                  >
                    Partial amount
                  </button>
                </div>
                {redeemMode === 'partial' && (
                  <input
                    type="number"
                    value={redeemAmount}
                    onChange={(e) => setRedeemAmount(e.target.value)}
                    placeholder="Enter amount"
                    max={fund.currentValue}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 mb-3 focus:outline-none focus:ring-1 focus:ring-blue-400"
                  />
                )}
                <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                  <span>
                    Units are sold at that day&apos;s NAV. For equity funds, proceeds are credited to
                    your bank account within 3 business days (T+3).
                  </span>
                </div>
                <button
                  onClick={() => onExplain(fund.name, 'How does mutual fund redemption work?')}
                  className="text-xs font-semibold text-emerald-600 hover:underline mt-3"
                >
                  Explain this
                </button>
              </div>
            )}

            {/* Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                onClick={onClose}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg"
              >
                Go Back
              </button>
              <button
                onClick={handlePrimaryAction}
                disabled={
                  (actionType === 'cancel' && !selectedReasonId) ||
                  (actionType === 'redeem' && redeemMode === 'partial' && (!redeemValue || redeemValue > fund.currentValue))
                }
                className={`text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-colors text-white disabled:opacity-40 disabled:cursor-not-allowed ${accentByType.btn}`}
              >
                {actionType === 'skip' && 'Confirm Skip'}
                {actionType === 'cancel' && 'Continue to Cancel'}
                {actionType === 'redeem' && 'Confirm Withdrawal'}
              </button>
            </div>
          </>
        )}

        {step === 'result' && (
          <div className="p-5">
            <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-3">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>

            {actionType === 'skip' && (
              <>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Your <strong>{fund.sipDueDay} Dec</strong> instalment of ₹
                  {fund.sipAmount.toLocaleString('en-IN')} has been skipped for{' '}
                  <strong>{fund.name}</strong>.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Your SIP resumes automatically on {fund.sipDueDay} Jan — no action needed.
                </p>
              </>
            )}

            {actionType === 'cancel' && (
              <>
                <p className="text-sm text-slate-700 leading-relaxed">
                  Your SIP for <strong>{fund.name}</strong> has been cancelled. Future instalments
                  have stopped.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Your ₹{fund.invested.toLocaleString('en-IN')} already invested stays in the fund —
                  redeem separately if you want to withdraw it.
                </p>
              </>
            )}

            {actionType === 'redeem' && (
              <>
                <p className="text-sm text-slate-700 leading-relaxed">
                  ₹{redeemValue.toLocaleString('en-IN')} redemption request submitted for{' '}
                  <strong>{fund.name}</strong>.
                </p>
                <p className="text-xs text-slate-500 mt-2">
                  Expected credit to your registered bank account within 3 business days (T+3) for
                  equity funds.
                </p>
              </>
            )}

            <button
              onClick={onClose}
              className="w-full mt-5 text-sm font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl py-2.5 transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
