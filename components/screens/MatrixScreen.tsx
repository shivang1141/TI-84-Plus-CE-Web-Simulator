'use client';
// ============================================================
// MatrixScreen — Matrix editor [A]–[J]
// ============================================================

import { useState } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { MATRIX_NAMES } from '@/lib/constants';

export default function MatrixScreen() {
  const { matrices, setMatrix } = useCalculatorStore();
  const [selected, setSelected] = useState('[A]');

  const mat = matrices[selected];
  const rows = mat?.rows ?? 2;
  const cols = mat?.cols ?? 2;
  const data = mat?.data ?? Array.from({ length: rows }, () => new Array(cols).fill(0));

  const updateCell = (r: number, c: number, val: string) => {
    const newData = data.map((row, ri) => row.map((cell: number, ci: number) =>
      ri === r && ci === c ? (parseFloat(val) || 0) : cell
    ));
    setMatrix(selected, { rows, cols, data: newData });
  };

  const resize = (newRows: number, newCols: number) => {
    const newData = Array.from({ length: newRows }, (_, r) =>
      Array.from({ length: newCols }, (_, c) => (data[r]?.[c] ?? 0))
    );
    setMatrix(selected, { rows: newRows, cols: newCols, data: newData });
  };

  return (
    <div className="w-full h-full bg-[#E8F4E8] font-mono text-black flex flex-col p-1">
      <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 mb-1">
        MATRIX EDIT
      </div>

      {/* Matrix selector */}
      <div className="flex flex-wrap gap-1 mb-1">
        {MATRIX_NAMES.map((name) => (
          <button
            key={name}
            onClick={() => setSelected(name)}
            className={`text-[10px] px-1 py-0.5 border border-gray-400 rounded ${selected === name ? 'bg-[#1A3A1A] text-white' : ''}`}
          >
            {name}
          </button>
        ))}
      </div>

      {/* Dimension controls */}
      <div className="flex items-center gap-2 mb-1">
        <span className="text-[10px]">Rows:</span>
        <button onClick={() => resize(Math.max(1, rows - 1), cols)} className="text-[11px] px-1 border border-gray-400">−</button>
        <span className="text-[11px] w-4 text-center">{rows}</span>
        <button onClick={() => resize(Math.min(9, rows + 1), cols)} className="text-[11px] px-1 border border-gray-400">+</button>
        <span className="text-[10px] ml-2">Cols:</span>
        <button onClick={() => resize(rows, Math.max(1, cols - 1))} className="text-[11px] px-1 border border-gray-400">−</button>
        <span className="text-[11px] w-4 text-center">{cols}</span>
        <button onClick={() => resize(rows, Math.min(9, cols + 1))} className="text-[11px] px-1 border border-gray-400">+</button>
      </div>

      {/* Matrix cells */}
      <div className="flex-1 overflow-auto">
        <div className="border border-black inline-block">
          {data.map((row: number[], r: number) => (
            <div key={r} className="flex">
              {row.map((cell: number, c: number) => (
                <input
                  key={c}
                  type="number"
                  step="any"
                  value={cell}
                  onChange={(e) => updateCell(r, c, e.target.value)}
                  className="w-12 text-[11px] text-center border border-gray-300 outline-none bg-transparent"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="text-[10px] text-gray-500 mt-1">
        {selected} is {rows}×{cols}
      </div>
    </div>
  );
}
