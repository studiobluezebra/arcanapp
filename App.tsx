import React, { useState, useEffect, useRef } from 'react';
import { TAROT_DECK } from './constants';
import { TarotCard, Spread, DailyDraw, TarotTheme } from './types';
import TarotCardView from './TarotCardView';
import HistorySidebar from './HistorySidebar';
import DeckAtelier from './DeckAtelier';
import { getTarotReading, getDailyGuidance } from './geminiService';

const App: React.FC = () => {
  const [question, setQuestion] = useState('');
  const [history, setHistory] = useState<Spread[]>([]);
  const [dailyDraw, setDailyDraw] = useState<DailyDraw | null>(null);
  const [currentCards, setCurrentCards] = useState<(TarotCard | null)[]>([null, null, null]);
  const [flippedIndices, setFlippedIndices] = useState<boolean[]>([false, false, false]);
  
  const [isDrawing, setIsDrawing] = useState(false);
  const [isDrawingDaily, setIsDrawingDaily] = useState(false);
  const [isInterpreting, setIsInterpreting] = useState(false);
  const [currentSpread, setCurrentSpread] = useState<Spread | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [currentTheme, setCurrentTheme] = useState<TarotTheme>('original');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAtelierOpen, setIsAtelierOpen] = useState(false);

  const interpretationRef = useRef<HTMLDivElement>(null);

  const getTodayStr = () => new Date().toISOString().split('T')[0];

  useEffect(() => {
    const savedTheme = localStorage.getItem('tarot-theme') as TarotTheme;
    if (savedTheme) setCurrentTheme(savedTheme);

    const savedHistory = localStorage.getItem('tarot-history');
    if (savedHistory) {
      try {
        const parsed = JSON.parse(savedHistory);
        if (Array.isArray(parsed)) setHistory(parsed);
      } catch(e) {}
    }

    const savedDaily = localStorage.getItem('tarot-daily');
    if (savedDaily) {
      try {
        const parsed: DailyDraw = JSON.parse(savedDaily);
        if (parsed.date === getTodayStr()) setDailyDraw(parsed);
      } catch(e) {}
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tarot-history', JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    localStorage.setItem('tarot-theme', currentTheme);
  }, [currentTheme]);

  const handleDailyDraw = async () => {
    setIsDrawingDaily(true);
    setError(null);
    try {
      const card = TAROT_DECK[Math.floor(Math.random() * TAROT_DECK.length)];
      const res = await getDailyGuidance(card);
      const newDaily: DailyDraw = { date: getTodayStr(), card, interpretation: res.interpretation };
      setDailyDraw(newDaily);
      localStorage.setItem('tarot-daily', JSON.stringify(newDaily));
    } catch (err) { setError("The Oracle is silent."); } finally { setIsDrawingDaily(false); }
  };

  const drawCards = () => {
    if (!question.trim()) return;
    setIsDrawing(true);
    setCurrentSpread(null);
    setFlippedIndices([false, false, false]);
    setError(null);
    setTimeout(() => {
      const deck = [...TAROT_DECK];
      const drawn: TarotCard[] = [];
      for (let i = 0; i < 3; i++) {
        const randomIndex = Math.floor(Math.random() * deck.length);
        drawn.push(deck.splice(randomIndex, 1)[0]);
      }
      setCurrentCards(drawn);
      setIsDrawing(false);
    }, 1200);
  };

  const interpret = async () => {
    setFlippedIndices([true, true, true]);
    setIsInterpreting(true);
    try {
      const drawnCards = currentCards.filter((c): c is TarotCard => c !== null);
      const res = await getTarotReading(question, drawnCards);
      const s: Spread = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        question,
        readings: res.readings.map((r, i) => ({ 
          card: drawnCards[i], 
          interpretation: r.interpretation, 
          position: r.position as any 
        })),
        summary: res.summary,
        advice: res.advice
      };
      setCurrentSpread(s);
      setHistory(h => [s, ...h]);
      setTimeout(() => interpretationRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    } catch (e) { 
      setError("The connection to the stars was interrupted."); 
    } finally { 
      setIsInterpreting(false); 
    }
  };

  const reset = () => {
    setQuestion('');
    setCurrentCards([null, null, null]);
    setFlippedIndices([false, false, false]);
    setCurrentSpread(null);
    setError(null);
  };

  return (
    <div className="min-h-screen text-slate-300 flex flex-col items-center pb-20 selection:bg-accent/30">
      <HistorySidebar 
        history={history} 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        onSelectSpread={(s) => { 
          setQuestion(s.question); 
          setCurrentCards(s.readings.map(r => r.card)); 
          setFlippedIndices([true, true, true]); 
          setCurrentSpread(s); 
        }} 
      />
      <DeckAtelier 
        isOpen={isAtelierOpen} 
        onClose={() => setIsAtelierOpen(false)} 
        currentTheme={currentTheme} 
        onSelectTheme={setCurrentTheme} 
      />

      <header className="w-full max-w-6xl p-6 flex justify-between items-center sticky top-0 bg-[#050508]/60 backdrop-blur-xl z-40 border-b border-white/5">
        <button onClick={() => setIsSidebarOpen(true)} className="group flex items-center gap-2">
          <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-accent-light transition-colors">Archive</span>
        </button>
        <h1 className="text-xl md:text-2xl font-serif text-accent tracking-[0.4em] uppercase cursor-pointer hover:scale-105 transition-transform" onClick={reset}>Celestial Arcana</h1>
        <button onClick={() => setIsAtelierOpen(true)} className="group flex items-center gap-2">
          <span className="text-accent text-[10px] font-black uppercase tracking-[0.3em] group-hover:text-accent-light transition-colors">Atelier</span>
        </button>
      </header>

      <main className="w-full max-w-5xl p-6 flex flex-col items-center">
        {!question && !currentCards[0] && (
          <div className="my-20 text-center animate-in">
            {!dailyDraw ? (
              <div className="flex flex-col items-center gap-10">
                <div className="w-36 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-1000">
                   <TarotCardView card={null} positionLabel="Daily Insight" isFlipped={false} theme={currentTheme} />
                </div>
                <button 
                  onClick={handleDailyDraw} 
                  disabled={isDrawingDaily} 
                  className="group relative px-10 py-4 overflow-hidden rounded-full border border-accent/30 hover:border-accent transition-all"
                >
                  <div className="absolute inset-0 bg-accent/5 group-hover:bg-accent/10 transition-colors"></div>
                  <p className="relative text-[10px] text-accent font-black uppercase tracking-[0.5em]">{isDrawingDaily ? 'Invoking...' : 'Reveal Daily Energy'}</p>
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-10 max-w-xl animate-in">
                <div className="w-48 shadow-[0_0_80px_rgba(171,146,92,0.15)] rounded-2xl overflow-hidden">
                  <TarotCardView card={dailyDraw.card} positionLabel="Today's Guide" isFlipped={true} theme={currentTheme} />
                </div>
                <div className="space-y-6 text-center">
                  <h2 className="text-3xl font-serif text-accent-light uppercase tracking-[0.2em]">{dailyDraw.card.name}</h2>
                  <p className="text-2xl italic font-reading leading-relaxed text-slate-200 px-4">"{dailyDraw.interpretation}"</p>
                </div>
                <button onClick={() => setDailyDraw(null)} className="text-[9px] text-slate-500 uppercase tracking-widest hover:text-accent transition-colors border-b border-transparent hover:border-accent pb-1">Clear the Altar</button>
              </div>
            )}
          </div>
        )}

        {(!currentCards[0] || (currentCards[0] && !currentSpread)) && (
          <div className="w-full max-w-2xl bg-white/5 p-12 rounded-[3.5rem] border border-white/10 text-center mb-16 shadow-2xl backdrop-blur-sm relative overflow-hidden group">
             <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-accent/20 to-transparent"></div>
             <label className="text-[10px] text-accent font-black uppercase tracking-[0.6em] mb-8 block opacity-50">Inquire the Infinite</label>
             <textarea 
              value={question} 
              onChange={e => setQuestion(e.target.value)} 
              placeholder="What does the universe need you to know?" 
              className="w-full bg-transparent text-center text-3xl font-reading italic outline-none resize-none placeholder:text-slate-800 transition-all focus:placeholder:opacity-0"
              rows={2}
             />
             {question.trim() && !currentCards[0] && (
              <button 
                onClick={drawCards} 
                disabled={isDrawing} 
                className="mt-10 bg-accent hover:bg-accent-light text-black px-14 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all transform hover:scale-105 active:scale-95 shadow-[0_10px_40px_-10px_rgba(171,146,92,0.5)]"
              >
                {isDrawing ? 'Shuffling the Veil...' : 'Cast the Spread'}
              </button>
             )}
          </div>
        )}

        {error && <p className="mb-8 text-red-400 text-[10px] uppercase tracking-widest italic animate-pulse">{error}</p>}

        {currentCards[0] && (
          <div className="w-full space-y-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12 px-4 lg:gap-20">
              {currentCards.map((c, i) => (
                <TarotCardView 
                  key={i} 
                  card={c} 
                  positionLabel={i===0?"The Past":i===1?"The Present":"The Future"} 
                  isFlipped={flippedIndices[i]} 
                  theme={currentTheme} 
                  onClick={() => {
                    const f=[...flippedIndices]; 
                    f[i]=true; 
                    setFlippedIndices(f);
                  }} 
                />
              ))}
            </div>
            {!currentSpread && !isDrawing && (
              <div className="flex flex-col items-center gap-8 animate-in">
                {!flippedIndices.every(v => v) && (
                  <button onClick={() => setFlippedIndices([true, true, true])} className="text-[10px] uppercase font-black tracking-[0.5em] text-slate-500 hover:text-accent transition-colors">Reveal the Path</button>
                )}
                <button 
                  onClick={interpret} 
                  disabled={isInterpreting} 
                  className="bg-accent hover:bg-accent-light text-black px-16 py-5 rounded-full text-[11px] font-black uppercase tracking-[0.4em] transition-all shadow-xl disabled:opacity-50 disabled:grayscale"
                >
                  {isInterpreting ? 'Consulting the Spirits...' : 'Divine the Meaning'}
                </button>
              </div>
            )}
          </div>
        )}

        {currentSpread && (
          <div ref={interpretationRef} className="mt-32 space-y-32 animate-in pb-48 w-full max-w-4xl">
            <div className="grid grid-cols-1 gap-20">
              {currentSpread.readings.map((r, i) => (
                <div key={i} className="border-l border-accent/30 pl-12 py-4 relative group">
                  <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-accent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[10px] text-accent font-black uppercase tracking-[0.5em] mb-6 block opacity-50">{r.position}</span>
                  <h3 className="text-4xl font-serif text-accent-light uppercase mb-8 tracking-wider">{r.card.name}</h3>
                  <p className="text-2xl font-reading italic leading-relaxed text-slate-100">"{r.interpretation}"</p>
                </div>
              ))}
            </div>
            
            <div className="bg-white/5 p-20 rounded-[4.5rem] text-center border border-white/10 shadow-3xl relative overflow-hidden">
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-[1px] bg-gradient-to-r from-transparent via-accent/40 to-transparent"></div>
               <h4 className="text-[11px] text-accent font-black uppercase tracking-[0.7em] mb-14 opacity-60">The Oracle's Synthesis</h4>
               <p className="text-4xl md:text-6xl font-serif italic text-slate-50 leading-tight mb-14 drop-shadow-sm">"{currentSpread.advice}"</p>
               <p className="text-xl text-slate-400 font-reading max-w-2xl mx-auto italic leading-relaxed mb-20">{currentSpread.summary}</p>
               <button 
                onClick={reset} 
                className="bg-accent hover:bg-accent-light text-black px-16 py-6 rounded-full text-[11px] font-black uppercase tracking-[0.5em] transition-all transform hover:scale-105 active:scale-95 shadow-2xl"
               >
                  Another Inquiry
               </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
