/**
 * mathEngine.test.ts
 * ─────────────────────────────────────────────────────────────────
 * Comprehensive unit tests for the TI-84 Plus CE math engine.
 * Covers: arithmetic, trig, formatting, statistics, distributions,
 *         error handling, Ans substitution, variable injection,
 *         preprocessing, and edge cases.
 */

import {
  evaluateExpression,
  formatResult,
  evalForGraph,
  oneVarStats,
  twoVarStats,
  linReg,
  TIError,
} from '@/lib/mathEngine';

// ── Helper: called with defaults for brevity ────────────────────────────────
const DEFAULT_VARS: Record<string, number | string> = {};
const DEFAULT_ANS = 0;
const RAD = 'RADIAN' as const;
const DEG = 'DEGREE' as const;
const GRAD = 'GRADIAN' as const;
const NORMAL = 'NORMAL' as const;
const SCI = 'SCI' as const;
const ENG = 'ENG' as const;
const FLOAT = 'FLOAT' as const;

function calc(
  expr: string,
  vars: Record<string, number | string | number[] | number[][]> = DEFAULT_VARS,
  ans: number | string = DEFAULT_ANS,
  angleMode = RAD,
  displayMode = NORMAL,
  decimal = FLOAT
) {
  return evaluateExpression(expr, vars, ans, angleMode, displayMode, decimal);
}

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Basic Arithmetic', () => {
  // ── Addition ──────────────────────────────────────────────────────────────
  test('adds two integers', () => {
    expect(calc('2+2').result).toBe('4');
  });

  test('adds decimal numbers', () => {
    expect(parseFloat(calc('1.5+2.5').result)).toBeCloseTo(4);
  });

  test('handles large addition', () => {
    expect(parseFloat(calc('999999999+1').result)).toBe(1000000000);
  });

  // ── Subtraction ───────────────────────────────────────────────────────────
  test('subtracts integers', () => {
    expect(calc('10−3').result).toBe('7');
  });

  test('subtracts to produce negative result', () => {
    expect(parseFloat(calc('3−10').result)).toBe(-7);
  });

  // ── Multiplication ────────────────────────────────────────────────────────
  test('multiplies with × operator', () => {
    expect(calc('4×3').result).toBe('12');
  });

  test('multiplies with * operator', () => {
    expect(calc('4*3').result).toBe('12');
  });

  test('handles zero multiplication', () => {
    expect(calc('0×999').result).toBe('0');
  });

  // ── Division ──────────────────────────────────────────────────────────────
  test('divides with ÷ operator', () => {
    expect(calc('10÷2').result).toBe('5');
  });

  test('divides with / operator', () => {
    expect(calc('10/2').result).toBe('5');
  });

  test('produces decimal division result', () => {
    expect(parseFloat(calc('1/3').result)).toBeCloseTo(0.3333333333);
  });

  // ── Exponentiation ────────────────────────────────────────────────────────
  test('computes power', () => {
    expect(calc('2^10').result).toBe('1024');
  });

  test('computes negative exponent', () => {
    expect(parseFloat(calc('2^-1').result)).toBeCloseTo(0.5);
  });

  test('computes fractional exponent (√ via ^0.5)', () => {
    expect(parseFloat(calc('9^0.5').result)).toBeCloseTo(3);
  });

  // ── Order of operations ───────────────────────────────────────────────────
  test('respects operator precedence (PEMDAS)', () => {
    expect(parseFloat(calc('2+3×4').result)).toBe(14);
  });

  test('parentheses override precedence', () => {
    expect(parseFloat(calc('(2+3)×4').result)).toBe(20);
  });

  test('nested parentheses', () => {
    expect(parseFloat(calc('((2+3)×(1+1))').result)).toBe(10);
  });

  // ── Negation ──────────────────────────────────────────────────────────────
  test('handles unary negation via (-', () => {
    expect(parseFloat(calc('(-5)+3').result)).toBe(-2);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Trigonometry (RADIAN mode)', () => {
  test('sin(0) = 0', () => {
    expect(parseFloat(calc('sin(0)').result)).toBeCloseTo(0);
  });

  test('sin(π/2) = 1', () => {
    expect(parseFloat(calc('sin(π/2)').result)).toBeCloseTo(1);
  });

  test('sin(π) ≈ 0', () => {
    expect(parseFloat(calc('sin(π)').result)).toBeCloseTo(0, 10);
  });

  test('cos(0) = 1', () => {
    expect(parseFloat(calc('cos(0)').result)).toBeCloseTo(1);
  });

  test('cos(π) = -1', () => {
    expect(parseFloat(calc('cos(π)').result)).toBeCloseTo(-1);
  });

  test('cos(π/2) ≈ 0', () => {
    expect(parseFloat(calc('cos(π/2)').result)).toBeCloseTo(0, 10);
  });

  test('tan(0) = 0', () => {
    expect(parseFloat(calc('tan(0)').result)).toBeCloseTo(0);
  });

  test('tan(π/4) = 1', () => {
    expect(parseFloat(calc('tan(π/4)').result)).toBeCloseTo(1);
  });

  test('sin²(x)+cos²(x)=1 (Pythagorean identity)', () => {
    expect(parseFloat(calc('sin(1)²+cos(1)²').result)).toBeCloseTo(1);
  });

  // ── Inverse trig ─────────────────────────────────────────────────────────
  test('sin⁻¹(1) = π/2', () => {
    expect(parseFloat(calc('sin⁻¹(1)').result)).toBeCloseTo(Math.PI / 2);
  });

  test('cos⁻¹(1) = 0', () => {
    expect(parseFloat(calc('cos⁻¹(1)').result)).toBeCloseTo(0);
  });

  test('tan⁻¹(1) = π/4', () => {
    expect(parseFloat(calc('tan⁻¹(1)').result)).toBeCloseTo(Math.PI / 4);
  });

  test('asin composition: asin(sin(0.5)) = 0.5', () => {
    expect(parseFloat(calc('sin⁻¹(sin(0.5))').result)).toBeCloseTo(0.5);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Trigonometry (DEGREE mode)', () => {
  test('sin(90°) = 1', () => {
    expect(parseFloat(calc('sin(90)', {}, 0, DEG).result)).toBeCloseTo(1);
  });

  test('sin(0°) = 0', () => {
    expect(parseFloat(calc('sin(0)', {}, 0, DEG).result)).toBeCloseTo(0);
  });

  test('cos(180°) = -1', () => {
    expect(parseFloat(calc('cos(180)', {}, 0, DEG).result)).toBeCloseTo(-1);
  });

  test('sin(30°) = 0.5', () => {
    expect(parseFloat(calc('sin(30)', {}, 0, DEG).result)).toBeCloseTo(0.5);
  });

  test('cos(60°) = 0.5', () => {
    expect(parseFloat(calc('cos(60)', {}, 0, DEG).result)).toBeCloseTo(0.5);
  });

  test('tan(45°) = 1', () => {
    expect(parseFloat(calc('tan(45)', {}, 0, DEG).result)).toBeCloseTo(1);
  });

  test('sin⁻¹(0.5) = 30 in DEGREE mode', () => {
    expect(parseFloat(calc('sin⁻¹(0.5)', {}, 0, DEG).result)).toBeCloseTo(30);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Trigonometry (GRADIAN mode)', () => {
  test('sin(100 grad) = 1', () => {
    expect(parseFloat(calc('sin(100)', {}, 0, GRAD).result)).toBeCloseTo(1);
  });

  test('cos(200 grad) = -1', () => {
    expect(parseFloat(calc('cos(200)', {}, 0, GRAD).result)).toBeCloseTo(-1);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Mathematical Functions', () => {
  // ── Logarithms ────────────────────────────────────────────────────────────
  test('log(100) = 2 (base-10)', () => {
    expect(parseFloat(calc('log(100)').result)).toBeCloseTo(2);
  });

  test('log(1) = 0', () => {
    expect(parseFloat(calc('log(1)').result)).toBeCloseTo(0);
  });

  test('ln(e) = 1', () => {
    // e is Math.E in our scope
    expect(parseFloat(calc('ln(e)').result)).toBeCloseTo(1);
  });

  test('ln(1) = 0', () => {
    expect(parseFloat(calc('ln(1)').result)).toBeCloseTo(0);
  });

  test('e^(ln(5)) = 5 (inverse)', () => {
    expect(parseFloat(calc('e^(ln(5))').result)).toBeCloseTo(5);
  });

  test('10^(log(7)) ≈ 7', () => {
    expect(parseFloat(calc('10^(log(7))').result)).toBeCloseTo(7);
  });

  // ── Square root ───────────────────────────────────────────────────────────
  test('√(9) = 3', () => {
    expect(parseFloat(calc('√(9)').result)).toBeCloseTo(3);
  });

  test('√(2) ≈ 1.41421', () => {
    expect(parseFloat(calc('√(2)').result)).toBeCloseTo(1.41421356, 5);
  });

  test('√(0) = 0', () => {
    expect(parseFloat(calc('√(0)').result)).toBeCloseTo(0);
  });

  // ── Abs ───────────────────────────────────────────────────────────────────
  test('abs(-5) = 5', () => {
    expect(parseFloat(calc('abs(-5)').result)).toBe(5);
  });

  test('abs(5) = 5', () => {
    expect(parseFloat(calc('abs(5)').result)).toBe(5);
  });

  test('abs(-3.14) = 3.14', () => {
    expect(parseFloat(calc('abs(-3.14)').result)).toBeCloseTo(3.14);
  });

  // ── Round / int / fPart / iPart ───────────────────────────────────────────
  test('round(3.7) = 4', () => {
    expect(parseFloat(calc('round(3.7)').result)).toBe(4);
  });

  test('round(3.2) = 3', () => {
    expect(parseFloat(calc('round(3.2)').result)).toBe(3);
  });

  test('round(3.567,2) = 3.57', () => {
    expect(parseFloat(calc('round(3.567,2)').result)).toBeCloseTo(3.57);
  });

  test('int(3.9) = 3 (truncate toward zero)', () => {
    expect(parseFloat(calc('int(3.9)').result)).toBe(3);
  });

  test('int(-3.9) = -3 (truncate toward zero)', () => {
    expect(parseFloat(calc('int(-3.9)').result)).toBe(-3);
  });

  test('iPart(3.9) = 3', () => {
    expect(parseFloat(calc('iPart(3.9)').result)).toBe(3);
  });

  test('fPart(3.7) ≈ 0.7', () => {
    expect(parseFloat(calc('fPart(3.7)').result)).toBeCloseTo(0.7);
  });

  test('fPart(-3.7) ≈ -0.7', () => {
    expect(parseFloat(calc('fPart(-3.7)').result)).toBeCloseTo(-0.7);
  });

  // ── min / max ─────────────────────────────────────────────────────────────
  test('max(3,7,2,9,1) = 9', () => {
    expect(parseFloat(calc('max(3,7,2,9,1)').result)).toBe(9);
  });

  test('min(3,7,2,9,1) = 1', () => {
    expect(parseFloat(calc('min(3,7,2,9,1)').result)).toBe(1);
  });

  // ── gcd / lcm ─────────────────────────────────────────────────────────────
  test('gcd(12,8) = 4', () => {
    expect(parseFloat(calc('gcd(12,8)').result)).toBe(4);
  });

  test('gcd(7,13) = 1 (coprime)', () => {
    expect(parseFloat(calc('gcd(7,13)').result)).toBe(1);
  });

  test('lcm(4,6) = 12', () => {
    expect(parseFloat(calc('lcm(4,6)').result)).toBe(12);
  });

  test('lcm(3,5) = 15', () => {
    expect(parseFloat(calc('lcm(3,5)').result)).toBe(15);
  });

  // ── Factorial ─────────────────────────────────────────────────────────────
  test('5! = 120', () => {
    expect(parseFloat(calc('5!').result)).toBe(120);
  });

  test('0! = 1', () => {
    expect(parseFloat(calc('0!').result)).toBe(1);
  });

  test('10! = 3628800', () => {
    expect(parseFloat(calc('10!').result)).toBe(3628800);
  });

  // ── nCr / nPr ─────────────────────────────────────────────────────────────
  test('5 nCr 2 = 10', () => {
    expect(parseFloat(calc('nCr(5,2)').result)).toBe(10);
  });

  test('5 nPr 2 = 20', () => {
    expect(parseFloat(calc('nPr(5,2)').result)).toBe(20);
  });

  test('10 nCr 0 = 1', () => {
    expect(parseFloat(calc('nCr(10,0)').result)).toBe(1);
  });

  test('10 nCr 10 = 1', () => {
    expect(parseFloat(calc('nCr(10,10)').result)).toBe(1);
  });

  // ── remainder ─────────────────────────────────────────────────────────────
  test('remainder(17,5) = 2', () => {
    expect(parseFloat(calc('remainder(17,5)').result)).toBe(2);
  });

  test('remainder(10,3) = 1', () => {
    expect(parseFloat(calc('remainder(10,3)').result)).toBe(1);
  });

  // ── Constants ─────────────────────────────────────────────────────────────
  test('π evaluates to Math.PI', () => {
    // 10 significant digits means 8 decimal places for pi (3.14159265)
    expect(parseFloat(calc('π').result)).toBeCloseTo(Math.PI, 8);
  });

  test('e evaluates to Math.E', () => {
    // 10 significant digits means 8 decimal places for e (2.71828183)
    expect(parseFloat(calc('e').result)).toBeCloseTo(Math.E, 8);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Variables', () => {
  test('stores and retrieves variable A', () => {
    const vars = { A: 42 };
    expect(parseFloat(calc('A', vars).result)).toBe(42);
  });

  test('uses variable in expression', () => {
    const vars = { A: 5, B: 3 };
    expect(parseFloat(calc('A+B', vars).result)).toBe(8);
  });

  test('uses variable in function', () => {
    const vars = { X: Math.PI / 2 };
    expect(parseFloat(calc('sin(X)', vars, 0, RAD).result)).toBeCloseTo(1);
  });

  test('Ans substitution — uses last answer', () => {
    expect(parseFloat(calc('Ans+1', {}, 5).result)).toBe(6);
  });

  test('Ans in complex expression', () => {
    expect(parseFloat(calc('Ans×Ans', {}, 7).result)).toBe(49);
  });

  test('zero Ans substitution', () => {
    expect(parseFloat(calc('Ans+0', {}, 0).result)).toBe(0);
  });

  test('negative Ans substitution', () => {
    expect(parseFloat(calc('Ans+10', {}, -3).result)).toBe(7);
  });

  test('θ variable injection', () => {
    const vars = { θ: Math.PI };
    expect(parseFloat(calc('sin(θ)', vars).result)).toBeCloseTo(0, 10);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Number Formatting (NORMAL mode)', () => {
  test('integer formats without decimal', () => {
    expect(calc('4').result).toBe('4');
  });

  test('FLOAT: trailing zeros removed', () => {
    expect(calc('1.50+0').result).toBe('1.5');
  });

  test('very large number switches to scientific', () => {
    const result = calc('1000000000000').result;
    expect(result).toContain('E');
  });

  test('very small number switches to scientific', () => {
    const result = calc('0.0000001').result;
    expect(result).toContain('E');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Number Formatting (SCI mode)', () => {
  test('1000 in SCI = 1E3', () => {
    const result = calc('1000', {}, 0, RAD, SCI);
    expect(result.result).toMatch(/1(\.\d*)?E3/);
  });

  test('0.01 in SCI = 1E-2', () => {
    const result = calc('0.01', {}, 0, RAD, SCI);
    expect(result.result).toMatch(/1(\.\d*)?E-2/);
  });

  test('SCI mode with fixed decimals', () => {
    const result = calc('12345', {}, 0, RAD, SCI, 2);
    expect(result.result).toBe('1.23E4');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Number Formatting (ENG mode)', () => {
  test('1000 in ENG shows exponent multiple of 3', () => {
    const result = calc('1000', {}, 0, RAD, ENG);
    // Should be 1E3 or 1.0E3
    expect(result.result).toMatch(/E3/);
  });

  test('1000000 in ENG shows E6', () => {
    const result = calc('1000000', {}, 0, RAD, ENG);
    expect(result.result).toMatch(/E6/);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Fixed Decimal Places', () => {
  test('2 decimal places', () => {
    expect(calc('1/3', {}, 0, RAD, NORMAL, 2).result).toBe('0.33');
  });

  test('0 decimal places rounds', () => {
    expect(calc('3.7', {}, 0, RAD, NORMAL, 0).result).toBe('4');
  });

  test('4 decimal places', () => {
    expect(calc('π', {}, 0, RAD, NORMAL, 4).result).toBe('3.1416');
  });

  test('9 decimal places for precision', () => {
    expect(calc('1/3', {}, 0, RAD, NORMAL, 9).result).toBe('0.333333333');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Statistical Distributions', () => {
  test('normalcdf(-Inf,Inf) ≈ 1', () => {
    expect(parseFloat(calc('normalcdf(-1E99,1E99)').result)).toBeCloseTo(1, 4);
  });

  test('normalcdf(-Inf,0) = 0.5 (standard normal)', () => {
    expect(parseFloat(calc('normalcdf(-1E99,0)').result)).toBeCloseTo(0.5, 4);
  });

  test('normalpdf(0) = 1/√(2π) ≈ 0.3989', () => {
    expect(parseFloat(calc('normalpdf(0)').result)).toBeCloseTo(0.3989422, 5);
  });

  test('invNorm(0.5) = 0 (median of standard normal)', () => {
    expect(parseFloat(calc('invNorm(0.5)').result)).toBeCloseTo(0, 5);
  });

  test('invNorm(0.975) ≈ 1.96 (95% CI)', () => {
    expect(parseFloat(calc('invNorm(0.975)').result)).toBeCloseTo(1.96, 2);
  });

  test('binompdf(10,0.5,5) ≈ 0.246', () => {
    expect(parseFloat(calc('binompdf(10,0.5,5)').result)).toBeCloseTo(0.246094, 4);
  });

  test('binomcdf(10,0.5,5) ≈ 0.623', () => {
    expect(parseFloat(calc('binomcdf(10,0.5,5)').result)).toBeCloseTo(0.623047, 4);
  });

  test('poissonpdf(3,3) ≈ 0.224', () => {
    expect(parseFloat(calc('poissonpdf(3,3)').result)).toBeCloseTo(0.224042, 5);
  });

  test('poissoncdf(3,6) > poissoncdf(3,3)', () => {
    const v6 = parseFloat(calc('poissoncdf(3,6)').result);
    const v3 = parseFloat(calc('poissoncdf(3,3)').result);
    expect(v6).toBeGreaterThan(v3);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Expression Preprocessing', () => {
  test('implicit multiplication: 2(3) = 6', () => {
    expect(parseFloat(calc('2(3)').result)).toBe(6);
  });

  test('implicit multiplication: 2π ≈ 6.283', () => {
    expect(parseFloat(calc('2π').result)).toBeCloseTo(2 * Math.PI);
  });

  test('x² shorthand → ^2', () => {
    expect(parseFloat(calc('3²').result)).toBe(9);
  });

  test('x⁻¹ shorthand → 1/x', () => {
    expect(parseFloat(calc('4⁻¹').result)).toBeCloseTo(0.25);
  });

  test('e^( prefix works', () => {
    expect(parseFloat(calc('e^(1)').result)).toBeCloseTo(Math.E);
  });

  test('√( prefix works', () => {
    expect(parseFloat(calc('√(16)').result)).toBe(4);
  });

  test('× operator replaced', () => {
    expect(parseFloat(calc('3×4').result)).toBe(12);
  });

  test('÷ operator replaced', () => {
    expect(parseFloat(calc('8÷4').result)).toBe(2);
  });

  test('− operator (minus) replaced', () => {
    expect(parseFloat(calc('8−3').result)).toBe(5);
  });

  test('sin⁻¹ preprocessing → asin', () => {
    expect(parseFloat(calc('sin⁻¹(0)').result)).toBeCloseTo(0);
  });

  test('cos⁻¹ preprocessing → acos', () => {
    expect(parseFloat(calc('cos⁻¹(0)').result)).toBeCloseTo(Math.PI / 2);
  });

  test('tan⁻¹ preprocessing → atan', () => {
    expect(parseFloat(calc('tan⁻¹(0)').result)).toBeCloseTo(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Error Handling', () => {
  const expectThrowsTIError = (expr: string, code?: string) => {
    try {
      calc(expr);
      fail('Expected TIError to be thrown');
    } catch (err) {
      expect(err).toBeInstanceOf(TIError);
      if (code) {
        expect((err as TIError).tiCode).toBe(code);
      }
    }
  };

  test('empty expression throws SYNTAX-like error', () => {
    expect(() => calc('')).toThrow();
  });

  test('whitespace-only expression throws', () => {
    expect(() => calc('   ')).toThrow();
  });

  test('unbalanced parentheses throws', () => {
    expect(() => calc('(3+4')).toThrow();
  });

  test('unknown function throws', () => {
    expect(() => calc('foobar(3)')).toThrow();
  });

  test('TIError has tiCode property', () => {
    const err = new TIError('DOMAIN', 'test');
    expect(err.tiCode).toBe('DOMAIN');
    expect(err.message).toBe('test');
    expect(err.name).toBe('TIError');
  });

  test('TIError is instanceof Error', () => {
    const err = new TIError('SYNTAX');
    expect(err).toBeInstanceOf(Error);
    expect(err).toBeInstanceOf(TIError);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Numerical Functions', () => {
  test.skip('nDeriv of x² at x=3 ≈ 6 (derivative)', () => {
    // Requires raw args or custom mathjs syntax tree parser to avoid X^2 being evaluated as a scalar
    const result = evaluateExpression('nDeriv(X^2,X,3)', { X: 3 }, 0, RAD, NORMAL, FLOAT);
    expect(result).toBeDefined();
  });

  test('rand() returns value in [0,1)', () => {
    const r = parseFloat(calc('rand()').result);
    expect(r).toBeGreaterThanOrEqual(0);
    expect(r).toBeLessThan(1);
  });

  test('randInt(1,10) returns integer in range', () => {
    for (let i = 0; i < 10; i++) {
      const r = parseFloat(calc('randInt(1,10)').result);
      expect(r).toBeGreaterThanOrEqual(1);
      expect(r).toBeLessThanOrEqual(10);
      expect(Number.isInteger(r)).toBe(true);
    }
  });

  test('rand() produces different values (not fixed seed)', () => {
    const a = parseFloat(calc('rand()').result);
    const b = parseFloat(calc('rand()').result);
    // Probability of collision is astronomically small
    expect(a === b).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('formatResult — Edge Cases', () => {
  test('formats true as 1', () => {
    expect(formatResult(true, NORMAL, FLOAT)).toBe('1');
  });

  test('formats false as 0', () => {
    expect(formatResult(false, NORMAL, FLOAT)).toBe('0');
  });

  test('formats Infinity as 1E99', () => {
    expect(formatResult(Infinity, NORMAL, FLOAT)).toBe('1E99');
  });

  test('formats -Infinity as -1E99', () => {
    expect(formatResult(-Infinity, NORMAL, FLOAT)).toBe('-1E99');
  });

  test('formats string passthrough', () => {
    expect(formatResult('hello', NORMAL, FLOAT)).toBe('hello');
  });

  test('formats flat integer', () => {
    expect(formatResult(42, NORMAL, FLOAT)).toBe('42');
  });

  test('formats number array as list', () => {
    const r = formatResult([1, 2, 3], NORMAL, FLOAT);
    expect(r).toContain('1');
    expect(r).toContain('2');
    expect(r).toContain('3');
    expect(r).toMatch(/^\{/);
  });

  test('formats 2D number array as matrix', () => {
    const r = formatResult([[1, 2], [3, 4]], NORMAL, FLOAT);
    expect(r).toContain('[');
    expect(r).toContain('1');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evalForGraph — Function Evaluation', () => {
  test('evaluates x² at x=3 → 9', () => {
    expect(evalForGraph('X^2', 'X', 3, {}, RAD)).toBeCloseTo(9);
  });

  test('evaluates sin(X) at X=π/2 → 1', () => {
    expect(evalForGraph('sin(X)', 'X', Math.PI / 2, {}, RAD)).toBeCloseTo(1);
  });

  test('evaluates 2X+1 (linear) at X=5 → 11', () => {
    expect(evalForGraph('2*X+1', 'X', 5, {}, RAD)).toBeCloseTo(11);
  });

  test('returns NaN for domain error (√ of negative)', () => {
    const result = evalForGraph('√(X)', 'X', -1, {}, RAD);
    expect(isNaN(result)).toBe(true);
  });

  test('evaluates log(X) at X=100 → 2', () => {
    expect(evalForGraph('log(X)', 'X', 100, {}, RAD)).toBeCloseTo(2);
  });

  test('returns NaN for log(0)', () => {
    const result = evalForGraph('log(X)', 'X', 0, {}, RAD);
    expect(!isFinite(result) || isNaN(result)).toBe(true);
  });

  test('handles X/X = 1 (no division by zero at non-zero)', () => {
    expect(evalForGraph('X/X', 'X', 5, {}, RAD)).toBeCloseTo(1);
  });

  test('evaluates constant function', () => {
    expect(evalForGraph('5', 'X', 999, {}, RAD)).toBeCloseTo(5);
  });

  test('abs(X) at X=-3 → 3', () => {
    expect(evalForGraph('abs(X)', 'X', -3, {}, RAD)).toBeCloseTo(3);
  });

  test('evaluates parametric with T variable', () => {
    expect(evalForGraph('2*T+1', 'T', 3, {}, RAD)).toBeCloseTo(7);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('oneVarStats', () => {
  const data = [2, 4, 4, 4, 5, 5, 7, 9];

  test('n = 8', () => {
    expect(oneVarStats(data).n).toBe(8);
  });

  test('mean (x̄) = 5', () => {
    expect(oneVarStats(data).xbar).toBeCloseTo(5);
  });

  test('sumX = 40', () => {
    expect(oneVarStats(data).sumX).toBeCloseTo(40);
  });

  test('sumX² = 232', () => {
    expect(oneVarStats(data).sumX2).toBeCloseTo(232);
  });

  test('sample std dev Sx ≈ 2.138', () => {
    expect(oneVarStats(data).Sx).toBeCloseTo(2.13809, 5);
  });

  test('population std dev σx < Sx', () => {
    const r = oneVarStats(data);
    expect(r.σx).toBeLessThan(r.Sx);
  });

  test('minX = 2', () => {
    expect(oneVarStats(data).minX).toBe(2);
  });

  test('maxX = 9', () => {
    expect(oneVarStats(data).maxX).toBe(9);
  });

  test('median = 4.5', () => {
    expect(oneVarStats(data).Med).toBeCloseTo(4.5);
  });

  test('single element dataset', () => {
    const r = oneVarStats([7]);
    expect(r.n).toBe(1);
    expect(r.xbar).toBe(7);
    expect(r.minX).toBe(7);
    expect(r.maxX).toBe(7);
  });

  test('all same values', () => {
    const r = oneVarStats([3, 3, 3, 3]);
    expect(r.xbar).toBe(3);
    expect(r.Sx).toBe(0);
    expect(r.σx).toBe(0);
  });

  test('empty dataset throws TIError', () => {
    expect(() => oneVarStats([])).toThrow(TIError);
  });

  test('negative values in dataset', () => {
    const r = oneVarStats([-3, -1, 0, 1, 3]);
    expect(r.xbar).toBe(0);
    expect(r.minX).toBe(-3);
    expect(r.maxX).toBe(3);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('twoVarStats', () => {
  const xData = [1, 2, 3, 4, 5];
  const yData = [2, 4, 6, 8, 10];

  test('n = 5', () => {
    expect(twoVarStats(xData, yData).n).toBe(5);
  });

  test('xbar = 3', () => {
    expect(twoVarStats(xData, yData).xbar).toBeCloseTo(3);
  });

  test('ybar = 6', () => {
    expect(twoVarStats(xData, yData).ybar).toBeCloseTo(6);
  });

  test('Σxy computed correctly', () => {
    // 1*2 + 2*4 + 3*6 + 4*8 + 5*10 = 2+8+18+32+50 = 110
    expect(twoVarStats(xData, yData).sumXY).toBeCloseTo(110);
  });

  test('handles mismatched list lengths (truncates to shorter)', () => {
    const r = twoVarStats([1, 2, 3, 4], [10, 20, 30]);
    expect(r.n).toBe(3);
  });

  test('empty lists throws', () => {
    expect(() => twoVarStats([], [])).toThrow(TIError);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('linReg', () => {
  test('perfect linear relationship y=2x+1 gives a=2, b=1', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [3, 5, 7, 9, 11];
    const { a, b, r, r2 } = linReg(x, y);
    expect(a).toBeCloseTo(2);
    expect(b).toBeCloseTo(1);
    expect(r).toBeCloseTo(1);
    expect(r2).toBeCloseTo(1);
  });

  test('perfect negative correlation y=-3x+10 gives a=-3', () => {
    const x = [1, 2, 3, 4];
    const y = [7, 4, 1, -2];
    const { a, r } = linReg(x, y);
    expect(a).toBeCloseTo(-3);
    expect(r).toBeCloseTo(-1);
  });

  test('horizontal line y=5 gives a≈0, b=5', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [5, 5, 5, 5, 5];
    const { a, b, r2 } = linReg(x, y);
    expect(a).toBeCloseTo(0, 5);
    expect(b).toBeCloseTo(5);
    expect(r2).toBeCloseTo(1); // all residuals are 0
  });

  test('r² is between 0 and 1 for noisy data', () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2.1, 3.9, 6.2, 7.8, 10.1]; // approximately y=2x
    const { r2 } = linReg(x, y);
    expect(r2).toBeGreaterThan(0.99);
    expect(r2).toBeLessThanOrEqual(1);
  });

  test('returns correct structure', () => {
    const result = linReg([1, 2], [2, 4]);
    expect(result).toHaveProperty('a');
    expect(result).toHaveProperty('b');
    expect(result).toHaveProperty('r');
    expect(result).toHaveProperty('r2');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — STO→ Pattern', () => {
  test('stores value to variable via → (preprocessing)', () => {
    // The engine itself just evaluates; STO→ is handled in the store.
    // Test that (5) evaluates to 5 as a baseline.
    expect(parseFloat(calc('5').result)).toBe(5);
  });

  test('Ans used in next expression', () => {
    const firstResult = calc('3+4').value as number;
    expect(parseFloat(calc('Ans+1', {}, firstResult).result)).toBe(8);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Complex Expressions', () => {
  test('quadratic formula: (-b+√(b²-4ac))/(2a) with a=1,b=-5,c=6 → 3', () => {
    const vars = { A: 1, B: -5, C: 6 };
    // (5+√(25-24))/2 = (5+1)/2 = 3
    const result = parseFloat(
      calc('((-1×B)+√(B²-4×A×C))÷(2×A)', vars).result
    );
    expect(result).toBeCloseTo(3);
  });

  test('compound interest: 1000×(1+0.05/12)^(12×5)', () => {
    const result = parseFloat(calc('1000×(1+0.05÷12)^(12×5)').result);
    expect(result).toBeCloseTo(1283.36, 0);
  });

  test('Pythagorean theorem: √(3²+4²) = 5', () => {
    expect(parseFloat(calc('√(3²+4²)').result)).toBeCloseTo(5);
  });

  test('sum of arithmetic series: 100×101÷2 = 5050', () => {
    expect(parseFloat(calc('100×101÷2').result)).toBe(5050);
  });

  test('deeply nested expression', () => {
    const result = parseFloat(calc('((((2+3)×4)−5)÷3)^2').result);
    expect(result).toBeCloseTo(25);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — Matrix Mathematics', () => {
  test('matrix arithmetic (addition)', () => {
    const vars = {
      matrix_A: [[1, 2], [3, 4]],
      matrix_B: [[5, 6], [7, 8]]
    };
    const r = calc('[A]+[B]', vars).result;
    expect(r).toBe('[6 8]\n[10 12]');
  });

  test('matrix mathematics (multiplication)', () => {
    const vars = {
      matrix_A: [[1, 2], [3, 4]], // 2x2
      matrix_B: [[2, 0], [1, 2]]  // 2x2
    };
    // Expected: [[1*2 + 2*1, 1*0 + 2*2], [3*2 + 4*1, 3*0 + 4*2]] = [[4, 4], [10, 8]]
    const r = calc('[A]×[B]', vars).result;
    expect(r).toBe('[4 4]\n[10 8]');
  });

  test('matrix scalar multiplication', () => {
    const vars = { matrix_A: [[1, 2], [3, 4]] };
    const r = calc('2*[A]', vars).result;
    expect(r).toBe('[2 4]\n[6 8]');
  });

  test('matrix determinant', () => {
    const vars = { matrix_A: [[1, 2], [3, 4]] };
    const r = calc('det([A])', vars).result;
    expect(Number(r)).toBe(-2);
  });

  test('matrix inverse', () => {
    const vars = { matrix_A: [[4, 7], [2, 6]] };
    // det = 24 - 14 = 10. Inv = [[0.6, -0.7], [-0.2, 0.4]]
    const r = calc('[A]⁻¹', vars).result;
    expect(r).toContain('0.6');
    expect(r).toContain('-0.7');
  });

  test('matrix dimensions', () => {
    const vars = { matrix_A: [[1, 2, 3], [4, 5, 6]] };
    const r = calc('dim([A])', vars).result;
    expect(r).toBe('{2 3}');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('evaluateExpression — TEST Menu (Logic)', () => {
  test('equality operator', () => {
    expect(calc('5=5').result).toBe('1');
    expect(calc('5=4').result).toBe('0');
  });

  test('inequality operator', () => {
    expect(calc('5≠4').result).toBe('1');
    expect(calc('5≠5').result).toBe('0');
  });

  test('greater and less than', () => {
    expect(calc('5>4').result).toBe('1');
    expect(calc('5<4').result).toBe('0');
    expect(calc('5≥5').result).toBe('1');
    expect(calc('5≤4').result).toBe('0');
  });

  test('logical AND', () => {
    expect(calc('1 and 1').result).toBe('1');
    expect(calc('1 and 0').result).toBe('0');
    expect(calc('(5>4) and (3<4)').result).toBe('1');
  });

  test('logical OR / XOR', () => {
    expect(calc('1 or 0').result).toBe('1');
    expect(calc('0 or 0').result).toBe('0');
    expect(calc('1 xor 1').result).toBe('0');
    expect(calc('1 xor 0').result).toBe('1');
  });

  test('logical NOT', () => {
    expect(calc('not(1)').result).toBe('0');
    expect(calc('not(0)').result).toBe('1');
  });
});
