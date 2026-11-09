import React, { useState } from 'react';
import { Wifi, RotateCcw, Minus, Plus } from 'lucide-react';

interface PhoneFrameProps {
  children: React.ReactNode;
  onReset: () => void;
  simulateFailure: boolean;
  onToggleSimulateFailure: () => void;
}

export type DeviceMode = 'ios' | 'android' | 'frameless';

// Just the phone + its own small toolbar — this is the content shown when
// "Prototype" is the selected item in the persistent workspace sidebar, not a
// separate always-on shell of its own.
export const PhoneFrame: React.FC<PhoneFrameProps> = ({
  children,
  onReset,
  simulateFailure,
  onToggleSimulateFailure,
}) => {
  const [deviceMode, setDeviceMode] = useState<DeviceMode>('ios');
  const [scale, setScale] = useState<number>(100);

  return (
    <div className="flex flex-col h-full">
      {/* Slim Prototype Toolbar */}
      <header className="bg-white border-b border-slate-200/80 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-xs shrink-0">
        <div>
          <h2 className="text-sm font-bold text-slate-900">Prototype</h2>
          <p className="text-[11px] text-slate-500">Interactive demo — iOS / Android / Frameless</p>
        </div>

        <div className="flex items-center gap-2">
          {/* Device Switcher */}
          <div className="bg-slate-100 p-1 rounded-xl flex items-center gap-1 border border-slate-200 text-xs font-semibold">
            <button
              onClick={() => setDeviceMode('ios')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                deviceMode === 'ios'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              iOS
            </button>
            <button
              onClick={() => setDeviceMode('android')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                deviceMode === 'android'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Android
            </button>
            <button
              onClick={() => setDeviceMode('frameless')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                deviceMode === 'frameless'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Frameless
            </button>
          </div>

          {/* Zoom Stepper */}
          <div className="hidden lg:flex items-center gap-0.5 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs text-slate-600 font-medium">
            <button
              onClick={() => setScale((prev) => Math.max(50, prev - 10))}
              disabled={scale <= 50}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom out"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <span className="w-10 text-center font-bold text-slate-900">{scale}%</span>
            <button
              onClick={() => setScale((prev) => Math.min(150, prev + 10))}
              disabled={scale >= 150}
              className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white hover:text-slate-900 hover:shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              aria-label="Zoom in"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Simulate AI Failure Toggle */}
          <button
            onClick={onToggleSimulateFailure}
            className={`flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-xl border transition-colors ${
              simulateFailure
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
            title="Toggle simulated AI latency/timeout to verify offline fallback"
          >
            <div
              className={`w-2.5 h-2.5 rounded-full ${
                simulateFailure ? 'bg-amber-500 animate-pulse' : 'bg-slate-300'
              }`}
            />
            <span>Simulate AI failure</span>
          </button>

          {/* Reset App State */}
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 transition-colors"
            title="Reset prototype state"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </header>

      {/* Phone Canvas */}
      <div className="flex-1 flex items-center justify-center p-3 sm:p-6 overflow-auto">
        {deviceMode === 'frameless' ? (
          <div className="w-full max-w-[420px] h-[840px] max-h-[92vh] bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden flex flex-col relative">
            {children}
          </div>
        ) : (
          <div
            style={{ transform: `scale(${scale / 100})`, transformOrigin: 'center center' }}
            className="transition-transform duration-200 ease-out"
          >
            {/* Phone Outer Chassis with side buttons */}
            <div className="relative w-[390px] sm:w-[400px] h-[820px] bg-slate-900 rounded-[50px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.38)] border-[3px] border-slate-700/80 ring-1 ring-slate-900/50 flex flex-col">
              {/* Left Side Buttons (Volume) */}
              <div className="absolute -left-[5px] top-[115px] w-[3px] h-[32px] bg-slate-700 rounded-l-md" />
              <div className="absolute -left-[5px] top-[160px] w-[3px] h-[48px] bg-slate-700 rounded-l-md" />
              <div className="absolute -left-[5px] top-[220px] w-[3px] h-[48px] bg-slate-700 rounded-l-md" />

              {/* Right Side Button (Power) */}
              <div className="absolute -right-[5px] top-[170px] w-[3px] h-[70px] bg-slate-700 rounded-r-md" />

              {/* Inner Screen Surface */}
              <div className="w-full h-full bg-white rounded-[40px] overflow-hidden flex flex-col relative shadow-inner">
                {/* Native Status Bar & Dynamic Island / Punch Hole */}
                <div className="pt-2 px-6 flex items-center justify-between text-xs font-semibold text-slate-900 bg-white shrink-0 z-30 select-none">
                  {/* Left: Time */}
                  <span className="text-[13px] font-bold tracking-tight">9:41</span>

                  {/* Center: Dynamic Island (iOS) or Punch-hole (Android) */}
                  {deviceMode === 'ios' ? (
                    <div className="w-24 h-6 bg-black rounded-full flex items-center justify-between px-2.5 mx-auto -mt-0.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
                      <div className="w-2 h-2 rounded-full bg-[#00D09C]/40" />
                    </div>
                  ) : (
                    <div className="w-4 h-4 bg-black rounded-full mx-auto" />
                  )}

                  {/* Right: Signal, Wifi, Battery */}
                  <div className="flex items-center gap-1.5 text-slate-800">
                    {/* Cellular signal bars */}
                    <div className="flex items-end gap-0.5 h-3">
                      <div className="w-[2.5px] h-1.5 bg-slate-800 rounded-xs" />
                      <div className="w-[2.5px] h-2 bg-slate-800 rounded-xs" />
                      <div className="w-[2.5px] h-2.5 bg-slate-800 rounded-xs" />
                      <div className="w-[2.5px] h-3 bg-slate-800 rounded-xs" />
                    </div>
                    <Wifi className="w-3.5 h-3.5" />
                    <div className="flex items-center">
                      <div className="w-5 h-2.5 border border-slate-800 rounded-[3px] p-0.5 flex items-center">
                        <div className="w-full h-full bg-slate-800 rounded-[1px]" />
                      </div>
                      <div className="w-[1.5px] h-1 bg-slate-800 rounded-r-xs -ml-[1px]" />
                    </div>
                  </div>
                </div>

                {/* Main App Content View inside Screen */}
                <div className="flex-1 flex flex-col overflow-y-auto relative bg-slate-50">
                  {children}
                </div>

                {/* Home Indicator Bar (iOS) */}
                <div className="bg-white py-1.5 shrink-0 flex justify-center z-30">
                  <div className="w-32 h-1 bg-slate-900/40 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
