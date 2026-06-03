
import React, { useState, useEffect } from 'react';
import { UserInput } from '../types';

interface Props {
  onSubmit: (data: UserInput) => void;
  loading: boolean;
}

const SHICHEN_LIST = [
  { name: '子時', range: '23:00 - 01:00', icon: '🌙' },
  { name: '丑時', range: '01:00 - 03:00', icon: '🐂' },
  { name: '寅時', range: '03:00 - 05:00', icon: '🐅' },
  { name: '卯時', range: '05:00 - 07:00', icon: '🐇' },
  { name: '辰時', range: '07:00 - 09:00', icon: '🐉' },
  { name: '巳時', range: '09:00 - 11:00', icon: '🐍' },
  { name: '午時', range: '11:00 - 13:00', icon: '🐎' },
  { name: '未時', range: '13:00 - 15:00', icon: '🐐' },
  { name: '申時', range: '15:00 - 17:00', icon: '🐒' },
  { name: '酉時', range: '17:00 - 19:00', icon: '🐓' },
  { name: '戌時', range: '19:00 - 21:00', icon: '🐕' },
  { name: '亥時', range: '21:00 - 23:00', icon: '🐖' },
];

const getShichen = (hour: number) => {
  if (hour >= 23 || hour < 1) return SHICHEN_LIST[0];
  if (hour >= 1 && hour < 3) return SHICHEN_LIST[1];
  if (hour >= 3 && hour < 5) return SHICHEN_LIST[2];
  if (hour >= 5 && hour < 7) return SHICHEN_LIST[3];
  if (hour >= 7 && hour < 9) return SHICHEN_LIST[4];
  if (hour >= 9 && hour < 11) return SHICHEN_LIST[5];
  if (hour >= 11 && hour < 13) return SHICHEN_LIST[6];
  if (hour >= 13 && hour < 15) return SHICHEN_LIST[7];
  if (hour >= 15 && hour < 17) return SHICHEN_LIST[8];
  if (hour >= 17 && hour < 19) return SHICHEN_LIST[9];
  if (hour >= 19 && hour < 21) return SHICHEN_LIST[10];
  if (hour >= 21 && hour < 23) return SHICHEN_LIST[11];
  return null;
};

const InputForm: React.FC<Props> = ({ onSubmit, loading }) => {
  const [selectedHour, setSelectedHour] = useState('12');
  const [selectedMin, setSelectedMin] = useState('00');
  
  const [formData, setFormData] = useState<UserInput>({
    name: '',
    birthDate: '',
    birthTime: '12:00',
    longitude: 121.5,
    latitude: 25.0,
    question: '',
    numbers: ''
  });

  const [currentShichen, setCurrentShichen] = useState(getShichen(12));

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setFormData(prev => ({
          ...prev,
          longitude: pos.coords.longitude,
          latitude: pos.coords.latitude
        }));
      });
    }
  }, []);

  useEffect(() => {
    const timeStr = `${selectedHour.padStart(2, '0')}:${selectedMin.padStart(2, '0')}`;
    setFormData(prev => ({ ...prev, birthTime: timeStr }));
    setCurrentShichen(getShichen(parseInt(selectedHour)));
  }, [selectedHour, selectedMin]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = "w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 focus:ring-1 focus:ring-yellow-600/50 focus:border-yellow-600/50 outline-none transition-all text-slate-200 serif text-sm placeholder:text-slate-700 appearance-none";
  const labelClass = "block text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-widest ml-1";

  // Generate 0-23 hours
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  // Generate minutes (intervals of 1)
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <form onSubmit={handleSubmit} className="space-y-8 bg-slate-900/40 p-10 rounded-3xl border border-slate-800 backdrop-blur-md shadow-2xl relative">
      <div className="absolute top-0 right-10 -translate-y-1/2 flex space-x-2">
        <div className="w-1 h-8 bg-yellow-600/20 rounded-full"></div>
        <div className="w-1 h-12 bg-yellow-600/40 rounded-full"></div>
        <div className="w-1 h-8 bg-yellow-600/20 rounded-full"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelClass}>姓名 / 齋號</label>
          <input
            required
            type="text"
            className={inputClass}
            value={formData.name}
            onChange={e => setFormData({...formData, name: e.target.value})}
            placeholder="請輸入起卦者名號"
          />
        </div>
        <div>
          <label className={labelClass}>求占事項 / 願景</label>
          <input
            required
            type="text"
            className={inputClass}
            value={formData.question}
            onChange={e => setFormData({...formData, question: e.target.value})}
            placeholder="例如：事業調動、情志抉擇..."
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelClass}>出生日期 (西曆公曆)</label>
          <input
            required
            type="date"
            className={inputClass}
            value={formData.birthDate}
            onChange={e => setFormData({...formData, birthDate: e.target.value})}
          />
        </div>
        <div>
          <div className="flex justify-between items-end mb-2">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">出生時間 (24H制: 00-23)</label>
            {currentShichen && (
              <span className="text-[10px] text-yellow-600 font-bold animate-pulse">
                {currentShichen.icon} 應：{currentShichen.name}
              </span>
            )}
          </div>
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <select 
                className={inputClass}
                value={selectedHour}
                onChange={e => setSelectedHour(e.target.value)}
              >
                {hours.map(h => <option key={h} value={h} className="bg-slate-900">{h} 時</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 text-[10px]">▼</div>
            </div>
            <div className="flex items-center text-slate-500 font-bold">:</div>
            <div className="relative flex-1">
              <select 
                className={inputClass}
                value={selectedMin}
                onChange={e => setSelectedMin(e.target.value)}
              >
                {minutes.map(m => <option key={m} value={m} className="bg-slate-900">{m} 分</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600 text-[10px]">▼</div>
            </div>
          </div>
          <p className="mt-1 text-[9px] text-slate-600 italic">對應傳統時辰：{currentShichen?.name} ({currentShichen?.range})</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className={labelClass}>地理經度 (校正真太陽時)</label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              className={inputClass}
              value={formData.longitude}
              onChange={e => setFormData({...formData, longitude: parseFloat(e.target.value)})}
            />
            <i className="fas fa-location-crosshairs absolute right-4 top-1/2 -translate-y-1/2 text-slate-700 text-xs"></i>
          </div>
        </div>
        <div>
          <label className={labelClass}>動爻隨機數或事物 (選填)</label>
          <input
            type="text"
            className={inputClass}
            value={formData.numbers}
            onChange={e => setFormData({...formData, numbers: e.target.value})}
            placeholder="數字如 3, 15 或感應事物如 '梅花', '鳴雀'"
          />
          <p className="mt-1 text-[9px] text-slate-600 italic">邵康節：萬物皆可起卦，心力映射量子信息場。</p>
        </div>
      </div>

      <button
        disabled={loading}
        type="submit"
        className={`w-full py-5 rounded-2xl font-bold text-lg transition-all relative overflow-hidden group ${
          loading 
            ? 'bg-slate-800 text-slate-600 cursor-not-allowed border border-slate-700' 
            : 'bg-gradient-to-r from-yellow-700 to-amber-900 text-white shadow-[0_10px_30px_rgba(120,60,0,0.3)] hover:shadow-[0_15px_40px_rgba(120,60,0,0.5)] hover:-translate-y-1 active:translate-y-0'
        }`}
      >
        <div className="absolute inset-0 bg-white/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        {loading ? (
          <div className="flex items-center justify-center">
            <i className="fas fa-yin-yang fa-spin mr-3 text-yellow-500"></i>
            <span className="serif tracking-widest">正在通靈演課...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center">
            <i className="fas fa-compass mr-3 text-yellow-200 group-hover:rotate-45 transition-transform duration-500"></i>
            <span className="serif tracking-[0.3em] font-bold">開啟奇門遁甲局</span>
          </div>
        )}
      </button>
      
      <p className="text-center text-[10px] text-slate-700 serif uppercase tracking-[0.4em] pt-4">
        Celestial Mechanics & Metaphysical Computation
      </p>
    </form>
  );
};

export default InputForm;
