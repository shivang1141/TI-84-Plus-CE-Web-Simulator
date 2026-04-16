'use client';
// ============================================================
// CalculatorKey — Reusable key with primary/2nd/alpha labels
// ============================================================

import { useCallback } from 'react';
import { useCalculatorStore, dispatchAction } from '@/store/useCalculatorStore';
import { KeyDef, KeyAction } from '@/lib/keyDefinitions';

interface CalculatorKeyProps {
  keyDef: KeyDef;
  className?: string;
}

export default function CalculatorKey({ keyDef, className = '' }: CalculatorKeyProps) {
  const { isSecond, isAlpha } = useCalculatorStore();

  const handlePress = useCallback(() => {
    let action: KeyAction;
    if (isSecond && keyDef.second !== undefined) {
      action = keyDef.second;
    } else if (isAlpha && keyDef.alpha !== undefined) {
      action = keyDef.alpha;
    } else {
      action = keyDef.primary;
    }
    dispatchAction(action);
  }, [isSecond, isAlpha, keyDef]);

  // Determine display labels
  const primaryLabel = keyDef.primaryLabel;
  const secondLabel = keyDef.secondLabel;
  const alphaLabel = keyDef.alphaLabel;

  // Key color
  const getKeyColors = () => {
    if (keyDef.id === 'second') return { bg: 'bg-[#3B6FC4] hover:bg-[#4A7ED5]', text: 'text-white', border: isSecond ? 'ring-2 ring-yellow-300' : '' };
    if (keyDef.id === 'alpha') return { bg: 'bg-[#2E7D32] hover:bg-[#388E3C]', text: 'text-white', border: isAlpha ? 'ring-2 ring-green-300' : '' };
    if (keyDef.id === 'enter') return { bg: 'bg-[#D0D0D0] hover:bg-[#E0E0E0]', text: 'text-black', border: '' };
    if (keyDef.color === 'light') return { bg: 'bg-[#D8CFC0] hover:bg-[#E4DDD4]', text: 'text-black', border: '' };
    if (keyDef.color === 'gray') return { bg: 'bg-[#B0A8A0] hover:bg-[#C0B8B0]', text: 'text-black', border: '' };
    // dark (default)
    return { bg: 'bg-[#3A0808] hover:bg-[#4A0E0E]', text: 'text-white', border: '' };
  };

  const { bg, text, border } = getKeyColors();

  return (
    <div className="flex flex-col items-center justify-end select-none">
      {/* Secondary label (above, left-ish) */}
      <div className="w-full flex justify-between px-0.5 h-3">
        <span
          className={`text-[7px] leading-none font-medium transition-opacity ${secondLabel ? 'text-[#5B9BD5]' : 'opacity-0'} ${isSecond && secondLabel ? 'opacity-100' : 'opacity-60'}`}
        >
          {secondLabel || '.'}
        </span>
        <span
          className={`text-[7px] leading-none font-medium transition-opacity ${alphaLabel ? 'text-[#4CAF50]' : 'opacity-0'} ${isAlpha && alphaLabel ? 'opacity-100' : 'opacity-60'}`}
        >
          {alphaLabel || '.'}
        </span>
      </div>

      {/* Main key button */}
      <button
        onPointerDown={(e) => {
          e.preventDefault(); // Prevent input fields from losing focus
          e.currentTarget.style.transform = 'translateY(1px)';
          e.currentTarget.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.4)';
          handlePress();
        }}
        onPointerUp={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}
        onPointerLeave={(e) => {
          e.currentTarget.style.transform = '';
          e.currentTarget.style.boxShadow = '';
        }}
        className={`
          ${bg} ${text} ${border} ${className}
          w-full rounded-[4px]
          font-bold leading-tight
          shadow-[0_3px_0_rgba(0,0,0,0.5),0_1px_2px_rgba(0,0,0,0.3)]
          transition-colors duration-75
          flex items-center justify-center
          text-[11px]
          cursor-pointer
          outline-none
          border border-black/20
          ${keyDef.id === 'on' ? 'bg-[#5C0A0A] hover:bg-[#7A1010]' : ''}
        `}
        style={{
          minHeight: '28px',
          paddingTop: '2px',
          paddingBottom: '2px',
        }}
        title={[keyDef.secondLabel && `2nd: ${keyDef.secondLabel}`, keyDef.alphaLabel && `alpha: ${keyDef.alphaLabel}`].filter(Boolean).join(' | ')}
      >
        {primaryLabel}
      </button>
    </div>
  );
}
