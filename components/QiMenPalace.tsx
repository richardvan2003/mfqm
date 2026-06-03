import React from 'react';
import { PalaceData } from '../types';
import { getStemRelationship } from '../utils/qimenLogic';

export type HighlightStatus = 'none' | 'selected' | 'stem' | 'element';

interface Props {
  data: PalaceData;
  onClick?: () => void;
  highlightStatus?: HighlightStatus;
}

const QiMenPalace: React.FC<Props> = ({ data, onClick, highlightStatus = 'none' }) => {
  const rel = getStemRelationship(data.heavenStem, data.earthStem);

  const getElementColor = (el: string) => {
    switch (el) {
      case '水': return 'text-blue-400';
      case '火': return 'text-red-500';
      case '木': return 'text-emerald-500';
      case '金': return 'text-yellow-200';
      case '土': return 'text-amber-700';
      default: return 'text-gray-400';
    }
  };

  const getElementBg = (el: string) => {
    switch (el) {
      case '水': return 'bg-blue-500/5';
      case '火': return 'bg-red-500/5';
      case '木': return 'bg-emerald-500/5';
      case '金': return 'bg-yellow-500/5';
      case '土': return 'bg-amber-500/5';
      default: return 'bg-slate-800/50';
    }
  };

  const getRelStyles = (type: string) => {
    switch (type) {
      case 'he': return 'text-pink-400 border-pink-500/40 bg-pink-500/10 shadow-[0_0_8px_rgba(236,72,153,0.4)]';
      case 'chong': return 'text-red-500 border-red-500/40 bg-red-500/10 shadow-[0_0_8px_rgba(239,68,68,0.4)]';
      case 'sheng': return 'text-emerald-400 border-emerald-400/60 bg-emerald-500/20 shadow-[0_0_12px_rgba(52,211,153,0.5)]';
      case 'ke': return 'text-amber-500 border-amber-500/60 bg-amber-500/20 shadow-[0_0_12px_rgba(245,158,11,0.5)]';
      default: return 'text-slate-500 border-slate-700 bg-slate-800/20';
    }
  };

  const highlightClasses = {
    none: 'border-slate-800/50',
    selected: 'border-yellow-500 ring-2 ring-yellow-500/40 shadow-[0_0_30px_rgba(234,179,8,0.4)] z-20 scale-[1.05]',
    stem: 'border-sky-500/60 shadow-[0_0_15px_rgba(14,165,233,0.3)] animate-pulse z-10',
    element: 'border-white/20 shadow-[0_0_15px_rgba(255,255,255,0.1)]'
  };

  const hasEntropy = data.isJiXing || data.isRuMu || data.isMenPo || data.isEmpty;

  return (
    <div 
      onClick={onClick}
      className={`relative aspect-square border ${highlightClasses[highlightStatus]} ${getElementBg(data.element)} p-3 flex flex-col justify-between rounded-xl overflow-hidden transition-all duration-500 hover:bg-slate-800/80 group cursor-pointer ${hasEntropy ? 'hover:shadow-[inset_0_0_20px_rgba(239,68,68,0.1)]' : ''}`}
    >
      {/* Background Palace Name */}
      <div className={`absolute inset-0 flex items-center justify-center opacity-[0.03] text-6xl font-black select-none group-hover:opacity-[0.07] transition-opacity duration-700 serif ${highlightStatus === 'selected' ? 'opacity-[0.1]' : ''}`}>
        {data.name.charAt(0)}
      </div>

      {/* Entropy Shimmer Effect */}
      {hasEntropy && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-red-500/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-[2s] pointer-events-none"></div>
      )}

      {/* Status Badges & Harm Indicators */}
      <div className="absolute top-2 right-2 flex flex-col items-end space-y-1.5 z-20">
        <div className="flex flex-wrap justify-end gap-1 max-w-[60px]">
          {data.isJiXing && <div className="bg-red-950/80 text-red-500 text-[7px] px-1 py-0.5 rounded border border-red-500/40 font-bold" title="擊刑">刑</div>}
          {data.isRuMu && <div className="bg-slate-950/80 text-orange-500 text-[7px] px-1 py-0.5 rounded border border-orange-500/40 font-bold" title="入墓">墓</div>}
          {data.isMenPo && <div className="bg-red-950/80 text-red-400 text-[7px] px-1 py-0.5 rounded border border-red-400/40 font-bold" title="門迫">迫</div>}
          {data.isHorse && (
            <div className="bg-yellow-500/20 text-yellow-500 text-[8px] px-1.5 py-0.5 rounded border border-yellow-500/30 flex items-center shadow-lg animate-pulse font-bold">馬</div>
          )}
          {data.isEmpty && (
            <div className="bg-slate-950/90 text-slate-500 text-[8px] px-1.5 py-0.5 rounded border border-slate-700/50 flex items-center shadow-lg font-bold">空</div>
          )}
        </div>
      </div>

      {/* Top Layer: God & Star */}
      <div className="flex justify-between items-start z-10">
        <span className="text-[10px] font-black text-purple-400/90 tracking-tighter uppercase">{data.god}</span>
        <span className="text-[10px] text-sky-300/80 serif">{data.star}</span>
      </div>

      {/* Middle Layer: Door (Core) */}
      <div className="flex justify-center items-center z-10 relative">
        <span className={`text-2xl font-bold ${data.isMenPo ? 'text-red-400' : 'text-emerald-400'} group-hover:scale-110 transition-transform duration-500 drop-shadow-[0_0_8px_rgba(52,211,153,0.3)] serif`}>
          {data.door}
        </span>
        {data.isMenPo && (
          <div className="absolute -inset-2 border border-red-500/20 rounded-full animate-ping opacity-20"></div>
        )}
      </div>

      {/* Bottom Layer: Stems & Element */}
      <div className="flex justify-between items-end z-10 border-t border-slate-800/30 pt-1.5">
        <div className="flex flex-col relative pl-1">
           <div className="flex items-center space-x-1.5 mb-0.5 group/stem">
             <span className="text-[7px] text-slate-600 font-bold opacity-40">天</span>
             <span className={`text-sm font-bold transition-colors ${data.isJiXing || data.isRuMu ? 'text-orange-600' : 'text-orange-400 group-hover/stem:text-orange-300'}`}>
               {data.heavenStem}
             </span>
           </div>

           <div className="flex items-center space-x-1.5 group/stem">
             <span className="text-[7px] text-slate-600 font-bold opacity-40">地</span>
             <span className="text-sm text-stone-400 font-bold group-hover/stem:text-stone-300 transition-colors">{data.earthStem}</span>
           </div>
           
           {/* Relationship Icon */}
           {rel && (
             <div className={`absolute -left-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full border bg-slate-950 flex items-center justify-center text-[7px] font-black z-20 ${getRelStyles(rel.type)}`}>
               {rel.label}
             </div>
           )}
        </div>

        <div className="flex flex-col items-end">
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-950/40 border border-slate-800/40 ${getElementColor(data.element)}`}>
            {data.element}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QiMenPalace;