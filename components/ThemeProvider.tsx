'use client';
import React, { createContext, useContext, useState, useEffect } from 'react';

// ----------------------------------------------------------------
// 莫蘭迪 (Morandi) 調色盤
// 每套 4 色對應：Delta / Gamma / Vega / Theta
// 所有顏色均為低飽和度、帶灰調的莫蘭迪風格
// ----------------------------------------------------------------
export interface ColorPalette {
  name: string;
  nameZh: string;
  emoji: string;
  description: string;
  delta: string;   // Δ 方向性
  gamma: string;   // Γ 敏感度
  vega: string;    // V  波動率
  theta: string;   // Θ 時間衰蝕
}

export const PALETTES: ColorPalette[] = [
  {
    name: 'Wabi-Sabi',
    nameZh: '侘寂',
    emoji: '🌿',
    description: '鼠尾草・陶土・暖灰・霧紫 — 枯寂而飽含生命力',
    delta: '#6AA27D',   // sage +sat  (was #7A9682 S12→S22%)
    gamma: '#BD7442',   // terracotta +sat (was #B4835A S35→S46%)
    vega:  '#AA8075',   // warm ash +sat (was #9E908A S10→S21%)
    theta: '#8C76B5',   // lavender +sat (was #9688A8 S16→S27%)
  },
  {
    name: 'Celadon',
    nameZh: '青瓷',
    emoji: '🏺',
    description: '青瓷藍・玫瑰粉・暖礫・淡霞 — 宋代窯火的餘溫',
    delta: '#62AAAA',   // celadon teal +sat (was #7AA0A0 S15→S27%)
    gamma: '#C87A68',   // dusty rose +sat (was #C08E80 S25→S37%)
    vega:  '#AA7868',   // warm pebble +sat (was #9A8A82 S10→S22%)
    theta: '#6888BC',   // faded sky +sat (was #8090AA S18→S30%)
  },
  {
    name: 'Ochre',
    nameZh: '赭石',
    emoji: '🌾',
    description: '芥末黃・苔蘚・塵紫・沙棕 — 乾燥大地的低語',
    delta: '#BA9C42',   // dusty ochre +sat (was #B8A060 S32→S44%)
    gamma: '#669A66',   // faded moss +sat (was #7E9A7E S12→S24%)
    vega:  '#B074AB',   // muted mauve +sat (was #A888A0 S15→S27%)
    theta: '#B88C50',   // warm sand +sat (was #B09878 S22→S33%)
  },
  {
    name: 'Rime',
    nameZh: '霜白',
    emoji: '❄️',
    description: '冷鐵藍・霧金・薄荷・淡珊瑚 — 冬晨結霜的寧靜',
    delta: '#6292C2',   // steel blue +sat (was #8098B0 S22→S34%)
    gamma: '#BA9C52',   // muted gold +sat (was #B0A07A S20→S32%)
    vega:  '#68AE98',   // sage mint +sat (was #88A898 S15→S27%)
    theta: '#CC8460',   // dusty coral +sat (was #C09888 S24→S36%)
  },
  {
    name: 'Dusk',
    nameZh: '暮色',
    emoji: '🌅',
    description: '杏粉・灰紫・茶棕・霧藍 — 黃昏最後一抹溫柔',
    delta: '#CE7C50',   // apricot +sat (was #C4907A S38→S50%)
    gamma: '#9068AA',   // grey purple +sat (was #9880A0 S14→S26%)
    vega:  '#A87250',   // tea brown +sat (was #9A8A78 S14→S26%)
    theta: '#6A88BC',   // haze blue +sat (was #8898B0 S20→S32%)
  },
  {
    name: 'Mineral',
    nameZh: '礦石',
    emoji: '🪨',
    description: '岩藍・鏽橘・銅綠・石灰紫 — 礦物質的沉靜力量',
    delta: '#5490AA',   // mineral blue +sat (was #7090A0 S20→S32%)
    gamma: '#BA6030',   // rust orange +sat (was #B07858 S35→S47%)
    vega:  '#5EA894',   // patina green +sat (was #7A9888 S14→S26%)
    theta: '#A474A8',   // limestone purple +sat (was #9A8898 S10→S22%)
  },
  {
    name: 'Autumn',
    nameZh: '深秋',
    emoji: '🍂',
    description: '楓紅・苔土・薰衣草・橡棕 — 落葉前最濃烈的色彩',
    delta: '#BA5840',   // autumn brick +sat (was #B07060 S30→S42%)
    gamma: '#5C8C5C',   // forest floor +sat (was #788A70 S11→S23%)
    vega:  '#8874C6',   // lavender fog +sat (was #A098B8 S15→S27%)
    theta: '#986030',   // oak brown +sat (was #907860 S20→S33%)
  },
];

// ----------------------------------------------------------------
// CSS 透明度工具（hex opacity）
// ----------------------------------------------------------------
function withOpacity(hex: string, opacity: number): string {
  const alpha = Math.round(opacity * 255).toString(16).padStart(2, '0');
  return hex + alpha;
}

// ----------------------------------------------------------------
// Context
// ----------------------------------------------------------------
interface ThemeContextType {
  palette: ColorPalette;
  paletteIndex: number;
  palettes: ColorPalette[];
  setPaletteIndex: (i: number) => void;
  setCustomPalette: (delta: string, gamma: string, vega: string, theta: string, name?: string) => void;
  // 向後相容
  hue: number;
  setHue: (h: number) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  palette: PALETTES[0],
  paletteIndex: 0,
  palettes: PALETTES,
  setPaletteIndex: () => {},
  setCustomPalette: () => {},
  hue: 200,
  setHue: () => {},
});

// ----------------------------------------------------------------
// Provider
// ----------------------------------------------------------------
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteIndex, setPaletteIndexState] = useState(0);
  const [customPalette, setCustomPaletteState] = useState<ColorPalette | null>(null);
  const [hue, setHue] = useState(200);

  const currentPalette = customPalette ?? PALETTES[paletteIndex];

  useEffect(() => {
    const { delta, gamma, vega, theta } = currentPalette;
    const root = document.documentElement;

    // ── 希臘字母主色（莫蘭迪色，飽和實色）
    root.style.setProperty('--greek-delta', delta);
    root.style.setProperty('--greek-gamma', gamma);
    root.style.setProperty('--greek-vega',  vega);
    root.style.setProperty('--greek-theta', theta);

    // ── 淡染版本（底色區塊、hover 狀態背景）
    root.style.setProperty('--tint-delta', withOpacity(delta, 0.12));
    root.style.setProperty('--tint-gamma', withOpacity(gamma, 0.12));
    root.style.setProperty('--tint-vega',  withOpacity(vega,  0.12));
    root.style.setProperty('--tint-theta', withOpacity(theta, 0.12));

    // ── 半透明版本（tag、badge）
    root.style.setProperty('--semi-delta', withOpacity(delta, 0.22));
    root.style.setProperty('--semi-gamma', withOpacity(gamma, 0.22));
    root.style.setProperty('--semi-vega',  withOpacity(vega,  0.22));
    root.style.setProperty('--semi-theta', withOpacity(theta, 0.22));
  }, [currentPalette]);

  const setPaletteIndex = (i: number) => {
    setCustomPaletteState(null);
    setPaletteIndexState(i);
  };

  const setCustomPalette = (delta: string, gamma: string, vega: string, theta: string, name = '自訂') => {
    setCustomPaletteState({
      name: 'Custom', nameZh: name, emoji: '🎨',
      description: '您的個人莫蘭迪配色',
      delta, gamma, vega, theta,
    });
  };

  return (
    <ThemeContext.Provider value={{
      palette: currentPalette, paletteIndex, palettes: PALETTES,
      setPaletteIndex, setCustomPalette, hue, setHue,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
