'use client';
// ============================================================
// CalculatorShell — The outer body of the TI-84 Plus CE
// ============================================================

import Screen from './Screen';
import ButtonGrid from './ButtonGrid';

export default function CalculatorShell() {
  return (
    <div
      className="relative flex flex-col items-center"
      style={{
        width: '370px',
        background: 'linear-gradient(160deg, #9B1C1C 0%, #7A0A0A 40%, #5C0505 100%)',
        borderRadius: '28px 28px 20px 20px',
        boxShadow:
          '0 0 0 2px #3A0000, 0 8px 40px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.12), inset 0 -1px 0 rgba(0,0,0,0.4)',
        padding: '12px 0 16px 0',
      }}
    >
      {/* Texas Instruments wordmark at top */}
      <div className="mb-2 flex items-center gap-1.5">
        {/* TI logo mark */}
        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
          <span className="text-[7px] font-black text-red-800 leading-none">TI</span>
        </div>
        <span className="text-white text-[11px] font-light tracking-widest" style={{ fontFamily: 'Georgia, serif' }}>
          TI-84 Plus CE
        </span>
      </div>

      {/* Screen bezel */}
      <div
        className="mx-auto relative"
        style={{
          background: '#0A0A0A',
          borderRadius: '10px 10px 8px 8px',
          padding: '8px 8px 4px 8px',
          boxShadow: 'inset 0 2px 8px rgba(0,0,0,0.9), 0 2px 4px rgba(0,0,0,0.5)',
          width: '336px',
        }}
      >
        {/* Screen glass effect */}
        <div
          className="relative overflow-hidden mx-auto"
          style={{
            borderRadius: '4px',
            width: '320px',
            height: '240px',
            background: '#C8D6C8',
            boxShadow: 'inset 0 0 20px rgba(0,120,0,0.1)',
          }}
        >
          {/* Gloss highlight on screen top */}
          <div
            className="absolute top-0 left-0 right-0 pointer-events-none z-10"
            style={{
              height: '40%',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.12) 0%, transparent 100%)',
              borderRadius: '4px 4px 0 0',
            }}
          />

          {/* Screen component */}
          <Screen />
        </div>
      </div>

      {/* Button section */}
      <div className="w-full mt-1">
        <ButtonGrid />
      </div>

      {/* Texas Instruments footer */}
      <div className="mt-2 flex items-center gap-1">
        <div className="w-4 h-4 bg-white rounded-full flex items-center justify-center opacity-60">
          <span className="text-[6px] font-black text-red-800">TI</span>
        </div>
        <span
          className="text-white/50 text-[9px] tracking-[3px] uppercase"
          style={{ fontFamily: 'Georgia, serif', fontVariant: 'small-caps' }}
        >
          Texas Instruments
        </span>
      </div>
    </div>
  );
}
