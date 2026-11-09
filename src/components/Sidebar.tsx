import React from 'react';
import { LayoutGrid, Smartphone, ListChecks, ScrollText } from 'lucide-react';
import { WorkspaceSection } from '../types';

interface SidebarProps {
  section: WorkspaceSection;
  onSectionChange: (s: WorkspaceSection) => void;
  testLogCount: number;
}

const NAV_ITEMS: { id: WorkspaceSection; label: string; icon: React.ElementType }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutGrid },
  { id: 'prototype', label: 'Prototype', icon: Smartphone },
  { id: 'golden-set', label: 'Golden Set', icon: ListChecks },
  { id: 'test-log', label: 'Test Log', icon: ScrollText },
];

// The persistent left workspace nav — always visible from the first load, no
// click required. The phone prototype is just one item in this list, not a
// separate always-on shell sitting beside a toggle-only panel.
export const Sidebar: React.FC<SidebarProps> = ({ section, onSectionChange, testLogCount }) => {
  return (
    <aside className="w-56 shrink-0 bg-white border-r border-slate-200 flex flex-col h-screen sticky top-0">
      <div className="p-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <img src="/groww-logo.png" alt="Groww" className="w-8 h-8 rounded-full object-cover shrink-0" />
          <div className="min-w-0">
            <div className="font-bold text-sm text-slate-900 truncate">SIP Explainer</div>
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
              PM Case Study
            </div>
          </div>
        </div>
        <p className="text-[11px] text-slate-500 mt-2.5 leading-snug">
          Contextual, non-advisory AI prototype inside classic Groww.
        </p>
      </div>

      <nav className="p-2 space-y-0.5 flex-1">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
              section === item.id
                ? 'bg-slate-100 text-slate-900'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
            }`}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            <span className="flex-1 text-left">{item.label}</span>
            {item.id === 'test-log' && testLogCount > 0 && (
              <span className="text-[10px] bg-slate-900 text-white px-1.5 py-0.5 rounded-full">
                {testLogCount}
              </span>
            )}
          </button>
        ))}
      </nav>

      <div className="p-3 border-t border-slate-100 text-[10px] text-slate-400 leading-snug">
        Independent PM case study. Not affiliated with Groww.
      </div>
    </aside>
  );
};
