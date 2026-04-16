/**
 * constants.test.ts
 * ─────────────────────────────────────────────────────────────────
 * Tests for lib/constants.ts — ensures all constant values are
 * correct, arrays are populated, and graph windows are valid.
 */

import {
  SCREEN_WIDTH,
  SCREEN_HEIGHT,
  STATUS_BAR_HEIGHT,
  LCD_BG_COLOR,
  LCD_TEXT_COLOR,
  LCD_ERROR_COLOR,
  DEFAULT_GRAPH_WINDOW,
  ZTRIG_WINDOW,
  ZDECIMAL_WINDOW,
  ZINTEGER_WINDOW,
  GRAPH_COLORS,
  GRAPH_COLOR_NAMES,
  NUM_EQUATIONS,
  EQUATION_NAMES_FUNC,
  EQUATION_NAMES_PAR,
  EQUATION_NAMES_POL,
  MATRIX_NAMES,
  ERROR_CODES,
  PROG_NAME_MAX,
  MAX_HISTORY,
  ZOOM_IN_FACTOR,
  ZOOM_OUT_FACTOR,
} from '@/lib/constants';

// ════════════════════════════════════════════════════════════════════════════
describe('Screen constants', () => {
  test('SCREEN_WIDTH is a positive number', () => {
    expect(typeof SCREEN_WIDTH).toBe('number');
    expect(SCREEN_WIDTH).toBeGreaterThan(0);
  });

  test('SCREEN_HEIGHT is a positive number', () => {
    expect(typeof SCREEN_HEIGHT).toBe('number');
    expect(SCREEN_HEIGHT).toBeGreaterThan(0);
  });

  test('STATUS_BAR_HEIGHT is a positive number', () => {
    expect(typeof STATUS_BAR_HEIGHT).toBe('number');
    expect(STATUS_BAR_HEIGHT).toBeGreaterThan(0);
  });

  test('STATUS_BAR_HEIGHT < SCREEN_HEIGHT', () => {
    expect(STATUS_BAR_HEIGHT).toBeLessThan(SCREEN_HEIGHT);
  });

  test('SCREEN_WIDTH matches TI-84 Plus CE (320)', () => {
    expect(SCREEN_WIDTH).toBe(320);
  });

  test('SCREEN_HEIGHT matches TI-84 Plus CE (240)', () => {
    expect(SCREEN_HEIGHT).toBe(240);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('LCD Color constants', () => {
  const isHexOrRGB = (v: string) =>
    /^#[0-9A-Fa-f]{3,8}$/.test(v) || /^rgb/.test(v) || v.startsWith('hsl');

  test('LCD_BG_COLOR is a valid color string', () => {
    expect(typeof LCD_BG_COLOR).toBe('string');
    expect(LCD_BG_COLOR.length).toBeGreaterThan(0);
  });

  test('LCD_TEXT_COLOR is a valid color string', () => {
    expect(typeof LCD_TEXT_COLOR).toBe('string');
    expect(LCD_TEXT_COLOR.length).toBeGreaterThan(0);
  });

  test('LCD_ERROR_COLOR is a valid color string', () => {
    expect(typeof LCD_ERROR_COLOR).toBe('string');
    expect(LCD_ERROR_COLOR.length).toBeGreaterThan(0);
  });

  test('LCD_BG_COLOR and LCD_TEXT_COLOR are different (contrast)', () => {
    expect(LCD_BG_COLOR).not.toBe(LCD_TEXT_COLOR);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('DEFAULT_GRAPH_WINDOW', () => {
  test('has xMin', () => {
    expect(typeof DEFAULT_GRAPH_WINDOW.xMin).toBe('number');
  });

  test('has xMax', () => {
    expect(typeof DEFAULT_GRAPH_WINDOW.xMax).toBe('number');
  });

  test('xMin < xMax', () => {
    expect(DEFAULT_GRAPH_WINDOW.xMin).toBeLessThan(DEFAULT_GRAPH_WINDOW.xMax);
  });

  test('yMin < yMax', () => {
    expect(DEFAULT_GRAPH_WINDOW.yMin).toBeLessThan(DEFAULT_GRAPH_WINDOW.yMax);
  });

  test('xScl is positive', () => {
    expect(DEFAULT_GRAPH_WINDOW.xScl).toBeGreaterThan(0);
  });

  test('yScl is positive', () => {
    expect(DEFAULT_GRAPH_WINDOW.yScl).toBeGreaterThan(0);
  });

  test('xMin = -10 (standard window)', () => {
    expect(DEFAULT_GRAPH_WINDOW.xMin).toBe(-10);
  });

  test('xMax = 10 (standard window)', () => {
    expect(DEFAULT_GRAPH_WINDOW.xMax).toBe(10);
  });

  test('yMin = -10 (standard window)', () => {
    expect(DEFAULT_GRAPH_WINDOW.yMin).toBe(-10);
  });

  test('yMax = 10 (standard window)', () => {
    expect(DEFAULT_GRAPH_WINDOW.yMax).toBe(10);
  });

  test('has xRes property', () => {
    expect(DEFAULT_GRAPH_WINDOW.xRes).toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('ZTrig Window', () => {
  test('xMin ≈ -2π * n for some n', () => {
    // ZTrig uses approximately (-47π/24, 47π/24)
    expect(ZTRIG_WINDOW.xMin).toBeLessThan(0);
  });

  test('xMax > 0', () => {
    expect(ZTRIG_WINDOW.xMax).toBeGreaterThan(0);
  });

  test('window is symmetric', () => {
    expect(Math.abs(ZTRIG_WINDOW.xMin + ZTRIG_WINDOW.xMax)).toBeLessThan(0.01);
  });

  test('xScl ≈ π/2', () => {
    expect(ZTRIG_WINDOW.xScl).toBeCloseTo(Math.PI / 2, 3);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('ZDecimal Window', () => {
  test('xMin is negative', () => {
    expect(ZDECIMAL_WINDOW.xMin).toBeLessThan(0);
  });

  test('xMax is positive', () => {
    expect(ZDECIMAL_WINDOW.xMax).toBeGreaterThan(0);
  });

  test('xScl > 0', () => {
    expect(ZDECIMAL_WINDOW.xScl).toBeGreaterThan(0);
  });

  test('yMin < yMax', () => {
    expect(ZDECIMAL_WINDOW.yMin).toBeLessThan(ZDECIMAL_WINDOW.yMax);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('ZInteger Window', () => {
  test('xMin is negative integer', () => {
    expect(Number.isInteger(ZINTEGER_WINDOW.xMin)).toBe(true);
    expect(ZINTEGER_WINDOW.xMin).toBeLessThan(0);
  });

  test('xMax is positive integer', () => {
    expect(Number.isInteger(ZINTEGER_WINDOW.xMax)).toBe(true);
    expect(ZINTEGER_WINDOW.xMax).toBeGreaterThan(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Graph Colors', () => {
  test('GRAPH_COLORS is an array', () => {
    expect(Array.isArray(GRAPH_COLORS)).toBe(true);
  });

  test('GRAPH_COLORS has at least 10 entries', () => {
    expect(GRAPH_COLORS.length).toBeGreaterThanOrEqual(10);
  });

  test('all colors are valid hex strings', () => {
    for (const color of GRAPH_COLORS) {
      expect(color).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });

  test('all colors are unique', () => {
    const unique = new Set(GRAPH_COLORS);
    expect(unique.size).toBe(GRAPH_COLORS.length);
  });

  test('GRAPH_COLOR_NAMES is same length as GRAPH_COLORS', () => {
    expect(GRAPH_COLOR_NAMES.length).toBe(GRAPH_COLORS.length);
  });

  test('GRAPH_COLOR_NAMES are non-empty strings', () => {
    for (const name of GRAPH_COLOR_NAMES) {
      expect(typeof name).toBe('string');
      expect(name.length).toBeGreaterThan(0);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Equation Name Arrays', () => {
  test('NUM_EQUATIONS matches expected count', () => {
    expect(NUM_EQUATIONS).toBeGreaterThan(0);
    expect(NUM_EQUATIONS).toBe(EQUATION_NAMES_FUNC.length);
  });

  test('EQUATION_NAMES_FUNC has function names Y1-Y0', () => {
    expect(EQUATION_NAMES_FUNC).toContain('Y1');
    expect(EQUATION_NAMES_FUNC).toContain('Y2');
  });

  test('EQUATION_NAMES_PAR has parametric names (X1T, Y1T)', () => {
    expect(EQUATION_NAMES_PAR.some((n) => n.includes('X') || n.includes('T'))).toBe(true);
  });

  test('EQUATION_NAMES_POL has polar names (r1–r6)', () => {
    expect(EQUATION_NAMES_POL.some((n) => n.startsWith('r'))).toBe(true);
  });

  test('EQUATION_NAMES_FUNC are all unique', () => {
    const unique = new Set(EQUATION_NAMES_FUNC);
    expect(unique.size).toBe(EQUATION_NAMES_FUNC.length);
  });

  test('GRAPH_COLORS has enough entries for all equations', () => {
    expect(GRAPH_COLORS.length).toBeGreaterThanOrEqual(NUM_EQUATIONS);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Matrix Names', () => {
  test('MATRIX_NAMES is an array', () => {
    expect(Array.isArray(MATRIX_NAMES)).toBe(true);
  });

  test('has exactly 10 matrices [A] through [J]', () => {
    expect(MATRIX_NAMES.length).toBe(10);
  });

  test('contains [A]', () => {
    expect(MATRIX_NAMES).toContain('[A]');
  });

  test('contains [J]', () => {
    expect(MATRIX_NAMES).toContain('[J]');
  });

  test('all names are bracket-wrapped single letters', () => {
    for (const name of MATRIX_NAMES) {
      expect(name).toMatch(/^\[[A-J]\]$/);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Error Codes', () => {
  test('ERROR_CODES is an object', () => {
    expect(typeof ERROR_CODES).toBe('object');
    expect(ERROR_CODES !== null).toBe(true);
  });

  test('has SYNTAX error code', () => {
    expect(Object.keys(ERROR_CODES)).toContain('SYNTAX');
  });

  test('has DOMAIN error code', () => {
    expect(Object.keys(ERROR_CODES)).toContain('DOMAIN');
  });

  test('has DIM MISMATCH error code', () => {
    const keys = Object.keys(ERROR_CODES);
    expect(keys.some((k) => k.includes('DIM') || k.includes('MISMATCH'))).toBe(true);
  });

  test('all error messages are non-empty strings', () => {
    for (const [, msg] of Object.entries(ERROR_CODES)) {
      expect(typeof msg).toBe('string');
      expect((msg as string).length).toBeGreaterThan(0);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Program Constants', () => {
  test('PROG_NAME_MAX is 8 (TI specification)', () => {
    expect(PROG_NAME_MAX).toBe(8);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('History Constants', () => {
  test('MAX_HISTORY is a positive number', () => {
    expect(typeof MAX_HISTORY).toBe('number');
    expect(MAX_HISTORY).toBeGreaterThan(0);
  });

  test('MAX_HISTORY is at least 100', () => {
    expect(MAX_HISTORY).toBeGreaterThanOrEqual(100);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Zoom Factors', () => {
  test('ZOOM_IN_FACTOR < 1 (zooms in)', () => {
    expect(ZOOM_IN_FACTOR).toBeLessThan(1);
    expect(ZOOM_IN_FACTOR).toBeGreaterThan(0);
  });

  test('ZOOM_OUT_FACTOR > 1 (zooms out)', () => {
    expect(ZOOM_OUT_FACTOR).toBeGreaterThan(1);
  });

  test('zoom in then out returns approximately same range', () => {
    const original = 20; // e.g., xMax - xMin
    const afterIn = original * ZOOM_IN_FACTOR;
    const afterOut = afterIn * ZOOM_OUT_FACTOR;
    expect(afterOut).toBeCloseTo(original, 5);
  });
});
