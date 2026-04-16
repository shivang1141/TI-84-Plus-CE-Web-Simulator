'use client';
// ============================================================
// ModeScreen — Calculator mode settings
// ============================================================

import { useCalculatorStore } from '@/store/useCalculatorStore';

export default function ModeScreen() {
  const { settings, setSetting } = useCalculatorStore();

  type OptionGroup<T extends string> = { label: string; options: T[] };

  function OptionRow<T extends string>({ label, options, current, onChange }: {
    label: string;
    options: T[];
    current: T;
    onChange: (val: T) => void;
  }) {
    return (
      <div className="flex items-start mb-1">
        <span className="text-[11px] w-16 flex-shrink-0 opacity-60">{label}</span>
        <div className="flex flex-wrap gap-2">
          {options.map((o) => (
            <button
              key={o}
              onClick={() => onChange(o)}
              className={`text-[11px] px-1 rounded ${current === o ? 'bg-[#1A3A1A] text-white font-bold' : 'text-black hover:underline'}`}
            >
              {o.toLowerCase()}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#E8F4E8] font-mono text-black p-1 flex flex-col">
      <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 mb-2">
        MODE
      </div>

      <OptionRow
        label="Number"
        options={['NORMAL', 'SCI', 'ENG'] as const}
        current={settings.displayMode}
        onChange={(v) => setSetting('displayMode', v)}
      />

      <OptionRow
        label="Angle"
        options={['RADIAN', 'DEGREE', 'GRADIAN'] as const}
        current={settings.angleMode}
        onChange={(v) => setSetting('angleMode', v)}
      />

      <OptionRow
        label="Complex"
        options={['REAL', 'a+bi', 're^θi'] as const}
        current={settings.complexMode}
        onChange={(v) => setSetting('complexMode', v)}
      />

      <OptionRow
        label="Graph"
        options={['FUNC', 'PAR', 'POL', 'SEQ'] as const}
        current={settings.calcMode}
        onChange={(v) => setSetting('calcMode', v)}
      />

      <OptionRow
        label="Style"
        options={['CONNECTED', 'DOT'] as const}
        current={settings.graphStyle}
        onChange={(v) => setSetting('graphStyle', v)}
      />

      <div className="flex items-center mb-1 gap-3">
        {[
          { key: 'gridOn', label: 'Grid' },
          { key: 'axesOn', label: 'Axes' },
          { key: 'labelOn', label: 'Label' },
          { key: 'coordDisplay', label: 'Coord' },
          { key: 'exprOn', label: 'Expr' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSetting(key as keyof typeof settings, !settings[key as keyof typeof settings])}
            className={`text-[11px] px-1 rounded ${settings[key as keyof typeof settings] ? 'text-black font-bold' : 'text-gray-400'}`}
          >
            {label}: {settings[key as keyof typeof settings] ? 'ON' : 'OFF'}
          </button>
        ))}
      </div>

      <div className="mt-2 text-[10px] text-gray-600">
        Press CLEAR or 2nd+QUIT to return
      </div>
    </div>
  );
}
