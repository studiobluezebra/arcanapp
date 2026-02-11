
import React from 'react';
import { Spread } from './types';

interface HistorySidebarProps {
  history: Spread[];
  onSelectSpread: (spread: Spread) => void;
  isOpen: boolean;
  onClose: () => void;
}

const HistorySidebar: React.FC<HistorySidebarProps> = ({ history, onSelectSpread, isOpen, onClose }) => {
  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[45] animate-in" 
          onClick={onClose}
        ></div>
      )}
      
      <div className={`fixed inset-y-0 left-0 w-80 bg-[#08080c]/95 backdrop-blur-2xl border-r border-white/5 transform transition-transform duration-500 ease-in-out z-50 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-10 flex flex-col h-full">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-xl font-proxima nova regular text-accent uppercase tracking-widest">The Archive</h2>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 text-2xl">✕</button>
          </div>

          {history.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-center px-4">
              <p className="text-slate-600 text-sm italic opacity-40">The scrolls are currently empty.</p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar">
              {history.sort((a,b) => b.timestamp - a.timestamp).map((spread) => {
                return (
                  <button
                    key={spread.id}
                    onClick={() => { onSelectSpread(spread); onClose(); }}
                    className="w-full text-left p-6 rounded-3xl bg-white/5 border border-transparent hover:border-accent/20 transition-all group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <span className="text-[8px] font-black uppercase tracking-widest text-accent">Oracle Spread</span>
                      <span className="text-[8px] text-slate-600 font-bold uppercase">
                        {new Date(spread.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                    <h4 className="text-sm font-medium text-slate-300 line-clamp-2 italic mb-3 group-hover:text-accent-light transition-colors">
                      {spread.question}
                    </h4>
                    <div className="flex gap-1.5 opacity-20 group-hover:opacity-60 transition-opacity">
                      {[0,1,2].map(i => <span key={i} className="w-1.5 h-1.5 rounded-full bg-accent"></span>)}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </>
  );
};
