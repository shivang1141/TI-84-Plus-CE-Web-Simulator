'use client';
// ============================================================
// Main Calculator Page — hydration + keyboard + shell
// ============================================================

import { useEffect, useRef, useState } from 'react';
import CalculatorShell from '@/components/calculator/CalculatorShell';
import { useCalculatorStore, dispatchAction } from '@/store/useCalculatorStore';
import { getKeyboardAction } from '@/lib/keyboardMap';

// Natural width of the calculator shell (px)
const CALC_NATURAL_W = 370;

export default function CalculatorPage() {
  const { loadSession, setBrightness, brightness, isSecond } = useCalculatorStore();

  // ── Responsive fit: scale the whole calculator to always fill the viewport ─
  const calcRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [naturalH, setNaturalH] = useState(760); // rough guess; overridden after mount

  // ── Load session from DB on mount ────────────────────────────────────────
  useEffect(() => {
    const hydrateSession = async () => {
      try {
        const { loadCalculatorState } = await import('@/app/actions/calculator');
        const session = await loadCalculatorState();
        if (session) {
          loadSession(session as Parameters<typeof loadSession>[0]);
        }
      } catch {
        // DB not configured — run in local-only mode
        console.info('Running in local-only mode (no DB session found)');
      }
    };
    hydrateSession();
  }, [loadSession]);

  // ── Physical keyboard handler ─────────────────────────────────────────────
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Brightness shortcuts: 2nd + ▲/▼
      if (isSecond && e.key === 'ArrowUp') {
        setBrightness(brightness + 1);
        e.preventDefault();
        return;
      }
      if (isSecond && e.key === 'ArrowDown') {
        setBrightness(brightness - 1);
        e.preventDefault();
        return;
      }

      const action = getKeyboardAction(e);
      if (action !== null) {
        e.preventDefault();
        dispatchAction(action);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSecond, brightness, setBrightness]);

  // ── Auto-save every 30s ───────────────────────────────────────────────────
  useEffect(() => {
    const { saveSession } = useCalculatorStore.getState();
    const interval = setInterval(() => {
      saveSession();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  // ── Measure actual calculator height, then keep it fitted to the viewport ──
  useEffect(() => {
    const compute = () => {
      const el = calcRef.current;
      if (!el) return;
      const h = el.offsetHeight || 760;
      setNaturalH(h);
      // Scale to fit both width AND height with a small margin
      const scaleW = (window.innerWidth - 16) / CALC_NATURAL_W;
      const scaleH = (window.innerHeight - 16) / h;
      setScale(Math.min(scaleW, scaleH, 1));
    };
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  return (
    /*
     * h-screen + overflow-hidden = viewport is the boundary, no scrolling ever.
     * The calculator is scaled so it always fits inside the full viewport.
     */
    <main className="h-screen overflow-hidden flex items-center justify-center bg-[#1a1a2e] relative">
      {/* Ambient background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse 60% 60% at 50% 50%, rgba(139,0,0,0.15) 0%, transparent 70%)',
        }}
      />

      {/* Subtle grid pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      {/*
       * Outer shell: its CSS dimensions equal the SCALED size of the calculator.
       * This tells flexbox exactly how much space the visual element occupies,
       * so no overflow / scroll is ever triggered.
       */}
      <div
        className="relative z-10 flex items-center justify-center"
        style={{
          width:  `${CALC_NATURAL_W * scale}px`,
          height: `${naturalH * scale}px`,
          flexShrink: 0,
        }}
      >
        {/* Inner shell: this is the element that actually scales */}
        <div
          ref={calcRef}
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
            filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.9))',
            flexShrink: 0,
          }}
        >
          <CalculatorShell />
        </div>
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white/30 text-[10px] tracking-widest text-center whitespace-nowrap">
        KEYBOARD: Enter=EVAL · Esc=CLR · F1-F5=FUNC KEYS · x=X · p=π
      </div>
    </main>
  );
}
