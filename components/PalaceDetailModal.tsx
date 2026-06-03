
import React, { useEffect, useState } from 'react';
import { PalaceData } from '../types';
import { analyzePalaceDetail } from '../services/geminiService';

interface Props {
  palace: PalaceData;
  userBazi: string;
  question: string;
  onClose: () => void;
}

const PalaceDetailModal: React.FC<Props> = ({ palace, userBazi, question, onClose }) => {
  const [analysis, setAnalysis] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      setLoading(true);
      const result = await analyzePalaceDetail(palace, userBazi, question);
      setAnalysis(result);
      setLoading(false);
    };
    fetchDetail();
  }, [palace, userBazi, question]);

  const getElementIcon = (el: string) => {
    switch (el) {
      case '水': return <i className="fas fa-tint text-blue-400"></i>;
      case '火': return <i className="fas fa-fire text-red-400"></i>;
      case '木': return <i className="fas fa-tree text-green-400"></i>;
      case '金': return <i className="fas fa-coins text-yellow-200"></i>;
      case '土': return <i className="fas fa-mountain text-amber-600"></i>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-300">
      <div 
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-800 to-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <span className="text-2xl font-bold serif text-blue-400">{palace.name}</span>
            <div className="flex space-x-2">
              {palace.isHorse && <span className="text-[10px] bg-yellow-500/20 text-yellow-500 px-2 py-0.5 rounded border border-yellow-500/30">驛馬</span>}
              {palace.isEmpty && <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-600">空亡</span>}
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors p-2"
          >
            <i className="fas fa-times text-xl"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <DetailItem label="九星" value={palace.star} color="text-sky-300" />
            <DetailItem label="八門" value={palace.door} color="text-emerald-400" />
            <DetailItem label="八神" value={palace.god} color="text-purple-400" />
            <DetailItem label="五行" value={<span className="flex items-center gap-2">{palace.element} {getElementIcon(palace.element)}</span>} color="text-slate-200" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
              <span className="block text-xs text-slate-500 mb-1 uppercase tracking-widest">天盤干</span>
              <span className="text-2xl font-bold text-orange-400">{palace.heavenStem}</span>
            </div>
            <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
              <span className="block text-xs text-slate-500 mb-1 uppercase tracking-widest">地盤干</span>
              <span className="text-2xl font-bold text-stone-400">{palace.earthStem}</span>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold serif border-l-4 border-blue-500 pl-3">大師深度批點</h4>
            {loading ? (
              <div className="flex flex-col items-center py-12 space-y-4">
                <div className="w-10 h-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
                <p className="text-slate-500 italic text-sm">正在研讀古籍，演算宮位吉凶...</p>
              </div>
            ) : (
              <div className="bg-slate-800/60 p-5 rounded-xl border border-slate-700 text-slate-200 leading-relaxed whitespace-pre-line text-sm">
                {analysis}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-800/50 border-t border-slate-700 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors font-medium text-sm"
          >
            關閉
          </button>
        </div>
      </div>
    </div>
  );
};

const DetailItem: React.FC<{ label: string; value: React.ReactNode; color: string }> = ({ label, value, color }) => (
  <div className="bg-slate-800/40 p-3 rounded-xl border border-slate-700 text-center">
    <span className="block text-[10px] text-slate-500 mb-1 uppercase tracking-widest">{label}</span>
    <span className={`text-lg font-bold ${color}`}>{value}</span>
  </div>
);

export default PalaceDetailModal;
