import { GoogleGenAI } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";
import { QiMenResult, PalaceData } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeQiMen = async (data: QiMenResult): Promise<string> => {
  const ai = getAI();
  
  const prompt = `
[量子時空矩陣]
占卜課式：${data.queryBazi}
觀察者本命：${data.userBazi}
宏觀訴求：${data.question}
太陽時校準：${data.solarTime}

[九宮數據]
飛盤/轉盤糾纏數據：${JSON.stringify(data.flyingPan)}

指令：
1. **法理穿透 (Ming-Method Analysis)**：嚴格依據《奇門鳴法》法理，分析「四害」（擊刑、入墓、空亡、門迫）對當下量子場的干擾。
2. **能量向量預測 (Energy Vector)**：判斷五行能量流向，指出哪個方位是「低熵穩定態」。
3. **量子糾纏建議**：將吉凶格看作時空演化的「簡併態」，給出最佳「觀測行動」建議。
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7,
      },
    });
    return response.text || "無法獲取量子波函數解讀。";
  } catch (error) {
    return "解析失敗，量子態崩坍。";
  }
};

export const analyzePalaceDetail = async (
  palace: PalaceData, 
  userBazi: string, 
  question: string
): Promise<string> => {
  const ai = getAI();
  const prompt = `
請針對以下「量子宮位」進行深層解析：
宮位：${palace.name} (${palace.element})
星、門、神、干組件：${palace.star}, ${palace.door}, ${palace.god}, ${palace.heavenStem}/${palace.earthStem}
熵增狀態 (四害)：${palace.isJiXing ? '擊刑,' : ''} ${palace.isRuMu ? '入墓,' : ''} ${palace.isMenPo ? '門迫,' : ''} ${palace.isEmpty ? '空亡' : '實態'}

[求占內容]
本命：${userBazi}
事項：${question}

指令：
1. **格局演化**：利用《奇門鳴法》斷語，分析該宮位是否存在能量塌縮風險。
2. **量子位建議**：若求問者在此方位「觀測」或行動，會引發怎樣的概率鏈條？
`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.6,
      },
    });
    return response.text || "大師暫無批語。";
  } catch (error) {
    return "獲取宮位解析失敗。";
  }
};