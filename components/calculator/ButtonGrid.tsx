'use client';
// ============================================================
// ButtonGrid — Complete TI-84 Plus CE key layout
// ============================================================

import CalculatorKey from './CalculatorKey';
import DirectionalPad from './DirectionalPad';
import { KEY_DEFINITIONS, KeyDef } from '@/lib/keyDefinitions';
import { dispatchAction } from '@/store/useCalculatorStore';

// Keys arranged by row (excluding D-pad direction keys)
const ROW_KEYS: string[][] = [
  ['y_equals', 'window', 'zoom', 'trace', 'graph'],         // Row 0: Function
  ['second', 'mode', 'del'],                                  // Row 1: 2nd/Mode/Del + DPAD
  ['alpha', 'xtθn', 'stat'],                                  // Row 2: Alpha/XT/Stat + DPAD
  ['math', 'apps', 'prgm', 'vars', 'clear'],                 // Row 3
  ['x_inv', 'sin', 'cos', 'tan', 'caret'],                   // Row 4
  ['x_sq', 'comma', 'lparen', 'rparen', 'div'],              // Row 5
  ['log', '7', '8', '9', 'mul'],                             // Row 6
  ['ln', '4', '5', '6', 'sub'],                              // Row 7
  ['sto', '1', '2', '3', 'add'],                             // Row 8
  ['on', '0', 'dot', 'neg', 'enter'],                        // Row 9
];

// Build lookup
const keyById = Object.fromEntries(KEY_DEFINITIONS.map((k) => [k.id, k]));

export default function ButtonGrid() {
  return (
    <div className="flex flex-col gap-[5px] px-3 py-2 select-none">
      {ROW_KEYS.map((row, rowIdx) => (
        <div key={rowIdx} className="flex gap-[5px] items-end">
          {row.map((keyId) => {
            const kd = keyById[keyId];
            if (!kd) return null;
            return (
              <div
                key={keyId}
                className={keyId === 'enter' ? 'flex-[1.5]' : 'flex-1'}
              >
                <CalculatorKey keyDef={kd} />
              </div>
            );
          })}

          {/* D-Pad injection after row 1 & 2 right side */}
          {rowIdx === 1 && (
            <div className="flex items-center justify-center" style={{ width: '88px', flexShrink: 0 }}>
              <DirectionalPad />
            </div>
          )}
          {/* Row 2 gets a matching spacer (D-pad spans both rows) */}
          {rowIdx === 2 && (
            <div style={{ width: '88px', flexShrink: 0 }} />
          )}
        </div>
      ))}
    </div>
  );
}
