// ----------------------------------------------------------------
// 色彩數學工具函數
// ----------------------------------------------------------------

export function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

export function rgbToHsl(r: number, g: number, b: number): [number, number, number] {
  r /= 255; g /= 255; b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return [Math.round(h * 360), Math.round(s * 100), Math.round(l * 100)];
}

function hueToRgbChannel(p: number, q: number, t: number): number {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1 / 6) return p + (q - p) * 6 * t;
  if (t < 1 / 2) return q;
  if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
  return p;
}

export function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    const v = Math.round(l * 255);
    return [v, v, v];
  }
  const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  const p = 2 * l - q;
  return [
    Math.round(hueToRgbChannel(p, q, h + 1 / 3) * 255),
    Math.round(hueToRgbChannel(p, q, h) * 255),
    Math.round(hueToRgbChannel(p, q, h - 1 / 3) * 255),
  ];
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('');
}

export function hexToHsl(hex: string): [number, number, number] {
  return rgbToHsl(...hexToRgb(hex));
}

export function hslToHex(h: number, s: number, l: number): string {
  return rgbToHex(...hslToRgb(h, s, l));
}

// 計算文字在該背景上應用白色還是深色
export function getContrastColor(hex: string): string {
  const [r, g, b] = hexToRgb(hex);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#1a1a1a' : '#ffffff';
}

// 色彩和諧計算
export interface ColorHarmony {
  base: string;
  complement: string;
  splitComplement: [string, string];
  triadic: [string, string];
  analogous: [string, string];
  tetradic: [string, string, string];
  shades: string[];
  tints: string[];
}

export function getHarmony(hex: string): ColorHarmony {
  const [h, s, l] = hexToHsl(hex);
  return {
    base: hex,
    complement: hslToHex((h + 180) % 360, s, l),
    splitComplement: [
      hslToHex((h + 150) % 360, s, l),
      hslToHex((h + 210) % 360, s, l),
    ],
    triadic: [
      hslToHex((h + 120) % 360, s, l),
      hslToHex((h + 240) % 360, s, l),
    ],
    analogous: [
      hslToHex((h + 30) % 360, s, l),
      hslToHex(((h - 30) + 360) % 360, s, l),
    ],
    tetradic: [
      hslToHex((h + 90) % 360, s, l),
      hslToHex((h + 180) % 360, s, l),
      hslToHex((h + 270) % 360, s, l),
    ],
    // 漸淡（加入白色比例）
    tints: [20, 40, 60, 80].map(mix => hslToHex(h, Math.max(0, s - mix * 0.3), Math.min(95, l + mix * 0.4))),
    // 漸深（加入黑色比例）
    shades: [20, 40, 60, 80].map(mix => hslToHex(h, Math.min(100, s + mix * 0.1), Math.max(5, l - mix * 0.5))),
  };
}

// 從 4 色調色盤，建議一套可用的 UI 對比度搭配
export function suggestAccessiblePalette(colors: [string, string, string, string]) {
  // 根據亮度排序
  const sorted = [...colors].sort((a, b) => {
    const [, , la] = hexToHsl(a);
    const [, , lb] = hexToHsl(b);
    return la - lb;
  });
  return {
    darkest: sorted[0],
    dark: sorted[1],
    light: sorted[2],
    lightest: sorted[3],
  };
}

export interface ColorPalette {
  name: string;
  emoji: string;
  description: string;
  colors: [string, string, string, string]; // [bg, surface, primary, accent]
}
