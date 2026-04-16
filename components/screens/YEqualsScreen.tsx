'use client';
// ============================================================
// YEqualsScreen — Y= equation editor
// ============================================================

import { useCalculatorStore } from '@/store/useCalculatorStore';
import { GRAPH_COLORS } from '@/lib/constants';

export default function YEqualsScreen() {
  const { equations, setEquation, toggleEquation, settings } = useCalculatorStore();

  const getVisibleEquations = () => {
    if (settings.calcMode === 'PAR') return equations.filter(eq => eq.name.endsWith('T'));
    if (settings.calcMode === 'POL') return equations.filter(eq => eq.name.startsWith('r'));
    return equations.filter(eq => eq.name.startsWith('Y'));
  };

  const visibleEquations = getVisibleEquations();

  return (
    <div className="w-full h-full bg-[#E8F4E8] font-mono text-black flex flex-col p-1">
      {/* Header */}
      <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 mb-1 flex justify-between">
        <span>Y= EDITOR</span>
        <span className="opacity-70">2nd+GRAPH=TABLE</span>
      </div>

      {/* Equations list */}
      <div className="flex-1 overflow-y-auto">
        {visibleEquations.map((eq) => {
          const globalIndex = equations.findIndex(e => e.name === eq.name);
          return (
          <div key={eq.name} className="flex items-center mb-0.5 gap-1">
            {/* Enable toggle */}
            <button
              onClick={() => toggleEquation(globalIndex)}
              className={`w-3 h-3 border border-black flex-shrink-0 ${eq.enabled ? 'bg-black' : 'bg-white'}`}
              title={eq.enabled ? 'Enabled' : 'Disabled'}
            />

            {/* Color dot */}
            <div
              className="w-2 h-2 rounded-full flex-shrink-0 border border-gray-400"
              style={{ background: eq.color }}
            />

            {/* Name */}
            <span className="text-[11px] font-bold w-8 flex-shrink-0" style={{ color: eq.color }}>
              {eq.name}=
            </span>

            {/* Expression input */}
            <input
              type="text"
              value={eq.expr}
              onChange={(e) => setEquation(globalIndex, e.target.value)}
              className="flex-1 bg-transparent text-[11px] border-b border-gray-400 outline-none text-black"
              placeholder=""
              spellCheck={false}
            />
          </div>
        );
      })}
      </div>

      {/* Footer */}
      <div className="text-[10px] text-gray-600 mt-1">
        Press GRAPH to plot • Click □ to enable/disable
      </div>
    </div>
  );
}
