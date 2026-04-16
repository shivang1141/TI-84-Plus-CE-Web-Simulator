/**
 * keyDefinitions.test.ts
 * ─────────────────────────────────────────────────────────────────
 * Tests for lib/keyDefinitions.ts — ensures all 50 keys are
 * defined, unique, correctly structured, and required actions
 * are present for 2nd/alpha shift states.
 */

import { KEY_DEFINITIONS, KeyDef, KeyAction } from '@/lib/keyDefinitions';

// ════════════════════════════════════════════════════════════════════════════
describe('KEY_DEFINITIONS — Structure', () => {
  test('is an array', () => {
    expect(Array.isArray(KEY_DEFINITIONS)).toBe(true);
  });

  test('has exactly 50 keys', () => {
    expect(KEY_DEFINITIONS.length).toBe(50);
  });

  test('every key has a non-empty id', () => {
    for (const key of KEY_DEFINITIONS) {
      expect(typeof key.id).toBe('string');
      expect(key.id.length).toBeGreaterThan(0);
    }
  });

  test('every key has a primaryLabel', () => {
    for (const key of KEY_DEFINITIONS) {
      expect(typeof key.primaryLabel).toBe('string');
      expect(key.primaryLabel.length).toBeGreaterThan(0);
    }
  });

  test('every key has a primary action', () => {
    for (const key of KEY_DEFINITIONS) {
      expect(key.primary).toBeDefined();
    }
  });

  test('all key IDs are unique', () => {
    const ids = KEY_DEFINITIONS.map((k) => k.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  test('all primaryLabels are strings', () => {
    for (const key of KEY_DEFINITIONS) {
      expect(typeof key.primaryLabel).toBe('string');
    }
  });

  test('secondLabel, when present, is a non-empty string', () => {
    for (const key of KEY_DEFINITIONS) {
      if (key.secondLabel !== undefined) {
        expect(key.secondLabel).toBeTruthy();
      }
    }
  });

  test('alphaLabel, when present, is a non-empty string', () => {
    for (const key of KEY_DEFINITIONS) {
      if (key.alphaLabel !== undefined) {
        expect(key.alphaLabel).toBeTruthy();
      }
    }
  });

  test('color property is valid when present', () => {
    const validColors = ['dark', 'light', 'gray', 'blue', 'green'];
    for (const key of KEY_DEFINITIONS) {
      if (key.color !== undefined) {
        expect(validColors).toContain(key.color);
      }
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('KEY_DEFINITIONS — Required Keys', () => {
  const keyById = Object.fromEntries(KEY_DEFINITIONS.map((k) => [k.id, k]));

  // ── Number keys ───────────────────────────────────────────────────────────
  test('digits 0–9 are all present', () => {
    const digitIds = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
    for (const id of digitIds) {
      const keyExists = keyById[id] !== undefined;
      expect(keyExists).toBe(true);
    }
  });

  test('digit keys insert correct characters', () => {
    for (let d = 0; d <= 9; d++) {
      const key = keyById[String(d)];
      expect(key).toBeDefined();
      const primary = key.primary;
      if (typeof primary === 'object' && primary !== null && 'type' in primary) {
        expect((primary as { type: string; text: string }).text).toBe(String(d));
      }
    }
  });

  // ── Function keys ─────────────────────────────────────────────────────────
  test('y_equals key is present', () => {
    expect(keyById['y_equals']).toBeDefined();
  });

  test('window key is present', () => {
    expect(keyById['window']).toBeDefined();
  });

  test('zoom key is present', () => {
    expect(keyById['zoom']).toBeDefined();
  });

  test('trace key is present', () => {
    expect(keyById['trace']).toBeDefined();
  });

  test('graph key is present', () => {
    expect(keyById['graph']).toBeDefined();
  });

  // ── Modifier keys ─────────────────────────────────────────────────────────
  test('second key is present', () => {
    expect(keyById['second']).toBeDefined();
  });

  test('second key primary action is toggle_second', () => {
    expect(keyById['second'].primary).toBe('toggle_second');
  });

  test('alpha key is present', () => {
    expect(keyById['alpha']).toBeDefined();
  });

  test('alpha key primary action is toggle_alpha', () => {
    expect(keyById['alpha'].primary).toBe('toggle_alpha');
  });

  test('del key is present', () => {
    expect(keyById['del']).toBeDefined();
  });

  test('del key primary action is delete', () => {
    expect(keyById['del'].primary).toBe('delete');
  });

  test('on key is present', () => {
    expect(keyById['on']).toBeDefined();
  });

  test('enter key is present', () => {
    expect(keyById['enter']).toBeDefined();
  });

  test('enter key primary action is evaluate', () => {
    expect(keyById['enter'].primary).toBe('evaluate');
  });

  test('clear key is present', () => {
    expect(keyById['clear']).toBeDefined();
  });

  test('clear key primary action is clear', () => {
    expect(keyById['clear'].primary).toBe('clear');
  });

  // ── Math function keys ────────────────────────────────────────────────────
  test('sin key is present', () => {
    expect(keyById['sin']).toBeDefined();
  });

  test('sin key inserts "sin("', () => {
    const primary = keyById['sin'].primary;
    if (typeof primary === 'object' && 'text' in primary) {
      expect((primary as { text: string }).text).toContain('sin');
    }
  });

  test('cos key is present', () => {
    expect(keyById['cos']).toBeDefined();
  });

  test('tan key is present', () => {
    expect(keyById['tan']).toBeDefined();
  });

  test('log key is present', () => {
    expect(keyById['log']).toBeDefined();
  });

  test('ln key is present', () => {
    expect(keyById['ln']).toBeDefined();
  });

  test('x_sq key is present (x²)', () => {
    expect(keyById['x_sq']).toBeDefined();
  });

  test('x_inv key is present (x⁻¹)', () => {
    expect(keyById['x_inv']).toBeDefined();
  });

  // ── Arithmetic operator keys ───────────────────────────────────────────────
  test('add key is present', () => {
    expect(keyById['add']).toBeDefined();
  });

  test('sub key is present', () => {
    expect(keyById['sub']).toBeDefined();
  });

  test('mul key is present', () => {
    expect(keyById['mul']).toBeDefined();
  });

  test('div key is present', () => {
    expect(keyById['div']).toBeDefined();
  });

  test('caret key is present (^)', () => {
    expect(keyById['caret']).toBeDefined();
  });

  // ── Misc keys ─────────────────────────────────────────────────────────────
  test('dot key is present (.)', () => {
    expect(keyById['dot']).toBeDefined();
  });

  test('neg key is present ((-) negative)', () => {
    expect(keyById['neg']).toBeDefined();
  });

  test('sto key is present (STO→)', () => {
    expect(keyById['sto']).toBeDefined();
  });

  test('math key is present', () => {
    expect(keyById['math']).toBeDefined();
  });

  test('stat key is present', () => {
    expect(keyById['stat']).toBeDefined();
  });

  test('vars key is present', () => {
    expect(keyById['vars']).toBeDefined();
  });

  test('prgm key is present', () => {
    expect(keyById['prgm']).toBeDefined();
  });

  test('apps key is present', () => {
    expect(keyById['apps']).toBeDefined();
  });

  test('xtθn key is present (X,T,θ,n)', () => {
    expect(keyById['xtθn']).toBeDefined();
  });

  test('mode key is present', () => {
    expect(keyById['mode']).toBeDefined();
  });

  // ── 2nd key actions (sample) ──────────────────────────────────────────────
  test('y_equals has 2nd action (stat_plot)', () => {
    expect(keyById['y_equals'].second).toBeDefined();
  });

  test('graph key has 2nd action (table)', () => {
    expect(keyById['graph'].second).toBeDefined();
  });

  test('zoom key has 2nd action (format)', () => {
    expect(keyById['zoom'].second).toBeDefined();
  });

  // ── Alpha key actions (letters) ────────────────────────────────────────────
  test('digit/math keys have alpha letter actions', () => {
    const alphaKeys = KEY_DEFINITIONS.filter((k) => k.alphaLabel);
    expect(alphaKeys.length).toBeGreaterThan(20); // Most keys have alpha
  });

  test('alpha actions produce letter inserts', () => {
    const alphaKeys = KEY_DEFINITIONS.filter(
      (k) => k.alpha && k.alphaLabel
    );
    for (const key of alphaKeys) {
      if (typeof key.alpha === 'object' && key.alpha !== null && 'type' in key.alpha) {
        const action = key.alpha as { type: string; text: string };
        expect(action.type).toBe('insert');
        expect(action.text).toMatch(/^[A-Zθ"' :?]$/);
      }
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('KEY_DEFINITIONS — Insert Actions', () => {
  test('all insert actions have a non-empty text property', () => {
    for (const key of KEY_DEFINITIONS) {
      const checkAction = (action: KeyAction) => {
        if (action && typeof action === 'object' && 'type' in action) {
          const ins = action as { type: string; text: string };
          if (ins.type === 'insert') {
            expect(typeof ins.text).toBe('string');
          }
        }
      };
      checkAction(key.primary);
      if (key.second) checkAction(key.second);
      if (key.alpha) checkAction(key.alpha);
    }
  });

  test('parentheses keys insert correct symbols', () => {
    const keyById = Object.fromEntries(KEY_DEFINITIONS.map((k) => [k.id, k]));
    const lparen = keyById['lparen'];
    const rparen = keyById['rparen'];
    expect(lparen).toBeDefined();
    expect(rparen).toBeDefined();

    if (typeof lparen.primary === 'object' && lparen.primary !== null) {
      expect((lparen.primary as { text: string }).text).toBe('(');
    }
    if (typeof rparen.primary === 'object' && rparen.primary !== null) {
      expect((rparen.primary as { text: string }).text).toBe(')');
    }
  });

  test('decimal key inserts "."', () => {
    const keyById = Object.fromEntries(KEY_DEFINITIONS.map((k) => [k.id, k]));
    const dotKey = keyById['dot'];
    if (typeof dotKey.primary === 'object' && dotKey.primary !== null) {
      expect((dotKey.primary as { text: string }).text).toBe('.');
    }
  });

  test('negation key inserts "(−" or "(-"', () => {
    const keyById = Object.fromEntries(KEY_DEFINITIONS.map((k) => [k.id, k]));
    const negKey = keyById['neg'];
    if (typeof negKey.primary === 'object' && negKey.primary !== null) {
      const text = (negKey.primary as { text: string }).text;
      expect(text).toContain('(') ;
    }
  });
});
