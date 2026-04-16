'use client';
// ============================================================
// ProgramScreen — PRGM menu + editor
// ============================================================

import { useState } from 'react';
import { useCalculatorStore } from '@/store/useCalculatorStore';
import { Program } from '@/types/calculator';
import { PROG_NAME_MAX } from '@/lib/constants';

type PrgmTab = 'EXEC' | 'EDIT' | 'NEW';

export default function ProgramScreen() {
  const [tab, setTab] = useState<PrgmTab>('EXEC');
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [newName, setNewName] = useState('');
  const [editLines, setEditLines] = useState<string[]>([]);
  const [editingIdx, setEditingIdx] = useState(-1);

  const { programs, addProgram, updateProgram, deleteProgram, executeProgram } = useCalculatorStore();

  const handleEdit = (idx: number) => {
    setEditingIdx(idx);
    setEditLines([...programs[idx].lines]);
    setTab('EDIT');
  };

  const handleSave = () => {
    if (editingIdx >= 0) {
      updateProgram(editingIdx, { lines: editLines });
    }
    setTab('EXEC');
    setEditingIdx(-1);
  };

  const handleNew = () => {
    if (!newName.trim()) return;
    const prog: Program = {
      name: newName.toUpperCase().slice(0, PROG_NAME_MAX),
      lines: [''],
      protected: false,
      createdAt: Date.now(),
    };
    addProgram(prog);
    setEditingIdx(programs.length);
    setEditLines(['']);
    setNewName('');
    setTab('EDIT');
  };

  return (
    <div className="w-full h-full bg-[#E8F4E8] font-mono text-black flex flex-col p-1">
      {/* Tab bar */}
      <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 flex gap-3">
        {(['EXEC', 'EDIT', 'NEW'] as PrgmTab[]).map((t) => (
          <button key={t} onClick={() => setTab(t)}
            className={`${tab === t ? 'underline font-bold' : 'opacity-70'}`}>
            {t}
          </button>
        ))}
      </div>

      {/* EXEC tab */}
      {tab === 'EXEC' && (
        <div className="flex-1 overflow-y-auto mt-1">
          {programs.length === 0 && (
            <div className="text-[11px] opacity-60 text-center mt-4">No programs stored</div>
          )}
          {programs.map((prog, i) => (
            <div key={i} className={`flex items-center justify-between px-1 py-0.5 ${selectedIdx === i ? 'bg-[#1A3A1A] text-white' : ''}`}
              onClick={() => setSelectedIdx(i)}>
              <span className="text-[11px]">{i + 1}:{prog.name}</span>
              <div className="flex gap-1">
                <button onClick={() => executeProgram(i)} className="text-[9px] border border-current px-1">RUN</button>
                <button onClick={() => handleEdit(i)} className="text-[9px] border border-current px-1">EDIT</button>
                <button onClick={() => deleteProgram(i)} className="text-[9px] border border-current px-1 text-red-500">DEL</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* EDIT tab */}
      {tab === 'EDIT' && (
        <div className="flex-1 flex flex-col mt-1">
          <div className="text-[10px] font-bold mb-1">
            PROGRAM: {editingIdx >= 0 ? programs[editingIdx]?.name : 'NEW'}
          </div>
          <div className="flex-1 overflow-y-auto">
            {editLines.map((line, i) => (
              <div key={i} className="flex items-start gap-1 mb-0.5">
                <span className="text-[9px] text-gray-500 w-5 flex-shrink-0 mt-0.5">{i + 1}</span>
                <input
                  type="text"
                  value={line}
                  onChange={(e) => {
                    const newLines = [...editLines];
                    newLines[i] = e.target.value;
                    setEditLines(newLines);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      const newLines = [...editLines];
                      newLines.splice(i + 1, 0, '');
                      setEditLines(newLines);
                    }
                    if (e.key === 'Backspace' && !line && editLines.length > 1) {
                      const newLines = [...editLines];
                      newLines.splice(i, 1);
                      setEditLines(newLines);
                    }
                  }}
                  className="flex-1 bg-transparent border-b border-gray-400 text-[11px] outline-none"
                  placeholder="..."
                />
              </div>
            ))}
          </div>
          <div className="flex gap-2 mt-1">
            <button onClick={handleSave} className="text-[10px] px-2 py-0.5 bg-[#1A3A1A] text-white rounded">Save</button>
            <button onClick={() => setTab('EXEC')} className="text-[10px] px-2 py-0.5 border border-gray-400 rounded">Cancel</button>
          </div>
        </div>
      )}

      {/* NEW tab */}
      {tab === 'NEW' && (
        <div className="flex-1 mt-2">
          <div className="text-[11px] mb-1">Program Name (up to 8 chars, A-Z):</div>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, PROG_NAME_MAX))}
            className="w-full bg-white border border-gray-400 text-[12px] px-1 outline-none font-mono"
            placeholder="NAME"
            maxLength={PROG_NAME_MAX}
          />
          <button
            onClick={handleNew}
            className="mt-2 text-[11px] px-2 py-0.5 bg-[#1A3A1A] text-white rounded"
          >
            Create Program
          </button>
        </div>
      )}
    </div>
  );
}
