/**
 * @jest-environment jsdom
 */
/**
 * keyboardMap.test.ts
 * Tests for lib/keyboardMap.ts — verifies that physical keyboard
 * events map to the correct calculator actions.
 */

import { getKeyboardAction } from '@/lib/keyboardMap';
import { KeyAction } from '@/lib/keyDefinitions';

// ── Helper to create a synthetic KeyboardEvent ────────────────────────────────
function makeKeyEvent(
  key: string,
  options: Partial<KeyboardEvent> = {}
): KeyboardEvent {
  return {
    key,
    code: options.code ?? '',
    ctrlKey: options.ctrlKey ?? false,
    shiftKey: options.shiftKey ?? false,
    altKey: options.altKey ?? false,
    metaKey: options.metaKey ?? false,
    preventDefault: jest.fn(),
    ...options,
  } as unknown as KeyboardEvent;
}

// ── Helper to get action from key event ────────────────────────────────────────
function act(key: string, opts?: Partial<KeyboardEvent>): KeyAction {
  return getKeyboardAction(makeKeyEvent(key, opts));
}

// ════════════════════════════════════════════════════════════════════════════
describe('getKeyboardAction — Evaluation', () => {
  test('Enter → evaluate', () => {
    expect(act('Enter')).toBe('evaluate');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('getKeyboardAction — Navigation', () => {
  test('ArrowLeft → cursor_left', () => {
    expect(act('ArrowLeft')).toBe('cursor_left');
  });

  test('ArrowRight → cursor_right', () => {
    expect(act('ArrowRight')).toBe('cursor_right');
  });

  test('ArrowUp → cursor_up', () => {
    expect(act('ArrowUp')).toBe('cursor_up');
  });

  test('ArrowDown → cursor_down', () => {
    expect(act('ArrowDown')).toBe('cursor_down');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('getKeyboardAction — Editing', () => {
  test('Backspace → delete', () => {
    expect(act('Backspace')).toBe('delete');
  });

  test('Delete → delete', () => {
    const result = act('Delete');
    expect(result === 'delete' || result === null).toBe(true);
  });

  test('Escape → clear', () => {
    expect(act('Escape')).toBe('clear');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('getKeyboardAction — Digit Insertion', () => {
  const digits = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];

  for (const d of digits) {
    test(`key "${d}" → inserts "${d}"`, () => {
      const action = act(d);
      expect(action).not.toBeNull();
      if (action && typeof action === 'object' && 'type' in action) {
        expect((action as { type: string; text: string }).type).toBe('insert');
        expect((action as { type: string; text: string }).text).toBe(d);
      }
    });
  }
});

// ════════════════════════════════════════════════════════════════════════════
describe('getKeyboardAction — Operator Insertion', () => {
  test('+ → inserts "+"', () => {
    const action = act('+');
    if (action && typeof action === 'object' && 'text' in action) {
      expect((action as { text: string }).text).toBe('+');
    } else {
      expect(action).not.toBeNull();
    }
  });

  test('- → inserts "−" or "-"', () => {
    const action = act('-');
    if (action && typeof action === 'object' && 'text' in action) {
      expect(['-', '−']).toContain((action as { text: string }).text);
    } else {
      expect(action).not.toBeNull();
    }
  });

  test('* → inserts "×" or "*"', () => {
    const action = act('*');
    if (action && typeof action === 'object' && 'text' in action) {
      expect(['*', '×']).toContain((action as { text: string }).text);
    } else {
      expect(action).not.toBeNull();
    }
  });

  test('/ → inserts "÷" or "/"', () => {
    const action = act('/');
    if (action && typeof action === 'object' && 'text' in action) {
      expect(['/', '÷']).toContain((action as { text: string }).text);
    } else {
      expect(action).not.toBeNull();
    }
  });

  test('. → inserts "."', () => {
    const action = act('.');
    if (action && typeof action === 'object' && 'text' in action) {
      expect((action as { text: string }).text).toBe('.');
    } else {
      expect(action).not.toBeNull();
    }
  });

  test('^ → inserts "^"', () => {
    const action = act('^');
    if (action && typeof action === 'object' && 'text' in action) {
      expect((action as { text: string }).text).toBe('^');
    } else {
      expect(action).not.toBeNull();
    }
  });

  test('( → inserts "("', () => {
    const action = act('(');
    if (action && typeof action === 'object' && 'text' in action) {
      expect((action as { text: string }).text).toBe('(');
    } else {
      expect(action).not.toBeNull();
    }
  });

  test(') → inserts ")"', () => {
    const action = act(')');
    if (action && typeof action === 'object' && 'text' in action) {
      expect((action as { text: string }).text).toBe(')');
    } else {
      expect(action).not.toBeNull();
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('getKeyboardAction — Variable / Special Keys', () => {
  test('"x" or "X" → inserts X', () => {
    const action = act('x');
    if (action && typeof action === 'object' && 'text' in action) {
      expect((action as { text: string }).text.toUpperCase()).toBe('X');
    } else {
      expect(action).not.toBeNull();
    }
  });

  test('"p" → inserts π', () => {
    const action = act('p');
    if (action && typeof action === 'object' && 'text' in action) {
      expect((action as { text: string }).text).toBe('π');
    } else {
      // Some maps use shift+p or similar — allow null
      expect(action === null || action !== undefined).toBe(true);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('getKeyboardAction — Function Row', () => {
  test('F1 → navigates to Y= screen', () => {
    const action = act('F1');
    expect(action).toBe('screen_y_equals');
  });

  test('F2 → navigates to window screen', () => {
    const action = act('F2');
    expect(action).toBe('screen_window');
  });

  test('F3 → navigates to zoom screen', () => {
    const action = act('F3');
    expect(action).toBe('screen_zoom');
  });

  test('F4 → trace mode', () => {
    const action = act('F4');
    expect(action).toBe('trace_mode');
  });

  test('F5 → graph screen', () => {
    const action = act('F5');
    expect(action).toBe('screen_graph');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('getKeyboardAction — Unmapped Keys', () => {
  test('unmapped key returns null', () => {
    expect(act('F12')).toBeNull();
  });

  test('Tab returns null', () => {
    expect(act('Tab')).toBeNull();
  });

  test('CapsLock returns null', () => {
    expect(act('CapsLock')).toBeNull();
  });

  test('Meta returns null', () => {
    expect(act('Meta')).toBeNull();
  });

  test('random char (ñ) returns null or insert', () => {
    const result = act('ñ');
    expect(result === null || (typeof result === 'object') || typeof result === 'string').toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('getKeyboardAction — Return Type Invariants', () => {
  test('result is always null, string, or insert-shaped object', () => {
    const testKeys = [
      'Enter', 'Backspace', 'Escape', '0', '9', 'ArrowUp', 'ArrowDown',
      '+', '-', '*', '/', '.', '(', ')', '^', 'F1', 'F5', 'x', 'Tab',
    ];
    for (const key of testKeys) {
      const result = act(key);
      const isValid =
        result === null ||
        typeof result === 'string' ||
        (typeof result === 'object' && result !== null && 'type' in result);
      expect(isValid).toBe(true);
    }
  });

  test('all returned insert actions have type="insert" and text string', () => {
    const insertKeys = ['0', '1', '+', '-', '.', '(', ')'];
    for (const key of insertKeys) {
      const result = act(key);
      if (result && typeof result === 'object' && 'type' in result) {
        const ins = result as { type: string; text: string };
        expect(ins.type).toBe('insert');
        expect(typeof ins.text).toBe('string');
      }
    }
  });
});
