import { PalaceData, PanType, UserInput } from '../types';
import { PALACE_NAMES, STARS, DOORS, GODS, STEMS } from '../constants';
import { Solar, Lunar } from 'lunar-javascript';

export const getBaziFromDate = (date: Date): string => {
  const solar = Solar.fromDate(date);
  const lunar = solar.getLunar();
  return `${lunar.getYearInGanZhi()}年 ${lunar.getMonthInGanZhi()}月 ${lunar.getDayInGanZhi()}日 ${lunar.getTimeInGanZhi()}時`;
};

/**
 * Logic for the Four Harms (Entropy Zones)
 */
const calculateFourHarms = (data: Partial<PalaceData>): Partial<PalaceData> => {
  const { name, heavenStem, door, element } = data;
  
  // 1. 門迫 (Men Po): Door element overcomes Palace element
  const doorElements: Record<string, string> = { '休門': '水', '死門': '土', '傷門': '木', '杜門': '木', '開門': '金', '驚門': '金', '生門': '土', '景門': '火' };
  const palaceElements: Record<string, string> = { '坎一': '水', '坤二': '土', '震三': '木', '巽四': '木', '中五': '土', '乾六': '金', '兌七': '金', '艮八': '土', '離九': '火' };
  
  const dEl = doorElements[door || ''];
  const pEl = palaceElements[name || ''];
  const overcomes: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
  
  const isMenPo = overcomes[dEl] === pEl;
  const isShouZhi = overcomes[pEl] === dEl;

  // 2. 擊刑 (Ji Xing): Punishment
  const jixingMap: Record<string, string[]> = {
    '戊': ['震三'], '己': ['坤二'], '庚': ['艮八'], '辛': ['離九'], '壬': ['巽四'], '癸': ['巽四']
  };
  const isJiXing = jixingMap[heavenStem || '']?.includes(name || '');

  // 3. 入墓 (Ru Mu): Tomb
  const rumuMap: Record<string, string[]> = {
    '乙': ['坤二', '乾六'], '丙': ['乾六'], '戊': ['乾六'], '丁': ['艮八'], '己': ['艮八'], '庚': ['艮八'], '辛': ['巽四'], '壬': ['巽四'], '癸': ['巽四']
  };
  const isRuMu = rumuMap[heavenStem || '']?.includes(name || '');

  return { ...data, isMenPo, isShouZhi, isJiXing, isRuMu };
};

export const generatePanData = (input: UserInput, type: PanType): PalaceData[] => {
  const seedStr = `${input.birthDate} ${input.birthTime}`;
  const seed = new Date(seedStr).getTime();
  
  return PALACE_NAMES.map((name, index) => {
    const baseOffset = (seed + index);
    const offset = baseOffset % 8;
    const godOffset = baseOffset % (type === PanType.FLYING ? 10 : 8);
    
    let palace: PalaceData = {
      id: index + 1,
      name,
      star: STARS[baseOffset % 9],
      door: DOORS[offset],
      god: GODS[godOffset],
      heavenStem: STEMS[(baseOffset * 2) % 10],
      earthStem: STEMS[(baseOffset * 3) % 10],
      element: palaceElements[name],
      isHorse: index === (seed % 9),
      isEmpty: index === ((seed + 4) % 9)
    };

    return calculateFourHarms(palace) as PalaceData;
  });
};

const palaceElements: Record<string, string> = { '坎一': '水', '坤二': '土', '震三': '木', '巽四': '木', '中五': '土', '乾六': '金', '兌七': '金', '艮八': '土', '離九': '火' };

export const getPalaceBearing = (name: string): number | null => {
  const bearings: Record<string, number> = { '坎一': 0, '艮八': 45, '震三': 90, '巽四': 135, '離九': 180, '坤二': 225, '兌七': 270, '乾六': 315 };
  return bearings[name] ?? null;
};

export const calculateTrueSolarTime = (date: string, time: string, lng: number): string => {
  const localTime = new Date(`${date} ${time}`);
  const diffInMinutes = (lng - 120) * 4;
  const trueSolarTime = new Date(localTime.getTime() + diffInMinutes * 60000);
  return trueSolarTime.toLocaleString('zh-TW', { hour12: false, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
};

export const getStemRelationship = (h: string, e: string): { type: string, label: string } | null => {
  const elements: Record<string, string> = { '甲': '木', '乙': '木', '丙': '火', '丁': '火', '戊': '土', '己': '土', '庚': '金', '辛': '金', '壬': '水', '癸': '水' };
  const combinations: Record<string, string> = { '甲': '己', '己': '甲', '乙': '庚', '庚': '乙', '丙': '辛', '辛': '丙', '丁': '壬', '壬': '丁', '戊': '癸', '癸': '戊' };
  if (combinations[h] === e) return { type: 'he', label: '合' };
  const clashes: Record<string, string[]> = { '甲': ['庚'], '庚': ['甲'], '乙': ['辛'], '辛': ['乙'], '丙': ['壬'], '壬': ['丙'], '丁': ['癸'], '癸': ['丁'] };
  if (clashes[h]?.includes(e)) return { type: 'chong', label: '沖' };
  const hEl = elements[h];
  const eEl = elements[e];
  if (hEl === eEl) return null;
  const sheng: Record<string, string> = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  if (sheng[hEl] === eEl || sheng[eEl] === hEl) return { type: 'sheng', label: '生' };
  const ke: Record<string, string> = { '木': '土', '土': '水', '水': '火', '火': '金', '金': '木' };
  if (ke[hEl] === eEl || ke[eEl] === hEl) return { type: 'ke', label: '剋' };
  return null;
};