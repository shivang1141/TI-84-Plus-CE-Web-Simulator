'use client';
// ============================================================
// Main Calculator Page — hydration + keyboard + shell
// ============================================================

import { useEffect } from 'react';
import CalculatorShell from '@/components/calculator/CalculatorShell';
import { useCalculatorStore, dispatchAction } from '@/store/useCalculatorStore';
import { getKeyboardAction } from '@/lib/keyboardMap';

export default function CalculatorPage() {
  const { loadSession, setBrightness, brightness, isSecond } = useCalculatorStore();

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

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#1a1a2e] relative overflow-hidden">
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

      {/* Calculator */}
      <div className="relative z-10" style={{ filter: 'drop-shadow(0 20px 60px rgba(0,0,0,0.9))' }}>
        <CalculatorShell />
      </div>

      {/* Keyboard hint */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/30 text-[10px] tracking-widest">
        KEYBOARD: Enter=EVAL · Esc=CLR · F1-F5=FUNC KEYS · x=X · p=π
      </div>
    </main>
  );
}
