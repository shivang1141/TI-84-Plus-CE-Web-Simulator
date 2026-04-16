// ============================================================
// TI-84 Plus CE Simulator — Math Engine
// Wraps mathjs with TI-84-compatible behavior
// ============================================================

import * as math from 'mathjs';
import { AngleMode, DecimalPlaces, DisplayMode } from '@/types/calculator';

// ── Custom mathjs instance with extended precision ─────────────────────────
const mathInstance = math.create(math.all, {
  epsilon: 1e-12,
  matrix: 'Array',
  number: 'number',
  precision: 14,
  predictable: false,
  randomSeed: null,
});

// A&S formula 7.1.26 for erf (Error function)
function erf(x: number) {
  const sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);
  const a1 =  0.254829592, a2 = -0.284496736, a3 =  1.421413741, a4 = -1.453152027, a5 =  1.061405429, p =  0.3275911;
  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y;
}

// ── Custom distribution mathematical injections ─────────────────────────
mathInstance.import({
  normalcdf: function(lower: number, upper: number, mu: number = 0, sigma: number = 1) {
    const z1 = (lower - mu) / sigma;
    const z2 = (upper - mu) / sigma;
    return 0.5 * (erf(z2 / Math.SQRT2) - erf(z1 / Math.SQRT2));
  },
  normalpdf: function(x: number, mu: number = 0, sigma: number = 1) {
    return (1 / (sigma * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * Math.pow((x - mu) / sigma, 2));
  },
  binompdf: function(n: number, p: number, x: number | undefined) {
    if (x === undefined) {
      return Array.from({length: n + 1}, (_, k) => (mathInstance.evaluate as Function)(`combinations(${n}, ${k})`) * Math.pow(p, k) * Math.pow(1 - p, n - k));
    }
    return (mathInstance.evaluate as Function)(`combinations(${n}, ${x})`) * Math.pow(p, x) * Math.pow(1 - p, n - x);
  },
  invNorm: function(p: number, mu: number = 0, sigma: number = 1) {
    const a1 = -3.969683028665376e+01, a2 =  2.209460984245205e+02, a3 = -2.759285104469687e+02, a4 =  1.383577518672690e+02, a5 = -3.066479806614716e+01, a6 =  2.506628277459239e+00;
    const b1 = -5.447609879822406e+01, b2 =  1.615858368580409e+02, b3 = -1.556989798598866e+02, b4 =  6.680131188771972e+01, b5 = -1.328068155288572e+01;
    const c1 = -7.784894002430293e-03, c2 = -3.223964580411365e-01, c3 = -2.400758277161838e+00, c4 = -2.549732539343734e+00, c5 =  4.374664141464968e+00, c6 =  2.938163982698783e+00;
    const d1 =  7.784695709041462e-03, d2 =  3.224671290700398e-01, d3 =  2.445134137142996e+00, d4 =  3.754408661907416e+00;
    let q, r, z;
    if (0 < p && p < 0.02425) {
      q = Math.sqrt(-2*Math.log(p));
      z = (((((c1*q+c2)*q+c3)*q+c4)*q+c5)*q+c6) / ((((d1*q+d2)*q+d3)*q+d4)*q+1);
    } else if (0.02425 <= p && p <= 0.97575) {
      q = p - 0.5; r = q*q;
      z = (((((a1*r+a2)*r+a3)*r+a4)*r+a5)*r+a6)*q / (((((b1*r+b2)*r+b3)*r+b4)*r+b5)*r+1);
    } else {
      q = Math.sqrt(-2*Math.log(1-p));
      z = -(((((c1*q+c2)*q+c3)*q+c4)*q+c5)*q+c6) / ((((d1*q+d2)*q+d3)*q+d4)*q+1);
    }
    return z * sigma + mu;
  }
});

// ── Angle conversion helpers ───────────────────────────────────────────────
function toRad(val: number, mode: AngleMode): number {
  if (mode === 'DEGREE') return (val * Math.PI) / 180;
  if (mode === 'GRADIAN') return (val * Math.PI) / 200;
  return val;
}

function fromRad(val: number, mode: AngleMode): number {
  if (mode === 'DEGREE') return (val * 180) / Math.PI;
  if (mode === 'GRADIAN') return (val * 200) / Math.PI;
  return val;
}

// ── Number formatter (TI-84 style) ────────────────────────────────────────
export function formatResult(
  value: unknown,
  displayMode: DisplayMode,
  decimalPlaces: DecimalPlaces
): string {
  if (typeof value === 'boolean') return value ? '1' : '0';

  if (Array.isArray(value)) {
    // Matrix or list
    if (Array.isArray(value[0])) {
      const rows = (value as number[][]).map(
        (row) => '[' + row.map((v) => formatNumber(v, displayMode, decimalPlaces)).join(' ') + ']'
      );
      return rows.join('\n');
    }
    return '{' + (value as number[]).map((v) => formatNumber(v, displayMode, decimalPlaces)).join(' ') + '}';
  }

  if (typeof value === 'object' && value !== null && 're' in value) {
    // Complex number
    const c = value as { re: number; im: number };
    const re = formatNumber(c.re, displayMode, decimalPlaces);
    const im = formatNumber(Math.abs(c.im), displayMode, decimalPlaces);
    if (c.im === 0) return re;
    if (c.re === 0) return `${c.im < 0 ? '-' : ''}${im}i`;
    return `${re}${c.im < 0 ? '-' : '+'}${im}i`;
  }

  if (typeof value === 'number') {
    return formatNumber(value, displayMode, decimalPlaces);
  }

  if (typeof value === 'string') return value;

  return String(value);
}

function formatNumber(
  n: number,
  displayMode: DisplayMode,
  decimalPlaces: DecimalPlaces
): string {
  if (!isFinite(n)) {
    if (n === Infinity) return '1E99';
    if (n === -Infinity) return '-1E99';
    return 'ERR';
  }

  const abs = Math.abs(n);
  const dp = decimalPlaces === 'FLOAT' ? -1 : (decimalPlaces as number);

  if (displayMode === 'SCI') {
    if (dp === -1) {
      return n.toExponential(9).replace('e+', 'E').replace('e-', 'E-').replace('e', 'E');
    }
    return n.toExponential(dp).replace('e+', 'E').replace('e-', 'E-').replace('e', 'E');
  }

  if (displayMode === 'ENG') {
    // Engineering notation: exponent is multiple of 3
    if (n === 0) return '0';
    const exp3 = Math.floor(Math.log10(abs) / 3) * 3;
    const mantissa = n / Math.pow(10, exp3);
    const formatted = dp === -1 ? mantissa.toPrecision(10) : mantissa.toFixed(dp);
    return `${formatted}E${exp3}`;
  }

  // NORMAL mode
  if (abs !== 0 && (abs >= 1e10 || abs < 1e-3)) {
    // Auto switch to scientific for very large/small numbers
    if (dp === -1) {
      return n.toExponential(9).replace('e+', 'E').replace('e-', 'E-').replace('e', 'E');
    }
    return n.toExponential(dp).replace('e+', 'E').replace('e-', 'E-').replace('e', 'E');
  }

  if (dp === -1) {
    // Float: remove trailing zeros but keep up to 10 significant digits
    const str = parseFloat(n.toPrecision(10)).toString();
    return str;
  }

  return n.toFixed(dp);
}

// ── Main evaluate function ─────────────────────────────────────────────────
export function evaluateExpression(
  expr: string,
  variables: Record<string, number | string>,
  lastAnswer: number | string,
  angleMode: AngleMode,
  displayMode: DisplayMode,
  decimalPlaces: DecimalPlaces
): { result: string; value: number | string | number[] | number[][] } {
  if (!expr.trim()) throw new Error('SYNTAX');

  // Pre-process expression: substitute TI-84 notation → mathjs
  let processed = preprocessExpression(expr, variables, lastAnswer, angleMode);

  // Build mathjs scope
  const scope: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(variables)) {
    scope[k.toLowerCase() === 'θ' ? 'theta' : k] = typeof v === 'number' ? v : v;
  }
  scope['theta'] = typeof variables['θ'] === 'number' ? variables['θ'] : 0;
  scope['Ans'] = lastAnswer;
  scope['ans'] = lastAnswer;
  scope['π'] = Math.PI;
  scope['pi'] = Math.PI;
  scope['e'] = Math.E;

  // Add trig functions with angle mode
  const am = angleMode;
  scope['sin'] = (x: number) => Math.sin(toRad(x, am));
  scope['cos'] = (x: number) => Math.cos(toRad(x, am));
  scope['tan'] = (x: number) => Math.tan(toRad(x, am));
  scope['asin'] = (x: number) => fromRad(Math.asin(x), am);
  scope['arcsin'] = scope['asin'];
  scope['acos'] = (x: number) => fromRad(Math.acos(x), am);
  scope['arccos'] = scope['acos'];
  scope['atan'] = (x: number) => fromRad(Math.atan(x), am);
  scope['arctan'] = scope['atan'];
  scope['sinh'] = Math.sinh;
  scope['cosh'] = Math.cosh;
  scope['tanh'] = Math.tanh;
  scope['asinh'] = Math.asinh;
  scope['acosh'] = Math.acosh;
  scope['atanh'] = Math.atanh;

  // Math functions
  scope['abs'] = Math.abs;
  scope['round'] = (x: number, n?: number) => n !== undefined ? parseFloat(x.toFixed(n)) : Math.round(x);
  scope['int'] = Math.trunc; // TI int() = integer part (truncate toward 0)
  scope['iPart'] = Math.trunc;
  scope['fPart'] = (x: number) => x - Math.trunc(x);
  scope['sqrt'] = Math.sqrt;
  scope['cbrt'] = Math.cbrt;
  scope['log'] = (x: number, base?: number) => base !== undefined ? Math.log(x) / Math.log(base) : Math.log10(x);
  scope['ln'] = Math.log;
  scope['exp'] = Math.exp;
  scope['max'] = (...args: number[]) => Math.max(...args.flat());
  scope['min'] = (...args: number[]) => Math.min(...args.flat());
  scope['gcd'] = (a: number, b: number) => {
    a = Math.abs(Math.round(a)); b = Math.abs(Math.round(b));
    while (b) { [a, b] = [b, a % b]; } return a;
  };
  scope['lcm'] = (a: number, b: number) => {
    const g = (scope['gcd'] as (a: number, b: number) => number)(a, b);
    return g === 0 ? 0 : Math.abs(a * b) / g;
  };
  scope['nCr'] = (n: number, r: number) => factorial(n) / (factorial(r) * factorial(n - r));
  scope['nPr'] = (n: number, r: number) => factorial(n) / factorial(n - r);
  scope['factorial'] = factorial;
  scope['remainder'] = (a: number, b: number) => a - b * Math.trunc(a / b);
  scope['mod'] = (a: number, b: number) => ((a % b) + b) % b;

  // Rand
  scope['rand'] = () => Math.random();
  scope['randInt'] = (a: number, b: number) => Math.floor(Math.random() * (b - a + 1)) + Math.floor(a);
  scope['randNorm'] = (μ: number, σ: number) => {
    // Box-Muller
    const u = 1 - Math.random();
    const v = Math.random();
    return μ + σ * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  };
  scope['randBin'] = (n: number, p: number) => {
    let count = 0;
    for (let i = 0; i < Math.round(n); i++) if (Math.random() < p) count++;
    return count;
  };

  // Stat distributions
  scope['normalcdf'] = (lower: number, upper: number, μ = 0, σ = 1) =>
    normalCDF((upper - μ) / σ) - normalCDF((lower - μ) / σ);
  scope['normalpdf'] = (x: number, μ = 0, σ = 1) =>
    Math.exp(-0.5 * ((x - μ) / σ) ** 2) / (σ * Math.sqrt(2 * Math.PI));
  scope['invNorm'] = (p: number, μ = 0, σ = 1) => μ + σ * invNorm(p);
  scope['binompdf'] = (n: number, p: number, k: number) => {
    const n_ = Math.round(n); const k_ = Math.round(k);
    return (scope['nCr'] as (n: number, r: number) => number)(n_, k_) * p ** k_ * (1 - p) ** (n_ - k_);
  };
  scope['binomcdf'] = (n: number, p: number, k: number) => {
    let sum = 0;
    for (let i = 0; i <= Math.round(k); i++) {
      sum += (scope['binompdf'] as (n: number, p: number, k: number) => number)(n, p, i);
    }
    return sum;
  };
  scope['poissonpdf'] = (μ: number, k: number) =>
    Math.exp(-μ) * μ ** Math.round(k) / factorial(Math.round(k));
  scope['poissoncdf'] = (μ: number, k: number) => {
    let sum = 0;
    for (let i = 0; i <= Math.round(k); i++) {
      sum += (scope['poissonpdf'] as (μ: number, k: number) => number)(μ, i);
    }
    return sum;
  };

  // List operations
  scope['sum'] = (arr: number[]) => arr.reduce((a, b) => a + b, 0);
  scope['prod'] = (arr: number[]) => arr.reduce((a, b) => a * b, 1);
  scope['cumSum'] = (arr: number[]) => {
    const out: number[] = [];
    let s = 0;
    for (const v of arr) { s += v; out.push(s); }
    return out;
  };
  scope['dim'] = (arr: number[] | number[][]) => Array.isArray(arr[0])
    ? [(arr as number[][]).length, (arr as number[][])[0].length]
    : [(arr as number[]).length];
  scope['length'] = (arr: number[] | string) => Array.isArray(arr) ? arr.length : arr.length;
  scope['seq'] = (fn: (x: number) => number, start: number, end: number, step = 1) => {
    const result: number[] = [];
    for (let x = start; x <= end; x += step) result.push(fn(x));
    return result;
  };
  scope['augment'] = (a: number[][], b: number[][]) =>
    a.map((row, i) => [...row, ...b[i]]);
  scope['det'] = (m: number[][]) => determinant(m);
  scope['identity'] = (n: number) => {
    const m: number[][] = [];
    for (let i = 0; i < n; i++) {
      m.push(new Array(n).fill(0));
      m[i][i] = 1;
    }
    return m;
  };
  scope['transpose'] = (m: number[][]) =>
    m[0].map((_, col) => m.map(row => row[col]));
  scope['trace_mat'] = (m: number[][]) => m.reduce((s, row, i) => s + row[i], 0);

  // Numerical methods
  scope['nDeriv'] = (fn: (x: number) => number, x: number, h = 1e-5) =>
    (fn(x + h) - fn(x - h)) / (2 * h);
  scope['fnInt'] = (fn: (x: number) => number, a: number, b: number, n = 1000) => {
    // Simpson's rule
    const step = (b - a) / n;
    let s = fn(a) + fn(b);
    for (let i = 1; i < n; i++) s += fn(a + i * step) * (i % 2 === 0 ? 2 : 4);
    return (step / 3) * s;
  };

  // String functions
  scope['length_str'] = (s: string) => s.length;
  scope['sub'] = (s: string, start: number, len: number) => s.substring(start - 1, start - 1 + len);
  scope['inString'] = (s: string, sub: string, start = 1) => {
    const idx = s.indexOf(sub, start - 1);
    return idx === -1 ? 0 : idx + 1;
  };
  scope['concat'] = (...args: string[]) => args.join('');

  try {
    const result = mathInstance.evaluate(processed, scope);
    const formatted = formatResult(result, displayMode, decimalPlaces);
    return { result: formatted, value: result };
  } catch (err) {
    const msg = (err as Error).message || 'SYNTAX';
    throw new TIError(mapError(msg), msg);
  }
}

// ── Expression pre-processor ───────────────────────────────────────────────
function preprocessExpression(
  expr: string,
  variables: Record<string, number | string>,
  lastAnswer: number | string,
  _angleMode: AngleMode
): string {
  let s = expr;

  // -- Replace TI-84 specific tokens --
  s = s.replace(/→/g, '->');
  s = s.replace(/÷/g, '/');
  s = s.replace(/×/g, '*');
  s = s.replace(/−/g, '-'); // U+2212 minus sign
  s = s.replace(/Ans/g, `(${lastAnswer})`);
  s = s.replace(/π/g, 'pi');
  s = s.replace(/θ/g, 'theta');
  s = s.replace(/\^/g, '^');
  
  // -- Lists & Matrices --
  s = s.replace(/\{/g, '[');
  s = s.replace(/\}/g, ']');
  // Replace references like [A] with matrix_A
  s = s.replace(/\[([A-J])\]/g, 'matrix_$1');

  // -- TEST Menu (Logic) --
  // mathjs requires == for equality, TI-84 uses =
  // Need to be careful: might conflict with assignments or polar equations like r1=
  // We'll replace = with == only if it's not starting with an equation definition
  // For the simulator eval engine, standard expressions don't use assignment (=) anyway
  s = s.replace(/(?<![<>!])=(?!=)/g, '=='); 
  s = s.replace(/≠/g, '!=');
  s = s.replace(/≤/g, '<=');
  s = s.replace(/≥/g, '>=');

  // -- Math Extras & Complex (MATH/CMPLX) --
  s = s.replace(/real\(/g, 're(');
  s = s.replace(/imag\(/g, 'im(');
  s = s.replace(/angle\(/g, 'arg(');

  // Implicit multiplication: 2x → 2*x, 2( → 2*(, )(  → )*(
  // Exclude 'e' and 'E' if followed by optional sign and digit (scientific notation)
  s = s.replace(/(\d)(?![eE][+\-]?\d)([A-Za-z(])/g, '$1*$2');
  s = s.replace(/\)(\d)/g, ')*$1');
  s = s.replace(/\)\s*\(/g, ')*(');

  // Exponents
  s = s.replace(/\^-1/g, '^-1'); // mathjs handles this

  // sin^-1 → asin etc.
  s = s.replace(/sin\^-1/gi, 'asin');
  s = s.replace(/cos\^-1/gi, 'acos');
  s = s.replace(/tan\^-1/gi, 'atan');
  s = s.replace(/sin⁻¹/g, 'asin');
  s = s.replace(/cos⁻¹/g, 'acos');
  s = s.replace(/tan⁻¹/g, 'atan');

  // √( → sqrt(
  s = s.replace(/√\s*\(/g, 'sqrt(');
  s = s.replace(/√([0-9A-Za-z.]+)/g, 'sqrt($1)');

  // e^( → exp(
  s = s.replace(/e\^\(/g, 'exp(');
  s = s.replace(/e\^([0-9A-Za-z.]+)/g, 'exp($1)');

  // x² → x^2
  s = s.replace(/²/g, '^2');

  // x⁻¹ → x^-1
  s = s.replace(/⁻¹/g, '^-1');

  // nCr, nPr
  s = s.replace(/(\d+)\s*nCr\s*(\d+)/g, 'nCr($1,$2)');
  s = s.replace(/(\d+)\s*nPr\s*(\d+)/g, 'nPr($1,$2)');

  // ! factorial (must not match the '!=' inequality operator)
  s = s.replace(/([A-Za-z0-9.()]+)!(?!=)/g, 'factorial($1)');

  // -- E notation: 1E5 → 1e5 (mathjs handles e) --
  s = s.replace(/(\d)E(-?\d+)/g, '$1e$2');

  // Substitute single uppercase letter variables
  for (const [k, v] of Object.entries(variables)) {
    if (k === 'θ') continue;
    if (k.length === 1 && /[A-Z]/.test(k)) {
      // Replace standalone letter variable references.
      // Must not be preceded or followed by letter/underscore to avoid mangling matrix_A
      const re = new RegExp(`(?<![A-Za-z_])${k}(?![A-Za-z_])`, 'g');
      s = s.replace(re, `(${v})`);
    }
  }
  // θ (theta)
  if (variables['θ'] !== undefined) {
    s = s.replace(/theta/g, `(${variables['θ']})`);
  }

  return s;
}

// ── Helper functions ───────────────────────────────────────────────────────
function factorial(n: number): number {
  n = Math.round(n);
  if (n < 0) throw new TIError('DOMAIN');
  if (n > 69) return Infinity;
  if (n === 0 || n === 1) return 1;
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}

function normalCDF(z: number): number {
  // Approximation (Abramowitz & Stegun)
  if (z < -8) return 0;
  if (z > 8) return 1;
  const t = 1 / (1 + 0.2316419 * Math.abs(z));
  const poly = t * (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf = Math.exp(-0.5 * z * z) / Math.sqrt(2 * Math.PI);
  const cdf = 1 - pdf * poly;
  return z >= 0 ? cdf : 1 - cdf;
}

function invNorm(p: number): number {
  // Rational approximation (Peter Acklam)
  const a = [-3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
  const b = [-5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
  const c = [-7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
  const d = [7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];
  const pLow = 0.02425, pHigh = 1 - pLow;
  let q: number;
  if (p < pLow) {
    q = Math.sqrt(-2 * Math.log(p));
    return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
  }
  if (p <= pHigh) {
    q = p - 0.5; const r = q * q;
    return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q / (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
  }
  q = Math.sqrt(-2 * Math.log(1 - p));
  return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) / ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
}

function determinant(m: number[][]): number {
  const n = m.length;
  if (n === 1) return m[0][0];
  if (n === 2) return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  let det = 0;
  for (let j = 0; j < n; j++) {
    const minor = m.slice(1).map(row => [...row.slice(0, j), ...row.slice(j + 1)]);
    det += (j % 2 === 0 ? 1 : -1) * m[0][j] * determinant(minor);
  }
  return det;
}

function mapError(msg: string): string {
  const lower = msg.toLowerCase();
  if (lower.includes('undefined')) return 'UNDEFINED';
  if (lower.includes('syntax')) return 'SYNTAX';
  if (lower.includes('divide') || lower.includes('zero')) return 'DIVIDE_BY_0';
  if (lower.includes('domain') || lower.includes('nan')) return 'DOMAIN';
  if (lower.includes('dimension')) return 'DIMENSION';
  if (lower.includes('overflow') || lower.includes('infinity')) return 'OVERFLOW';
  return 'SYNTAX';
}

export class TIError extends Error {
  public tiCode: string;
  constructor(tiCode: string, message?: string) {
    super(message || tiCode);
    this.tiCode = tiCode;
    this.name = 'TIError';
  }
}

// ── Eval single value for graphing ────────────────────────────────────────
export function evalForGraph(
  expr: string,
  varName: string,
  value: number,
  variables: Record<string, number | string>,
  angleMode: AngleMode
): number {
  const vars = { ...variables, [varName]: value, [varName.toLowerCase()]: value };
  try {
    const scope: Record<string, unknown> = { ...vars };
    scope['pi'] = Math.PI;
    scope['π'] = Math.PI;
    scope['e'] = Math.E;
    scope['theta'] = vars['θ'] ?? 0;
    const am = angleMode;
    scope['sin'] = (x: number) => Math.sin(toRad(x, am));
    scope['cos'] = (x: number) => Math.cos(toRad(x, am));
    scope['tan'] = (x: number) => Math.tan(toRad(x, am));
    scope['asin'] = (x: number) => fromRad(Math.asin(x), am);
    scope['acos'] = (x: number) => fromRad(Math.acos(x), am);
    scope['atan'] = (x: number) => fromRad(Math.atan(x), am);
    scope['abs'] = Math.abs;
    scope['sqrt'] = Math.sqrt;
    scope['log'] = Math.log10;
    scope['ln'] = Math.log;
    scope['exp'] = Math.exp;
    scope['int'] = Math.trunc;
    scope['iPart'] = Math.trunc;
    scope['fPart'] = (x: number) => x - Math.trunc(x);

    let processed = preprocessExpression(expr.replace(/X/g, `(${value})`).replace(/x/g, `(${value})`), vars, 0, angleMode);
    processed = processed.replace(/theta/g, `(${vars['θ'] ?? 0})`);
    processed = processed.replace(/pi/g, `${Math.PI}`);

    const res = mathInstance.evaluate(processed, scope);
    const n = typeof res === 'number' ? res : parseFloat(String(res));
    return isFinite(n) && !isNaN(n) ? n : NaN;
  } catch {
    return NaN;
  }
}

// ── Statistics ─────────────────────────────────────────────────────────────
export function oneVarStats(data: number[]): Record<string, number> {
  const n = data.length;
  if (n === 0) throw new TIError('STAT');
  const xbar = data.reduce((s, x) => s + x, 0) / n;
  const sumX = data.reduce((s, x) => s + x, 0);
  const sumX2 = data.reduce((s, x) => s + x * x, 0);
  const sx = n > 1 ? Math.sqrt((sumX2 - n * xbar * xbar) / (n - 1)) : 0;
  const σx = Math.sqrt((sumX2 - n * xbar * xbar) / n);
  const sorted = [...data].sort((a, b) => a - b);
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];
  const q1 = sorted[Math.floor(n / 4)];
  const q3 = sorted[Math.floor(3 * n / 4)];
  return { n, xbar, sumX, sumX2, Sx: sx, σx, minX: Math.min(...data), Q1: q1, Med: median, Q3: q3, maxX: Math.max(...data) };
}

export function twoVarStats(xData: number[], yData: number[]): Record<string, number> {
  const n = Math.min(xData.length, yData.length);
  if (n === 0) throw new TIError('STAT');
  const s1 = oneVarStats(xData.slice(0, n));
  const s2 = oneVarStats(yData.slice(0, n));
  const sumXY = xData.slice(0, n).reduce((s, x, i) => s + x * yData[i], 0);
  return { ...s1, ybar: s2.xbar, sumY: s2.sumX, sumY2: s2.sumX2, Sy: s2.Sx, σy: s2.σx, sumXY };
}

export function linReg(xData: number[], yData: number[]): { a: number; b: number; r: number; r2: number } {
  const n = Math.min(xData.length, yData.length);
  const sumX = xData.reduce((s, x) => s + x, 0);
  const sumY = yData.reduce((s, y) => s + y, 0);
  const sumXY = xData.reduce((s, x, i) => s + x * yData[i], 0);
  const sumX2 = xData.reduce((s, x) => s + x * x, 0);
  const a = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX ** 2);
  const b = (sumY - a * sumX) / n;
  const xbar = sumX / n, ybar = sumY / n;
  const sst = yData.reduce((s, y) => s + (y - ybar) ** 2, 0);
  const sse = yData.reduce((s, y, i) => s + (y - (a * xData[i] + b)) ** 2, 0);
  const r2 = sst === 0 ? 1 : 1 - sse / sst;
  const r = Math.sign(a) * Math.sqrt(r2);
  return { a, b, r, r2 };
}
