export enum PanType {
  FLYING = 'FLYING', // 飛盤
  ROTATING = 'ROTATING' // 轉盤
}

export interface PalaceData {
  id: number;
  name: string; // 坎、坤、震...
  star: string;
  door: string;
  god: string;
  heavenStem: string;
  earthStem: string;
  element: string;
  isEmpty?: boolean; // 空亡
  isHorse?: boolean; // 驛馬
  // 四害 (Four Harms) - Quantum Entropy Zones
  isJiXing?: boolean; // 擊刑
  isRuMu?: boolean;   // 入墓
  isMenPo?: boolean;  // 門迫
  isShouZhi?: boolean; // 受制
}

export interface QiMenResult {
  userBazi: string;
  queryBazi: string; // 課時八字
  solarTime: string;
  question: string;
  flyingPan: PalaceData[];
  rotatingPan: PalaceData[];
  analysis?: string;
}

export interface UserInput {
  name: string;
  birthDate: string;
  birthTime: string;
  longitude: number;
  latitude: number;
  question: string;
  numbers?: string;
}