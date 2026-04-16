'use client';
// ============================================================
// StatScreen — Statistics menu (EDIT / CALC / TESTS)
// ============================================================

import { useState } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { oneVarStats, twoVarStats, linReg } from '@/lib/mathEngine';

type StatTab = 'EDIT' | 'CALC' | 'TESTS';

export default function StatScreen() {
  const [tab, setTab] = useState<StatTab>('EDIT');
  const [selectedList, setSelectedList] = useState(0);
  const [results, setResults] = useState<Record<string, string> | null>(null);
  const { lists, setList } = useCalculatorStore();

  const listNames = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6'];

  return (
    <div className="w-full h-full bg-[#E8F4E8] font-mono text-black flex flex-col p-1">
      {/* Tab bar */}
      <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 flex gap-3">
        {(['EDIT', 'CALC', 'TESTS'] as StatTab[]).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`${tab === t ? 'underline font-bold' : 'opacity-70'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* EDIT tab */}
      {tab === 'EDIT' && (
        <div className="flex flex-1 overflow-hidden mt-1 gap-1">
          {/* List selector */}
          <div className="flex flex-col gap-0.5">
            {listNames.map((name, i) => (
              <button
                key={name}
                onClick={() => setSelectedList(i)}
                className={`text-[10px] px-1 py-0.5 font-bold ${selectedList === i ? 'bg-[#1A3A1A] text-white' : ''}`}
              >
                {name}
              </button>
            ))}
          </div>

          {/* List editor */}
          <div className="flex-1 overflow-y-auto">
            <div className="text-[10px] font-bold mb-1">{listNames[selectedList]} ({(lists[listNames[selectedList]] || []).length})</div>
            {[...(lists[listNames[selectedList]] || []), ''].map((val, idx) => (
              <div key={idx} className="flex items-center mb-0.5">
                <span className="text-[10px] text-gray-500 w-4">{idx + 1}</span>
                <input
                  type="number"
                  step="any"
                  value={idx < (lists[listNames[selectedList]] || []).length ? val : ''}
                  onChange={(e) => {
                    const newList = [...(lists[listNames[selectedList]] || [])];
                    if (e.target.value) {
                      newList[idx] = parseFloat(e.target.value);
                    } else {
                      newList.splice(idx, 1);
                    }
                    setList(listNames[selectedList], newList);
                  }}
                  className="flex-1 bg-transparent border-b border-gray-400 text-[11px] outline-none"
                  placeholder={idx < (lists[listNames[selectedList]] || []).length ? '' : 'add...'}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CALC tab */}
      {tab === 'CALC' && (
        <div className="flex-1 overflow-y-auto mt-1">
          <div className="text-[11px] font-bold mb-1">1-Var Stats</div>
          <button
            onClick={() => {
              try {
                const data = lists['L1'] || [];
                const r = oneVarStats(data);
                setResults(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(parseFloat((v as number).toPrecision(8)))])));
              } catch { setResults({ error: 'ERR:STAT' }); }
            }}
            className="w-full text-left text-[11px] px-1 py-0.5 hover:bg-gray-200 rounded"
          >
            1-Var Stats L1
          </button>
          <button
            onClick={() => {
              try {
                const xData = lists['L1'] || [];
                const yData = lists['L2'] || [];
                const r = twoVarStats(xData, yData);
                setResults(Object.fromEntries(Object.entries(r).map(([k, v]) => [k, String(parseFloat((v as number).toPrecision(8)))])));
              } catch { setResults({ error: 'ERR:STAT' }); }
            }}
            className="w-full text-left text-[11px] px-1 py-0.5 hover:bg-gray-200 rounded"
          >
            2-Var Stats L1,L2
          </button>
          <button
            onClick={() => {
              try {
                const xData = lists['L1'] || [];
                const yData = lists['L2'] || [];
                const r = linReg(xData, yData);
                setResults({ a: r.a.toPrecision(6), b: r.b.toPrecision(6), r: r.r.toPrecision(6), r2: r.r2.toPrecision(6) });
              } catch { setResults({ error: 'ERR:STAT' }); }
            }}
            className="w-full text-left text-[11px] px-1 py-0.5 hover:bg-gray-200 rounded"
          >
            LinReg(ax+b) L1,L2
          </button>

          {results && (
            <div className="mt-2 border-t border-gray-400 pt-1">
              {Object.entries(results).map(([k, v]) => (
                <div key={k} className="text-[11px] flex justify-between">
                  <span className="font-bold">{k}=</span>
                  <span>{v}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TESTS tab */}
      {tab === 'TESTS' && (
        <div className="flex-1 overflow-y-auto mt-1">
          {[
            'Z-Test', 'T-Test', '2-SampZTest', '2-SampTTest',
            '1-PropZTest', '2-PropZTest', 'χ²-Test', '2-SampFTest', 'LinRegTTest', 'ANOVA(',
          ].map((test, i) => (
            <button
              key={test}
              className="w-full text-left text-[11px] px-1 py-0.5 hover:bg-gray-200"
            >
              {i + 1}:{test}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
