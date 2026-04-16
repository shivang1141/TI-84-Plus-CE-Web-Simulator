'use client';
// ============================================================
// DirectionalPad — Circular D-pad component
// ============================================================

import { dispatchAction } from '@/store/useCalculatorStore';

export default function DirectionalPad() {
  const handleDirection = (dir: 'up' | 'down' | 'left' | 'right') => {
    dispatchAction(`cursor_${dir}` as 'cursor_up' | 'cursor_down' | 'cursor_left' | 'cursor_right');
  };

  return (
    <div className="relative w-[72px] h-[72px] flex-shrink-0">
      {/* Outer ring */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#5A5A5A] to-[#2A2A2A] shadow-lg border border-black/50" />

      {/* Up */}
      <button
        onPointerDown={() => handleDirection('up')}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-8 flex items-end justify-center pb-1 text-white text-[14px] font-bold hover:text-[#5B9BD5] active:scale-95 transition-transform cursor-pointer select-none"
        style={{ borderRadius: '50% 50% 0 0' }}
        aria-label="Up"
      >
        ▲
      </button>

      {/* Down */}
      <button
        onPointerDown={() => handleDirection('down')}
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-8 flex items-start justify-center pt-1 text-white text-[14px] font-bold hover:text-[#5B9BD5] active:scale-95 transition-transform cursor-pointer select-none"
        style={{ borderRadius: '0 0 50% 50%' }}
        aria-label="Down"
      >
        ▼
      </button>

      {/* Left */}
      <button
        onPointerDown={() => handleDirection('left')}
        className="absolute left-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-end pr-1 text-white text-[14px] font-bold hover:text-[#5B9BD5] active:scale-95 transition-transform cursor-pointer select-none"
        style={{ borderRadius: '50% 0 0 50%' }}
        aria-label="Left"
      >
        ◀
      </button>

      {/* Right */}
      <button
        onPointerDown={() => handleDirection('right')}
        className="absolute right-0 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-start pl-1 text-white text-[14px] font-bold hover:text-[#5B9BD5] active:scale-95 transition-transform cursor-pointer select-none"
        style={{ borderRadius: '0 50% 50% 0' }}
        aria-label="Right"
      >
        ▶
      </button>

      {/* Center dot */}
      <div className="absolute inset-[22px] rounded-full bg-gradient-to-br from-[#888] to-[#444] border border-black/40 pointer-events-none" />
    </div>
  );
}
