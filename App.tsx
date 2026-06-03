import React, { useState, useMemo, useEffect } from 'react';
import { UserInput, QiMenResult, PanType, PalaceData } from './types';
import { generatePanData, calculateTrueSolarTime, getBaziFromDate, getPalaceBearing } from './utils/qimenLogic';
import { analyzeQiMen } from './services/geminiService';
import { PALACE_NAMES } from './constants';
import InputForm from './components/InputForm';
import QiMenPalace, { HighlightStatus } from './components/QiMenPalace';
import PalaceDetailModal from './components/PalaceDetailModal';
import DirectionMap from './components/DirectionMap';

const INITIAL_VISUAL_LAYOUT = [3, 8, 1, 2, 4, 6, 7, 0, 5];

const QiMenLogo = () => (
  <div className="relative w-16 h-16 flex items-center justify-center">
    <div className="absolute inset-0 border-2 border-yellow-600/40 rounded-full animate-mystic-spin shadow-[0_0_15px_rgba(212,175,55,0.2)]"></div>
    <div className="absolute inset-2 border border-yellow-600/20 rounded-full border-dashed animate-mystic-spin" style={{ animationDirection: 'reverse', animationDuration: '30s' }}></div>
    <div className="relative z-10 w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center border border-yellow-600/50">
      <span className="calligraphy text-3xl text-yellow-500 glow-gold">遁</span>
    </div>
  </div>
);

const App: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<QiMenResult | null>(null);
  const [activePan, setActivePan] = useState<PanType>(PanType.FLYING);
  const [selectedPalace, setSelectedPalace] = useState<PalaceData | null>(null);
  const [currentInput, setCurrentInput] = useState<UserInput | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const [visualIndices, setVisualIndices] = useState<number[]>(INITIAL_VISUAL_LAYOUT);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentMomentBazi = useMemo(() => getBaziFromDate(currentTime), [currentTime]);

  const palaceDataMap = useMemo(() => {
    if (!result) return new Map<string, PalaceData>();
    const data = activePan === PanType.FLYING ? result.flyingPan : result.rotatingPan;
    return new Map(data.map(p => [p.name, p]));
  }, [result, activePan]);

  const handleStartAnalysis = async (input: UserInput) => {
    setLoading(true);
    setCurrentInput(input);
    setSelectedPalace(null);
    try {
      const solarTime = calculateTrueSolarTime(input.birthDate, input.birthTime, input.longitude);
      const birthDateTime = new Date(`${input.birthDate} ${input.birthTime}`);
      const userBazi = getBaziFromDate(birthDateTime);
      const now = new Date();
      const queryBazi = getBaziFromDate(now);
      const flyingPan = generatePanData(input, PanType.FLYING);
      const rotatingPan = generatePanData(input, PanType.ROTATING);

      const partialResult: QiMenResult = {
        userBazi,
        queryBazi,
        solarTime,
        question: input.question,
        flyingPan,
        rotatingPan
      };

      setResult(partialResult);
      const analysis = await analyzeQiMen(partialResult);
      setResult(prev => prev ? { ...prev, analysis } : null);
    } catch (err) {
      console.error(err);
      alert("量子態糾纏異常，請重啟法門。");
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (index: number) => setDraggedIndex(index);
  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; };
  const handleDrop = (index: number) => {
    if (draggedIndex === null) return;
    const newIndices = [...visualIndices];
    const [movedItem] = newIndices.splice(draggedIndex, 1);
    newIndices.splice(index, 0, movedItem);
    setVisualIndices(newIndices);
    setDraggedIndex(null);
  };

  const handlePalaceClick = (palace: PalaceData) => {
    if (selectedPalace && selectedPalace.name === palace.name) {
      setSelectedPalace(null);
    } else {
      setSelectedPalace(palace);
    }
  };

  const getPalaceHighlight = (palace: PalaceData): HighlightStatus => {
    if (!selectedPalace) return 'none';
    if (selectedPalace.name === palace.name) return 'selected';
    const selectedStems = [selectedPalace.heavenStem, selectedPalace.earthStem];
    const currentStems = [palace.heavenStem, palace.earthStem];
    if (selectedStems.some(s => currentStems.includes(s))) return 'stem';
    if (selectedPalace.element === palace.element) return 'element';
    return 'none';
  };

  const renderPan = () => {
    if (!result) return null;
    return (
      <div 
        className="qimen-grid w-full max-w-md mx-auto aspect-square transition-transform duration-1000 ease-out"
        style={{ perspective: '1000px', transformStyle: 'preserve-3d' }}
      >
        <div className="grid grid-cols-3 gap-2 w-full h-full" style={{ transform: 'rotateX(10deg)' }}>
          {visualIndices.map((logicalIdx, visualIdx) => {
            const name = PALACE_NAMES[logicalIdx];
            const palaceData = palaceDataMap.get(name);
            if (!palaceData) return <div key={`empty-${visualIdx}`} className="aspect-square bg-slate-800/20 rounded-md" />;
            return (
              <div 
                key={`${activePan}-${name}`}
                draggable
                onDragStart={() => handleDragStart(visualIdx)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(visualIdx)}
                className={`transition-all duration-300 ${draggedIndex === visualIdx ? 'opacity-20 scale-90' : 'opacity-100'}`}
                style={{ transform: 'translateZ(20px)' }}
              >
                <QiMenPalace 
                  data={palaceData} 
                  onClick={() => handlePalaceClick(palaceData)} 
                  highlightStatus={getPalaceHighlight(palaceData)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen pb-20 overflow-x-hidden">
      <div className="h-1 bg-gradient-to-r from-transparent via-yellow-700/50 to-transparent w-full"></div>
      
      <nav className="border-b border-yellow-900/30 bg-slate-900/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <QiMenLogo />
            <div className="relative">
              <h1 className="text-3xl font-bold tracking-[0.25em] serif text-slate-100 uppercase">鳴法量子</h1>
              <div className="flex items-center space-x-2 mt-1">
                <span className="h-px w-8 bg-yellow-600/50"></span>
                <p className="text-[9px] uppercase tracking-[0.3em] text-yellow-600 font-bold whitespace-nowrap">Quantum-Ming Oracle System</p>
                <span className="h-px w-8 bg-yellow-600/50"></span>
              </div>
            </div>
          </div>
          
          <div className="hidden lg:flex items-center space-x-10">
            <div className="flex flex-col items-end">
              <div className="flex items-center space-x-2 mb-1">
                <i className="fas fa-atom text-[10px] text-sky-500 animate-spin" style={{ animationDuration: '3s' }}></i>
                <span className="text-slate-500 text-[9px] uppercase tracking-widest">當前量子相位 (Quantum Phase)</span>
              </div>
              <span className="text-yellow-500/90 font-mono text-sm tracking-wider serif">{currentMomentBazi}</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 mt-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
          <div className="lg:col-span-7 space-y-16">
            <section className="relative">
              <div className="absolute -top-12 -left-10 calligraphy text-[10rem] text-slate-800/20 pointer-events-none select-none z-0">量子</div>
              <div className="relative z-10">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="w-12 h-px bg-yellow-600/30"></div>
                  <h2 className="text-3xl font-bold serif text-yellow-500/90 tracking-widest flex items-center">
                    <i className="fas fa-microchip mr-4 text-2xl opacity-80"></i>
                    「太初 · 鳴法量子奇門」
                  </h2>
                  <div className="flex-grow h-px bg-gradient-to-r from-yellow-600/30 to-transparent"></div>
                </div>
                <InputForm onSubmit={handleStartAnalysis} loading={loading} />
              </div>
            </section>

            {result && (
              <section className="animate-in fade-in slide-in-from-bottom-12 duration-1000">
                <div className="flex items-center space-x-4 mb-10">
                  <div className="w-12 h-px bg-amber-600/30"></div>
                  <h2 className="text-3xl font-bold serif text-amber-500 tracking-widest flex items-center">
                    <i className="fas fa-wave-pulse mr-4 text-2xl opacity-80"></i>
                    波函數坍縮解讀 (Decoherence Analysis)
                  </h2>
                  <div className="flex-grow h-px bg-gradient-to-r from-amber-600/30 to-transparent"></div>
                </div>
                
                <div className="bg-slate-900/40 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl relative">
                  {!result.analysis ? (
                    <div className="flex flex-col items-center py-20 space-y-8">
                      <div className="relative w-24 h-24">
                        <div className="absolute inset-0 border-4 border-sky-500/10 border-t-sky-500 rounded-full animate-spin"></div>
                        <i className="fas fa-atom absolute inset-0 flex items-center justify-center text-sky-500 text-3xl animate-pulse"></i>
                      </div>
                      <p className="text-slate-400 italic serif text-xl text-center">正在解析鳴法格局，對沖熵增擾動中...</p>
                    </div>
                  ) : (
                    <div className="whitespace-pre-line text-slate-300 leading-relaxed custom-scrollbar max-h-[800px] overflow-y-auto pr-6 serif text-xl first-letter:text-5xl first-letter:text-yellow-600">
                      {result.analysis}
                    </div>
                  )}
                </div>
              </section>
            )}
          </div>

          <div className="lg:col-span-5">
            <div className="sticky top-32">
              <div className="bg-slate-900/95 p-10 rounded-[3rem] border border-yellow-900/20 shadow-[0_0_60px_rgba(0,0,0,0.6)] relative overflow-hidden">
                <div className="flex justify-between items-center mb-12 relative z-10">
                  <div className="flex items-center space-x-4">
                    <div className="w-3 h-3 rounded-full bg-yellow-500 shadow-[0_0_15px_rgba(212,175,55,1)]"></div>
                    <h2 className="text-2xl font-bold serif text-slate-100 tracking-[0.2em] uppercase">九宮相干態</h2>
                  </div>
                  <div className="flex bg-slate-800/40 p-1.5 rounded-2xl border border-slate-700/50 backdrop-blur-md">
                    <button onClick={() => setActivePan(PanType.FLYING)} className={`px-5 py-2 text-xs rounded-xl transition-all font-black ${activePan === PanType.FLYING ? 'bg-gradient-to-br from-yellow-600 to-amber-800 text-white' : 'text-slate-500'}`}>飛盤</button>
                    <button onClick={() => setActivePan(PanType.ROTATING)} className={`px-5 py-2 text-xs rounded-xl transition-all font-black ${activePan === PanType.ROTATING ? 'bg-gradient-to-br from-yellow-600 to-amber-800 text-white' : 'text-slate-500'}`}>轉盤</button>
                  </div>
                </div>

                {!result ? (
                  <div className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-slate-800 rounded-[2.5rem] bg-slate-900/50">
                    <i className="fas fa-fingerprint text-7xl opacity-5 mb-8"></i>
                    <p className="serif tracking-[0.3em] text-sm uppercase font-bold text-center px-10">等待觀察者觀測<br/><span className="text-[10px] opacity-50 mt-2 block">Wavefunction Awaiting Collapse</span></p>
                  </div>
                ) : (
                  <div className="relative z-10">
                    <div className="mb-10 p-5 bg-slate-950/60 rounded-3xl border border-slate-800/50 text-center">
                      <span className="text-[10px] uppercase tracking-widest text-slate-600 block mb-1">真太陽時對齊 (Solar Alignment)</span>
                      <p className="font-mono text-sky-400 text-lg tracking-widest">{result.solarTime}</p>
                    </div>
                    {renderPan()}
                    {currentInput && (
                      <div className="mt-8 animate-in fade-in zoom-in duration-500">
                        <DirectionMap 
                          center={[currentInput.latitude, currentInput.longitude]} 
                          bearing={selectedPalace ? getPalaceBearing(selectedPalace.name) : null}
                          palaceName={selectedPalace?.name || ''}
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      {selectedPalace && result && currentInput && (
        <PalaceDetailModal palace={selectedPalace} userBazi={result.userBazi} question={result.question} onClose={() => setSelectedPalace(null)} />
      )}
    </div>
  );
};

export default App;