'use client';
// ============================================================
// Screen — Main canvas LCD display
// Renders all screen modes via canvas + React overlays
// ============================================================

import { useEffect, useRef, useCallback, useState } from 'react';
import { useCalculatorStore, dispatchAction } from '@/store/useCalculatorStore';
import { drawGraph, drawHomeScreen, drawStatusBar, drawTableScreen } from '@/lib/graphEngine';
import { SCREEN_WIDTH, SCREEN_HEIGHT } from '@/lib/constants';
import MenuOverlay from '@/components/screens/MenuOverlay';
import YEqualsScreen from '@/components/screens/YEqualsScreen';
import WindowScreen from '@/components/screens/WindowScreen';
import ZoomScreen from '@/components/screens/ZoomScreen';
import ModeScreen from '@/components/screens/ModeScreen';
import StatScreen from '@/components/screens/StatScreen';
import MatrixScreen from '@/components/screens/MatrixScreen';
import ProgramScreen from '@/components/screens/ProgramScreen';
import TvmSolverScreen from '@/components/screens/TvmSolverScreen';

const STATUS_BAR_H = 20;

export default function Screen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [cursorVisible, setCursorVisible] = useState(true);
  const [traceX, setTraceX] = useState(0);
  const [calcMode, setCalcMode] = useState<'value' | 'zero' | 'min' | 'max' | 'intersect' | 'integral' | null>(null);

  const state = useCalculatorStore();

  // ── Cursor blink ─────────────────────────────────────────────────────────
  useEffect(() => {
    const interval = setInterval(() => setCursorVisible((v) => !v), 530);
    return () => clearInterval(interval);
  }, []);

  // ── Canvas draw ───────────────────────────────────────────────────────────
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = canvas.width / dpr;
    const cssH = canvas.height / dpr;

    // Clear
    ctx.clearRect(0, 0, cssW, cssH);

    const { screenMode, history, inputLine, cursorPos, insertMode,
      equations, graphWindow, settings, variables, traceState, brightness,
      tableSettings, tableScrollRow } = state;

    // Status bar (always)
    drawStatusBar(ctx, cssW, settings.angleMode, settings.displayMode, settings.complexMode, state.isSecond, state.isAlpha);

    const contentH = cssH - STATUS_BAR_H;
    ctx.save();
    ctx.translate(0, STATUS_BAR_H);

    if (screenMode === 'graph') {
      drawGraph({
        canvas: { ...canvas, width: cssW, height: contentH } as HTMLCanvasElement,
        ctx,
        window: graphWindow,
        equations,
        settings,
        variables,
        tracePoint: traceState.active ? { x: traceState.x, y: traceState.y, eqIndex: traceState.equationIndex } : null,
      });
    } else if (screenMode === 'table') {
      drawTableScreen(ctx, cssW, contentH, equations, tableSettings.tblStart, tableSettings.deltaTbl, tableScrollRow, variables, settings.angleMode);
    } else {
      // Home or other text modes render via drawHomeScreen
      drawHomeScreen(
        ctx, cssW, contentH,
        history.slice(-20),
        inputLine,
        cursorPos,
        cursorVisible,
        insertMode,
        0,
        brightness
      );
    }

    ctx.restore();
  }, [state, cursorVisible]);

  // HiDPI canvas setup
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;
    const cssW = container.clientWidth;
    const cssH = container.clientHeight;
    canvas.width = cssW * dpr;
    canvas.height = cssH * dpr;
    canvas.style.width = cssW + 'px';
    canvas.style.height = cssH + 'px';
    const ctx = canvas.getContext('2d');
    if (ctx) ctx.scale(dpr, dpr);
  }, []);

  useEffect(() => {
    draw();
  }, [draw]);

  // ── Graph canvas click (trace / calc) ────────────────────────────────────
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (state.screenMode !== 'graph') return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const cssX = e.clientX - rect.left;
    const cssH = rect.height - STATUS_BAR_H;
    const cssW = rect.width;

    const wx = state.graphWindow.xMin + (cssX / cssW) * (state.graphWindow.xMax - state.graphWindow.xMin);
    if (state.traceState.active) {
      // Move trace to clicked x
      dispatchAction({ type: 'insert', text: '' });
    }
  };

  // ── React-rendered overlays (non-canvas screens) ─────────────────────────
  const renderOverlay = () => {
    const { screenMode } = state;

    if (state.currentMenu) {
      return <MenuOverlay menu={state.currentMenu} />;
    }

    if (state.errorState) {
      return (
        <div className="absolute inset-0 bg-[#E8F4E8] font-mono text-black flex flex-col p-2 z-50" style={{ top: STATUS_BAR_H }}>
          <div className="text-[12px] font-bold">ERR:{state.errorState.code}</div>
          <div className="text-[11px] mt-1 opacity-80">{state.errorState.message}</div>
          <div className="mt-2">
            {state.errorState.options.map((opt, i) => (
              <button
                key={i}
                onClick={() => {
                  state.setError(null);
                  if (opt.includes('Quit')) state.setScreenMode('home');
                }}
                className="block text-[11px] hover:underline"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      );
    }

    switch (screenMode) {
      case 'y_equals':
        return <div className="absolute inset-0 z-40" style={{ top: STATUS_BAR_H }}><YEqualsScreen /></div>;
      case 'window':
        return <div className="absolute inset-0 z-40" style={{ top: STATUS_BAR_H }}><WindowScreen /></div>;
      case 'zoom':
        return <div className="absolute inset-0 z-40" style={{ top: STATUS_BAR_H }}><ZoomScreen /></div>;
      case 'mode':
        return <div className="absolute inset-0 z-40" style={{ top: STATUS_BAR_H }}><ModeScreen /></div>;
      case 'stat':
        return <div className="absolute inset-0 z-40" style={{ top: STATUS_BAR_H }}><StatScreen /></div>;
      case 'matrix':
        return <div className="absolute inset-0 z-40" style={{ top: STATUS_BAR_H }}><MatrixScreen /></div>;
      case 'program':
      case 'program_editor':
      case 'prgm_exec':
      case 'prgm_edit':
      case 'prgm_new':
        return <div className="absolute inset-0 z-40" style={{ top: STATUS_BAR_H }}><ProgramScreen /></div>;
      case 'tvm_solver':
        return <div className="absolute inset-0 z-40" style={{ top: STATUS_BAR_H }}><TvmSolverScreen /></div>;
      case 'vars_menu':
        return (
          <div className="absolute inset-0 z-40 bg-[#E8F4E8] font-mono text-black p-1" style={{ top: STATUS_BAR_H }}>
            <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 mb-1">VARS</div>
            {['Xmin', 'Xmax', 'Xscl', 'Ymin', 'Ymax', 'Yscl', 'Xres', 'TblStart', 'ΔTbl', 'Ans'].map((v, i) => (
              <button key={v} onClick={() => { state.appendInput(v); state.setScreenMode('home'); }}
                className="block w-full text-left text-[11px] px-1 py-0.5 hover:bg-gray-200">
                {i + 1}:{v}
              </button>
            ))}
          </div>
        );
      case 'mem_menu':
        return (
          <div className="absolute inset-0 z-40 bg-[#E8F4E8] font-mono text-black p-1" style={{ top: STATUS_BAR_H }}>
            <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 mb-1">MEMORY</div>
            <div className="text-[10px] mb-1">RAM Used: ~{(JSON.stringify(state.variables).length / 1024).toFixed(1)}KB</div>
            <button onClick={() => { state.clearAll(); state.setScreenMode('home'); }}
              className="block text-[11px] px-1 py-0.5 hover:bg-gray-200 text-red-600">
              1:Reset All
            </button>
            <button onClick={() => { state.setList('L1', []); state.setList('L2', []); state.setList('L3', []); state.setScreenMode('home'); }}
              className="block text-[11px] px-1 py-0.5 hover:bg-gray-200 text-red-600">
              2:ClrAllLists
            </button>
            <button onClick={() => state.setScreenMode('home')}
              className="block text-[11px] px-1 py-0.5 hover:bg-gray-200">
              3:Quit
            </button>
          </div>
        );
      case 'about':
        return (
          <div className="absolute inset-0 z-40 bg-[#E8F4E8] font-mono text-black p-2 flex flex-col items-center justify-center" style={{ top: STATUS_BAR_H }}>
            <div className="text-[13px] font-bold">TI-84 Plus CE</div>
            <div className="text-[10px] opacity-70 mt-1">OS Version 5.7.0</div>
            <div className="text-[10px] opacity-70">Web Simulator v1.0</div>
            <div className="text-[10px] opacity-70 mt-2">© Texas Instruments</div>
            <button onClick={() => state.setScreenMode('home')} className="mt-3 text-[10px] border border-current px-2">OK</button>
          </div>
        );
      case 'catalog':
        return (
          <div className="absolute inset-0 z-40 bg-[#E8F4E8] font-mono text-black p-1" style={{ top: STATUS_BAR_H }}>
            <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 mb-1">CATALOG</div>
            <div className="overflow-y-auto h-[calc(100%-24px)]">
              {[
                'abs(', 'and', 'angle(', 'ANOVA(', 'Ans', 'augment(',
                'binomcdf(', 'binompdf(', 'circle(', 'ClrDraw', 'ClrHome',
                'conj(', 'cos(', 'cos⁻¹(', 'cosh(', 'cumSum(',
                'det(', 'dim(', 'Disp', 'DrawF', 'DrawInv',
                'e', 'End', 'expr(', 'e^(',
                'Fill(', 'fnInt(', 'For(', 'fPart(', 'Goto',
                'identity(', 'If', 'imag(', 'Input', 'int(',
                'iPart(', 'lcm(', 'Lbl', 'length(',
                'linReg(', 'List►matr(', 'ln(', 'log(',
                'max(', 'mean(', 'median(', 'Menu(', 'min(',
                'nDeriv(', 'nCr', 'normalcdf(', 'normalpdf(', 'not(',
                'or', 'Output(', 'Pause', 'poissonpdf(', 'poissoncdf(',
                'Prompt', 'rand', 'randBin(', 'randInt(', 'randNorm(',
                'real(', 'ref(', 'remainder(', 'Return', 'round(',
                'rref(', 'seq(', 'sin(', 'sin⁻¹(', 'sinh(',
                'SortA(', 'SortD(', 'Stop', 'sum(', 'tan(', 'tan⁻¹(', 'tanh(',
                'Then', 'transpose(', 'While', 'xor',
              ].map((fn, i) => (
                <button key={fn} onClick={() => { state.appendInput(fn); state.setScreenMode('home'); }}
                  className="block w-full text-left text-[11px] px-1 py-0.5 hover:bg-[#1A3A1A] hover:text-white">
                  {fn}
                </button>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      style={{
        filter: `brightness(${0.7 + state.brightness * 0.035})`,
      }}
    >
      {/* Canvas (used for home + graph + table) */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        onClick={handleCanvasClick}
        style={{ cursor: state.screenMode === 'graph' ? 'crosshair' : 'default' }}
      />

      {/* React overlays for structured screens */}
      {renderOverlay()}

      {/* Trace readout (graph mode) */}
      {state.screenMode === 'graph' && state.traceState.active && (
        <div className="absolute bottom-1 left-1 right-1 flex justify-between text-[10px] font-mono bg-white/80 px-1 py-0.5 z-30">
          <span>X={parseFloat(state.traceState.x.toPrecision(6))}</span>
          <span className="font-bold">{state.equations[state.traceState.equationIndex]?.name}</span>
          <span>Y={parseFloat(state.traceState.y.toPrecision(6))}</span>
        </div>
      )}
    </div>
  );
}
