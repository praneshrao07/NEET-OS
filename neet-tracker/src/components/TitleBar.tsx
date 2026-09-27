import React, { useEffect, useState } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';

export const TitleBar: React.FC = () => {
  const [isElectron, setIsElectron] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      setIsElectron(true);
      window.electronAPI.isMaximized().then(setIsMaximized).catch(() => {});
    }
  }, []);

  const handleMinimize = () => {
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = async () => {
    if (window.electronAPI) {
      window.electronAPI.maximizeWindow();
      const max = await window.electronAPI.isMaximized();
      setIsMaximized(max);
    }
  };

  const handleClose = () => {
    window.electronAPI?.closeWindow();
  };

  return (
    <div className="h-8 bg-[#040609] border-b border-[#111A28] flex items-center justify-between px-3 select-none app-drag-region z-50 shrink-0">
      <div className="flex items-center gap-2 text-xs font-medium text-slate-400">
        <img src="/icon.png" alt="NEET OS" className="w-4 h-4 rounded-sm object-cover shadow-sm shadow-cyan-500/30" />
        <span className="text-slate-200 font-semibold tracking-wide">NEET OS</span>
        <span className="text-slate-600">|</span>
        <span className="text-[11px] text-slate-400">UG 2026 Analytics Platform</span>
      </div>

      <div className="flex items-center gap-1.5 app-no-drag">
        {isElectron ? (
          <>
            <button
              onClick={handleMinimize}
              className="w-7 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="w-7 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
              title={isMaximized ? "Restore" : "Maximize"}
            >
              {isMaximized ? <Copy className="w-3 h-3" /> : <Square className="w-3 h-3" />}
            </button>
            <button
              onClick={handleClose}
              className="w-7 h-6 flex items-center justify-center rounded text-slate-400 hover:text-white hover:bg-red-600/80 transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </>
        ) : (
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-blue-950/40 border border-blue-800/30 text-[10px] text-blue-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Desktop Engine Ready
          </div>
        )}
      </div>
    </div>
  );
};
