// ============================================================
// TI-84 Plus CE Simulator — Graph Engine (Canvas)
// ============================================================

import { evalForGraph } from './mathEngine';
import { AngleMode, Equation, GraphWindow, CalcSettings } from '@/types/calculator';
import { GRAPH_COLORS } from './constants';

export interface GraphContext {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  window: GraphWindow;
  equations: Equation[];
  settings: CalcSettings;
  variables: Record<string, number | string>;
  tracePoint?: { x: number; y: number; eqIndex: number } | null;
}

// ── World ↔ Canvas coordinate transforms ──────────────────────────────────
function worldToCanvas(
  wx: number, wy: number,
  win: GraphWindow,
  cw: number, ch: number
): [number, number] {
  const cx = ((wx - win.xMin) / (win.xMax - win.xMin)) * cw;
  const cy = ch - ((wy - win.yMin) / (win.yMax - win.yMin)) * ch;
  return [cx, cy];
}

function canvasToWorld(
  cx: number, cy: number,
  win: GraphWindow,
  cw: number, ch: number
): [number, number] {
  const wx = win.xMin + (cx / cw) * (win.xMax - win.xMin);
  const wy = win.yMax - (cy / ch) * (win.yMax - win.yMin);
  return [wx, wy];

}

// ── Main graph draw ────────────────────────────────────────────────────────
export function drawGraph(gc: GraphContext): void {
  const { canvas, ctx, window: win, equations, settings, variables } = gc;
  const cw = canvas.width;
  const ch = canvas.height;

  // Background
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cw, ch);

  // Grid
  if (settings.gridOn) {
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 0.5;

    // Vertical grid lines
    const xStart = Math.ceil(win.xMin / win.xScl) * win.xScl;
    for (let x = xStart; x <= win.xMax; x += win.xScl) {
      const [cx] = worldToCanvas(x, 0, win, cw, ch);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, ch);
      ctx.stroke();
    }

    // Horizontal grid lines
    const yStart = Math.ceil(win.yMin / win.yScl) * win.yScl;
    for (let y = yStart; y <= win.yMax; y += win.yScl) {
      const [, cy] = worldToCanvas(0, y, win, cw, ch);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(cw, cy);
      ctx.stroke();
    }
  }

  // Axes
  if (settings.axesOn) {
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1.5;

    // X axis
    if (win.yMin <= 0 && win.yMax >= 0) {
      const [, cy] = worldToCanvas(0, 0, win, cw, ch);
      ctx.beginPath();
      ctx.moveTo(0, cy);
      ctx.lineTo(cw, cy);
      ctx.stroke();

      // X tick marks
      const xStart = Math.ceil(win.xMin / win.xScl) * win.xScl;
      for (let x = xStart; x <= win.xMax; x += win.xScl) {
        if (Math.abs(x) < 1e-10) continue;
        const [cx] = worldToCanvas(x, 0, win, cw, ch);
        ctx.beginPath();
        ctx.moveTo(cx, cy - 3);
        ctx.lineTo(cx, cy + 3);
        ctx.stroke();
      }
    }

    // Y axis
    if (win.xMin <= 0 && win.xMax >= 0) {
      const [cx] = worldToCanvas(0, 0, win, cw, ch);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx, ch);
      ctx.stroke();

      // Y tick marks
      const yStart = Math.ceil(win.yMin / win.yScl) * win.yScl;
      for (let y = yStart; y <= win.yMax; y += win.yScl) {
        if (Math.abs(y) < 1e-10) continue;
        const [, cy] = worldToCanvas(0, y, win, cw, ch);
        ctx.beginPath();
        ctx.moveTo(cx - 3, cy);
        ctx.lineTo(cx + 3, cy);
        ctx.stroke();
      }
    }

    // Arrow heads on axes
    const arrowSize = 6;
    // X axis arrow head (right)
    if (win.yMin <= 0 && win.yMax >= 0 && win.xMax > 0) {
      const [, cy] = worldToCanvas(0, 0, win, cw, ch);
      ctx.beginPath();
      ctx.moveTo(cw, cy);
      ctx.lineTo(cw - arrowSize, cy - arrowSize / 2);
      ctx.lineTo(cw - arrowSize, cy + arrowSize / 2);
      ctx.closePath();
      ctx.fillStyle = '#000000';
      ctx.fill();
    }
    // Y axis arrow head (up)
    if (win.xMin <= 0 && win.xMax >= 0 && win.yMax > 0) {
      const [cx] = worldToCanvas(0, 0, win, cw, ch);
      ctx.beginPath();
      ctx.moveTo(cx, 0);
      ctx.lineTo(cx - arrowSize / 2, arrowSize);
      ctx.lineTo(cx + arrowSize / 2, arrowSize);
      ctx.closePath();
      ctx.fillStyle = '#000000';
      ctx.fill();
    }
  }

  // Labels
  if (settings.labelOn && settings.axesOn) {
    ctx.fillStyle = '#000000';
    ctx.font = '10px monospace';
    const xScl = win.xScl;
    const yScl = win.yScl;
    const xStart = Math.ceil(win.xMin / xScl) * xScl;
    const yStart = Math.ceil(win.yMin / yScl) * yScl;

    const [, axisY] = worldToCanvas(0, 0, win, cw, ch);
    const [axisX] = worldToCanvas(0, 0, win, cw, ch);

    for (let x = xStart; x <= win.xMax; x += xScl) {
      if (Math.abs(x) < 1e-10) continue;
      const [cx] = worldToCanvas(x, 0, win, cw, ch);
      const label = parseFloat(x.toPrecision(4)).toString();
      ctx.fillText(label, cx - label.length * 3, Math.min(axisY + 14, ch - 2));
    }
    for (let y = yStart; y <= win.yMax; y += yScl) {
      if (Math.abs(y) < 1e-10) continue;
      const [, cy] = worldToCanvas(0, y, win, cw, ch);
      const label = parseFloat(y.toPrecision(4)).toString();
      ctx.fillText(label, Math.max(axisX + 3, 2), cy + 4);
    }
  }

  // Plot equations based on mode
  const funcEqs = equations.filter((eq) => eq.name.startsWith('Y'));
  const parEqs = equations.filter((eq) => eq.name.endsWith('T'));
  const polEqs = equations.filter((eq) => eq.name.startsWith('r'));

  if (settings.calcMode === 'FUNC') {
    plotFuncEquations(ctx, funcEqs, win, cw, ch, variables, settings.angleMode);
  } else if (settings.calcMode === 'POL') {
    plotPolarEquations(ctx, polEqs, win, cw, ch, variables, settings.angleMode);
  } else if (settings.calcMode === 'PAR') {
    plotParametricEquations(ctx, parEqs, win, cw, ch, variables, settings.angleMode);
  }

  // Trace point
  if (gc.tracePoint) {
    const { x, y, eqIndex } = gc.tracePoint;
    const [cx, cy] = worldToCanvas(x, y, win, cw, ch);
    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, 2 * Math.PI);
    ctx.fillStyle = GRAPH_COLORS[eqIndex % GRAPH_COLORS.length];
    ctx.fill();
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Display coordinates
    if (settings.coordDisplay) {
      const xStr = `X=${parseFloat(x.toPrecision(6))}`;
      const yStr = `Y=${parseFloat(y.toPrecision(6))}`;
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(xStr, 5, ch - 20);
      ctx.fillText(yStr, 5, ch - 8);
    }
  }
}

function plotFuncEquations(
  ctx: CanvasRenderingContext2D,
  equations: Equation[],
  win: GraphWindow,
  cw: number,
  ch: number,
  variables: Record<string, number | string>,
  angleMode: AngleMode
): void {
  const step = (win.xMax - win.xMin) / (cw / (win.xRes || 1));

  for (let i = 0; i < equations.length; i++) {
    const eq = equations[i];
    if (!eq.enabled || !eq.expr.trim()) continue;

    ctx.beginPath();
    ctx.strokeStyle = eq.color || GRAPH_COLORS[i % GRAPH_COLORS.length];
    ctx.lineWidth = eq.style === 'thick' ? 2.5 : 1.5;
    if (eq.style === 'dot') ctx.setLineDash([2, 4]);
    else ctx.setLineDash([]);

    let penDown = false;
    let prevY = NaN;

    for (let px = 0; px <= cw; px += win.xRes || 1) {
      const wx = win.xMin + (px / cw) * (win.xMax - win.xMin);
      const wy = evalForGraph(eq.expr, 'X', wx, variables, angleMode);

      if (!isNaN(wy) && isFinite(wy)) {
        const [cx, cy] = worldToCanvas(wx, wy, win, cw, ch);

        // Detect discontinuity (large jump)
        if (!penDown || (Math.abs(wy - prevY) > (win.yMax - win.yMin) * 5)) {
          ctx.moveTo(cx, cy);
          penDown = true;
        } else {
          ctx.lineTo(cx, cy);
        }
        prevY = wy;
      } else {
        penDown = false;
        prevY = NaN;
      }
    }

    ctx.stroke();
    ctx.setLineDash([]);

    // Expression label
    if (true) { // exprOn
      ctx.font = '10px monospace';
      ctx.fillStyle = eq.color || GRAPH_COLORS[i % GRAPH_COLORS.length];
      // Find a nice midpoint to label
    }
  }
}

function plotPolarEquations(
  ctx: CanvasRenderingContext2D,
  equations: Equation[],
  win: GraphWindow,
  cw: number,
  ch: number,
  variables: Record<string, number | string>,
  angleMode: AngleMode
): void {
  const θMin = win.θMin ?? 0;
  const θMax = win.θMax ?? 2 * Math.PI;
  const θStep = win.θStep ?? (Math.PI / 120);

  for (let i = 0; i < equations.length; i++) {
    const eq = equations[i];
    if (!eq.enabled || !eq.expr.trim()) continue;

    ctx.beginPath();
    ctx.strokeStyle = eq.color || GRAPH_COLORS[i % GRAPH_COLORS.length];
    ctx.lineWidth = 1.5;

    let penDown = false;
    for (let θ = θMin; θ <= θMax + θStep / 2; θ += θStep) {
      const r = evalForGraph(eq.expr, 'θ', θ, variables, angleMode);
      if (isNaN(r) || !isFinite(r)) { penDown = false; continue; }
      const wx = r * Math.cos(θ);
      const wy = r * Math.sin(θ);
      const [cx, cy] = worldToCanvas(wx, wy, win, cw, ch);
      if (!penDown) { ctx.moveTo(cx, cy); penDown = true; }
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
}

function plotParametricEquations(
  ctx: CanvasRenderingContext2D,
  equations: Equation[],
  win: GraphWindow,
  cw: number,
  ch: number,
  variables: Record<string, number | string>,
  angleMode: AngleMode
): void {
  const tMin = win.tMin ?? 0;
  const tMax = win.tMax ?? 2 * Math.PI;
  const tStep = win.tStep ?? (Math.PI / 24);

  // Parametric: pairs (X1T, Y1T), (X2T, Y2T), ...
  for (let i = 0; i < equations.length - 1; i += 2) {
    const xEq = equations[i];
    const yEq = equations[i + 1];
    if (!xEq.enabled || !xEq.expr.trim() || !yEq.expr.trim()) continue;

    ctx.beginPath();
    ctx.strokeStyle = xEq.color || GRAPH_COLORS[Math.floor(i / 2) % GRAPH_COLORS.length];
    ctx.lineWidth = 1.5;

    let penDown = false;
    for (let t = tMin; t <= tMax + tStep / 2; t += tStep) {
      const wx = evalForGraph(xEq.expr, 'T', t, variables, angleMode);
      const wy = evalForGraph(yEq.expr, 'T', t, variables, angleMode);
      if (isNaN(wx) || isNaN(wy)) { penDown = false; continue; }
      const [cx, cy] = worldToCanvas(wx, wy, win, cw, ch);
      if (!penDown) { ctx.moveTo(cx, cy); penDown = true; }
      else ctx.lineTo(cx, cy);
    }
    ctx.stroke();
  }
}

// ── Draw integration shading ───────────────────────────────────────────────
export function drawIntegralShading(
  ctx: CanvasRenderingContext2D,
  eq: Equation,
  a: number,
  b: number,
  win: GraphWindow,
  cw: number,
  ch: number,
  variables: Record<string, number | string>,
  angleMode: AngleMode,
  color: string
): number {
  const step = (b - a) / 500;
  ctx.beginPath();
  const [x0, y0] = worldToCanvas(a, 0, win, cw, ch);
  ctx.moveTo(x0, y0);

  for (let x = a; x <= b + step / 2; x += step) {
    const y = evalForGraph(eq.expr, 'X', x, variables, angleMode);
    if (!isNaN(y)) {
      const [cx, cy] = worldToCanvas(x, y, win, cw, ch);
      ctx.lineTo(cx, cy);
    }
  }

  const [x1, y1] = worldToCanvas(b, 0, win, cw, ch);
  ctx.lineTo(x1, y1);
  ctx.closePath();
  ctx.fillStyle = color + '55';
  ctx.fill();

  // Calculate area (Simpson's rule)
  let sum = 0;
  const n = 1000;
  const h = (b - a) / n;
  for (let i = 0; i <= n; i++) {
    const x = a + i * h;
    const y = evalForGraph(eq.expr, 'X', x, variables, angleMode);
    const coeff = i === 0 || i === n ? 1 : i % 2 === 0 ? 2 : 4;
    if (!isNaN(y)) sum += coeff * y;
  }
  return (h / 3) * sum;
}

// ── Find zero using bisection ──────────────────────────────────────────────
export function findZero(
  eq: Equation,
  left: number,
  right: number,
  variables: Record<string, number | string>,
  angleMode: AngleMode,
  tol = 1e-8,
  maxIter = 100
): number | null {
  let f = (x: number) => evalForGraph(eq.expr, 'X', x, variables, angleMode);
  let a = left, b = right;
  if (f(a) * f(b) > 0) return null;
  for (let i = 0; i < maxIter; i++) {
    const mid = (a + b) / 2;
    const fmid = f(mid);
    if (Math.abs(fmid) < tol || (b - a) / 2 < tol) return mid;
    if (f(a) * fmid < 0) b = mid; else a = mid;
  }
  return (a + b) / 2;
}

// ── Find min/max using Golden Section ─────────────────────────────────────
export function findMinMax(
  eq: Equation,
  left: number,
  right: number,
  findMin: boolean,
  variables: Record<string, number | string>,
  angleMode: AngleMode,
  tol = 1e-6
): { x: number; y: number } | null {
  const phi = (Math.sqrt(5) - 1) / 2;
  let a = left, b = right;
  const sign = findMin ? 1 : -1;
  const f = (x: number) => sign * evalForGraph(eq.expr, 'X', x, variables, angleMode);

  let c = b - phi * (b - a);
  let d = a + phi * (b - a);

  while (Math.abs(b - a) > tol) {
    if (f(c) < f(d)) b = d; else a = c;
    c = b - phi * (b - a);
    d = a + phi * (b - a);
  }

  const x = (a + b) / 2;
  const y = evalForGraph(eq.expr, 'X', x, variables, angleMode);
  return isNaN(y) ? null : { x, y };
}

// ── Find intersection ──────────────────────────────────────────────────────
export function findIntersection(
  eq1: Equation,
  eq2: Equation,
  left: number,
  right: number,
  variables: Record<string, number | string>,
  angleMode: AngleMode
): { x: number; y: number } | null {
  const diff: Equation = {
    ...eq1,
    expr: `(${eq1.expr})-(${eq2.expr})`
  };
  const x = findZero(diff, left, right, variables, angleMode);
  if (x === null) return null;
  const y = evalForGraph(eq1.expr, 'X', x, variables, angleMode);
  return isNaN(y) ? null : { x, y };
}

// ── Draw home screen (history + input) ────────────────────────────────────
export function drawHomeScreen(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  history: Array<{ expression: string; result: string; isError: boolean }>,
  inputLine: string,
  cursorPos: number,
  cursorVisible: boolean,
  insertMode: boolean,
  scrollOffset: number,
  brightness: number
): void {
  const bg = `hsl(120, 15%, ${85 + brightness}%)`;
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, cw, ch);

  const lineH = 16;
  const padding = 4;
  const maxLines = Math.floor((ch - padding * 2 - lineH) / lineH);
  
  ctx.font = '13px "Courier New", monospace';

  // Render history
  const entries = history.slice(scrollOffset);
  const visibleEntries: Array<{ text: string; isResult: boolean; isError: boolean }> = [];

  for (const entry of entries) {
    visibleEntries.push({ text: entry.expression, isResult: false, isError: false });
    visibleEntries.push({ text: entry.result, isResult: true, isError: entry.isError });
  }

  const startIdx = Math.max(0, visibleEntries.length - maxLines);
  const visibleSlice = visibleEntries.slice(startIdx);

  let y = padding + lineH;
  for (const line of visibleSlice) {
    if (line.isResult) {
      ctx.fillStyle = line.isError ? '#CC0000' : '#000000';
      // Right-align results
      const measured = ctx.measureText(line.text).width;
      ctx.fillText(line.text, cw - measured - padding, y);
    } else {
      ctx.fillStyle = '#000000';
      ctx.fillText(line.text, padding, y);
    }
    y += lineH;
  }

  // Input line at bottom
  const inputY = ch - padding - lineH / 2;
  ctx.fillStyle = '#000000';
  ctx.fillText(inputLine, padding, inputY);

  // Cursor
  if (cursorVisible) {
    const beforeCursor = inputLine.slice(0, cursorPos);
    const cursorX = padding + ctx.measureText(beforeCursor).width;
    if (insertMode) {
      // Underline cursor
      ctx.fillStyle = '#000000';
      ctx.fillRect(cursorX, inputY + 2, 8, 2);
    } else {
      // Block cursor
      ctx.fillStyle = '#000000';
      ctx.fillRect(cursorX, inputY - lineH + 2, 8, lineH - 2);
      // Draw char in bg color
      if (cursorPos < inputLine.length) {
        ctx.fillStyle = bg;
        ctx.fillText(inputLine[cursorPos], cursorX + 1, inputY);
      }
    }
  }
}

// ── Draw status bar ────────────────────────────────────────────────────────
export function drawStatusBar(
  ctx: CanvasRenderingContext2D,
  cw: number,
  angleMode: string,
  displayMode: string,
  complexMode: string,
  isSecond: boolean,
  isAlpha: boolean
): void {
  ctx.fillStyle = '#1A3A1A';
  ctx.fillRect(0, 0, cw, 18);

  ctx.font = '10px "Courier New", monospace';
  ctx.fillStyle = '#FFFFFF';

  const parts = [
    displayMode.toUpperCase(),
    'AUTO',
    complexMode === 'REAL' ? 'REAL' : complexMode,
    angleMode.toUpperCase(),
    'MP',
  ];

  if (isSecond) parts.unshift('2nd');
  if (isAlpha) parts.unshift('ALPHA');

  ctx.fillText(parts.join('  '), 4, 13);

  // Battery icon (top right)
  const bx = cw - 18, by = 3;
  ctx.strokeStyle = '#FFFFFF';
  ctx.lineWidth = 1;
  ctx.strokeRect(bx, by, 14, 10);
  ctx.fillStyle = '#00FF00';
  ctx.fillRect(bx + 1, by + 1, 10, 8);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(bx + 14, by + 3, 2, 4);
}

// ── Draw table screen ──────────────────────────────────────────────────────
export function drawTableScreen(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  equations: Equation[],
  tblStart: number,
  deltaTbl: number,
  scrollRow: number,
  variables: Record<string, number | string>,
  angleMode: AngleMode
): void {
  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, cw, ch);

  const enabledEqs = equations.filter((e) => e.enabled && e.expr.trim());
  const colW = Math.floor((cw - 60) / Math.max(1, enabledEqs.length));
  const rowH = 18;
  const headerH = 20;

  ctx.font = 'bold 12px "Courier New", monospace';
  ctx.fillStyle = '#000080';

  // Header: X, Y1, Y2, ...
  ctx.fillStyle = '#000080';
  ctx.fillRect(0, 0, cw, headerH);
  ctx.fillStyle = '#FFFFFF';
  ctx.fillText('X', 10, headerH - 5);
  enabledEqs.forEach((eq, i) => {
    ctx.fillText(eq.name, 60 + i * colW + 4, headerH - 5);
  });

  // Rows
  const maxRows = Math.floor((ch - headerH) / rowH);

  for (let row = 0; row < maxRows; row++) {
    const rowIndex = scrollRow + row;
    const x = tblStart + rowIndex * deltaTbl;
    const y = headerH + row * rowH;

    // Alternating row background
    if (row % 2 === 0) {
      ctx.fillStyle = '#F0F0F0';
      ctx.fillRect(0, y, cw, rowH);
    }

    ctx.fillStyle = '#000000';
    ctx.font = '12px "Courier New", monospace';
    ctx.fillText(parseFloat(x.toPrecision(6)).toString(), 4, y + rowH - 5);

    enabledEqs.forEach((eq, i) => {
      const val = evalForGraph(eq.expr, 'X', x, variables, angleMode);
      const str = isNaN(val) ? 'ERR' : parseFloat(val.toPrecision(6)).toString();
      ctx.fillStyle = isNaN(val) ? '#CC0000' : '#000080';
      ctx.fillText(str, 60 + i * colW + 4, y + rowH - 5);
    });

    // Row separator
    ctx.strokeStyle = '#CCCCCC';
    ctx.lineWidth = 0.5;
    ctx.beginPath();
    ctx.moveTo(0, y + rowH);
    ctx.lineTo(cw, y + rowH);
    ctx.stroke();
  }

  // Column separators
  ctx.strokeStyle = '#AAAAAA';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(58, 0);
  ctx.lineTo(58, ch);
  ctx.stroke();
}
