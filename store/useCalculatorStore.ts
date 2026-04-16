'use client';
// ============================================================
// TI-84 Plus CE Simulator — Zustand Store
// ============================================================

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { produce } from 'immer';
import {
  CalculatorState, HistoryEntry, ScreenMode, AngleMode,
  DisplayMode, DecimalPlaces, CalcMode, GraphWindow,
  TableSettings, MatrixData, Program, CalcSettings,
  Equation, MenuState, TraceState, ErrorState, StatPlot
} from '@/types/calculator';
import { evaluateExpression, TIError } from '@/lib/mathEngine';
import { DEFAULT_GRAPH_WINDOW, GRAPH_COLORS, NUM_EQUATIONS, EQUATION_NAMES_FUNC, EQUATION_NAMES_PAR, EQUATION_NAMES_POL } from '@/lib/constants';
import { KeyAction } from '@/lib/keyDefinitions';
import { TIBasicInterpreter } from '@/lib/tiBasicInterpreter';

function newId(): string {
  return Math.random().toString(36).slice(2);
}

const defaultEquations = (): Equation[] => {
  const funcEqs = EQUATION_NAMES_FUNC.map((name, i) => ({
    name, expr: '', color: GRAPH_COLORS[i], enabled: true, style: 'solid' as const,
  }));
  const parEqs = EQUATION_NAMES_PAR.map((name, i) => ({
    name, expr: '', color: GRAPH_COLORS[Math.floor(i / 2) % GRAPH_COLORS.length], enabled: true, style: 'solid' as const,
  }));
  const polEqs = EQUATION_NAMES_POL.map((name, i) => ({
    name, expr: '', color: GRAPH_COLORS[i % GRAPH_COLORS.length], enabled: true, style: 'solid' as const,
  }));
  return [...funcEqs, ...parEqs, ...polEqs];
};

const defaultSettings = (): CalcSettings => ({
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
});

const defaultTableSettings = (): TableSettings => ({
  tblStart: 0,
  deltaTbl: 1,
  indpntAuto: true,
  dependAuto: true,
});

const defaultStatPlots = (): StatPlot[] =>
  Array.from({ length: 3 }, (_, i) => ({
    enabled: false,
    type: 'scatter',
    xList: `L${i * 2 + 1}`,
    yList: `L${i * 2 + 2}`,
    mark: 'dot',
    color: GRAPH_COLORS[i],
  }));

// ─────────────────────────────────────────────────────────────────────────────
export const useCalculatorStore = create<CalculatorState>()(
  immer((set, get) => ({
    // ── Initial State ──────────────────────────────────────────────────────
    inputLine: '',
    cursorPos: 0,
    insertMode: true,
    history: [],
    historyScrollOffset: 0,
    screenMode: 'home' as ScreenMode,
    brightness: 5,
    isSecond: false,
    isAlpha: false,
    isAlphaLock: false,
    variables: {},
    lastAnswer: 0,
    equations: defaultEquations(),
    graphWindow: { ...DEFAULT_GRAPH_WINDOW },
    tableSettings: defaultTableSettings(),
    tableScrollRow: 0,
    lists: { L1: [], L2: [], L3: [], L4: [], L5: [], L6: [] },
    matrices: {},
    statPlots: defaultStatPlots(),
    settings: defaultSettings(),
    statResults: {},
    programs: [],
    currentProgramIndex: -1,
    currentProgramLine: 0,
    currentMenu: null,
    traceState: { active: false, equationIndex: 0, x: 0, y: 0 },
    errorState: null,
    sessionId: null,
    tvm: { N: 0, I: 0, PV: 0, PMT: 0, FV: 0, PY: 1, CY: 1, pmtAtEnd: true },
    isLoading: false,

    // ── Input Actions ──────────────────────────────────────────────────────
    appendInput: (char: string) =>
      set((state) => {
        if (state.insertMode) {
          state.inputLine =
            state.inputLine.slice(0, state.cursorPos) +
            char +
            state.inputLine.slice(state.cursorPos);
        } else {
          state.inputLine =
            state.inputLine.slice(0, state.cursorPos) +
            char +
            state.inputLine.slice(state.cursorPos + 1);
        }
        state.cursorPos += char.length;
        state.isSecond = false;
        if (!state.isAlphaLock) state.isAlpha = false;
      }),

    insertChar: (char: string) => get().appendInput(char),

    deleteChar: () =>
      set((state) => {
        if (state.cursorPos > 0) {
          state.inputLine =
            state.inputLine.slice(0, state.cursorPos - 1) +
            state.inputLine.slice(state.cursorPos);
          state.cursorPos -= 1;
        }
        state.isSecond = false;
      }),

    clearInput: () =>
      set((state) => {
        state.inputLine = '';
        state.cursorPos = 0;
        state.isSecond = false;
        state.isAlpha = false;
      }),

    clearAll: () =>
      set((state) => {
        state.inputLine = '';
        state.cursorPos = 0;
        state.history = [];
        state.isSecond = false;
        state.isAlpha = false;
      }),

    // ── Evaluate ──────────────────────────────────────────────────────────
    evaluate: () =>
      set((state) => {
        const expr = state.inputLine.trim();
        if (!expr) return;

        const mergedVars: Record<string, any> = { ...state.variables };
        for (const [k, v] of Object.entries(state.lists)) mergedVars[k] = v;
        for (const [k, v] of Object.entries(state.matrices)) {
          if (k.length === 3 && k.startsWith('[') && k.endsWith(']')) {
             mergedVars[`matrix_${k[1]}`] = v.data;
          }
        }

        // Check for STO→ pattern: expr→VAR
        const stoMatch = expr.match(/^(.+)→([A-Zθ])$/);
        if (stoMatch) {
          try {
            const { value, result } = evaluateExpression(
              stoMatch[1], mergedVars, state.lastAnswer,
              state.settings.angleMode, state.settings.displayMode, state.settings.decimalPlaces
            );
            state.variables[stoMatch[2]] = value as number;
            state.lastAnswer = value as number;
            const entry: HistoryEntry = {
              id: newId(), expression: expr, result: stoMatch[2], timestamp: Date.now(), isError: false
            };
            state.history.push(entry);
          } catch (err) {
            const code = err instanceof TIError ? err.tiCode : 'SYNTAX';
            state.history.push({ id: newId(), expression: expr, result: `ERR:${code}`, timestamp: Date.now(), isError: true });
          }
          state.inputLine = '';
          state.cursorPos = 0;
          state.isSecond = false;
          state.isAlpha = false;
          return;
        }

        try {
          const { result, value } = evaluateExpression(
            expr,
            mergedVars,
            state.lastAnswer,
            state.settings.angleMode,
            state.settings.displayMode,
            state.settings.decimalPlaces
          );
          state.lastAnswer = value as number | string;
          state.variables['Ans'] = value as number;
          const entry: HistoryEntry = {
            id: newId(), expression: expr, result, timestamp: Date.now(), isError: false
          };
          state.history.push(entry);
        } catch (err) {
          const code = err instanceof TIError ? err.tiCode : 'SYNTAX';
          const entry: HistoryEntry = {
            id: newId(), expression: expr, result: `ERR:${code}`, timestamp: Date.now(), isError: true
          };
          state.history.push(entry);
          state.errorState = {
            code,
            message: (err as Error).message,
            options: ['1:Quit', '2:Goto'],
          };
        }
        state.inputLine = '';
        state.cursorPos = 0;
        state.isSecond = false;
        state.isAlpha = false;
      }),

    // ── Modifier Keys ──────────────────────────────────────────────────────
    toggleSecond: () =>
      set((state) => {
        state.isSecond = !state.isSecond;
        if (state.isSecond) { state.isAlpha = false; state.isAlphaLock = false; }
      }),

    toggleAlpha: () =>
      set((state) => {
        if (state.isAlphaLock) {
          state.isAlpha = false;
          state.isAlphaLock = false;
        } else {
          state.isAlpha = !state.isAlpha;
        }
        state.isSecond = false;
      }),

    toggleAlphaLock: () =>
      set((state) => {
        state.isAlphaLock = !state.isAlphaLock;
        state.isAlpha = state.isAlphaLock;
        state.isSecond = false;
      }),

    // ── Screen Mode ──────────────────────────────────────────────────────
    setScreenMode: (mode: ScreenMode) =>
      set((state) => {
        state.screenMode = mode;
        state.isSecond = false;
        state.isAlpha = false;
        state.currentMenu = null;
      }),

    // ── Variables ─────────────────────────────────────────────────────────
    storeVariable: (name: string, value: number | string) =>
      set((state) => { state.variables[name] = value; }),

    recallVariable: (name: string) =>
      set((state) => {
        const val = state.variables[name];
        if (val !== undefined) {
          get().appendInput(String(val));
        }
      }),

    setTvm: (key, val) =>
      set((state) => {
        (state.tvm as Record<string, unknown>)[key] = val;
      }),

    // ── Equations ─────────────────────────────────────────────────────────
    setEquation: (index: number, expr: string) =>
      set((state) => { if (index >= 0 && index < state.equations.length) state.equations[index].expr = expr; }),

    toggleEquation: (index: number) =>
      set((state) => { if (index >= 0 && index < state.equations.length) state.equations[index].enabled = !state.equations[index].enabled; }),

    setEquationColor: (index: number, color: string) =>
      set((state) => { if (index >= 0 && index < state.equations.length) state.equations[index].color = color; }),

    // ── Graph Window ──────────────────────────────────────────────────────
    setGraphWindow: (w: Partial<GraphWindow>) =>
      set((state) => { state.graphWindow = { ...state.graphWindow, ...w }; }),

    // ── Mode setters ──────────────────────────────────────────────────────
    setAngleMode: (mode: AngleMode) => set((state) => { state.settings.angleMode = mode; }),
    setDisplayMode: (mode: DisplayMode) => set((state) => { state.settings.displayMode = mode; }),
    setDecimalPlaces: (n: DecimalPlaces) => set((state) => { state.settings.decimalPlaces = n; }),
    setCalcMode: (mode: CalcMode) => set((state) => { state.settings.calcMode = mode; }),
    setSetting: (key: keyof CalcSettings, value: unknown) =>
      set((state) => { (state.settings as Record<string, unknown>)[key] = value; }),

    // ── Cursor ────────────────────────────────────────────────────────────
    moveCursor: (dir: 'left' | 'right' | 'up' | 'down') =>
      set((state) => {
        if (dir === 'left') state.cursorPos = Math.max(0, state.cursorPos - 1);
        if (dir === 'right') state.cursorPos = Math.min(state.inputLine.length, state.cursorPos + 1);
        if (dir === 'up') state.historyScrollOffset = Math.max(0, state.historyScrollOffset - 1);
        if (dir === 'down') state.historyScrollOffset = Math.min(state.history.length, state.historyScrollOffset + 1);
      }),

    scrollHistory: (dir: 'up' | 'down') =>
      set((state) => {
        if (dir === 'up') {
          // Recall previous expression
          const idx = state.history.length - 1 - state.historyScrollOffset;
          if (idx >= 0) {
            state.inputLine = state.history[idx].expression;
            state.cursorPos = state.inputLine.length;
            state.historyScrollOffset++;
          }
        } else {
          if (state.historyScrollOffset > 0) {
            state.historyScrollOffset--;
            const idx = state.history.length - state.historyScrollOffset;
            state.inputLine = idx <= state.history.length - 1 ? state.history[idx].expression : '';
            state.cursorPos = state.inputLine.length;
          }
        }
      }),

    // ── Menus ─────────────────────────────────────────────────────────────
    openMenu: (menu: MenuState | MenuState[]) => set((state) => { state.currentMenu = menu; }),
    closeMenu: () => set((state) => { state.currentMenu = null; }),
    selectMenuItem: (index: number) =>
      set((state) => {
        if (!state.currentMenu) return;
        const currentMenu = Array.isArray(state.currentMenu)
          ? state.currentMenu.find(m => m.selectedIndex !== undefined) ?? state.currentMenu[0]
          : state.currentMenu;
        
        // This logic is mostly handled by MenuOverlay now, 
        // but leaving here for store consistency if needed.
        if (currentMenu && index < currentMenu.items.length) {
          currentMenu.selectedIndex = index;
        }
      }),

    // ── Trace ─────────────────────────────────────────────────────────────
    setTraceState: (t: Partial<TraceState>) =>
      set((state) => { state.traceState = { ...state.traceState, ...t }; }),

    // ── Error ─────────────────────────────────────────────────────────────
    setError: (err: ErrorState | null) => set((state) => { state.errorState = err; }),

    // ── Brightness ────────────────────────────────────────────────────────
    setBrightness: (n: number) => set((state) => { state.brightness = Math.max(0, Math.min(9, n)); }),

    // ── Lists & Matrices ──────────────────────────────────────────────────
    setList: (name: string, values: number[]) =>
      set((state) => { state.lists[name] = values; }),

    setMatrix: (name: string, matrix: MatrixData) =>
      set((state) => { state.matrices[name] = matrix; }),

    // ── Programs ──────────────────────────────────────────────────────────
    addProgram: (prog: Program) => set((state) => { state.programs.push(prog); }),
    updateProgram: (index: number, prog: Partial<Program>) =>
      set((state) => { if (state.programs[index]) state.programs[index] = { ...state.programs[index], ...prog }; }),
    deleteProgram: (index: number) =>
      set((state) => { state.programs.splice(index, 1); }),
    executeProgram: (index: number) => {
      const prog = get().programs[index];
      if (!prog) return;
      const state = get();
      const interpreter = new TIBasicInterpreter(prog.lines, {
        variables: { ...state.variables },
        lastAnswer: state.lastAnswer,
        angleMode: state.settings.angleMode,
        displayMode: state.settings.displayMode,
        decimalPlaces: state.settings.decimalPlaces,
        output: [],
        onOutput: (line: string) => {
          set((s) => { s.history.push({ id: newId(), expression: line, result: '', timestamp: Date.now(), isError: false }); });
        },
        onInput: (prompt: string) => {
          return new Promise((resolve) => {
            const val = window.prompt(prompt) ?? '0';
            resolve(val);
          });
        },
        onMenu: (title: string, options: string[], labels: string[]) => {
          return new Promise((resolve) => {
            const choice = window.prompt(`${title}\n${options.map((o, i) => `${i + 1}: ${o}`).join('\n')}`);
            const idx = parseInt(choice ?? '1') - 1;
            resolve(labels[Math.max(0, Math.min(idx, labels.length - 1))]);
          });
        },
        onPause: () => new Promise((resolve) => setTimeout(resolve, 500)),
        onClrHome: () => set((s) => { s.history = []; }),
        updateVar: (name: string, value: number | string) => {
          set((s) => { s.variables[name] = value; });
        },
      });
      interpreter.run().catch((err: Error) => {
        set((s) => { s.errorState = { code: 'BREAK', message: err.message, options: ['1:Quit'] }; });
      });
    },

    // ── Table ─────────────────────────────────────────────────────────────
    setTableSettings: (s: Partial<TableSettings>) =>
      set((state) => { state.tableSettings = { ...state.tableSettings, ...s }; }),

    // ── Session Persistence ───────────────────────────────────────────────
    loadSession: (partial: Partial<CalculatorState>) =>
      set((state) => {
        if (partial.history) state.history = partial.history;
        if (partial.variables) state.variables = partial.variables;
        if (partial.equations) state.equations = partial.equations;
        if (partial.settings) state.settings = { ...state.settings, ...partial.settings };
        if (partial.graphWindow) state.graphWindow = { ...state.graphWindow, ...partial.graphWindow };
        if (partial.programs) state.programs = partial.programs;
        if (partial.lists) state.lists = partial.lists;
        if (partial.sessionId) state.sessionId = partial.sessionId;
        if (partial.lastAnswer !== undefined) state.lastAnswer = partial.lastAnswer;
      }),

    saveSession: async () => {
      const state = get();
      try {
        const { saveCalculatorState } = await import('@/app/actions/calculator');
        await saveCalculatorState({
          history: state.history,
          variables: state.variables,
          equations: state.equations,
          settings: state.settings,
          graphWindow: state.graphWindow,
          programs: state.programs,
          lists: state.lists,
          lastAnswer: state.lastAnswer,
        });
      } catch {
        // Silent fail if DB not configured
        console.warn('Session save failed (DB may not be configured)');
      }
    },
  }))
);

// ── Action dispatcher (called by key handlers) ────────────────────────────
export function dispatchAction(action: KeyAction): void {
  const store = useCalculatorStore.getState();

  if (action === null) return;

  if (typeof action === 'object' && action.type === 'insert') {
    let textToInsert = action.text;
    if (textToInsert === 'X_VAR') {
      const mode = store.settings.calcMode;
      textToInsert = mode === 'PAR' ? 'T' : mode === 'POL' ? 'θ' : mode === 'SEQ' ? 'n' : 'X';
    }

    if (typeof document !== 'undefined') {
      const el = document.activeElement as HTMLInputElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
        const start = el.selectionStart || 0;
        const end = el.selectionEnd || 0;
        const val = el.value;
        const nextVal = val.slice(0, start) + textToInsert + val.slice(end);
        
        const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
        nativeInputValueSetter?.call(el, nextVal);
        
        el.selectionStart = el.selectionEnd = start + textToInsert.length;
        el.dispatchEvent(new Event('input', { bubbles: true }));
        return;
      }
    }

    store.appendInput(textToInsert);
    return;
  }

  switch (action) {
    case 'evaluate': store.evaluate(); break;
    case 'delete':
      if (typeof document !== 'undefined') {
        const el = document.activeElement as HTMLInputElement;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
          const start = el.selectionStart || 0;
          const end = el.selectionEnd || 0;
          if (start === end && start > 0) {
            const val = el.value;
            const nextVal = val.slice(0, start - 1) + val.slice(end);
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            nativeInputValueSetter?.call(el, nextVal);
            el.selectionStart = el.selectionEnd = start - 1;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          } else if (start !== end) {
            const val = el.value;
            const nextVal = val.slice(0, start) + val.slice(end);
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
            nativeInputValueSetter?.call(el, nextVal);
            el.selectionStart = el.selectionEnd = start;
            el.dispatchEvent(new Event('input', { bubbles: true }));
          }
          break;
        }
      }
      store.deleteChar();
      break;
    case 'clear':
      if (store.inputLine) store.clearInput();
      else store.setScreenMode('home');
      break;
    case 'toggle_second': store.toggleSecond(); break;
    case 'toggle_alpha': store.toggleAlpha(); break;
    case 'toggle_alpha_lock': store.toggleAlphaLock(); break;
    case 'cursor_left': store.moveCursor('left'); break;
    case 'cursor_right': store.moveCursor('right'); break;
    case 'cursor_up': {
      if (store.screenMode === 'home') store.scrollHistory('up');
      else store.moveCursor('up');
      break;
    }
    case 'cursor_down': {
      if (store.screenMode === 'home') store.scrollHistory('down');
      else store.moveCursor('down');
      break;
    }
    case 'insert_toggle':
      useCalculatorStore.setState((s: CalculatorState) => ({ ...s, insertMode: !s.insertMode }));
      break;
    case 'screen_y_equals': store.setScreenMode('y_equals'); break;
    case 'screen_window': store.setScreenMode('window'); break;
    case 'screen_zoom': store.setScreenMode('zoom'); break;
    case 'screen_graph': store.setScreenMode('graph'); break;
    case 'screen_table': store.setScreenMode('table'); break;
    case 'screen_mode': store.setScreenMode('mode'); break;
    case 'screen_stat': store.setScreenMode('stat'); break;
    case 'screen_matrix': store.setScreenMode('matrix'); break;
    case 'screen_prgm': store.setScreenMode('program'); break;
    case 'screen_home': store.setScreenMode('home'); break;
    case 'screen_stat_plot': store.setScreenMode('stat_plot'); break;
    case 'screen_format': store.setScreenMode('format'); break;
    case 'screen_calc_menu': store.setScreenMode('calc_menu'); break;
    case 'screen_catalog': store.setScreenMode('catalog'); break;
    case 'screen_tvm_solver': store.setScreenMode('tvm_solver'); break;
    case 'menu_math': store.openMenu([MATH_MENU, CMPLX_MENU, PROB_MENU]); break;
    case 'menu_test': store.openMenu(TEST_MENU); break;
    case 'menu_angle': store.openMenu(ANGLE_MENU); break;
    case 'menu_draw': store.openMenu(DRAW_MENU); break;
    case 'menu_vars': store.setScreenMode('vars_menu'); break;
    case 'menu_distr': store.openMenu(DISTR_MENU); break;
    case 'menu_mem': store.setScreenMode('mem_menu'); break;
    case 'menu_apps': store.openMenu(APPS_MENU); break;
    case 'menu_list': store.openMenu(LIST_MENU); break;
    case 'menu_matrix': store.openMenu([MATRIX_NAMES_MENU, MATRIX_MATH_MENU, MATRIX_EDIT_MENU]); break;
    case 'menu_link': break; // stub
    case 'menu_stat_calc': store.setScreenMode('stat_calc'); break;
    case 'menu_stat_tests': store.setScreenMode('stat_tests'); break;
    case 'trace_mode':
      store.setScreenMode('graph');
      store.setTraceState({ active: true });
      break;
    case 'sto_arrow': store.appendInput('→'); break;
    case 'recall': store.appendInput('rcl '); break;
    case 'entry_recall':
      if (store.history.length > 0) {
        const last = store.history[store.history.length - 1];
        useCalculatorStore.setState((s: CalculatorState) => ({
          ...s, inputLine: last.expression, cursorPos: last.expression.length
        }));
      }
      break;
    case 'entry_solve': store.evaluate(); break;
    case 'power': break; // ON/power (could reset)
    default: break;
  }
}

// ── Convenience menu definitions ──────────────────────────────────────────
const ins2 = (text: string): KeyAction => ({ type: 'insert', text });

export const MATH_MENU: MenuState = {
  type: 'math_menu',
  title: 'MATH',
  selectedIndex: 0,
  items: [
    { label: '1:abs(', action: 'insert', value: 'abs(' },
    { label: '2:round(', action: 'insert', value: 'round(' },
    { label: '3:iPart(', action: 'insert', value: 'iPart(' },
    { label: '4:fPart(', action: 'insert', value: 'fPart(' },
    { label: '5:int(', action: 'insert', value: 'int(' },
    { label: '6:min(', action: 'insert', value: 'min(' },
    { label: '7:max(', action: 'insert', value: 'max(' },
    { label: '8:lcm(', action: 'insert', value: 'lcm(' },
    { label: '9:gcd(', action: 'insert', value: 'gcd(' },
    { label: '0:remainder(', action: 'insert', value: 'remainder(' },
    { label: 'A:nDeriv(', action: 'insert', value: 'nDeriv(' },
    { label: 'B:fnInt(', action: 'insert', value: 'fnInt(' },
    { label: 'C:nCr', action: 'insert', value: 'nCr' },
    { label: 'D:nPr', action: 'insert', value: 'nPr' },
    { label: 'E:rand', action: 'insert', value: 'rand' },
    { label: 'F:randInt(', action: 'insert', value: 'randInt(' },
    { label: 'G:randNorm(', action: 'insert', value: 'randNorm(' },
    { label: 'H:seq(', action: 'insert', value: 'seq(' },
  ],
};

export const CMPLX_MENU: MenuState = {
  type: 'math_menu',
  title: 'CMPLX',
  selectedIndex: 0,
  items: [
    { label: '1:conj(', action: 'insert', value: 'conj(' },
    { label: '2:real(', action: 'insert', value: 'real(' },
    { label: '3:imag(', action: 'insert', value: 'imag(' },
    { label: '4:angle(', action: 'insert', value: 'angle(' },
    { label: '5:abs(', action: 'insert', value: 'abs(' },
    { label: '6:►Rect', action: 'insert', value: '►Rect' },
    { label: '7:►Polar', action: 'insert', value: '►Polar' },
  ],
};

export const PROB_MENU: MenuState = {
  type: 'math_menu',
  title: 'PROB',
  selectedIndex: 0,
  items: [
    { label: '1:rand', action: 'insert', value: 'rand' },
    { label: '2:nPr', action: 'insert', value: 'nPr' },
    { label: '3:nCr', action: 'insert', value: 'nCr' },
    { label: '4:!', action: 'insert', value: '!' },
    { label: '5:randInt(', action: 'insert', value: 'randInt(' },
    { label: '6:randNorm(', action: 'insert', value: 'randNorm(' },
    { label: '7:randBin(', action: 'insert', value: 'randBin(' },
    { label: '8:randIntNoRep(', action: 'insert', value: 'randIntNoRep(' },
  ],
};

export const TEST_MENU: MenuState = {
  type: 'test_menu',
  title: 'TEST',
  selectedIndex: 0,
  items: [
    { label: '1: =', action: 'insert', value: '=' },
    { label: '2: ≠', action: 'insert', value: '≠' },
    { label: '3: >', action: 'insert', value: '>' },
    { label: '4: ≥', action: 'insert', value: '≥' },
    { label: '5: <', action: 'insert', value: '<' },
    { label: '6: ≤', action: 'insert', value: '≤' },
    { label: '7: and', action: 'insert', value: ' and ' },
    { label: '8: or', action: 'insert', value: ' or ' },
    { label: '9: xor', action: 'insert', value: ' xor ' },
    { label: '0: not(', action: 'insert', value: 'not(' },
  ],
};

export const ANGLE_MENU: MenuState = {
  type: 'angle_menu',
  title: 'ANGLE',
  selectedIndex: 0,
  items: [
    { label: '1:°', action: 'insert', value: '°' },
    { label: '2:\'', action: 'insert', value: '\'' },
    { label: '3:r (radian)', action: 'insert', value: 'r' },
    { label: '4:►DMS', action: 'insert', value: '►DMS' },
    { label: '5:►DD', action: 'insert', value: '►DD' },
    { label: '6:R►Pr(', action: 'insert', value: 'R►Pr(' },
    { label: '7:R►Pθ(', action: 'insert', value: 'R►Pθ(' },
    { label: '8:P►Rx(', action: 'insert', value: 'P►Rx(' },
    { label: '9:P►Ry(', action: 'insert', value: 'P►Ry(' },
  ],
};

export const DRAW_MENU: MenuState = {
  type: 'draw_menu',
  title: 'DRAW',
  selectedIndex: 0,
  items: [
    { label: '1:ClrDraw', action: 'insert', value: 'ClrDraw' },
    { label: '2:Line(', action: 'insert', value: 'Line(' },
    { label: '3:Horizontal ', action: 'insert', value: 'Horizontal ' },
    { label: '4:Vertical ', action: 'insert', value: 'Vertical ' },
    { label: '5:Tangent(', action: 'insert', value: 'Tangent(' },
    { label: '6:DrawF ', action: 'insert', value: 'DrawF ' },
    { label: '7:Shade(', action: 'insert', value: 'Shade(' },
    { label: '8:DrawInv ', action: 'insert', value: 'DrawInv ' },
    { label: '9:Circle(', action: 'insert', value: 'Circle(' },
    { label: '0:Text(', action: 'insert', value: 'Text(' },
  ],
};

export const DISTR_MENU: MenuState = {
  type: 'distr_menu',
  title: 'DISTR',
  selectedIndex: 0,
  items: [
    { label: '1:normalcdf(', action: 'insert', value: 'normalcdf(' },
    { label: '2:normalpdf(', action: 'insert', value: 'normalpdf(' },
    { label: '3:invNorm(', action: 'insert', value: 'invNorm(' },
    { label: '4:binompdf(', action: 'insert', value: 'binompdf(' },
    { label: '5:binomcdf(', action: 'insert', value: 'binomcdf(' },
    { label: '6:poissonpdf(', action: 'insert', value: 'poissonpdf(' },
    { label: '7:poissoncdf(', action: 'insert', value: 'poissoncdf(' },
    { label: '8:geometpdf(', action: 'insert', value: 'geometpdf(' },
    { label: '9:geometcdf(', action: 'insert', value: 'geometcdf(' },
    { label: '0:randNorm(', action: 'insert', value: 'randNorm(' },
    { label: 'A:randInt(', action: 'insert', value: 'randInt(' },
    { label: 'B:randBin(', action: 'insert', value: 'randBin(' },
  ],
};

export const APPS_MENU: MenuState = {
  type: 'math_menu',
  title: 'APPS',
  selectedIndex: 0,
  items: [
    { label: '1:Finance', action: 'screen_tvm_solver' },
    { label: '2:CBL/CBR', action: 'insert', value: '' },
    { label: '3:Inequality Graphing', action: 'insert', value: '' },
    { label: '4:Polynomial Root Finder', action: 'insert', value: '' },
    { label: '5:Periodic Table', action: 'insert', value: '' },
  ],
};

export const LIST_MENU: MenuState = {
  type: 'math_menu',
  title: 'LIST',
  selectedIndex: 0,
  items: [
    { label: '1:SortA(', action: 'insert', value: 'SortA(' },
    { label: '2:SortD(', action: 'insert', value: 'SortD(' },
    { label: '3:dim(', action: 'insert', value: 'dim(' },
    { label: '4:Fill(', action: 'insert', value: 'Fill(' },
    { label: '5:seq(', action: 'insert', value: 'seq(' },
    { label: '6:cumSum(', action: 'insert', value: 'cumSum(' },
    { label: '7:ΔList(', action: 'insert', value: 'ΔList(' },
    { label: '8:Select(', action: 'insert', value: 'Select(' },
    { label: '9:augment(', action: 'insert', value: 'augment(' },
    { label: '0:L1', action: 'insert', value: 'L1' },
    { label: 'A:L2', action: 'insert', value: 'L2' },
    { label: 'B:L3', action: 'insert', value: 'L3' },
    { label: 'C:L4', action: 'insert', value: 'L4' },
    { label: 'D:L5', action: 'insert', value: 'L5' },
    { label: 'E:L6', action: 'insert', value: 'L6' },
  ],
};

export const MATRIX_NAMES_MENU: MenuState = {
  type: 'matrix_names',
  title: 'NAMES',
  selectedIndex: 0,
  items: [
    { label: '1:[A]', action: 'insert', value: '[A]' },
    { label: '2:[B]', action: 'insert', value: '[B]' },
    { label: '3:[C]', action: 'insert', value: '[C]' },
    { label: '4:[D]', action: 'insert', value: '[D]' },
    { label: '5:[E]', action: 'insert', value: '[E]' },
    { label: '6:[F]', action: 'insert', value: '[F]' },
    { label: '7:[G]', action: 'insert', value: '[G]' },
    { label: '8:[H]', action: 'insert', value: '[H]' },
    { label: '9:[I]', action: 'insert', value: '[I]' },
    { label: '0:[J]', action: 'insert', value: '[J]' },
  ],
};

export const MATRIX_MATH_MENU: MenuState = {
  type: 'matrix_math',
  title: 'MATH',
  selectedIndex: 0,
  items: [
    { label: '1:det(', action: 'insert', value: 'det(' },
    { label: '2:T', action: 'insert', value: 'T' },
    { label: '3:dim(', action: 'insert', value: 'dim(' },
    { label: '4:Fill(', action: 'insert', value: 'Fill(' },
    { label: '5:identity(', action: 'insert', value: 'identity(' },
    { label: '6:randM(', action: 'insert', value: 'randM(' },
    { label: '7:augment(', action: 'insert', value: 'augment(' },
    { label: '8:Matr►list(', action: 'insert', value: 'Matr►list(' },
    { label: '9:List►matr(', action: 'insert', value: 'List►matr(' },
    { label: '0:cumSum(', action: 'insert', value: 'cumSum(' },
  ],
};

export const MATRIX_EDIT_MENU: MenuState = {
  type: 'matrix_edit',
  title: 'EDIT',
  selectedIndex: 0,
  items: [
    { label: '1:[A]', action: 'screen_matrix' },
    { label: '2:[B]', action: 'screen_matrix' },
    { label: '3:[C]', action: 'screen_matrix' },
    { label: '4:[D]', action: 'screen_matrix' },
    { label: '5:[E]', action: 'screen_matrix' },
    { label: '6:[F]', action: 'screen_matrix' },
    { label: '7:[G]', action: 'screen_matrix' },
    { label: '8:[H]', action: 'screen_matrix' },
    { label: '9:[I]', action: 'screen_matrix' },
    { label: '0:[J]', action: 'screen_matrix' },
  ],
};
