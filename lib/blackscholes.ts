export function normPDF(x: number) {
  return Math.exp(-0.5 * x * x) / Math.sqrt(2 * Math.PI);
}

export function normCDF(x: number) {
  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.sqrt(2.0);
  const t = 1.0 / (1.0 + 0.3275911 * absX);
  const y = 1.0 - (((((1.061405429 * t - 1.453152027) * t) + 1.421413741) * t - 0.284496736) * t + 0.254829592) * t * Math.exp(-absX * absX);
  return 0.5 * (1.0 + sign * y);
}

export type OptionType = 'Call' | 'Put';

export interface BSInputs {
  S: number;
  K: number;
  T: number; // in years
  v: number; // as decimal
  r: number; // as decimal
  type: OptionType;
}

export interface BSResults {
  premium: number;
  delta: number;
  gamma: number;
  theta: number;
  vega: number;
  intrinsic: number;
}

export function calculateValues({ S, K, T, v, r, type }: BSInputs): BSResults {
  const time = T <= 0 ? 0.0001 : T;
  const d1 = (Math.log(S / K) + (r + v * v / 2.0) * time) / (v * Math.sqrt(time));
  const d2 = d1 - v * Math.sqrt(time);

  let premium, delta, theta;
  const gamma = normPDF(d1) / (S * v * Math.sqrt(time));
  const vega = (S * normPDF(d1) * Math.sqrt(time)) / 100.0;
  
  if (type === 'Call') {
      premium = S * normCDF(d1) - K * Math.exp(-r * time) * normCDF(d2);
      delta = normCDF(d1);
      theta = (- (S * normPDF(d1) * v) / (2 * Math.sqrt(time)) - r * K * Math.exp(-r * time) * normCDF(d2)) / 365.0;
  } else {
      premium = K * Math.exp(-r * time) * normCDF(-d2) - S * normCDF(-d1);
      delta = normCDF(d1) - 1;
      theta = (- (S * normPDF(d1) * v) / (2 * Math.sqrt(time)) + r * K * Math.exp(-r * time) * normCDF(-d2)) / 365.0;
  }
  
  const intrinsic = type === 'Call' ? Math.max(0, S - K) : Math.max(0, K - S);

  return { premium: premium || 0, delta: delta || 0, gamma: gamma || 0, theta: theta || 0, vega: vega || 0, intrinsic: intrinsic || 0 };
}
