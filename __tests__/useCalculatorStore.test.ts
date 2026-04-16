/**
 * useCalculatorStore.test.ts
 * ─────────────────────────────────────────────────────────────────
 * Unit tests for the Zustand calculator store.
 * Tests all actions: input, evaluate, modifiers, navigation,
 * variable storage, equation management, settings, and menus.
 *
 * NOTE: Zustand stores are tested by calling actions and asserting
 * state — no React rendering needed.
 */

// Must appear before any imports that use 'use client'
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => undefined),
    set: jest.fn(),
  })),
}));

import { useCalculatorStore, dispatchAction } from '@/store/useCalculatorStore';

// ── Reset store before each test ─────────────────────────────────────────────
beforeEach(() => {
  useCalculatorStore.setState({
    inputLine: '',
    cursorPos: 0,
    insertMode: true,
    history: [],
    historyScrollOffset: 0,
    screenMode: 'home',
    isSecond: false,
    isAlpha: false,
    isAlphaLock: false,
    variables: {},
    lastAnswer: 0,
    brightness: 5,
    currentMenu: null,
    errorState: null,
  } as Partial<ReturnType<typeof useCalculatorStore.getState>>);
});

// ════════════════════════════════════════════════════════════════════════════
describe('Input Actions', () => {
  test('appendInput adds character at cursor', () => {
    const { appendInput, getState } = useCalculatorStore;
    useCalculatorStore.getState().appendInput('3');
    expect(useCalculatorStore.getState().inputLine).toBe('3');
  });

  test('appendInput advances cursor', () => {
    useCalculatorStore.getState().appendInput('3');
    expect(useCalculatorStore.getState().cursorPos).toBe(1);
  });

  test('multiple appendInput calls build up expression', () => {
    const s = useCalculatorStore.getState();
    s.appendInput('2');
    s.appendInput('+');
    s.appendInput('3');
    expect(useCalculatorStore.getState().inputLine).toBe('2+3');
  });

  test('deleteChar removes last character', () => {
    const s = useCalculatorStore.getState();
    s.appendInput('A');
    s.appendInput('B');
    s.deleteChar();
    expect(useCalculatorStore.getState().inputLine).toBe('A');
    expect(useCalculatorStore.getState().cursorPos).toBe(1);
  });

  test('deleteChar on empty input does nothing', () => {
    useCalculatorStore.getState().deleteChar();
    expect(useCalculatorStore.getState().inputLine).toBe('');
    expect(useCalculatorStore.getState().cursorPos).toBe(0);
  });

  test('clearInput empties input and resets cursor', () => {
    const s = useCalculatorStore.getState();
    s.appendInput('test');
    s.clearInput();
    expect(useCalculatorStore.getState().inputLine).toBe('');
    expect(useCalculatorStore.getState().cursorPos).toBe(0);
  });

  test('clearAll clears input and history', () => {
    useCalculatorStore.setState({
      inputLine: 'abc',
      history: [{ id: '1', expression: '2+2', result: '4', timestamp: 0, isError: false }],
    });
    useCalculatorStore.getState().clearAll();
    expect(useCalculatorStore.getState().inputLine).toBe('');
    expect(useCalculatorStore.getState().history).toHaveLength(0);
  });

  test('insertMode: insert mode inserts at cursor position', () => {
    useCalculatorStore.setState({ inputLine: 'AC', cursorPos: 1, insertMode: true });
    useCalculatorStore.getState().appendInput('B');
    expect(useCalculatorStore.getState().inputLine).toBe('ABC');
  });

  test('overwrite mode replaces character at cursor', () => {
    useCalculatorStore.setState({ inputLine: 'AXC', cursorPos: 1, insertMode: false });
    useCalculatorStore.getState().appendInput('B');
    expect(useCalculatorStore.getState().inputLine).toBe('ABC');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Evaluate Action', () => {
  test('evaluates 2+2 → history entry with result "4"', () => {
    useCalculatorStore.setState({ inputLine: '2+2', cursorPos: 3 });
    useCalculatorStore.getState().evaluate();
    const { history } = useCalculatorStore.getState();
    expect(history.length).toBeGreaterThan(0);
    expect(history[history.length - 1].result).toBe('4');
  });

  test('evaluate clears input line', () => {
    useCalculatorStore.setState({ inputLine: '5', cursorPos: 1 });
    useCalculatorStore.getState().evaluate();
    expect(useCalculatorStore.getState().inputLine).toBe('');
  });

  test('evaluate updates lastAnswer', () => {
    useCalculatorStore.setState({ inputLine: '7+3', cursorPos: 3 });
    useCalculatorStore.getState().evaluate();
    expect(useCalculatorStore.getState().lastAnswer).toBe(10);
  });

  test('evaluate with syntax error adds error entry', () => {
    useCalculatorStore.setState({ inputLine: '(((', cursorPos: 3 });
    useCalculatorStore.getState().evaluate();
    const { history } = useCalculatorStore.getState();
    const last = history[history.length - 1];
    expect(last.isError).toBe(true);
    expect(last.result).toMatch(/ERR:/);
  });

  test('evaluate with empty input does nothing', () => {
    useCalculatorStore.setState({ inputLine: '', cursorPos: 0 });
    const before = useCalculatorStore.getState().history.length;
    useCalculatorStore.getState().evaluate();
    expect(useCalculatorStore.getState().history.length).toBe(before);
  });

  test('STO arrow expression: 5→A stores 5 in A', () => {
    useCalculatorStore.setState({ inputLine: '5→A', cursorPos: 3 });
    useCalculatorStore.getState().evaluate();
    expect(useCalculatorStore.getState().variables['A']).toBe(5);
  });

  test('STO arrow: correct history entry shown', () => {
    useCalculatorStore.setState({ inputLine: '10→B', cursorPos: 4 });
    useCalculatorStore.getState().evaluate();
    const { history } = useCalculatorStore.getState();
    const last = history[history.length - 1];
    expect(last.expression).toContain('→');
  });

  test('evaluate resets isSecond and isAlpha', () => {
    useCalculatorStore.setState({ inputLine: '2', cursorPos: 1, isSecond: true, isAlpha: true });
    useCalculatorStore.getState().evaluate();
    expect(useCalculatorStore.getState().isSecond).toBe(false);
    expect(useCalculatorStore.getState().isAlpha).toBe(false);
  });

  test('multiple evaluations build history', () => {
    ['1', '2', '3'].forEach((x) => {
      useCalculatorStore.setState({ inputLine: x, cursorPos: 1 });
      useCalculatorStore.getState().evaluate();
    });
    expect(useCalculatorStore.getState().history.length).toBe(3);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('History entries', () => {
  test('each entry has id, expression, result, timestamp, isError', () => {
    useCalculatorStore.setState({ inputLine: '5', cursorPos: 1 });
    useCalculatorStore.getState().evaluate();
    const entry = useCalculatorStore.getState().history[0];
    expect(entry.id).toBeDefined();
    expect(entry.expression).toBe('5');
    expect(entry.result).toBe('5');
    expect(typeof entry.timestamp).toBe('number');
    expect(entry.isError).toBe(false);
  });

  test('error entries have isError=true', () => {
    useCalculatorStore.setState({ inputLine: 'bad(', cursorPos: 4 });
    useCalculatorStore.getState().evaluate();
    const entry = useCalculatorStore.getState().history[0];
    expect(entry.isError).toBe(true);
  });

  test('history entries have unique IDs', () => {
    ['1+1', '2+2', '3+3'].forEach((x) => {
      useCalculatorStore.setState({ inputLine: x, cursorPos: x.length });
      useCalculatorStore.getState().evaluate();
    });
    const ids = useCalculatorStore.getState().history.map((h) => h.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(3);
  });

  test('history entries have monotonically increasing timestamps', () => {
    ['1', '2', '3'].forEach((x) => {
      useCalculatorStore.setState({ inputLine: x, cursorPos: 1 });
      useCalculatorStore.getState().evaluate();
    });
    const timestamps = useCalculatorStore.getState().history.map((h) => h.timestamp);
    for (let i = 1; i < timestamps.length; i++) {
      expect(timestamps[i]).toBeGreaterThanOrEqual(timestamps[i - 1]);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Modifier Key Actions', () => {
  test('toggleSecond: false → true', () => {
    useCalculatorStore.getState().toggleSecond();
    expect(useCalculatorStore.getState().isSecond).toBe(true);
  });

  test('toggleSecond: true → false', () => {
    useCalculatorStore.setState({ isSecond: true });
    useCalculatorStore.getState().toggleSecond();
    expect(useCalculatorStore.getState().isSecond).toBe(false);
  });

  test('toggleSecond clears alpha when enabled', () => {
    useCalculatorStore.setState({ isAlpha: true, isAlphaLock: false });
    useCalculatorStore.getState().toggleSecond();
    expect(useCalculatorStore.getState().isAlpha).toBe(false);
  });

  test('toggleAlpha: false → true', () => {
    useCalculatorStore.getState().toggleAlpha();
    expect(useCalculatorStore.getState().isAlpha).toBe(true);
  });

  test('toggleAlpha: true → false', () => {
    useCalculatorStore.setState({ isAlpha: true });
    useCalculatorStore.getState().toggleAlpha();
    expect(useCalculatorStore.getState().isAlpha).toBe(false);
  });

  test('toggleAlpha clears isSecond', () => {
    useCalculatorStore.setState({ isSecond: true });
    useCalculatorStore.getState().toggleAlpha();
    expect(useCalculatorStore.getState().isSecond).toBe(false);
  });

  test('toggleAlphaLock: locks alpha and sets isAlpha=true', () => {
    useCalculatorStore.getState().toggleAlphaLock();
    expect(useCalculatorStore.getState().isAlphaLock).toBe(true);
    expect(useCalculatorStore.getState().isAlpha).toBe(true);
  });

  test('toggleAlphaLock again: unlocks and sets isAlpha=false', () => {
    useCalculatorStore.getState().toggleAlphaLock();
    useCalculatorStore.getState().toggleAlphaLock();
    expect(useCalculatorStore.getState().isAlphaLock).toBe(false);
    expect(useCalculatorStore.getState().isAlpha).toBe(false);
  });

  test('appendInput resets isSecond (non-lock)', () => {
    useCalculatorStore.setState({ isSecond: true });
    useCalculatorStore.getState().appendInput('X');
    expect(useCalculatorStore.getState().isSecond).toBe(false);
  });

  test('appendInput resets isAlpha when not locked', () => {
    useCalculatorStore.setState({ isAlpha: true, isAlphaLock: false });
    useCalculatorStore.getState().appendInput('X');
    expect(useCalculatorStore.getState().isAlpha).toBe(false);
  });

  test('appendInput keeps isAlpha when alphaLock active', () => {
    useCalculatorStore.setState({ isAlpha: true, isAlphaLock: true });
    useCalculatorStore.getState().appendInput('A');
    expect(useCalculatorStore.getState().isAlpha).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Screen Mode', () => {
  test('setScreenMode changes mode', () => {
    useCalculatorStore.getState().setScreenMode('graph');
    expect(useCalculatorStore.getState().screenMode).toBe('graph');
  });

  test('setScreenMode to y_equals', () => {
    useCalculatorStore.getState().setScreenMode('y_equals');
    expect(useCalculatorStore.getState().screenMode).toBe('y_equals');
  });

  test('setScreenMode resets isSecond', () => {
    useCalculatorStore.setState({ isSecond: true });
    useCalculatorStore.getState().setScreenMode('home');
    expect(useCalculatorStore.getState().isSecond).toBe(false);
  });

  test('setScreenMode resets isAlpha', () => {
    useCalculatorStore.setState({ isAlpha: true });
    useCalculatorStore.getState().setScreenMode('mode');
    expect(useCalculatorStore.getState().isAlpha).toBe(false);
  });

  test('setScreenMode closes any open menu', () => {
    useCalculatorStore.setState({ currentMenu: { type: 'math_menu', title: 'MATH', selectedIndex: 0, items: [] } });
    useCalculatorStore.getState().setScreenMode('home');
    expect(useCalculatorStore.getState().currentMenu).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Variables', () => {
  test('storeVariable sets a value', () => {
    useCalculatorStore.getState().storeVariable('A', 42);
    expect(useCalculatorStore.getState().variables['A']).toBe(42);
  });

  test('storeVariable overwrites existing', () => {
    useCalculatorStore.getState().storeVariable('A', 10);
    useCalculatorStore.getState().storeVariable('A', 20);
    expect(useCalculatorStore.getState().variables['A']).toBe(20);
  });

  test('all A-Z can be stored', () => {
    for (let i = 65; i <= 90; i++) {
      const c = String.fromCharCode(i);
      useCalculatorStore.getState().storeVariable(c, i);
      expect(useCalculatorStore.getState().variables[c]).toBe(i);
    }
  });

  test('storeVariable stores string value', () => {
    useCalculatorStore.getState().storeVariable('S', 'hello');
    expect(useCalculatorStore.getState().variables['S']).toBe('hello');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Equations', () => {
  test('setEquation updates equation expression', () => {
    useCalculatorStore.getState().setEquation(0, 'sin(X)');
    expect(useCalculatorStore.getState().equations[0].expr).toBe('sin(X)');
  });

  test('setEquation out of bounds does nothing', () => {
    const before = [...useCalculatorStore.getState().equations];
    useCalculatorStore.getState().setEquation(999, 'nope');
    expect(useCalculatorStore.getState().equations.length).toBe(before.length);
  });

  test('toggleEquation disables enabled equation', () => {
    useCalculatorStore.setState((s) => {
      s.equations[0].enabled = true;
    });
    useCalculatorStore.getState().toggleEquation(0);
    expect(useCalculatorStore.getState().equations[0].enabled).toBe(false);
  });

  test('toggleEquation enables disabled equation', () => {
    useCalculatorStore.setState((s) => {
      s.equations[0].enabled = false;
    });
    useCalculatorStore.getState().toggleEquation(0);
    expect(useCalculatorStore.getState().equations[0].enabled).toBe(true);
  });

  test('setEquationColor changes color', () => {
    useCalculatorStore.getState().setEquationColor(0, '#FF0000');
    expect(useCalculatorStore.getState().equations[0].color).toBe('#FF0000');
  });

  test('equations array has correct initial length', () => {
    const len = useCalculatorStore.getState().equations.length;
    expect(len).toBeGreaterThanOrEqual(10);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Graph Window', () => {
  test('setGraphWindow updates xMin', () => {
    useCalculatorStore.getState().setGraphWindow({ xMin: -5 });
    expect(useCalculatorStore.getState().graphWindow.xMin).toBe(-5);
  });

  test('setGraphWindow partial update preserves other values', () => {
    const before = { ...useCalculatorStore.getState().graphWindow };
    useCalculatorStore.getState().setGraphWindow({ xMin: -99 });
    const after = useCalculatorStore.getState().graphWindow;
    expect(after.xMax).toBe(before.xMax);
    expect(after.yMin).toBe(before.yMin);
  });

  test('setGraphWindow updates multiple fields', () => {
    useCalculatorStore.getState().setGraphWindow({ xMin: -20, xMax: 20, yMin: -15, yMax: 15 });
    const { graphWindow } = useCalculatorStore.getState();
    expect(graphWindow.xMin).toBe(-20);
    expect(graphWindow.xMax).toBe(20);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Settings', () => {
  test('setAngleMode updates angleMode', () => {
    useCalculatorStore.getState().setAngleMode('DEGREE');
    expect(useCalculatorStore.getState().settings.angleMode).toBe('DEGREE');
  });

  test('setDisplayMode updates displayMode', () => {
    useCalculatorStore.getState().setDisplayMode('SCI');
    expect(useCalculatorStore.getState().settings.displayMode).toBe('SCI');
  });

  test('setDecimalPlaces updates decimalPlaces', () => {
    useCalculatorStore.getState().setDecimalPlaces(4);
    expect(useCalculatorStore.getState().settings.decimalPlaces).toBe(4);
  });

  test('setCalcMode updates calcMode', () => {
    useCalculatorStore.getState().setCalcMode('PAR');
    expect(useCalculatorStore.getState().settings.calcMode).toBe('PAR');
  });

  test('setSetting updates arbitrary settings key', () => {
    useCalculatorStore.getState().setSetting('gridOn', true);
    expect(useCalculatorStore.getState().settings.gridOn).toBe(true);
  });

  test('setSetting can toggle axesOn', () => {
    useCalculatorStore.getState().setSetting('axesOn', false);
    expect(useCalculatorStore.getState().settings.axesOn).toBe(false);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Cursor Movement', () => {
  test('moveCursor left decrements cursorPos', () => {
    useCalculatorStore.setState({ inputLine: 'AB', cursorPos: 2 });
    useCalculatorStore.getState().moveCursor('left');
    expect(useCalculatorStore.getState().cursorPos).toBe(1);
  });

  test('moveCursor left stops at 0', () => {
    useCalculatorStore.setState({ inputLine: 'A', cursorPos: 0 });
    useCalculatorStore.getState().moveCursor('left');
    expect(useCalculatorStore.getState().cursorPos).toBe(0);
  });

  test('moveCursor right increments cursorPos', () => {
    useCalculatorStore.setState({ inputLine: 'AB', cursorPos: 0 });
    useCalculatorStore.getState().moveCursor('right');
    expect(useCalculatorStore.getState().cursorPos).toBe(1);
  });

  test('moveCursor right stops at end of input', () => {
    useCalculatorStore.setState({ inputLine: 'AB', cursorPos: 2 });
    useCalculatorStore.getState().moveCursor('right');
    expect(useCalculatorStore.getState().cursorPos).toBe(2);
  });

  test('moveCursor up decrements historyScrollOffset', () => {
    useCalculatorStore.setState({ historyScrollOffset: 3 });
    useCalculatorStore.getState().moveCursor('up');
    expect(useCalculatorStore.getState().historyScrollOffset).toBe(2);
  });

  test('moveCursor up stops at 0 historyScrollOffset', () => {
    useCalculatorStore.setState({ historyScrollOffset: 0 });
    useCalculatorStore.getState().moveCursor('up');
    expect(useCalculatorStore.getState().historyScrollOffset).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('History Scroll', () => {
  test('scrollHistory up recalls previous expression', () => {
    useCalculatorStore.setState({
      history: [
        { id: '1', expression: '1+1', result: '2', timestamp: 0, isError: false },
        { id: '2', expression: '2+2', result: '4', timestamp: 1, isError: false },
      ],
      historyScrollOffset: 0,
    });
    useCalculatorStore.getState().scrollHistory('up');
    expect(useCalculatorStore.getState().inputLine).toBe('2+2');
  });

  test('scrollHistory up increments offset', () => {
    useCalculatorStore.setState({
      history: [
        { id: '1', expression: '1+1', result: '2', timestamp: 0, isError: false },
      ],
      historyScrollOffset: 0,
    });
    useCalculatorStore.getState().scrollHistory('up');
    expect(useCalculatorStore.getState().historyScrollOffset).toBe(1);
  });

  test('scrollHistory up at boundary does not go past history', () => {
    useCalculatorStore.setState({
      history: [{ id: '1', expression: '1', result: '1', timestamp: 0, isError: false }],
      historyScrollOffset: 1,
    });
    const before = useCalculatorStore.getState().historyScrollOffset;
    useCalculatorStore.getState().scrollHistory('up');
    expect(useCalculatorStore.getState().historyScrollOffset).toBe(before);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Menu State', () => {
  const SAMPLE_MENU = {
    type: 'math_menu' as const,
    title: 'MATH',
    selectedIndex: 0,
    items: [
      { label: '1:abs(', action: 'insert', value: 'abs(' },
      { label: '2:round(', action: 'insert', value: 'round(' },
    ],
  };

  test('openMenu sets currentMenu', () => {
    useCalculatorStore.getState().openMenu(SAMPLE_MENU);
    expect(useCalculatorStore.getState().currentMenu).toBe(SAMPLE_MENU);
  });

  test('closeMenu sets currentMenu to null', () => {
    useCalculatorStore.getState().openMenu(SAMPLE_MENU);
    useCalculatorStore.getState().closeMenu();
    expect(useCalculatorStore.getState().currentMenu).toBeNull();
  });

  test('selectMenuItem updates selectedIndex', () => {
    useCalculatorStore.getState().openMenu(SAMPLE_MENU);
    useCalculatorStore.getState().selectMenuItem(1);
    expect(useCalculatorStore.getState().currentMenu!.selectedIndex).toBe(1);
  });

  test('selectMenuItem ignores out-of-bounds index', () => {
    useCalculatorStore.getState().openMenu(SAMPLE_MENU);
    useCalculatorStore.getState().selectMenuItem(99);
    expect(useCalculatorStore.getState().currentMenu!.selectedIndex).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Trace State', () => {
  test('setTraceState updates trace', () => {
    useCalculatorStore.getState().setTraceState({ active: true, x: 2.5, y: 1.0, equationIndex: 0 });
    const t = useCalculatorStore.getState().traceState;
    expect(t.active).toBe(true);
    expect(t.x).toBe(2.5);
    expect(t.y).toBe(1.0);
  });

  test('partial setTraceState preserves other fields', () => {
    useCalculatorStore.setState({ traceState: { active: true, x: 3, y: 9, equationIndex: 1 } });
    useCalculatorStore.getState().setTraceState({ x: 4 });
    const t = useCalculatorStore.getState().traceState;
    expect(t.active).toBe(true);
    expect(t.y).toBe(9);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Error State', () => {
  test('setError stores error', () => {
    useCalculatorStore.getState().setError({ code: 'SYNTAX', message: 'test', options: ['1:Quit'] });
    expect(useCalculatorStore.getState().errorState!.code).toBe('SYNTAX');
  });

  test('setError(null) clears error', () => {
    useCalculatorStore.getState().setError({ code: 'SYNTAX', message: 'test', options: [] });
    useCalculatorStore.getState().setError(null);
    expect(useCalculatorStore.getState().errorState).toBeNull();
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Brightness', () => {
  test('setBrightness sets value', () => {
    useCalculatorStore.getState().setBrightness(7);
    expect(useCalculatorStore.getState().brightness).toBe(7);
  });

  test('setBrightness clamps to 0', () => {
    useCalculatorStore.getState().setBrightness(-5);
    expect(useCalculatorStore.getState().brightness).toBe(0);
  });

  test('setBrightness clamps to 9', () => {
    useCalculatorStore.getState().setBrightness(99);
    expect(useCalculatorStore.getState().brightness).toBe(9);
  });

  test('setBrightness boundary: exactly 0', () => {
    useCalculatorStore.getState().setBrightness(0);
    expect(useCalculatorStore.getState().brightness).toBe(0);
  });

  test('setBrightness boundary: exactly 9', () => {
    useCalculatorStore.getState().setBrightness(9);
    expect(useCalculatorStore.getState().brightness).toBe(9);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Lists', () => {
  test('setList stores values', () => {
    useCalculatorStore.getState().setList('L1', [1, 2, 3]);
    expect(useCalculatorStore.getState().lists['L1']).toEqual([1, 2, 3]);
  });

  test('setList replaces existing list', () => {
    useCalculatorStore.getState().setList('L1', [1, 2, 3]);
    useCalculatorStore.getState().setList('L1', [10, 20]);
    expect(useCalculatorStore.getState().lists['L1']).toEqual([10, 20]);
  });

  test('setList for all 6 standard lists', () => {
    for (let i = 1; i <= 6; i++) {
      useCalculatorStore.getState().setList(`L${i}`, [i]);
      expect(useCalculatorStore.getState().lists[`L${i}`]).toEqual([i]);
    }
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Matrices', () => {
  test('setMatrix stores matrix data', () => {
    const mat = { rows: 2, cols: 2, data: [[1, 2], [3, 4]] };
    useCalculatorStore.getState().setMatrix('[A]', mat);
    expect(useCalculatorStore.getState().matrices['[A]']).toEqual(mat);
  });

  test('setMatrix overwrites existing', () => {
    useCalculatorStore.getState().setMatrix('[A]', { rows: 1, cols: 1, data: [[0]] });
    useCalculatorStore.getState().setMatrix('[A]', { rows: 2, cols: 2, data: [[1, 2], [3, 4]] });
    expect(useCalculatorStore.getState().matrices['[A]'].rows).toBe(2);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Programs', () => {
  const SAMPLE_PROG = {
    name: 'TEST',
    lines: [':Disp "HI"'],
    protected: false,
    createdAt: 0,
  };

  test('addProgram adds a program', () => {
    useCalculatorStore.setState({ programs: [] });
    useCalculatorStore.getState().addProgram(SAMPLE_PROG);
    expect(useCalculatorStore.getState().programs).toHaveLength(1);
  });

  test('addProgram stores correct name', () => {
    useCalculatorStore.setState({ programs: [] });
    useCalculatorStore.getState().addProgram(SAMPLE_PROG);
    expect(useCalculatorStore.getState().programs[0].name).toBe('TEST');
  });

  test('deleteProgram removes program', () => {
    useCalculatorStore.setState({ programs: [SAMPLE_PROG, { ...SAMPLE_PROG, name: 'PROG2' }] });
    useCalculatorStore.getState().deleteProgram(0);
    expect(useCalculatorStore.getState().programs).toHaveLength(1);
    expect(useCalculatorStore.getState().programs[0].name).toBe('PROG2');
  });

  test('updateProgram modifies lines', () => {
    useCalculatorStore.setState({ programs: [SAMPLE_PROG] });
    useCalculatorStore.getState().updateProgram(0, { lines: [':Disp "UPDATED"'] });
    expect(useCalculatorStore.getState().programs[0].lines[0]).toBe(':Disp "UPDATED"');
  });

  test('updateProgram out of bounds does nothing', () => {
    useCalculatorStore.setState({ programs: [] });
    expect(() => useCalculatorStore.getState().updateProgram(99, { name: 'X' })).not.toThrow();
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('dispatchAction', () => {
  test('dispatches evaluate action', () => {
    useCalculatorStore.setState({ inputLine: '4+4', cursorPos: 3 });
    dispatchAction('evaluate');
    expect(useCalculatorStore.getState().history.length).toBeGreaterThan(0);
  });

  test('dispatches delete action', () => {
    useCalculatorStore.setState({ inputLine: 'AB', cursorPos: 2 });
    dispatchAction('delete');
    expect(useCalculatorStore.getState().inputLine).toBe('A');
  });

  test('dispatches clear action (clears inputLine)', () => {
    useCalculatorStore.setState({ inputLine: 'hello', cursorPos: 5 });
    dispatchAction('clear');
    expect(useCalculatorStore.getState().inputLine).toBe('');
  });

  test('dispatches clear action (goes home when input empty)', () => {
    useCalculatorStore.setState({ inputLine: '', screenMode: 'graph' });
    dispatchAction('clear');
    expect(useCalculatorStore.getState().screenMode).toBe('home');
  });

  test('dispatches toggle_second', () => {
    dispatchAction('toggle_second');
    expect(useCalculatorStore.getState().isSecond).toBe(true);
  });

  test('dispatches toggle_alpha', () => {
    dispatchAction('toggle_alpha');
    expect(useCalculatorStore.getState().isAlpha).toBe(true);
  });

  test('dispatches screen_graph mode', () => {
    dispatchAction('screen_graph');
    expect(useCalculatorStore.getState().screenMode).toBe('graph');
  });

  test('dispatches screen_y_equals', () => {
    dispatchAction('screen_y_equals');
    expect(useCalculatorStore.getState().screenMode).toBe('y_equals');
  });

  test('dispatches screen_mode', () => {
    dispatchAction('screen_mode');
    expect(useCalculatorStore.getState().screenMode).toBe('mode');
  });

  test('dispatches cursor_left', () => {
    useCalculatorStore.setState({ inputLine: 'AB', cursorPos: 2 });
    dispatchAction('cursor_left');
    expect(useCalculatorStore.getState().cursorPos).toBe(1);
  });

  test('dispatches cursor_right', () => {
    useCalculatorStore.setState({ inputLine: 'AB', cursorPos: 0 });
    dispatchAction('cursor_right');
    expect(useCalculatorStore.getState().cursorPos).toBe(1);
  });

  test('dispatches insert action', () => {
    dispatchAction({ type: 'insert', text: 'sin(' });
    expect(useCalculatorStore.getState().inputLine).toBe('sin(');
  });

  test('dispatches null silently', () => {
    expect(() => dispatchAction(null)).not.toThrow();
  });

  test('dispatches sto_arrow → inserts →', () => {
    dispatchAction('sto_arrow');
    expect(useCalculatorStore.getState().inputLine).toContain('→');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('Table Settings', () => {
  test('setTableSettings updates tblStart', () => {
    useCalculatorStore.getState().setTableSettings({ tblStart: 5 });
    expect(useCalculatorStore.getState().tableSettings.tblStart).toBe(5);
  });

  test('setTableSettings partial update preserves other fields', () => {
    useCalculatorStore.getState().setTableSettings({ deltaTbl: 0.5 });
    expect(useCalculatorStore.getState().tableSettings.deltaTbl).toBe(0.5);
    // tblStart should be preserved
    expect(typeof useCalculatorStore.getState().tableSettings.tblStart).toBe('number');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('loadSession', () => {
  test('loads history into state', () => {
    const history = [{ id: '1', expression: 'loaded', result: '42', timestamp: 0, isError: false }];
    useCalculatorStore.getState().loadSession({ history } as Partial<ReturnType<typeof useCalculatorStore.getState>>);
    expect(useCalculatorStore.getState().history[0].expression).toBe('loaded');
  });

  test('loads variables into state', () => {
    useCalculatorStore.getState().loadSession({ variables: { A: 99 } } as Partial<ReturnType<typeof useCalculatorStore.getState>>);
    expect(useCalculatorStore.getState().variables['A']).toBe(99);
  });

  test('loads lastAnswer', () => {
    useCalculatorStore.getState().loadSession({ lastAnswer: 3.14 } as Partial<ReturnType<typeof useCalculatorStore.getState>>);
    expect(useCalculatorStore.getState().lastAnswer).toBeCloseTo(3.14);
  });
});
