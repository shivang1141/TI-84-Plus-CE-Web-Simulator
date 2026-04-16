// ============================================================
// TI-84 Plus CE Simulator — Key Definitions
// Every key: primary, second, alpha functions
// ============================================================

export type KeyAction =
  // Navigation
  | 'cursor_up' | 'cursor_down' | 'cursor_left' | 'cursor_right'
  // Modifiers
  | 'toggle_second' | 'toggle_alpha' | 'toggle_alpha_lock'
  // Input operations
  | 'evaluate' | 'delete' | 'insert_toggle' | 'clear' | 'power'
  // Screens
  | 'screen_y_equals' | 'screen_window' | 'screen_zoom' | 'screen_graph' | 'screen_table'
  | 'screen_mode' | 'screen_stat' | 'screen_matrix' | 'screen_prgm' | 'screen_home'
  | 'screen_stat_plot' | 'screen_format' | 'screen_calc_menu' | 'screen_catalog' | 'screen_tvm_solver'
  // Menus
  | 'menu_math' | 'menu_test' | 'menu_angle' | 'menu_draw' | 'menu_vars' | 'menu_distr'
  | 'menu_mem' | 'menu_apps' | 'menu_prgm' | 'menu_list' | 'menu_stat_calc' | 'menu_stat_tests'
  | 'menu_link' | 'menu_matrix'
  // Special actions
  | 'sto_arrow' | 'recall' | 'trace_mode' | 'entry_recall' | 'entry_solve'
  // Insert strings
  | { type: 'insert'; text: string }
  | null;

export interface KeyDef {
  id: string;
  primary: KeyAction;
  primaryLabel: string;
  second?: KeyAction;
  secondLabel?: string;
  alpha?: KeyAction;
  alphaLabel?: string;
  wide?: boolean;       // Extra wide key (ENTER)
  color?: 'dark' | 'light' | 'blue' | 'green' | 'gray';
  row: number;
  col: number;
}

const ins = (text: string): KeyAction => ({ type: 'insert', text });

export const KEY_DEFINITIONS: KeyDef[] = [
  // ── Row 0: Function row ──────────────────────────────────────────────────
  {
    id: 'y_equals', row: 0, col: 0,
    primary: 'screen_y_equals', primaryLabel: 'Y=',
    second: 'screen_stat_plot', secondLabel: 'stat plot',
    color: 'dark',
  },
  {
    id: 'window', row: 0, col: 1,
    primary: 'screen_window', primaryLabel: 'window',
    second: 'screen_table', secondLabel: 'tblset',
    color: 'dark',
  },
  {
    id: 'zoom', row: 0, col: 2,
    primary: 'screen_zoom', primaryLabel: 'zoom',
    second: 'screen_format', secondLabel: 'format',
    color: 'dark',
  },
  {
    id: 'trace', row: 0, col: 3,
    primary: 'trace_mode', primaryLabel: 'trace',
    second: 'screen_calc_menu', secondLabel: 'calc',
    color: 'dark',
  },
  {
    id: 'graph', row: 0, col: 4,
    primary: 'screen_graph', primaryLabel: 'graph',
    second: 'screen_table', secondLabel: 'table',
    color: 'dark',
  },

  // ── Row 1: Mode/2nd/Del ──────────────────────────────────────────────────
  {
    id: 'second', row: 1, col: 0,
    primary: 'toggle_second', primaryLabel: '2nd',
    color: 'blue',
  },
  {
    id: 'mode', row: 1, col: 1,
    primary: 'screen_mode', primaryLabel: 'mode',
    second: 'screen_home', secondLabel: 'quit',
    color: 'dark',
  },
  {
    id: 'del', row: 1, col: 2,
    primary: 'delete', primaryLabel: 'del',
    second: 'insert_toggle', secondLabel: 'ins',
    color: 'dark',
  },
  // D-pad spans col 3–4, rows 1–2 — handled separately

  // ── Row 2: Alpha/XT/Stat ─────────────────────────────────────────────────
  {
    id: 'alpha', row: 2, col: 0,
    primary: 'toggle_alpha', primaryLabel: 'alpha',
    second: 'toggle_alpha_lock', secondLabel: 'A-lock',
    color: 'green',
  },
  {
    id: 'xtθn', row: 2, col: 1,
    primary: ins('X_VAR'), primaryLabel: 'X,T,θ,n',
    second: 'menu_link', secondLabel: 'link',
    alpha: ins('θ'), alphaLabel: 'θ',
    color: 'dark',
  },
  {
    id: 'stat', row: 2, col: 2,
    primary: 'screen_stat', primaryLabel: 'stat',
    second: 'menu_list', secondLabel: 'list',
    color: 'dark',
  },

  // ── Row 3: Math/Apps/Prgm/Vars/Clear ────────────────────────────────────
  {
    id: 'math', row: 3, col: 0,
    primary: 'menu_math', primaryLabel: 'math',
    second: 'menu_test', secondLabel: 'test',
    alpha: ins('A'), alphaLabel: 'A',
    color: 'dark',
  },
  {
    id: 'apps', row: 3, col: 1,
    primary: 'menu_apps', primaryLabel: 'apps',
    second: 'menu_angle', secondLabel: 'angle',
    alpha: ins('B'), alphaLabel: 'B',
    color: 'dark',
  },
  {
    id: 'prgm', row: 3, col: 2,
    primary: 'screen_prgm', primaryLabel: 'prgm',
    second: 'menu_draw', secondLabel: 'draw',
    alpha: ins('C'), alphaLabel: 'C',
    color: 'dark',
  },
  {
    id: 'vars', row: 3, col: 3,
    primary: 'menu_vars', primaryLabel: 'vars',
    second: 'menu_distr', secondLabel: 'distr',
    color: 'dark',
  },
  {
    id: 'clear', row: 3, col: 4,
    primary: 'clear', primaryLabel: 'clear',
    color: 'dark',
  },

  // ── Row 4: x⁻¹/Sin/Cos/Tan/^ ────────────────────────────────────────────
  {
    id: 'x_inv', row: 4, col: 0,
    primary: ins('^(-1)'), primaryLabel: 'x⁻¹',
    second: 'menu_matrix', secondLabel: 'matrix',
    alpha: ins('D'), alphaLabel: 'D',
    color: 'dark',
  },
  {
    id: 'sin', row: 4, col: 1,
    primary: ins('sin('), primaryLabel: 'sin',
    second: ins('sin⁻¹('), secondLabel: 'sin⁻¹',
    alpha: ins('E'), alphaLabel: 'E',
    color: 'dark',
  },
  {
    id: 'cos', row: 4, col: 2,
    primary: ins('cos('), primaryLabel: 'cos',
    second: ins('cos⁻¹('), secondLabel: 'cos⁻¹',
    alpha: ins('F'), alphaLabel: 'F',
    color: 'dark',
  },
  {
    id: 'tan', row: 4, col: 3,
    primary: ins('tan('), primaryLabel: 'tan',
    second: ins('tan⁻¹('), secondLabel: 'tan⁻¹',
    alpha: ins('G'), alphaLabel: 'G',
    color: 'dark',
  },
  {
    id: 'caret', row: 4, col: 4,
    primary: ins('^'), primaryLabel: '^',
    second: ins('π'), secondLabel: 'π',
    alpha: ins('H'), alphaLabel: 'H',
    color: 'light',
  },

  // ── Row 5: x²/,/(/)÷ ─────────────────────────────────────────────────────
  {
    id: 'x_sq', row: 5, col: 0,
    primary: ins('²'), primaryLabel: 'x²',
    second: ins('√('), secondLabel: '√',
    alpha: ins('I'), alphaLabel: 'I',
    color: 'dark',
  },
  {
    id: 'comma', row: 5, col: 1,
    primary: ins(','), primaryLabel: ',',
    second: ins('ᴱ'), secondLabel: 'EE',
    alpha: ins('J'), alphaLabel: 'J',
    color: 'dark',
  },
  {
    id: 'lparen', row: 5, col: 2,
    primary: ins('('), primaryLabel: '(',
    second: ins('{'), secondLabel: '{',
    alpha: ins('K'), alphaLabel: 'K',
    color: 'dark',
  },
  {
    id: 'rparen', row: 5, col: 3,
    primary: ins(')'), primaryLabel: ')',
    second: ins('}'), secondLabel: '}',
    alpha: ins('L'), alphaLabel: 'L',
    color: 'dark',
  },
  {
    id: 'div', row: 5, col: 4,
    primary: ins('÷'), primaryLabel: '÷',
    second: ins('e'), secondLabel: 'e',
    alpha: ins('M'), alphaLabel: 'M',
    color: 'light',
  },

  // ── Row 6: Log/7/8/9/× ───────────────────────────────────────────────────
  {
    id: 'log', row: 6, col: 0,
    primary: ins('log('), primaryLabel: 'log',
    second: ins('10^('), secondLabel: '10ˣ',
    alpha: ins('N'), alphaLabel: 'N',
    color: 'dark',
  },
  {
    id: '7', row: 6, col: 1,
    primary: ins('7'), primaryLabel: '7',
    second: ins('u'), secondLabel: 'u',
    alpha: ins('O'), alphaLabel: 'O',
    color: 'light',
  },
  {
    id: '8', row: 6, col: 2,
    primary: ins('8'), primaryLabel: '8',
    second: ins('v'), secondLabel: 'v',
    alpha: ins('P'), alphaLabel: 'P',
    color: 'light',
  },
  {
    id: '9', row: 6, col: 3,
    primary: ins('9'), primaryLabel: '9',
    second: ins('w'), secondLabel: 'w',
    alpha: ins('Q'), alphaLabel: 'Q',
    color: 'light',
  },
  {
    id: 'mul', row: 6, col: 4,
    primary: ins('×'), primaryLabel: '×',
    second: ins('['), secondLabel: '[',
    alpha: ins('R'), alphaLabel: 'R',
    color: 'light',
  },

  // ── Row 7: Ln/4/5/6/− ────────────────────────────────────────────────────
  {
    id: 'ln', row: 7, col: 0,
    primary: ins('ln('), primaryLabel: 'ln',
    second: ins('e^('), secondLabel: 'eˣ',
    alpha: ins('S'), alphaLabel: 'S',
    color: 'dark',
  },
  {
    id: '4', row: 7, col: 1,
    primary: ins('4'), primaryLabel: '4',
    second: ins('L4'), secondLabel: 'L4',
    alpha: ins('T'), alphaLabel: 'T',
    color: 'light',
  },
  {
    id: '5', row: 7, col: 2,
    primary: ins('5'), primaryLabel: '5',
    second: ins('L5'), secondLabel: 'L5',
    alpha: ins('U'), alphaLabel: 'U',
    color: 'light',
  },
  {
    id: '6', row: 7, col: 3,
    primary: ins('6'), primaryLabel: '6',
    second: ins('L6'), secondLabel: 'L6',
    alpha: ins('V'), alphaLabel: 'V',
    color: 'light',
  },
  {
    id: 'sub', row: 7, col: 4,
    primary: ins('−'), primaryLabel: '−',
    second: ins(']'), secondLabel: ']',
    alpha: ins('W'), alphaLabel: 'W',
    color: 'light',
  },

  // ── Row 8: Sto/1/2/3/+ ───────────────────────────────────────────────────
  {
    id: 'sto', row: 8, col: 0,
    primary: 'sto_arrow', primaryLabel: 'sto→',
    second: 'recall', secondLabel: 'rcl',
    alpha: ins('X'), alphaLabel: 'X',
    color: 'dark',
  },
  {
    id: '1', row: 8, col: 1,
    primary: ins('1'), primaryLabel: '1',
    second: ins('L1'), secondLabel: 'L1',
    alpha: ins('Y'), alphaLabel: 'Y',
    color: 'light',
  },
  {
    id: '2', row: 8, col: 2,
    primary: ins('2'), primaryLabel: '2',
    second: ins('L2'), secondLabel: 'L2',
    alpha: ins('Z'), alphaLabel: 'Z',
    color: 'light',
  },
  {
    id: '3', row: 8, col: 3,
    primary: ins('3'), primaryLabel: '3',
    second: ins('L3'), secondLabel: 'L3',
    alpha: ins('θ'), alphaLabel: 'θ',
    color: 'light',
  },
  {
    id: 'add', row: 8, col: 4,
    primary: ins('+'), primaryLabel: '+',
    second: 'menu_mem', secondLabel: 'mem',
    alpha: ins('"'), alphaLabel: '"',
    color: 'light',
  },

  // ── Row 9: On/0/./(-)/Enter ──────────────────────────────────────────────
  {
    id: 'on', row: 9, col: 0,
    primary: 'power', primaryLabel: 'on',
    second: null, secondLabel: 'off',
    color: 'dark',
  },
  {
    id: '0', row: 9, col: 1,
    primary: ins('0'), primaryLabel: '0',
    second: 'screen_catalog', secondLabel: 'catalog',
    alpha: ins(' '), alphaLabel: '⌐',
    color: 'light',
  },
  {
    id: 'dot', row: 9, col: 2,
    primary: ins('.'), primaryLabel: '.',
    second: ins('i'), secondLabel: 'i',
    alpha: ins(':'), alphaLabel: ':',
    color: 'light',
  },
  {
    id: 'neg', row: 9, col: 3,
    primary: ins('(-'), primaryLabel: '(-)',
    second: ins('Ans'), secondLabel: 'ans',
    alpha: ins('?'), alphaLabel: '?',
    color: 'light',
  },
  {
    id: 'enter', row: 9, col: 4,
    primary: 'evaluate', primaryLabel: 'enter',
    second: 'entry_solve', secondLabel: 'entry solve',
    wide: true,
    color: 'gray',
  },

  // ── D-pad ─────────────────────────────────────────────────────────────────
  {
    id: 'up', row: 1, col: 3,
    primary: 'cursor_up', primaryLabel: '▲',
    color: 'gray',
  },
  {
    id: 'down', row: 2, col: 3,
    primary: 'cursor_down', primaryLabel: '▼',
    color: 'gray',
  },
  {
    id: 'left', row: 1, col: 3,
    primary: 'cursor_left', primaryLabel: '◀',
    color: 'gray',
  },
  {
    id: 'right', row: 1, col: 4,
    primary: 'cursor_right', primaryLabel: '▶',
    color: 'gray',
  },
];

// Lookup by id
export const KEY_MAP = Object.fromEntries(KEY_DEFINITIONS.map(k => [k.id, k]));
