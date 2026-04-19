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
    delta: '#7A9682',   // dusty sage
    gamma: '#B4835A',   // aged terracotta
    vega:  '#9E908A',   // warm ash
    theta: '#9688A8',   // misty lavender
  },
  {
    name: 'Celadon',
    nameZh: '青瓷',
    emoji: '🏺',
    description: '青瓷藍・玫瑰粉・暖礫・淡霞 — 宋代窯火的餘溫',
    delta: '#7AA0A0',   // celadon teal
    gamma: '#C08E80',   // dusty rose
    vega:  '#9A8A82',   // warm pebble
    theta: '#8090AA',   // faded sky
  },
  {
    name: 'Ochre',
    nameZh: '赭石',
    emoji: '🌾',
    description: '芥末黃・苔蘚・塵紫・沙棕 — 乾燥大地的低語',
    delta: '#B8A060',   // dusty ochre
    gamma: '#7E9A7E',   // faded moss
    vega:  '#A888A0',   // muted mauve
    theta: '#B09878',   // warm sand
  },
  {
    name: 'Rime',
    nameZh: '霜白',
    emoji: '❄️',
    description: '冷鐵藍・霧金・薄荷・淡珊瑚 — 冬晨結霜的寧靜',
    delta: '#8098B0',   // steel blue
    gamma: '#B0A07A',   // muted gold
    vega:  '#88A898',   // sage mint
    theta: '#C09888',   // dusty coral
  },
  {
    name: 'Dusk',
    nameZh: '暮色',
    emoji: '🌅',
    description: '杏粉・灰紫・茶棕・霧藍 — 黃昏最後一抹溫柔',
    delta: '#C4907A',   // apricot
    gamma: '#9880A0',   // grey purple
    vega:  '#9A8A78',   // tea brown
    theta: '#8898B0',   // haze blue
  },
  {
    name: 'Mineral',
    nameZh: '礦石',
    emoji: '🪨',
    description: '岩藍・鏽橘・銅綠・石灰紫 — 礦物質的沉靜力量',
    delta: '#7090A0',   // mineral blue
    gamma: '#B07858',   // rust orange
    vega:  '#7A9888',   // patina green
    theta: '#9A8898',   // limestone purple
  },
  {
    name: 'Autumn',
    nameZh: '深秋',
    emoji: '🍂',
    description: '楓紅・苔土・薰衣草・橡棕 — 落葉前最濃烈的色彩',
    delta: '#B07060',   // autumn brick
    gamma: '#788A70',   // forest floor
    vega:  '#A098B8',   // lavender fog
    theta: '#907860',   // oak brown
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
