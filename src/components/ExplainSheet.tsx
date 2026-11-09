import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Sparkles, Shield, RefreshCw, HelpCircle, AlertTriangle, ExternalLink } from 'lucide-react';
import { ChatMessage } from '../types';
import { evaluateQuestion } from '../utils/explainerEngine';

interface ExplainSheetProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
  contextTitle?: string;
  requestId: number;
  simulateFailure?: boolean;
  onLogEntry?: (entry: {
    question: string;
    answer: string;
    contextTitle?: string;
    guardrailLabel?: string;
    isFallback?: boolean;
    sourceId?: string;
    sourceUrl?: string;
  }) => void;
}

export const ExplainSheet: React.FC<ExplainSheetProps> = ({
  isOpen,
  onClose,
  initialQuestion,
  contextTitle,
  requestId,
  simulateFailure = false,
  onLogEntry,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastHandledRequestIdRef = useRef<number>(-1);

  const suggestedQuestions = [
    'What does XIRR mean?',
    'Why is my return negative/lower this month?',
    "What's the difference between pausing and cancelling?",
  ];

  // Auto-scroll to bottom of conversation
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Reliable Auto-send effect: uses requestId nonce so tapping the same question multiple times always fires!
  useEffect(() => {
    if (isOpen && initialQuestion && requestId !== lastHandledRequestIdRef.current) {
      lastHandledRequestIdRef.current = requestId;
      handleSendMessage(initialQuestion);
    }
  }, [isOpen, initialQuestion, requestId]);

  const handleClearChat = () => {
    setMessages([]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = (textToSend || inputValue).trim();
    if (!query || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}-${Math.random()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // If "Simulate AI failure" is enabled in prototype controls, trigger immediate timeout/fallback path.
    // The answer itself stays clean — only the small source line below it says this was a fallback.
    if (simulateFailure) {
      setTimeout(() => {
        const localResult = evaluateQuestion(query);
        const aiMessage: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'assistant',
          text: localResult.text,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          guardrailLabel: 'Offline fallback (simulated delay)',
          isFallback: true,
          sourceId: localResult.sourceId,
          sourceUrl: localResult.sourceUrl,
        };
        setMessages((prev) => [...prev, aiMessage]);
        onLogEntry?.({
          question: query,
          answer: aiMessage.text,
          contextTitle,
          guardrailLabel: aiMessage.guardrailLabel,
          isFallback: aiMessage.isFallback,
          sourceId: aiMessage.sourceId,
          sourceUrl: aiMessage.sourceUrl,
        });
        setIsLoading(false);
      }, 800);
      return;
    }

    // Client-side AbortController timeout (15s)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 15000);

    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: query,
          context: contextTitle || 'Groww Mutual Funds Holdings & SIP Screen',
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        throw new Error(`Server returned status ${res.status}`);
      }

      const data = await res.json();
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        guardrailLabel: data.guardrailLabel,
        isFallback: data.isFallback,
        sourceId: data.sourceId,
        sourceUrl: data.sourceUrl,
      };

      setMessages((prev) => [...prev, aiMessage]);
      onLogEntry?.({
        question: query,
        answer: aiMessage.text,
        contextTitle,
        guardrailLabel: aiMessage.guardrailLabel,
        isFallback: aiMessage.isFallback,
        sourceId: aiMessage.sourceId,
        sourceUrl: aiMessage.sourceUrl,
      });
    } catch (err: any) {
      clearTimeout(timeoutId);
      const isTimeout = err?.name === 'AbortError' || err?.message?.includes('aborted');
      console.warn('Explainer API fetch fallback to local engine:', err);

      // The answer text itself stays clean even on a timeout — the source line
      // below it is what tells the user this came from the offline fallback.
      const localResult = evaluateQuestion(query);
      const aiMessage: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'assistant',
        text: localResult.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        guardrailLabel: isTimeout
          ? 'Offline fallback (request timed out)'
          : localResult.guardrailLabel,
        isFallback: isTimeout ? true : localResult.isFallback,
        sourceId: localResult.sourceId,
        sourceUrl: localResult.sourceUrl,
      };
      setMessages((prev) => [...prev, aiMessage]);
      onLogEntry?.({
        question: query,
        answer: aiMessage.text,
        contextTitle,
        guardrailLabel: aiMessage.guardrailLabel,
        isFallback: aiMessage.isFallback,
        sourceId: aiMessage.sourceId,
        sourceUrl: aiMessage.sourceUrl,
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Groww AI Investment Explainer"
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Background backdrop click to close */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Bottom Sheet Container inside Phone Frame */}
      <div className="relative w-full bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[85%] h-[580px] animate-in slide-in-from-bottom duration-200 border-t border-slate-200 z-10">
        {/* Drag handle */}
        <div className="pt-2.5 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-slate-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-[#00D09C]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="text-sm font-bold text-slate-900">Groww Explainer</h2>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                  Non-Advisory AI
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                {contextTitle ? `Context: ${contextTitle}` : 'Contextual answers from verified knowledge base'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            {messages.length > 0 && (
              <button
                onClick={handleClearChat}
                className="text-xs text-slate-400 hover:text-slate-600 px-2 py-1 rounded"
                title="Clear conversation"
              >
                Clear
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              aria-label="Close explainer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Chat / Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col justify-center items-center text-center px-2 py-4">
              <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center text-emerald-600 mb-3">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-slate-900 text-sm mb-1">
                Have a question about your mutual fund screen?
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mb-5">
                Tap a suggested topic below or type any term like XIRR, NAV, pausing, or negative returns.
              </p>

              {/* Suggested Tappable Chips */}
              <div className="w-full space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider text-left">
                  Suggested Questions:
                </div>
                {suggestedQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q)}
                    className="w-full text-left text-xs bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-200 border border-slate-200/90 text-slate-800 p-2.5 rounded-xl font-medium transition-all flex items-center justify-between group cursor-pointer"
                  >
                    <span>{q}</span>
                    <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0 ml-2" />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${
                    msg.sender === 'user' ? 'items-end' : 'items-start'
                  }`}
                >
                  <div
                    className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                      msg.sender === 'user'
                        ? 'bg-slate-900 text-white rounded-br-xs'
                        : msg.isFallback
                        ? 'bg-amber-50/90 border border-amber-200 text-slate-900 rounded-bl-xs'
                        : 'bg-slate-100 text-slate-900 rounded-bl-xs border border-slate-200/60'
                    }`}
                  >
                    {msg.text}
                  </div>

                  {/* Source citation — every answer says precisely where it came from.
                      A real link only appears when we have a genuinely verified URL —
                      never fabricated, since that would break the no-invented-facts rule. */}
                  {msg.sender === 'assistant' && (
                    <div className="mt-1 ml-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        {msg.isFallback ? (
                          <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        ) : (
                          <Shield className="w-3 h-3 text-emerald-500 shrink-0" />
                        )}
                        <span>
                          Source: {msg.sourceId ? `${msg.sourceId} · ` : ''}
                          {msg.guardrailLabel || 'Verified Knowledge Base'}
                        </span>
                        <span>•</span>
                        <span>{msg.timestamp}</span>
                      </div>
                      {msg.sourceUrl && (
                        <a
                          href={msg.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-[10px] text-emerald-600 hover:underline mt-0.5"
                        >
                          <ExternalLink className="w-3 h-3" />
                          <span>{msg.sourceUrl.replace('https://', '')}</span>
                        </a>
                      )}
                    </div>
                  )}
                  {msg.sender === 'user' && (
                    <span className="text-[10px] text-slate-400 mt-1 mr-1">
                      {msg.timestamp}
                    </span>
                  )}
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-slate-100 border border-slate-200/60 rounded-2xl rounded-bl-xs px-3.5 py-2.5 text-xs text-slate-500 flex items-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                    <span>Verifying knowledge base...</span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick follow-up chips when conversation is active */}
        {messages.length > 0 && (
          <div className="px-3 py-1.5 border-t border-slate-100 overflow-x-auto whitespace-nowrap flex gap-1.5 bg-slate-50/50">
            {suggestedQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(q)}
                disabled={isLoading}
                className="text-[11px] bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 px-2.5 py-1 rounded-full shrink-0 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input area & mandatory non-advisory disclaimer */}
        <div className="p-3 border-t border-slate-200 bg-white">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Ask about XIRR, NAV, pausing, returns..."
              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-400 text-slate-900"
            />
            <button
              type="submit"
              disabled={!inputValue.trim() || isLoading}
              aria-label="Send question to AI explainer"
              className="w-8 h-8 rounded-xl bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-white flex items-center justify-center transition-colors shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Mandatory Disclaimers */}
          <div className="mt-2 text-[10px] text-slate-400 leading-tight text-center">
            This explains what&apos;s on your screen — it can&apos;t tell you what to do with your money or which fund to choose.
          </div>
        </div>
      </div>
    </div>
  );
};
