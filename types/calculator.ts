// ============================================================
// TI-84 Plus CE Simulator — Type Definitions
// ============================================================

export type ScreenMode =
  | 'home'
  | 'graph'
  | 'table'
  | 'y_equals'
  | 'window'
  | 'zoom'
  | 'mode'
  | 'stat'
  | 'matrix'
  | 'program'
  | 'program_editor'
  | 'math_menu'
  | 'test_menu'
  | 'angle_menu'
  | 'draw_menu'
  | 'vars_menu'
  | 'distr_menu'
  | 'mem_menu'
  | 'catalog'
  | 'error'
  | 'about'
  | 'stat_plot'
  | 'format'
  | 'calc_menu'
  | 'stat_list'
  | 'stat_calc'
  | 'stat_tests'
  | 'matrix_math'
  | 'prgm_exec'
  | 'prgm_edit'
  | 'prgm_new'
  | 'tvm_solver';

export type AngleMode = 'RADIAN' | 'DEGREE' | 'GRADIAN';
export type DisplayMode = 'NORMAL' | 'SCI' | 'ENG';
export type DecimalPlaces = 'FLOAT' | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
export type ComplexMode = 'REAL' | 'a+bi' | 're^θi';
export type CalcMode = 'FUNC' | 'PAR' | 'POL' | 'SEQ';
export type GraphStyle = 'CONNECTED' | 'DOT';
export type LineStyle = 'solid' | 'thick' | 'above' | 'below' | 'path' | 'animate' | 'dot';

export interface HistoryEntry {
  id: string;
  expression: string;
  result: string;
  timestamp: number;
  isError: boolean;
}

export interface Equation {
  name: string;       // Y1, Y2, ... Y0, X1T, Y1T, r1, ...
  expr: string;
  color: string;      // hex color
  enabled: boolean;
  style: LineStyle;
}

export interface GraphWindow {
  xMin: number;
  xMax: number;
  xScl: number;
  yMin: number;
  yMax: number;
  yScl: number;
  xRes: number;       // 1–8, pixels to skip between evaluations
  tMin?: number;
  tMax?: number;
  tStep?: number;
  θMin?: number;
  θMax?: number;
  θStep?: number;
  nMin?: number;
  nMax?: number;
  plotStart?: number;
  plotStep?: number;
}

export interface TableSettings {
  tblStart: number;
  deltaTbl: number;
  indpntAuto: boolean;
  dependAuto: boolean;
}

export interface CalcSettings {
  angleMode: AngleMode;
  displayMode: DisplayMode;
  decimalPlaces: DecimalPlaces;
  complexMode: ComplexMode;
  calcMode: CalcMode;
  graphStyle: GraphStyle;
  coordDisplay: boolean;
  gridOn: boolean;
  axesOn: boolean;
  labelOn: boolean;
  exprOn: boolean;
  seqMode?: 'Time' | 'Web' | 'uv' | 'vw' | 'uw';
}

export interface MatrixData {
  rows: number;
  cols: number;
  data: number[][];
}

export interface Program {
  name: string;
  lines: string[];
  protected: boolean;
  createdAt: number;
}

export interface StatPlot {
  enabled: boolean;
  type: 'scatter' | 'xyLine' | 'boxPlot' | 'histogram' | 'modBoxPlot' | 'normProb';
  xList: string;
  yList: string;
  mark: 'dot' | 'cross' | 'plus';
  color: string;
}

export interface TraceState {
  active: boolean;
  equationIndex: number;
  x: number;
  y: number;
}

export interface MenuState {
  type: ScreenMode | null;
  title: string;
  items: MenuItem[];
  selectedIndex: number;
  subMenu?: MenuState;
}

export interface TvmState {
  N: number;
  I: number;
  PV: number;
  PMT: number;
  FV: number;
  PY: number;
  CY: number;
  pmtAtEnd: boolean;
}

export interface MenuItem {
  label: string;
  action: string;
  value?: string | number;
  submenu?: MenuItem[];
}

export interface ErrorState {
  code: string;    // e.g. 'SYNTAX', 'DOMAIN', 'UNDEFINED'
  message: string;
  options: string[];
}

export interface CalculatorState {
  // Input / Display
  inputLine: string;
  cursorPos: number;
  insertMode: boolean;

  // History
  history: HistoryEntry[];
  historyScrollOffset: number;

  // Screen
  screenMode: ScreenMode;
  brightness: number;   // 0–9 for contrast

  // Modifier keys
  isSecond: boolean;
  isAlpha: boolean;
  isAlphaLock: boolean;

  // Variables A–Z, θ
  variables: Record<string, number | string>;
  lastAnswer: number | string;

  // Graph equations
  equations: Equation[];

  // Graph window
  graphWindow: GraphWindow;

  // Table
  tableSettings: TableSettings;
  tableScrollRow: number;

  // Lists L1–L6 (and named lists)
  lists: Record<string, number[]>;

  // Matrices [A]–[J]
  matrices: Record<string, MatrixData>;

  // Stat plots
  statPlots: StatPlot[];

  // Mode settings
  settings: CalcSettings;

  // Stat results
  statResults: Record<string, number | number[]>;

  // TVM
  tvm: TvmState;

  // Programs
  programs: Program[];
  currentProgramIndex: number;
  currentProgramLine: number;

  // Menus
  currentMenu: MenuState | MenuState[] | null;

  // Trace
  traceState: TraceState;

  // Error
  errorState: ErrorState | null;

  // Session
  sessionId: string | null;
  isLoading: boolean;

  // Actions
  appendInput: (char: string) => void;
  deleteChar: () => void;
  insertChar: (char: string) => void;
  setTvm: (key: keyof TvmState, val: number | boolean) => void;
  clearInput: () => void;
  clearAll: () => void;
  evaluate: () => void;
  toggleSecond: () => void;
  toggleAlpha: () => void;
  toggleAlphaLock: () => void;
  setScreenMode: (mode: ScreenMode) => void;
  storeVariable: (name: string, value: number | string) => void;
  recallVariable: (name: string) => void;
  setEquation: (index: number, expr: string) => void;
  toggleEquation: (index: number) => void;
  setEquationColor: (index: number, color: string) => void;
  setGraphWindow: (w: Partial<GraphWindow>) => void;
  setAngleMode: (mode: AngleMode) => void;
  setDisplayMode: (mode: DisplayMode) => void;
  setDecimalPlaces: (n: DecimalPlaces) => void;
  setCalcMode: (mode: CalcMode) => void;
  loadSession: (state: Partial<CalculatorState>) => void;
  saveSession: () => Promise<void>;
  moveCursor: (dir: 'left' | 'right' | 'up' | 'down') => void;
  scrollHistory: (dir: 'up' | 'down') => void;
  openMenu: (menu: MenuState | MenuState[]) => void;
  closeMenu: () => void;
  selectMenuItem: (index: number) => void;
  setTraceState: (t: Partial<TraceState>) => void;
  setError: (err: ErrorState | null) => void;
  setBrightness: (n: number) => void;
  setList: (name: string, values: number[]) => void;
  setMatrix: (name: string, matrix: MatrixData) => void;
  addProgram: (prog: Program) => void;
  updateProgram: (index: number, prog: Partial<Program>) => void;
  deleteProgram: (index: number) => void;
  executeProgram: (index: number) => void;
  setTableSettings: (s: Partial<TableSettings>) => void;
  setSetting: (key: keyof CalcSettings, value: unknown) => void;
}
