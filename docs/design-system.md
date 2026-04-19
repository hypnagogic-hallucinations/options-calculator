# 設計系統文件 Design System Documentation

> **專案：** Options Calculator
> **路徑：** `e:\E_Workspace\options-calculator`
> **最後更新：** 2026-04-20 (v2 — Morandi + 象牙白重構)
> **維護者：** Antigravity AI × 使用者協作

---

## 目錄 Table of Contents

1. [設計哲學](#設計哲學)
2. [雙層架構：象牙底色 × 莫蘭迪希臘色](#雙層架構)
3. [七套莫蘭迪調色盤](#七套莫蘭迪調色盤)
4. [CSS 變數架構](#css-變數架構)
5. [色彩和諧理論](#色彩和諧理論)
6. [字體系統](#字體系統)
7. [間距與圓角](#間距與圓角)
8. [陰影系統](#陰影系統)
9. [組件庫](#組件庫)
10. [ThemeProvider API](#themeprovider-api)
11. [新增調色盤指引](#新增調色盤指引)
12. [設計決策紀錄](#設計決策紀錄)

---

## 設計哲學

本設計系統以 **「莫蘭迪靜物畫」** 為視覺核心哲學：

> 喬治·莫蘭迪（Giorgio Morandi, 1890–1964）用一生畫同樣的瓶罐，
> 但每一幅都透過低飽和、帶灰調的顏色，傳達出無法言喻的靜謐與深度。

具體設計原則：

- **象牙底色恆定**：整個介面以暖象牙白 `#F6F3EE` 為不變的底色，給使用者視覺上的「紙面」感
- **希臘字母各有其色**：四個希臘字母（Δ Γ ν Θ）是唯一的有色元素，每個都得到一個精選的莫蘭迪低飽和色
- **透明度染色**：UI 的背景色塊、hover 效果、邊框等，使用這四色的 12%/22% 透明度版本，保持視覺聯繫但不搶眼
- **色彩不競爭**：在同一時間，只有希臘字母的色彩「發言」，其餘元素靜默在象牙白中

---

## 雙層架構

```
第一層：Fixed Ivory Base（固定象牙底，不隨調色盤變）
────────────────────────────────────────────────
  --bg-ivory      #F6F3EE  頁面底色
  --surface-01    #FDFCF9  卡片表面
  --surface-02    #F0EDE6  次要底板
  --text-primary  #2A2520  主文字
  --text-muted    #9A9388  說明文字
  --border-subtle #E4DFD6  邊框

第二層：Greek Morandi Colors（希臘字母莫蘭迪色，隨調色盤切換）
────────────────────────────────────────────────
  --greek-delta          Δ 方向性（實色）
  --greek-gamma          Γ 曲率（實色）
  --greek-vega           ν 波動率（實色）
  --greek-theta          Θ 時間衰蝕（實色）

  --tint-delta    12% opacity  → 卡片背景
  --tint-gamma    12% opacity
  --tint-vega     12% opacity
  --tint-theta    12% opacity

  --semi-delta    22% opacity  → 邊框
  --semi-gamma    22% opacity
  --semi-vega     22% opacity
  --semi-theta    22% opacity
```



## 調色盤系統

### 架構概念

每套調色盤由 **4 個語意角色** 組成：

| 角色 | CSS 變數 | 用途 |
|------|----------|------|
| Background | `--palette-bg` | 頁面最底層背景 |
| Surface | `--palette-surface` | 卡片、面板表面 |
| Primary | `--palette-primary` | 標題文字、主要按鈕 |
| Accent | `--palette-accent` | 強調色、互動反饋 |

### 七套內建調色盤

#### 01 · Midnight Mist 深夜薄霧 🌫️

> 深夜藍與暖奶霜的靜謐對話。適合需要專注與沉穩感的場景。

```
Background  #F0F0DB  ████████  暖奶霜，低彩度米白
Surface     #E1D9BC  ████████  暖沙色，比背景稍深
Primary     #30364F  ████████  深靛藍，主文字/標題
Accent      #ACBAC4  ████████  霧灰藍，互動元素
```

#### 02 · Vermillion Rose 朱砂玫瑰 🌹

> 紅色熱情遇上青綠清新。充滿張力的暖冷對比，適合金融儀表板。

```
Background  #FFF4EA  ████████  杏仁白
Surface     #EDDCC6  ████████  焦糖奶油
Primary     #BF4646  ████████  朱砂紅，強勢主色
Accent      #7EACB5  ████████  霧青綠，極佳補色
```

#### 03 · Sunset Coast 黃昏海岸 🌅

> 黃金夕陽漫染深海夜藍。強烈的明暗對比，層次感豐富。

```
Background  #EFD2B0  ████████  沙灘金
Surface     #FFC570  ████████  黃金橘，飽和度較高
Primary     #1A3263  ████████  深海藍，最深主色
Accent      #547792  ████████  礁石藍
```

#### 04 · Tropical Drift 熱帶漂流 🌊

> 熱帶海青與琥珀橙的活力碰撞。日系清新中帶有溫暖能量。

```
Background  #F6F3C2  ████████  米黃
Surface     #91C6BC  ████████  薄荷綠
Primary     #4B9DA9  ████████  海洋藍綠
Accent      #E37434  ████████  琥珀橙，補色強調
```

#### 05 · Nordic Haze 北歐晨霧 ❄️

> 北歐藍霧籠罩暖沙的柔和詩語。最低張力，適合長時間閱讀。

```
Background  #F3E3D0  ████████  米膚色
Surface     #D2C4B4  ████████  燕麥棕
Primary     #81A6C6  ████████  天際藍
Accent      #AACDDC  ████████  冰霧藍，類比色輕柔搭配
```

#### 06 · Coral Depth 珊瑚深淵 🪸

> 礁橘在深藍海洋中燃起的火花。最高對比度，適合視覺衝擊場景。

```
Background  #D7D7D7  ████████  中性灰
Surface     #447D9B  ████████  海洋藍
Primary     #273F4F  ████████  深潛藍，近黑
Accent      #FE7743  ████████  熱珊瑚橘，最高彩度
```

#### 07 · Twilight Bloom 暮色綻放 🌸

> 暮色紫羅蘭間盛開的薰衣草夢。夢幻系，適合女性化或藝術導向場景。

```
Background  #EFB6C8  ████████  蜜桃粉
Surface     #A888B5  ████████  薰衣草紫
Primary     #441752  ████████  深葡萄紫
Accent      #8174A0  ████████  淡紫，類比色
```

---

## CSS 變數架構

### 層級設計

系統採用「**兩層 CSS 變數**」架構：

```
原始調色盤變數（由 ThemeProvider 動態注入）
    ↓
語意 Token 變數（在 globals.css 中宣告，引用調色盤變數）
    ↓
組件使用語意 Token
```

### 完整變數列表

```css
/* ── 調色盤原始色（動態覆寫）──────────────────────── */
--palette-bg:      <color>;   /* 背景 */
--palette-surface: <color>;   /* 卡片表面 */
--palette-primary: <color>;   /* 主色 */
--palette-accent:  <color>;   /* 強調色 */

/* ── 語意 Token（靜態宣告）────────────────────────── */
--bg-color:        var(--palette-bg);
--card-bg:         var(--palette-surface);
--text-main:       var(--palette-primary);
--color-primary:   var(--palette-accent);
--text-muted:      <computed via JS>;   /* primary + bg 50% 混合 */
--border-color:    <computed via JS>;   /* primary + bg 15% 混合 */

/* ── 固定功能色（不隨主題變化）──────────────────────── */
--accent-green:    #4B9DA9;
--accent-orange:   #E37434;
--accent-red:      #BF4646;

/* ── 間距與形狀 ──────────────────────────────────── */
--radius-xs:   4px;
--radius-sm:   8px;
--radius-md:   12px;
--radius-lg:   18px;
--radius-xl:   28px;
--radius-full: 9999px;

/* ── 陰影 ─────────────────────────────────────────── */
--shadow-xs: 0 1px 2px rgba(0,0,0,0.05);
--shadow-sm: 0 2px 8px rgba(0,0,0,0.07);
--shadow-md: 0 6px 24px rgba(0,0,0,0.09);
--shadow-lg: 0 16px 48px rgba(0,0,0,0.12);

/* ── 過渡動畫 ─────────────────────────────────────── */
--transition-fast:   0.15s ease;
--transition-normal: 0.25s ease;
--transition-slow:   0.45s ease;   /* 調色盤切換使用 */
```

### muted 與 border 的計算邏輯

這兩個變數由 `ThemeProvider` 在 JavaScript 中計算後注入，原因是純 CSS 的 `color-mix()` 雖然已廣泛支援，但直接在 CSS 用相對色彩混合，仍需要考慮瀏覽器相容性。採用 JS 計算可確保完全可控。

```typescript
// text-muted: primary + bg 各 50%
const muted = `rgb(${(pr+br)/2}, ${(pg+bg)/2}, ${(pb+bb)/2})`;

// border-color: primary 15% + bg 85%
const border = `rgb(${pr*0.15+br*0.85}, ...)`;
```

---

## 色彩和諧理論

`lib/colorUtils.ts` 實作了完整的 HSL 色彩空間數學。

### 核心轉換函數

```
hex → RGB → HSL（計算用）
HSL → RGB → hex（輸出用）
```

### 和諧關係一覽

| 名稱 | 英文 | 色相差 | 特性 |
|------|------|--------|------|
| 補色 | Complement | ±180° | 最強對比，視覺衝擊 |
| 分割補色 | Split Complement | ±150° | 對比稍緩，更優雅 |
| 三角色 | Triadic | ±120° | 三色均衡，最常用 |
| 類比色 | Analogous | ±30° | 最和諧，過渡自然 |
| 四角色 | Tetradic | 90°步進 | 豐富但需平衡 |

### 漸淡漸深系列（Tints & Shades）

透過調整 HSL 的 L（明度）與 S（飽和度）生成：
- **Tints**：降低飽和度 + 提高明度（加白）
- **Shades**：微升飽和度 + 降低明度（加黑）

---

## 字體系統

使用 **Inter**（Google Fonts），系統字體回退為 `-apple-system, BlinkMacSystemFont`。

### 字體規格

| 層級 | 大小 | 粗細 | 字距 | 行高 |
|------|------|------|------|------|
| h1 | clamp(1.6rem, 4vw, 2.4rem) | 700 | -0.02em | 1.2 |
| h2 | clamp(1.2rem, 3vw, 1.75rem) | 600 | -0.015em | 1.3 |
| h3 | 1.15rem | 600 | — | — |
| h4 | 0.95rem | 600 | +0.08em | — |
| body | 1rem | 400 | — | 1.6 |
| small | 0.875rem | 400 | — | — |
| mono | font-family: monospace | — | — | — |

### 使用建議

- `h4` 使用了 `text-transform: uppercase` 與寬字距，適合用來當 **label / 分類標題**
- 數字顯示（如股價、希臘字母值）建議搭配 `font-variant-numeric: tabular-nums` 確保數字對齊
- 中文與英文之間請以空格分隔，提高可讀性

---

## 間距與圓角

### 圓角使用情境

| Token | 值 | 使用情境 |
|-------|-----|---------|
| `--radius-xs` | 4px | Badge、Tag 等小型元素 |
| `--radius-sm` | 8px | 輸入框、小卡片 |
| `--radius-md` | 12px | 按鈕、下拉選單 |
| `--radius-lg` | 18px | 主要卡片容器 |
| `--radius-xl` | 28px | 面板、模態框 |
| `--radius-full` | 9999px | 圓形按鈕、Pill badge |

### 間距原則

系統採用 **4px 基準格（4pt grid）**，所有間距應為 4 的倍數：
- `4px` → 最小元素內間距
- `8px` → 元素內 padding（小）
- `12px` / `16px` → 標準 padding
- `20px` / `24px` → 區塊間距
- `32px` / `40px` → 大區塊分隔

---

## 陰影系統

陰影基於透明黑色 `rgba(0,0,0,x)` 疊加，確保在任何調色盤下均可用。

| Token | 使用情境 |
|-------|---------|
| `--shadow-xs` | Tooltip、小型浮層 |
| `--shadow-sm` | 卡片（靜態） |
| `--shadow-md` | 卡片（hover 狀態）、下拉選單 |
| `--shadow-lg` | Modal、側邊欄 |

> **注意：** 陰影不應隨調色盤切換而改變顏色，固定使用透明黑色即可。

---

## 組件庫

### Button

```tsx
/* Primary Button */
<button className="btn-primary">送出</button>

/* Ghost Button */
<button className="btn-ghost">取消</button>
```

| 樣式 | 背景 | 文字 | 邊框 |
|------|------|------|------|
| Primary | `--palette-primary` | `--palette-bg` | 無 |
| Ghost | 透明 | `--text-main` | `--border-color` |

### Card

```tsx
<div className="card">
  卡片內容
</div>
```

### Badge / Pill

```tsx
<span style={{
  padding: '4px 12px',
  borderRadius: 'var(--radius-full)',
  backgroundColor: `${palette.colors[3]}33`,  // 20% 透明度
  color: palette.colors[3],
  border: `1px solid ${palette.colors[3]}66`,
}}>
  標籤
</span>
```

### 數值顯示（KPI）

```tsx
<div>
  <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
    METRIC NAME
  </div>
  <div style={{ fontSize: '28px', fontWeight: 700 }}>
    42.56
  </div>
  <div style={{ fontSize: '12px', color: 'var(--accent-green)' }}>
    ↑ 3.2%
  </div>
</div>
```

---

## ThemeProvider API

### Context 介面

```typescript
interface ThemeContextType {
  // 目前啟用的調色盤物件
  palette: ColorPalette;

  // 目前調色盤的索引（0–6），自訂調色盤時為最後一次的索引
  paletteIndex: number;

  // 全部 7 套調色盤的陣列
  palettes: ColorPalette[];

  // 切換到某套預設調色盤
  setPaletteIndex: (i: number) => void;

  // 客製化調色盤（來自 color picker）
  setCustomPalette: (
    colors: [string, string, string, string],
    name?: string
  ) => void;

  // 向後相容的 hue 值（舊版 HSL 系統遺留）
  hue: number;
  setHue: (h: number) => void;
}
```

### ColorPalette 型別

```typescript
interface ColorPalette {
  name: string;              // 調色盤名稱（英文）
  emoji: string;             // 代表 emoji
  description: string;       // 中文說明
  colors: [string, string, string, string];
  //        bg      surface  primary  accent
}
```

### 使用範例

```tsx
'use client';
import { useTheme } from '@/components/ThemeProvider';

function MyComponent() {
  const { palette, setPaletteIndex } = useTheme();

  return (
    <div style={{ backgroundColor: palette.colors[0] }}>
      <button onClick={() => setPaletteIndex(2)}>切換到 Sunset Coast</button>
    </div>
  );
}
```

### colorUtils 工具函數

```typescript
import {
  hexToRgb, rgbToHsl, hslToRgb, rgbToHex,
  hexToHsl, hslToHex,
  getContrastColor,  // 自動選擇白/深文字色
  getHarmony,        // 回傳完整和諧色集合
} from '@/lib/colorUtils';

// 取得一個顏色對應的所有和諧色
const harmony = getHarmony('#547792');
// → harmony.complement, harmony.triadic, harmony.tints, ...

// 計算合適的文字顏色（保證對比度）
const textColor = getContrastColor('#30364F');  // → '#ffffff'
```

---

## 新增調色盤指引

若要新增第 8 套或更多調色盤，請依下列步驟操作：

### Step 1：在 `ThemeProvider.tsx` 新增

```typescript
export const PALETTES: ColorPalette[] = [
  // ... 既有調色盤 ...
  {
    name: 'New Palette Name',
    emoji: '🆕',
    description: '調色盤說明（中文）',
    colors: ['#BACKGROUND', '#SURFACE', '#PRIMARY', '#ACCENT'],
    //    最淡 ↑                             最深 ↑
  },
];
```

### Step 2：測試對比度

使用 `getContrastColor(primary)` 確保主色文字可讀。理想對比比率：
- 正文 vs 背景 ≥ 4.5:1（WCAG AA 標準）
- 標題 vs 背景 ≥ 3:1

### Step 3：更新本文件

在 [七套內建調色盤](#七套內建調色盤) 區塊新增對應說明。

### 調色盤設計口訣

```
bg     → 紙（最淡、眼睛休息的底色）
surface → 紙板（比 bg 稍深，用來區分層次）
primary → 墨（最深，文字/標題讀清楚最重要）
accent  → 印章（最有個性，但別太搶戲）
```

---

## 設計決策紀錄

### ADR-001：採用 HSL 色彩空間而非 HEX

**決策：** 所有色彩計算在 HSL 空間進行，最終輸出 hex。

**原因：**
- HSL 的色相（H）直覺對應人眼感知的「顏色」
- 和諧色計算只需加減色相角度
- 飽和度（S）and 明度（L）可獨立調整生成 tints/shades

**反對意見：** OKLCH/OKLAB 在感知均勻性上更優秀，但實作複雜度高，目前使用者規模不需要。

---

### ADR-002：muted/border 顏色由 JS 計算而非純 CSS

**決策：** 使用 JavaScript 計算 `--text-muted` 和 `--border-color` 後注入 CSS 變數。

**原因：**
- 可精確控制混合比例（muted=50%, border=15%）
- 避免 `color-mix()` 的瀏覽器版本相容問題
- 與 ThemeProvider 的生命週期一致

---

### ADR-003：不使用 TailwindCSS

**決策：** 完全使用原生 CSS 變數 + inline styles（React）。

**原因：**
- 調色盤系統需要動態修改 CSS 變數，Tailwind 的靜態掃描機制不適合
- 設計系統本身即是「樣式控制層」，不需要額外工具層疊
- 減少打包體積與工具鏈複雜度

---

### ADR-004：調色盤過渡採用 CSS transition 而非 Framer Motion

**決策：** 全站顏色切換動畫使用 `transition: background-color 0.45s ease`。

**原因：**
- 顏色切換為「全域狀態」，不適合以組件層級動畫庫控制
- CSS transition 由 GPU 加速，性能更優
- `0.45s` 是既不太快（顯得突兀）也不太慢（使用者等待）的最佳平衡點

---

*本文件由 Antigravity AI 自動生成並維護。每次設計系統有重大異動時應同步更新。*
