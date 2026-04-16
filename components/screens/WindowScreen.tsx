'use client';
// ============================================================
// WindowScreen — Graph window settings editor
// ============================================================

import { useCalculatorStore } from '@/store/useCalculatorStore';
import { GraphWindow } from '@/types/calculator';

export default function WindowScreen() {
  const { graphWindow, setGraphWindow, settings } = useCalculatorStore();

  const fields: { key: keyof GraphWindow; label: string }[] = [
    { key: 'xMin', label: 'Xmin' },
    { key: 'xMax', label: 'Xmax' },
    { key: 'xScl', label: 'Xscl' },
    { key: 'yMin', label: 'Ymin' },
    { key: 'yMax', label: 'Ymax' },
    { key: 'yScl', label: 'Yscl' },
    { key: 'xRes', label: 'Xres' },
  ];

  const parFields: { key: keyof GraphWindow; label: string }[] = [
    { key: 'tMin', label: 'Tmin' },
    { key: 'tMax', label: 'Tmax' },
    { key: 'tStep', label: 'Tstep' },
  ];

  const polFields: { key: keyof GraphWindow; label: string }[] = [
    { key: 'θMin', label: 'θmin' },
    { key: 'θMax', label: 'θmax' },
    { key: 'θStep', label: 'θstep' },
  ];

  const extraFields = settings.calcMode === 'PAR' ? parFields : settings.calcMode === 'POL' ? polFields : [];
  const allFields = [...fields, ...extraFields];

  return (
    <div className="w-full h-full bg-[#E8F4E8] font-mono text-black flex flex-col p-1">
      <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 mb-1">
        WINDOW
      </div>

      <div className="flex-1 overflow-y-auto">
        {allFields.map(({ key, label }) => (
          <div key={key} className="flex items-center mb-0.5">
            <label className="text-[11px] w-12 flex-shrink-0">{label}=</label>
            <input
              type="number"
              step="any"
              value={(graphWindow[key] as number) ?? ''}
              onChange={(e) => setGraphWindow({ [key]: parseFloat(e.target.value) || 0 })}
              className="flex-1 bg-transparent border-b border-gray-500 text-[11px] outline-none text-right"
            />
          </div>
        ))}
      </div>

      <div className="text-[10px] text-gray-600 mt-1">
        Press GRAPH to plot
      </div>
    </div>
  );
}
