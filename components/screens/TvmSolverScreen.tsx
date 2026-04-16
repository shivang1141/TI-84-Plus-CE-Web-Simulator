'use client';

import { useState } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';

export default function TvmSolverScreen() {
  const { tvm, setTvm } = useCalculatorStore();
  const [activeIdx, setActiveIdx] = useState(0);

  const keys = ['N', 'I', 'PV', 'PMT', 'FV', 'PY', 'CY'] as const;
  const labels = ['N', 'I%', 'PV', 'PMT', 'FV', 'P/Y', 'C/Y'];

  const handleSolve = (keyToSolve: typeof keys[number]) => {
    // Basic solve algorithms
    const { N, I, PV, PMT, FV, PY, CY, pmtAtEnd } = tvm;
    const r = (I / 100) / CY;
    const nTotal = N * (CY / PY);

    // Simple solver for PV/FV (for complex ones Newton Raphson is required)
    // Here we'll implement a basic direct solver for PMT out of PV/FV context.
    let solvedValue = 0;
    if (keyToSolve === 'PMT') {
      if (r === 0) {
        solvedValue = -(PV + FV) / nTotal;
      } else {
        const factor = Math.pow(1 + r, nTotal);
        solvedValue = -(FV + PV * factor) / ((pmtAtEnd ? 1 : (1 + r)) * ((factor - 1) / r));
      }
      setTvm('PMT', Number(solvedValue.toFixed(2)));
    } else if (keyToSolve === 'FV') {
      if (r === 0) {
        solvedValue = -(PV + PMT * nTotal);
      } else {
        const factor = Math.pow(1 + r, nTotal);
        solvedValue = -(PV * factor + PMT * (pmtAtEnd ? 1 : (1 + r)) * ((factor - 1) / r));
      }
      setTvm('FV', Number(solvedValue.toFixed(2)));
    } else if (keyToSolve === 'PV') {
      if (r === 0) {
        solvedValue = -(FV + PMT * nTotal);
      } else {
        const factor = Math.pow(1 + r, nTotal);
        solvedValue = -(FV + PMT * (pmtAtEnd ? 1 : (1 + r)) * ((factor - 1) / r)) / factor;
      }
      setTvm('PV', Number(solvedValue.toFixed(2)));
    } else {
        alert("Advanced Root-Finding solving for " + keyToSolve + " requires Newton-Raphson approximation not fully implemented here.");
    }
  };

  return (
    <div className="w-full h-full bg-[#E8F4E8] font-mono text-black flex flex-col p-1">
      <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 mb-1 flex justify-between">
        <span>TVM SOLVER</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        {keys.map((k, i) => (
          <div key={k} className="flex items-center mb-0.5">
            <span className="w-8 text-[11px] font-bold text-right mr-1">{labels[i]}=</span>
            <input
              type="number"
              value={tvm[k]}
              onClick={() => setActiveIdx(i)}
              onChange={(e) => setTvm(k, Number(e.target.value))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && e.altKey) {
                  // Simulate Alpha + Solve
                  handleSolve(k);
                } else if (e.key === 'Enter') {
                  setActiveIdx((i + 1) % keys.length);
                }
              }}
              className="flex-1 bg-transparent text-[11px] border-b border-gray-400 outline-none px-1"
            />
            <button 
                onClick={() => handleSolve(k)} 
                className="ml-2 px-1 py-0.5 bg-gray-300 border border-gray-500 rounded text-[9px]"
            >
                SOLVE
            </button>
          </div>
        ))}
        
        <div className="flex items-center mb-0.5 mt-2 ml-4">
            <span className="text-[11px] mr-2 text-gray-700">PMT:</span>
            <button 
                onClick={() => setTvm('pmtAtEnd', true)}
                className={`text-[11px] px-1 font-bold ${tvm.pmtAtEnd ? 'bg-black text-white' : 'text-gray-500'}`}
            >
                END
            </button>
            <button 
                onClick={() => setTvm('pmtAtEnd', false)}
                className={`text-[11px] px-1 font-bold ml-2 ${!tvm.pmtAtEnd ? 'bg-black text-white' : 'text-gray-500'}`}
            >
                BEGIN
            </button>
        </div>
      </div>
      <div className="text-[9px] text-gray-500 mt-1">Press SOLVE button or Alt+Enter to calculate</div>
    </div>
  );
}
