// ============================================================
// TI-84 Plus CE Simulator — Constants & Color Palette
// ============================================================

export const SCREEN_WIDTH = 320;
export const SCREEN_HEIGHT = 240;
export const SCREEN_ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT;

// LCD Color palette (TI-84 Plus CE has 16-bit color)
export const LCD_BG = '#C8D6C8';
export const LCD_BG_LIT = '#E8F4E8';
export const LCD_TEXT = '#000000';
export const LCD_GRID = '#AABFAA';
export const LCD_AXIS = '#000000';
export const LCD_STATUS_BG = '#1A3A1A';
export const LCD_STATUS_TEXT = '#FFFFFF';

// Graph colors (TI-84 Plus CE standard colors)
export const GRAPH_COLORS = [
  '#2196F3', // Blue
  '#F44336', // Red
  '#4CAF50', // Green
  '#FF9800', // Orange
  '#9C27B0', // Purple
  '#00BCD4', // Cyan
  '#FF69B4', // Hot Pink (magenta)
  '#795548', // Dark Brown
  '#607D8B', // Blue Gray
  '#FFEB3B', // Yellow (Y0)
];

// Shell colors — TI-84 Plus CE Red
export const SHELL_BODY = '#8B1A1A';
export const SHELL_BODY_DARK = '#5C0A0A';
export const SHELL_BEZEL = '#111111';
export const SHELL_SCREEN_BG = '#0D0D0D';

// Key colors
export const KEY_DARK = '#4A0A0A';        // Main dark keys (maroon)
export const KEY_MEDIUM = '#D0C8BE';      // Light keys (numbers, operators)
export const KEY_SECOND = '#3B6FC4';      // 2nd key blue
export const KEY_ALPHA = '#2E7D32';       // ALPHA key green
export const KEY_ENTER = '#D0D0D0';       // ENTER key
export const KEY_ON = '#5C0A0A';          // ON key

// Label colors
export const LABEL_PRIMARY = '#FFFFFF';
export const LABEL_SECOND = '#5B9BD5';   // Blue for 2nd functions
export const LABEL_ALPHA = '#4CAF50';    // Green for alpha

// Font sizes
export const FONT_SCREEN_SMALL = 11;
export const FONT_SCREEN_NORMAL = 13;
export const FONT_SCREEN_LARGE = 16;

// Calculator layout
export const CALC_WIDTH = 340;           // CSS px
export const BUTTON_GRID_COLS = 5;

// Math constants
export const DEFAULT_GRAPH_WINDOW = {
  xMin: -10,
  xMax: 10,
  xScl: 1,
  yMin: -10,
  yMax: 10,
  yScl: 1,
  xRes: 1,
  tMin: 0,
  tMax: 2 * Math.PI,
  tStep: Math.PI / 24,
  θMin: 0,
  θMax: 2 * Math.PI,
  θStep: Math.PI / 24,
  nMin: 0,
  nMax: 10,
  plotStart: 1,
  plotStep: 1,
};

export const ZTRIG_WINDOW = {
  xMin: -(47 * Math.PI) / 15,
  xMax: (47 * Math.PI) / 15,
  xScl: Math.PI / 2,
  yMin: -4,
  yMax: 4,
  yScl: 1,
  xRes: 1,
};

export const ZDECIMAL_WINDOW = {
  xMin: -4.7,
  xMax: 4.7,
  xScl: 1,
  yMin: -3.1,
  yMax: 3.1,
  yScl: 1,
  xRes: 1,
};

export const ZINTEGER_WINDOW = {
  xMin: -47,
  xMax: 47,
  xScl: 10,
  yMin: -31,
  yMax: 31,
  yScl: 10,
  xRes: 1,
};

// TI-84 Plus CE has 10 graphing equations (Y1–Y0)
export const NUM_EQUATIONS = 10;
export const EQUATION_NAMES_FUNC = ['Y1', 'Y2', 'Y3', 'Y4', 'Y5', 'Y6', 'Y7', 'Y8', 'Y9', 'Y0'];
export const EQUATION_NAMES_PAR  = ['X1T', 'Y1T', 'X2T', 'Y2T', 'X3T', 'Y3T', 'X4T', 'Y4T', 'X5T', 'Y5T', 'X6T', 'Y6T'];
export const EQUATION_NAMES_POL  = ['r1', 'r2', 'r3', 'r4', 'r5', 'r6'];
export const EQUATION_NAMES_SEQ  = ['u', 'v', 'w'];

// Program name max length
export const PROG_NAME_MAX = 8;
export const PROG_MAX_LINES = 9999;

// Variable names
export const LETTER_VARS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z', 'θ'];
export const LIST_VARS = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];
export const MATRIX_NAMES = ['[A]', '[B]', '[C]', '[D]', '[E]', '[F]', '[G]', '[H]', '[I]', '[J]'];

// Error codes (TI-84 style)
export const ERROR_CODES: Record<string, string> = {
  ARGUMENT:     'ERR:ARGUMENT',
  BAD_GUESS:    'ERR:BAD GUESS',
  BOUND:        'ERR:BOUND',
  BREAK:        'ERR:BREAK',
  DATA_TYPE:    'ERR:DATA TYPE',
  DIM_MISMATCH: 'ERR:DIM MISMATCH',
  DIMENSION:    'ERR:DIMENSION',
  DIVIDE_BY_0:  'ERR:DIVIDE BY 0',
  DOMAIN:       'ERR:DOMAIN',
  DUP_NAME:     'ERR:DUPLICATE NAME',
  ILLEGAL_NEST: 'ERR:ILLEGAL NEST',
  INCREMENT:    'ERR:INCREMENT',
  INVALID:      'ERR:INVALID',
  INVALID_DIM:  'ERR:INVALID DIM',
  ITERATIONS:   'ERR:ITERATIONS',
  LABEL:        'ERR:LABEL',
  LINK:         'ERR:LINK',
  MEMORY:       'ERR:MEMORY',
  MODE:         'ERR:MODE',
  NO_SIGN_CHNG: 'ERR:NO SIGN CHANGE',
  NONREAL_ANS:  'ERR:NONREAL ANS',
  OVERFLOW:     'ERR:OVERFLOW',
  RESERVED:     'ERR:RESERVED',
  SINGULAR_MAT: 'ERR:SINGULAR MAT',
  STAT:         'ERR:STAT',
  STAT_PLOT:    'ERR:STAT PLOT',
  SYNTAX:       'ERR:SYNTAX',
  TOL_NOT_MET:  'ERR:TOL NOT MET',
  UNDEFINED:    'ERR:UNDEFINED',
  VARIABLE:     'ERR:VARIABLE',
  VERSION:      'ERR:VERSION',
  WINDOW_RANGE: 'ERR:WINDOW RANGE',
};

// Zoom factors
export const ZOOM_IN_FACTOR = 0.5;
export const ZOOM_OUT_FACTOR = 2.0;

// ── Convenience aliases used by tests & components ─────────────────────────
export const STATUS_BAR_HEIGHT = 20;
export const LCD_BG_COLOR = LCD_BG;
export const LCD_TEXT_COLOR = LCD_TEXT;
export const LCD_ERROR_COLOR = '#CC0000';
export const MAX_HISTORY = 500;

// Color name labels for graph colors (displayed in UI)
export const GRAPH_COLOR_NAMES = [
  'Blue', 'Red', 'Green', 'Orange', 'Purple',
  'Cyan', 'Pink', 'Brown', 'Gray', 'Yellow',
];
