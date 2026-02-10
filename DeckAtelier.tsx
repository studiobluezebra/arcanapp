
import React from 'react';
import { TarotTheme, TarotCard } from '../types';
import { THEME_CONFIGS, TAROT_DECK, getThemeCardUrl } from '../constants';

interface DeckAtelierProps {
  isOpen: boolean;
  onClose: () => void;
  currentTheme: TarotTheme;
  onSelectTheme: (theme: TarotTheme) => void;
}

const DeckAtelier: React.FC<DeckAtelierProps> = ({ isOpen, onClose, currentTheme, onSelectTheme }) => {
  if (!isOpen) return null;

  const themes: TarotTheme[] = ['original', 'anime', 'alchemy', 'midnight', 'ethereal'];
  const previewCard = TAROT_DECK.find(c => c.name === 'The Fool') || TAROT_DECK[0];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#050508]/95 backdrop-blur-xl animate-in">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl aspect-square bg-amber-900/10 blur-[160px] rounded-full pointer-events-none"></div>

      <div className="bg-[#0a0a0f] w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-[3rem] border border-white/5 flex flex-col shadow-[0_40px_100px_rgba(0,0,0,0.9)] relative z-10">
        
        <div className="p-10 md:p-12 border-b border-white/5 flex items-center justify-between bg-[#0c0c14]/80 backdrop-blur-md">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-serif text-amber-100 tracking-[0.2em] uppercase">The Atelier</h2>
            <p className="text-[9px] text-amber-900 font-black uppercase tracking-[0.4em]">Choose your spiritual vision</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-3 rounded-full text-slate-500 hover:text-white hover:bg-white/5 transition-all hover:rotate-90"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-8 md:p-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 md:gap-8 custom-scrollbar bg-gradient-to-b from-[#0a0a0f] to-[#050508]">
          {themes.map((theme) => {
            const config = THEME_CONFIGS[theme];
            const isActive = currentTheme === theme;
            return (
              <button
                key={theme}
                onClick={() => onSelectTheme(theme)}
                className={`group flex flex-col items-center gap-4 p-4 rounded-[2rem] border transition-all duration-700 relative ${isActive ? 'bg-amber-900/10 border-amber-500/30' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
              >
                <div className="relative w-full aspect-[2/3.5] rounded-xl overflow-hidden shadow-2xl transition-all duration-700 group-hover:scale-[1.03]">
                  <img 
                    src={getThemeCardUrl(previewCard, theme)} 
                    alt={`${config.name} Preview`}
                    className="w-full h-full object-cover"
                    style={{ filter: config.filter }}
                    onError={(e) => {
                       (e.target as HTMLImageElement).src = 'https://via.placeholder.com/200x350?text=Card+Back';
                    }}
                  />
                  <div className={`absolute inset-0 transition-opacity duration-700 ${isActive ? 'opacity-0' : 'bg-black/40 group-hover:opacity-10'}`}></div>
                  {isActive && (
                    <div className="absolute inset-0 border-2 border-amber-500/40 rounded-xl animate-pulse"></div>
                  )}
                </div>
                
                <div className="text-center space-y-1">
                  <h3 className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isActive ? 'text-amber-400' : 'text-slate-400'}`}>
                    {config.name}
                  </h3>
                  <p className="text-[7px] text-slate-500 italic leading-relaxed uppercase tracking-[0.1em] opacity-60">
                    {config.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DeckAtelier;
