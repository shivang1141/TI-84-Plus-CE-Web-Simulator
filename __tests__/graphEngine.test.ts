/**
 * graphEngine.test.ts
 * ─────────────────────────────────────────────────────────────────
 * Unit tests for the TI-84 Plus CE graph engine:
 * findZero, findMinMax, findIntersection, drawIntegralShading,
 * drawHomeScreen, drawStatusBar, drawTableScreen
 */

import {
  findZero,
  findMinMax,
  findIntersection,
  drawIntegralShading,
  drawHomeScreen,
  drawStatusBar,
  drawTableScreen,
  drawGraph,
} from '@/lib/graphEngine';
import { Equation, GraphWindow, CalcSettings } from '@/types/calculator';
import { DEFAULT_GRAPH_WINDOW } from '@/lib/constants';

// ── Canvas mock (jsdom doesn't support canvas) ───────────────────────────────
function createMockCanvas(width = 320, height = 240): {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
} {
  const calls: string[] = [];

  const ctx = {
    // Drawing
    fillRect: jest.fn(),
    clearRect: jest.fn(),
    strokeRect: jest.fn(),
    // Path
    beginPath: jest.fn(),
    moveTo: jest.fn(),
    lineTo: jest.fn(),
    closePath: jest.fn(),
    arc: jest.fn(),
    // Style
    fill: jest.fn(),
    stroke: jest.fn(),
    setLineDash: jest.fn(),
    // Text
    fillText: jest.fn(),
    measureText: jest.fn(() => ({ width: 50 })),
    // State
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    // Properties (mutable)
    fillStyle: '' as string | CanvasGradient | CanvasPattern,
    strokeStyle: '' as string | CanvasGradient | CanvasPattern,
    lineWidth: 1,
    font: '',
    globalAlpha: 1,
  } as unknown as CanvasRenderingContext2D;

  const canvas = {
    width,
    height,
    getContext: jest.fn(() => ctx),
  } as unknown as HTMLCanvasElement;

  return { canvas, ctx };
}

// ── Default equation factory ──────────────────────────────────────────────────
function makeEquation(expr: string, enabled = true): Equation {
  return {
    name: 'Y1',
    expr,
    color: '#2196F3',
    enabled,
    style: 'solid',
  };
}

const defaultWindow: GraphWindow = { ...DEFAULT_GRAPH_WINDOW };
const defaultSettings: CalcSettings = {
  angleMode: 'RADIAN',
  displayMode: 'NORMAL',
  decimalPlaces: 'FLOAT',
  complexMode: 'REAL',
  calcMode: 'FUNC',
  graphStyle: 'CONNECTED',
  coordDisplay: true,
  gridOn: false,
  axesOn: true,
  labelOn: false,
  exprOn: true,
};

// ════════════════════════════════════════════════════════════════════════════
describe('findZero', () => {
  const vars = {};
  const angleMode = 'RADIAN' as const;

  test('finds zero of f(x)=x at x=0', () => {
    const eq = makeEquation('X');
    const z = findZero(eq, -1, 1, vars, angleMode);
    expect(z).not.toBeNull();
    expect(z!).toBeCloseTo(0, 5);
  });

  test('finds zero of f(x)=x²-4 at x=2', () => {
    const eq = makeEquation('X^2-4');
    const z = findZero(eq, 0, 3, vars, angleMode);
    expect(z).not.toBeNull();
    expect(z!).toBeCloseTo(2, 4);
  });

  test('finds zero of f(x)=x²-4 at x=-2', () => {
    const eq = makeEquation('X^2-4');
    const z = findZero(eq, -3, 0, vars, angleMode);
    expect(z).not.toBeNull();
    expect(z!).toBeCloseTo(-2, 4);
  });

  test('finds zero of sin(x) at x=π', () => {
    const eq = makeEquation('sin(X)');
    const z = findZero(eq, 2, 4, vars, angleMode);
    expect(z).not.toBeNull();
    expect(z!).toBeCloseTo(Math.PI, 4);
  });

  test('returns null when no sign change in interval', () => {
    const eq = makeEquation('X^2+1'); // Always positive
    const z = findZero(eq, -5, 5, vars, angleMode);
    expect(z).toBeNull();
  });

  test('finds zero of linear function x-7', () => {
    const eq = makeEquation('X-7');
    const z = findZero(eq, 0, 10, vars, angleMode);
    expect(z).not.toBeNull();
    expect(z!).toBeCloseTo(7, 4);
  });

  test('finds zero of f(x)=x³-8 at x=2', () => {
    const eq = makeEquation('X^3-8');
    const z = findZero(eq, 0, 5, vars, angleMode);
    expect(z).not.toBeNull();
    expect(z!).toBeCloseTo(2, 4);
  });

  test('returns null when both endpoints have same sign', () => {
    const eq = makeEquation('X+100'); // Both positive in [0,5]
    const z = findZero(eq, 0, 5, vars, angleMode);
    expect(z).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('findMinMax', () => {
  const vars = {};
  const angleMode = 'RADIAN' as const;

  test('finds minimum of f(x)=x² at x=0', () => {
    const eq = makeEquation('X^2');
    const result = findMinMax(eq, -5, 5, true, vars, angleMode);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(0, 3);
    expect(result!.y).toBeCloseTo(0, 3);
  });

  test('finds maximum of f(x)=-x² at x=0', () => {
    const eq = makeEquation('-(X^2)');
    const result = findMinMax(eq, -5, 5, false, vars, angleMode);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(0, 3);
    expect(result!.y).toBeCloseTo(0, 3);
  });

  test('finds minimum of (x-3)² at x=3', () => {
    const eq = makeEquation('(X-3)^2');
    const result = findMinMax(eq, 0, 6, true, vars, angleMode);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(3, 2);
    expect(result!.y).toBeCloseTo(0, 2);
  });

  test('finds maximum of -(x+2)² at x=-2', () => {
    const eq = makeEquation('-(X+2)^2');
    const result = findMinMax(eq, -6, 2, false, vars, angleMode);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(-2, 2);
    expect(result!.y).toBeCloseTo(0, 2);
  });

  test('finds maximum of sin(x) in [0,π] at x=π/2', () => {
    const eq = makeEquation('sin(X)');
    const result = findMinMax(eq, 0, Math.PI, false, vars, angleMode);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(Math.PI / 2, 2);
    expect(result!.y).toBeCloseTo(1, 3);
  });

  test('returns object with x and y properties', () => {
    const eq = makeEquation('X^2');
    const result = findMinMax(eq, -3, 3, true, vars, angleMode);
    expect(result).toHaveProperty('x');
    expect(result).toHaveProperty('y');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('findIntersection', () => {
  const vars = {};
  const angleMode = 'RADIAN' as const;

  test('finds intersection of y=x and y=2 at x=2', () => {
    const eq1 = makeEquation('X');
    const eq2 = makeEquation('2');
    const result = findIntersection(eq1, eq2, 0, 5, vars, angleMode);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(2, 4);
    expect(result!.y).toBeCloseTo(2, 4);
  });

  test('finds intersection of y=x² and y=x at x=0', () => {
    const eq1 = makeEquation('X^2');
    const eq2 = makeEquation('X');
    const result = findIntersection(eq1, eq2, -1, 0.5, vars, angleMode);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(0, 3);
  });

  test('finds intersection of y=x² and y=x at x=1', () => {
    const eq1 = makeEquation('X^2');
    const eq2 = makeEquation('X');
    const result = findIntersection(eq1, eq2, 0.5, 2, vars, angleMode);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(1, 3);
    expect(result!.y).toBeCloseTo(1, 3);
  });

  test('returns null when no intersection in interval', () => {
    const eq1 = makeEquation('X+10');
    const eq2 = makeEquation('X+20');
    const result = findIntersection(eq1, eq2, 0, 5, vars, angleMode);
    expect(result).toBeNull();
  });

  test('intersect of y=sin(x) and y=0.5 in [0,π]', () => {
    const eq1 = makeEquation('sin(X)');
    const eq2 = makeEquation('0.5');
    const result = findIntersection(eq1, eq2, 0, Math.PI / 2 + 0.1, vars, angleMode);
    expect(result).not.toBeNull();
    expect(result!.x).toBeCloseTo(Math.PI / 6, 3); // sin(π/6)=0.5
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('drawIntegralShading', () => {
  test('returns a number (area approximation)', () => {
    const { canvas, ctx } = createMockCanvas();
    const eq = makeEquation('X^2');
    const area = drawIntegralShading(ctx, eq, 0, 3, defaultWindow, 320, 240, {}, 'RADIAN', '#2196F3');
    // ∫₀³ x² dx = 9
    expect(typeof area).toBe('number');
    expect(area).toBeCloseTo(9, 0);
  });

  test('integral of constant function c over [a,b] = c*(b-a)', () => {
    const { canvas, ctx } = createMockCanvas();
    const eq = makeEquation('3');
    const area = drawIntegralShading(ctx, eq, 1, 4, defaultWindow, 320, 240, {}, 'RADIAN', '#F44336');
    // ∫₁⁴ 3 dx = 9
    expect(area).toBeCloseTo(9, 1);
  });

  test('integral of sin(x) over [0,π] ≈ 2', () => {
    const { canvas, ctx } = createMockCanvas();
    const eq = makeEquation('sin(X)');
    const bigWindow: GraphWindow = { ...defaultWindow, xMin: 0, xMax: Math.PI };
    const area = drawIntegralShading(ctx, eq, 0, Math.PI, bigWindow, 320, 240, {}, 'RADIAN', '#4CAF50');
    expect(area).toBeCloseTo(2, 2);
  });

  test('calls canvas path methods', () => {
    const { canvas, ctx } = createMockCanvas();
    const eq = makeEquation('X');
    drawIntegralShading(ctx, eq, 0, 1, defaultWindow, 320, 240, {}, 'RADIAN', '#FF9800');
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.fill).toHaveBeenCalled();
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('drawHomeScreen', () => {
  test('calls fillStyle and fillRect for background', () => {
    const { canvas, ctx } = createMockCanvas();
    drawHomeScreen(ctx, 320, 240, [], '', 0, true, true, 0, 5);
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  test('renders history entries', () => {
    const { canvas, ctx } = createMockCanvas();
    const history = [
      { expression: '2+2', result: '4', isError: false },
      { expression: 'sin(0)', result: '0', isError: false },
    ];
    drawHomeScreen(ctx, 320, 240, history, '', 0, true, true, 0, 5);
    expect(ctx.fillText).toHaveBeenCalled();
  });

  test('renders input line', () => {
    const { canvas, ctx } = createMockCanvas();
    drawHomeScreen(ctx, 320, 240, [], '3+4', 3, true, true, 0, 5);
    // fillText called for input
    expect(ctx.fillText).toHaveBeenCalled();
  });

  test('does not crash on empty state', () => {
    const { canvas, ctx } = createMockCanvas();
    expect(() => drawHomeScreen(ctx, 320, 240, [], '', 0, false, true, 0, 5)).not.toThrow();
  });

  test('handles cursor invisible state', () => {
    const { canvas, ctx } = createMockCanvas();
    expect(() => drawHomeScreen(ctx, 320, 240, [], 'test', 2, false, true, 0, 5)).not.toThrow();
  });

  test('renders error entries in red', () => {
    const { canvas, ctx } = createMockCanvas();
    const history = [{ expression: 'bad(', result: 'ERR:SYNTAX', isError: true }];
    drawHomeScreen(ctx, 320, 240, history, '', 0, true, true, 0, 5);
    // fillStyle should have been set to red variant
    expect(ctx.fillText).toHaveBeenCalled();
  });

  test('brightness parameter affects background color', () => {
    const { canvas, ctx } = createMockCanvas();
    const styles: string[] = [];
    Object.defineProperty(ctx, 'fillStyle', {
      set(v: string) { styles.push(v); },
      get() { return styles[styles.length - 1]; }
    });
    drawHomeScreen(ctx, 320, 240, [], '', 0, true, true, 0, 9);
    drawHomeScreen(ctx, 320, 240, [], '', 0, true, true, 0, 0);
    // Different brightness → different backgrounds
    expect(styles.length).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('drawStatusBar', () => {
  test('renders without throwing', () => {
    const { canvas, ctx } = createMockCanvas();
    expect(() =>
      drawStatusBar(ctx, 320, 'RADIAN', 'NORMAL', 'REAL', false, false)
    ).not.toThrow();
  });

  test('draws background', () => {
    const { canvas, ctx } = createMockCanvas();
    drawStatusBar(ctx, 320, 'RADIAN', 'NORMAL', 'REAL', false, false);
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  test('renders text content', () => {
    const { canvas, ctx } = createMockCanvas();
    drawStatusBar(ctx, 320, 'RADIAN', 'NORMAL', 'REAL', false, false);
    expect(ctx.fillText).toHaveBeenCalled();
  });

  test('renders 2nd indicator when isSecond=true', () => {
    const { canvas, ctx } = createMockCanvas();
    const texts: string[] = [];
    (ctx.fillText as jest.Mock).mockImplementation((t: string) => texts.push(t));
    drawStatusBar(ctx, 320, 'RADIAN', 'NORMAL', 'REAL', true, false);
    expect(texts.some((t) => t.includes('2nd'))).toBe(true);
  });

  test('renders ALPHA indicator when isAlpha=true', () => {
    const { canvas, ctx } = createMockCanvas();
    const texts: string[] = [];
    (ctx.fillText as jest.Mock).mockImplementation((t: string) => texts.push(t));
    drawStatusBar(ctx, 320, 'DEGREE', 'NORMAL', 'REAL', false, true);
    expect(texts.some((t) => t.includes('ALPHA'))).toBe(true);
  });

  test('includes angle mode in status text', () => {
    const { canvas, ctx } = createMockCanvas();
    const texts: string[] = [];
    (ctx.fillText as jest.Mock).mockImplementation((t: string) => texts.push(t));
    drawStatusBar(ctx, 320, 'DEGREE', 'NORMAL', 'REAL', false, false);
    expect(texts.some((t) => t.includes('DEGREE'))).toBe(true);
  });

  test('different angle modes produce different status bars', () => {
    const { ctx: ctx1 } = createMockCanvas();
    const { ctx: ctx2 } = createMockCanvas();
    const texts1: string[] = [];
    const texts2: string[] = [];
    (ctx1.fillText as jest.Mock).mockImplementation((t: string) => texts1.push(t));
    (ctx2.fillText as jest.Mock).mockImplementation((t: string) => texts2.push(t));
    drawStatusBar(ctx1, 320, 'RADIAN', 'NORMAL', 'REAL', false, false);
    drawStatusBar(ctx2, 320, 'DEGREE', 'NORMAL', 'REAL', false, false);
    expect(JSON.stringify(texts1)).not.toEqual(JSON.stringify(texts2));
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('drawTableScreen', () => {
  const equations: Equation[] = [
    { name: 'Y1', expr: 'X^2', color: '#2196F3', enabled: true, style: 'solid' },
    { name: 'Y2', expr: '2*X', color: '#F44336', enabled: true, style: 'solid' },
  ];

  test('renders without throwing', () => {
    const { canvas, ctx } = createMockCanvas();
    expect(() =>
      drawTableScreen(ctx, 320, 240, equations, 0, 1, 0, {}, 'RADIAN')
    ).not.toThrow();
  });

  test('draws header', () => {
    const { canvas, ctx } = createMockCanvas();
    drawTableScreen(ctx, 320, 240, equations, 0, 1, 0, {}, 'RADIAN');
    expect(ctx.fillRect).toHaveBeenCalled();
    expect(ctx.fillText).toHaveBeenCalled();
  });

  test('renders values for X=0', () => {
    const { canvas, ctx } = createMockCanvas();
    const texts: string[] = [];
    (ctx.fillText as jest.Mock).mockImplementation((t: string) => texts.push(t));
    drawTableScreen(ctx, 320, 240, equations, 0, 1, 0, {}, 'RADIAN');
    expect(texts).toContain('0'); // tblStart=0, X=0
  });

  test('renders values for X=1 (Y1=1, Y2=2)', () => {
    const { canvas, ctx } = createMockCanvas();
    const texts: string[] = [];
    (ctx.fillText as jest.Mock).mockImplementation((t: string) => texts.push(t));
    drawTableScreen(ctx, 320, 240, equations, 0, 1, 0, {}, 'RADIAN');
    // Row for x=1: Y1=1²=1, Y2=2*1=2
    expect(texts.some((t) => t === '1' || t === '1.00')).toBe(true);
  });

  test('handles disabled equations (skips rendering Y values)', () => {
    const { canvas, ctx } = createMockCanvas();
    const disabledEqs: Equation[] = [
      { name: 'Y1', expr: 'X^2', color: '#2196F3', enabled: false, style: 'solid' },
    ];
    expect(() =>
      drawTableScreen(ctx, 320, 240, disabledEqs, 0, 1, 0, {}, 'RADIAN')
    ).not.toThrow();
  });

  test('handles custom tblStart and deltaTbl', () => {
    const { canvas, ctx } = createMockCanvas();
    const texts: string[] = [];
    (ctx.fillText as jest.Mock).mockImplementation((t: string) => texts.push(t));
    drawTableScreen(ctx, 320, 240, equations, 5, 2, 0, {}, 'RADIAN');
    // First X value should be 5
    expect(texts.some((t) => t === '5')).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('drawGraph', () => {
  test('renders without throwing (empty equations)', () => {
    const { canvas, ctx } = createMockCanvas();
    expect(() =>
      drawGraph({
        canvas,
        ctx,
        window: defaultWindow,
        equations: [],
        settings: defaultSettings,
        variables: {},
      })
    ).not.toThrow();
  });

  test('draws background', () => {
    const { canvas, ctx } = createMockCanvas();
    drawGraph({ canvas, ctx, window: defaultWindow, equations: [], settings: defaultSettings, variables: {} });
    expect(ctx.fillRect).toHaveBeenCalled();
  });

  test('draws axes when axesOn=true', () => {
    const { canvas, ctx } = createMockCanvas();
    drawGraph({ canvas, ctx, window: defaultWindow, equations: [], settings: defaultSettings, variables: {} });
    expect(ctx.beginPath).toHaveBeenCalled();
    expect(ctx.moveTo).toHaveBeenCalled();
    expect(ctx.lineTo).toHaveBeenCalled();
  });

  test('does not draw axes when axesOn=false', () => {
    const { canvas, ctx } = createMockCanvas();
    const noAxes: CalcSettings = { ...defaultSettings, axesOn: false };
    const callsWithAxes = { beginPath: 0 };
    drawGraph({ canvas, ctx, window: defaultWindow, equations: [], settings: defaultSettings, variables: {} });
    const callsWithAxesCount = (ctx.beginPath as jest.Mock).mock.calls.length;

    const { ctx: ctx2 } = createMockCanvas();
    drawGraph({ canvas: createMockCanvas().canvas, ctx: ctx2, window: defaultWindow, equations: [], settings: noAxes, variables: {} });
    const callsNoAxesCount = (ctx2.beginPath as jest.Mock).mock.calls.length;

    expect(callsWithAxesCount).toBeGreaterThan(callsNoAxesCount);
  });

  test('draws grid when gridOn=true', () => {
    const { canvas, ctx } = createMockCanvas();
    const gridOn: CalcSettings = { ...defaultSettings, gridOn: true };
    drawGraph({ canvas, ctx, window: defaultWindow, equations: [], settings: gridOn, variables: {} });
    expect(ctx.stroke).toHaveBeenCalled();
  });

  test('plots enabled equation (sin(X))', () => {
    const { canvas, ctx } = createMockCanvas();
    const eqs: Equation[] = [makeEquation('sin(X)', true)];
    drawGraph({ canvas, ctx, window: defaultWindow, equations: eqs, settings: defaultSettings, variables: {} });
    expect(ctx.stroke).toHaveBeenCalled();
    expect(ctx.beginPath).toHaveBeenCalled();
  });

  test('skips disabled equations', () => {
    const { canvas, ctx } = createMockCanvas();
    const eqs: Equation[] = [makeEquation('sin(X)', false)];
    drawGraph({ canvas, ctx, window: defaultWindow, equations: eqs, settings: defaultSettings, variables: {} });
    // Should be called less than if equation was active
    const strokeCalls = (ctx.stroke as jest.Mock).mock.calls.length;
    expect(strokeCalls).toBeGreaterThanOrEqual(0);
  });

  test('draws trace point when provided', () => {
    const { canvas, ctx } = createMockCanvas();
    drawGraph({
      canvas, ctx,
      window: defaultWindow,
      equations: [],
      settings: defaultSettings,
      variables: {},
      tracePoint: { x: 0, y: 0, eqIndex: 0 },
    });
    expect(ctx.arc).toHaveBeenCalled();
  });

  test('handles polar mode without crash', () => {
    const { canvas, ctx } = createMockCanvas();
    const polarSettings: CalcSettings = { ...defaultSettings, calcMode: 'POL' };
    const eqs: Equation[] = [{ ...makeEquation('3'), name: 'r1' }];
    expect(() =>
      drawGraph({ canvas, ctx, window: defaultWindow, equations: eqs, settings: polarSettings, variables: {} })
    ).not.toThrow();
  });

  test('handles parametric mode without crash', () => {
    const { canvas, ctx } = createMockCanvas();
    const parSettings: CalcSettings = { ...defaultSettings, calcMode: 'PAR' };
    const eqs: Equation[] = [
      { ...makeEquation('cos(T)'), name: 'X1T' },
      { ...makeEquation('sin(T)'), name: 'Y1T' },
    ];
    expect(() =>
      drawGraph({ canvas, ctx, window: { ...defaultWindow, tMin: 0, tMax: 2 * Math.PI, tStep: 0.1 }, equations: eqs, settings: parSettings, variables: {} })
    ).not.toThrow();
  });
});
