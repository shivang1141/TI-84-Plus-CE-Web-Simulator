// ============================================================
// TI-84 Plus CE Simulator — Physical Keyboard Mapping
// Maps browser keyboard events → calculator key actions
// ============================================================

import { KeyAction } from './keyDefinitions';

const ins = (text: string): KeyAction => ({ type: 'insert', text });

interface KeyboardMapping {
  key: string;
  code?: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  action: KeyAction;
}

export const KEYBOARD_MAPPINGS: KeyboardMapping[] = [
  // Evaluation
  { key: 'Enter', action: 'evaluate' },
  { key: 'NumpadEnter', action: 'evaluate' },

  // Deletion
  { key: 'Backspace', action: 'delete' },
  { key: 'Delete', action: 'delete' },

  // Clear
  { key: 'Escape', action: 'clear' },

  // Navigation
  { key: 'ArrowUp', action: 'cursor_up' },
  { key: 'ArrowDown', action: 'cursor_down' },
  { key: 'ArrowLeft', action: 'cursor_left' },
  { key: 'ArrowRight', action: 'cursor_right' },

  // Numbers
  { key: '0', action: ins('0') },
  { key: '1', action: ins('1') },
  { key: '2', action: ins('2') },
  { key: '3', action: ins('3') },
  { key: '4', action: ins('4') },
  { key: '5', action: ins('5') },
  { key: '6', action: ins('6') },
  { key: '7', action: ins('7') },
  { key: '8', action: ins('8') },
  { key: '9', action: ins('9') },

  // Operators
  { key: '+', action: ins('+') },
  { key: '-', action: ins('−') },
  { key: '*', action: ins('×') },
  { key: '/', action: ins('÷') },
  { key: '^', action: ins('^') },

  // Parentheses
  { key: '(', action: ins('(') },
  { key: ')', action: ins(')') },

  // Decimal / negate
  { key: '.', action: ins('.') },

  // Variable X
  { key: 'x', action: ins('X') },
  { key: 'X', action: ins('X') },

  // Pi
  { key: 'p', action: ins('π') },

  // Exponent notation
  { key: 'E', shiftKey: true, action: ins('ᴱ') },

  // Function keys → screen shortcuts
  { key: 'F1', action: 'screen_y_equals' },
  { key: 'F2', action: 'screen_window' },
  { key: 'F3', action: 'screen_zoom' },
  { key: 'F4', action: 'trace_mode' },
  { key: 'F5', action: 'screen_graph' },
  { key: 'F6', action: 'screen_table' },

  // Common math functions (keyboard shortcuts)
  { key: 's', action: ins('sin(') },
  { key: 'c', action: ins('cos(') },
  { key: 't', action: ins('tan(') },
  { key: 'l', action: ins('log(') },
  { key: 'n', action: ins('ln(') },
  { key: 'r', action: ins('√(') },

  // Special
  { key: ',', action: ins(',') },
  { key: '!', action: ins('!') },
  { key: '%', action: ins('%') },
];

export function getKeyboardAction(e: KeyboardEvent): KeyAction {
  // Ignore if user is typing in an input element
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  ) {
    return null;
  }

  for (const mapping of KEYBOARD_MAPPINGS) {
    if (mapping.key !== e.key && mapping.key !== e.code) continue;
    if (mapping.shiftKey !== undefined && mapping.shiftKey !== e.shiftKey) continue;
    if (mapping.ctrlKey !== undefined && mapping.ctrlKey !== e.ctrlKey) continue;
    return mapping.action;
  }

  // Single printable ASCII → insert
  if (e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
    const c = e.key;
    // Only allow calculator-relevant characters
    if (/[0-9+\-*/^().,%]/.test(c)) {
      return ins(c);
    }
  }

  return null;
}
