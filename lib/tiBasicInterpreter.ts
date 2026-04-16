// ============================================================
// TI-84 Plus CE Simulator — TI-BASIC Interpreter
// Supports: Disp, Input, Prompt, If/Then/Else/End,
//           For/End, While/End, Goto/Lbl, STO→, ClrHome,
//           Output, Pause, Stop, Return, Menu
// ============================================================

import { evaluateExpression, TIError } from './mathEngine';
import { AngleMode, DisplayMode, DecimalPlaces } from '@/types/calculator';

export interface InterpreterContext {
  variables: Record<string, number | string>;
  lastAnswer: number | string;
  angleMode: AngleMode;
  displayMode: DisplayMode;
  decimalPlaces: DecimalPlaces;
  output: string[];
  onOutput: (line: string) => void;
  onInput: (prompt: string) => Promise<string>;
  onMenu: (title: string, options: string[], labels: string[]) => Promise<string>;
  onPause: (msg?: string) => Promise<void>;
  onClrHome: () => void;
  updateVar: (name: string, value: number | string) => void;
}

export class TIBasicInterpreter {
  private lines: string[];
  private pc: number = 0;
  private ctx: InterpreterContext;
  private running: boolean = false;
  private labels: Map<string, number> = new Map();
  private callStack: number[] = [];
  private maxSteps = 100000;
  private steps = 0;

  constructor(programLines: string[], ctx: InterpreterContext) {
    // Flatten statements by colon to ensure exactly one statement per instruction pointer step
    this.lines = programLines.flatMap(line => 
      this.splitLine(line).filter(s => s && !s.startsWith('//'))
    );
    this.ctx = ctx;
    this.buildLabelMap();
  }

  private splitLine(line: string): string[] {
    const stmts: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') inQuotes = !inQuotes;
      if (char === ':' && !inQuotes) {
        stmts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) stmts.push(current.trim());
    return stmts;
  }

  private buildLabelMap(): void {
    for (let i = 0; i < this.lines.length; i++) {
      const stmt = this.lines[i];
      const lblMatch = stmt.match(/^Lbl\s+(\w+)$/);
      if (lblMatch) {
        this.labels.set(lblMatch[1], i);
      }
    }
  }

  async run(): Promise<void> {
    this.running = true;
    this.pc = 0;
    this.steps = 0;

    while (this.running && this.pc < this.lines.length) {
      if (++this.steps > this.maxSteps) throw new TIError('BREAK', 'Max steps exceeded');
      await this.executeStatement(this.lines[this.pc]);
      this.pc++;
    }
  }

  private async executeStatement(stmt: string): Promise<void> {
    if (!stmt) return;

    // Disp
    const dispMatch = stmt.match(/^Disp\s+(.+)$/);
    if (dispMatch) {
      const val = this.eval(dispMatch[1]);
      this.ctx.onOutput(String(val));
      return;
    }

    // Input
    const inputMatch = stmt.match(/^Input\s+"([^"]*)",\s*([A-Zθ])$/);
    if (inputMatch) {
      const raw = await this.ctx.onInput(inputMatch[1]);
      const val = parseFloat(raw);
      const varName = inputMatch[2];
      this.ctx.updateVar(varName, isNaN(val) ? raw : val);
      return;
    }

    const inputVarMatch = stmt.match(/^Input\s+([A-Zθ])$/);
    if (inputVarMatch) {
      const raw = await this.ctx.onInput('?');
      const val = parseFloat(raw);
      const varName = inputVarMatch[1];
      this.ctx.updateVar(varName, isNaN(val) ? raw : val);
      return;
    }

    // Prompt
    const promptMatch = stmt.match(/^Prompt\s+([A-Zθ])$/);
    if (promptMatch) {
      const raw = await this.ctx.onInput(promptMatch[1] + '=?');
      const val = parseFloat(raw);
      this.ctx.updateVar(promptMatch[1], isNaN(val) ? raw : val);
      return;
    }

    // If ... Then
    const ifMatch = stmt.match(/^If\s+(.+)$/);
    if (ifMatch) {
      const condition = this.evalBool(ifMatch[1]);
      const nextStmt = (this.pc + 1 < this.lines.length) ? this.lines[this.pc + 1] : null;
      
      if (nextStmt === 'Then') {
        if (!condition) {
          // Condition false: skip to matching Else or End
          this.pc = this.findMatchingEnd(this.pc, 0);
        }
      } else {
        if (!condition) {
          // Condition false & no 'Then': skip the next single statement
          this.pc++;
        }
      }
      return;
    }

    // Then/Else/End
    if (stmt === 'Then') return;
    if (stmt === 'Else') {
      // If we encounter Else during normal execution, it means the True branch just finished.
      // We must skip to the End.
      this.pc = this.findMatchingEnd(this.pc, 0);
      return;
    }
    if (stmt === 'End') return;

    // For
    const forMatch = stmt.match(/^For\s*\(\s*([A-Zθ]),\s*([^,]+),\s*([^,]+)(?:,\s*(.+))?\s*\)$/);
    if (forMatch) {
      const varName = forMatch[1];
      const start = Number(this.eval(forMatch[2]));
      const end = Number(this.eval(forMatch[3]));
      const step = forMatch[4] ? Number(this.eval(forMatch[4])) : 1;
      const forStart = this.pc;
      const forEnd = this.findMatchingEnd(this.pc, 0);

      for (let i = start; step > 0 ? i <= end : i >= end; i += step) {
        if (++this.steps > this.maxSteps) throw new TIError('BREAK');
        this.ctx.updateVar(varName, i);
        // Execute inner lines using a pc-driven loop to respect Gotos and If skips
        this.pc = forStart + 1;
        while (this.pc < forEnd && this.running) {
          if (++this.steps > this.maxSteps) throw new TIError('BREAK');
          await this.executeStatement(this.lines[this.pc]);
          this.pc++;
        }
        if (!this.running) break;
      }
      // Ensure PC correctly points to End so the outer loop increments past it
      this.pc = forEnd;
      return;
    }

    // While
    const whileMatch = stmt.match(/^While\s+(.+)$/);
    if (whileMatch) {
      const whileStart = this.pc;
      const whileEnd = this.findMatchingEnd(this.pc, 0);

      while (this.evalBool(whileMatch[1])) {
        if (++this.steps > this.maxSteps) throw new TIError('BREAK');
        this.pc = whileStart + 1;
        while (this.pc < whileEnd && this.running) {
          if (++this.steps > this.maxSteps) throw new TIError('BREAK');
          await this.executeStatement(this.lines[this.pc]);
          this.pc++;
        }
        if (!this.running) break;
      }
      this.pc = whileEnd;
      return;
    }

    // Goto
    const gotoMatch = stmt.match(/^Goto\s+(\w+)$/);
    if (gotoMatch) {
      const target = this.labels.get(gotoMatch[1]);
      if (target === undefined) throw new TIError('LABEL');
      this.pc = target;
      return;
    }

    // Lbl (already processed)
    if (stmt.match(/^Lbl\s+/)) return;

    // ClrHome
    if (stmt === 'ClrHome') {
      this.ctx.onClrHome();
      return;
    }

    // Output(row, col, value)
    const outputMatch = stmt.match(/^Output\s*\(\s*(\d+),\s*(\d+),\s*(.+)\s*\)$/);
    if (outputMatch) {
      const val = this.eval(outputMatch[3]);
      this.ctx.onOutput(`[${outputMatch[1]},${outputMatch[2]}]: ${val}`);
      return;
    }

    // Pause
    const pauseMatch = stmt.match(/^Pause(?:\s+(.+))?$/);
    if (pauseMatch) {
      if (pauseMatch[1]) {
        const val = this.eval(pauseMatch[1]);
        this.ctx.onOutput(String(val));
      }
      await this.ctx.onPause(pauseMatch[1]);
      return;
    }

    // Stop
    if (stmt === 'Stop') {
      this.running = false;
      return;
    }

    // Return
    if (stmt === 'Return') {
      if (this.callStack.length > 0) {
        this.pc = this.callStack.pop()!;
      } else {
        this.running = false;
      }
      return;
    }

    // Menu("title","opt1",lbl1,...)
    const menuMatch = stmt.match(/^Menu\s*\((.+)\)$/);
    if (menuMatch) {
      const args = this.parseArgs(menuMatch[1]);
      const title = args[0].replace(/"/g, '');
      const options: string[] = [];
      const labels: string[] = [];
      for (let i = 1; i < args.length - 1; i += 2) {
        options.push(args[i].replace(/"/g, ''));
        labels.push(args[i + 1]);
      }
      const chosen = await this.ctx.onMenu(title, options, labels);
      const target = this.labels.get(chosen);
      if (target !== undefined) this.pc = target - 1;
      return;
    }

    // STO→: expr→VAR  or  expr→Ans
    const stoMatch = stmt.match(/^(.+)→([A-Zθ]|Ans)$/);
    if (stoMatch) {
      const val = this.eval(stoMatch[1]);
      this.ctx.updateVar(stoMatch[2], typeof val === 'number' ? val : parseFloat(String(val)));
      return;
    }

    // Assignment VAR=expr (alternate syntax)
    const assignMatch = stmt.match(/^([A-Zθ])\s*=\s*(.+)$/);
    if (assignMatch) {
      const val = this.eval(assignMatch[2]);
      this.ctx.updateVar(assignMatch[1], typeof val === 'number' ? val : parseFloat(String(val)));
      return;
    }

    // Expression statement (evaluate and discard or display)
    try {
      const val = this.eval(stmt);
      if (val !== undefined && val !== null) {
        this.ctx.onOutput(String(val));
      }
    } catch {
      // Ignore expression errors in programs
    }
  }

  private eval(expr: string): number | string {
    try {
      const { value } = evaluateExpression(
        expr,
        this.ctx.variables,
        this.ctx.lastAnswer,
        this.ctx.angleMode,
        this.ctx.displayMode,
        this.ctx.decimalPlaces
      );
      return value as number | string;
    } catch {
      throw new TIError('SYNTAX', `Cannot evaluate: ${expr}`);
    }
  }

  private evalBool(expr: string): boolean {
    try {
      const val = Number(this.eval(expr));
      return val !== 0;
    } catch {
      return false;
    }
  }

  private findMatchingEnd(startLine: number, depth: number): number {
    let d = depth;
    for (let i = startLine + 1; i < this.lines.length; i++) {
      const t = this.lines[i].trim();
      if (t.startsWith('If ') || t.startsWith('For(') || t.startsWith('While ')) d++;
      else if (t === 'End') {
        if (d === 0) return i;
        d--;
      } else if (t === 'Else' && d === 0) return i;
    }
    return this.lines.length - 1;
  }

  private parseArgs(argsStr: string): string[] {
    const args: string[] = [];
    let current = '';
    let inString = false;
    let depth = 0;

    for (const char of argsStr) {
      if (char === '"') inString = !inString;
      if (!inString) {
        if (char === '(') depth++;
        else if (char === ')') depth--;
        else if (char === ',' && depth === 0) {
          args.push(current.trim());
          current = '';
          continue;
        }
      }
      current += char;
    }
    if (current.trim()) args.push(current.trim());
    return args;
  }
}
