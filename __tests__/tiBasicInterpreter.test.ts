/**
 * tiBasicInterpreter.test.ts
 * ─────────────────────────────────────────────────────────────────
 * Unit tests for TI-BASIC interpreter.
 * Covers: Disp, Input, For loops, While, If/Then/Else,
 *         Goto/Lbl, arithmetic assignments, ClrHome,
 *         Pause, Return, Stop, error handling.
 */

import { TIBasicInterpreter } from '@/lib/tiBasicInterpreter';

// ── Interpreter factory helper ───────────────────────────────────────────────
interface InterpreterOptions {
  variables?: Record<string, number | string>;
  lastAnswer?: number;
  inputResponses?: string[];
}

function runProgram(lines: string[], opts: InterpreterOptions = {}): Promise<{
  output: string[];
  variables: Record<string, number | string>;
}> {
  const output: string[] = [];
  const variables: Record<string, number | string> = { ...(opts.variables ?? {}) };
  const inputQueue = [...(opts.inputResponses ?? [])];

  return new Promise((resolve, reject) => {
    const interpreter = new TIBasicInterpreter(lines, {
      variables,
      lastAnswer: opts.lastAnswer ?? 0,
      angleMode: 'RADIAN',
      displayMode: 'NORMAL',
      decimalPlaces: 'FLOAT',
      output,
      onOutput: (line: string) => { output.push(line); },
      onInput: (_prompt: string) => Promise.resolve(inputQueue.shift() ?? '0'),
      onMenu: (_title: string, options: string[]) => Promise.resolve(options[0]),
      onPause: () => Promise.resolve(),
      onClrHome: () => { output.length = 0; },
      updateVar: (name: string, value: number | string) => { variables[name] = value; },
    });

    interpreter.run()
      .then(() => resolve({ output, variables }))
      .catch(reject);
  });
}

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Disp', () => {
  test('Disp outputs a string literal', async () => {
    const { output } = await runProgram([':Disp "HELLO"']);
    expect(output).toContain('HELLO');
  });

  test('Disp outputs a number', async () => {
    const { output } = await runProgram([':Disp 42']);
    expect(output).toContain('42');
  });

  test('Disp outputs a variable value', async () => {
    const { output } = await runProgram([':5→A', ':Disp A'], { variables: {} });
    expect(output.some((o) => o.includes('5'))).toBe(true);
  });

  test('Disp outputs expression result', async () => {
    const { output } = await runProgram([':Disp 2+2']);
    expect(output.some((o) => o.includes('4'))).toBe(true);
  });

  test('multiple Disp statements produce multiple lines', async () => {
    const { output } = await runProgram([':Disp "A"', ':Disp "B"', ':Disp "C"']);
    expect(output.length).toBeGreaterThanOrEqual(3);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Variable Assignment (STO→)', () => {
  test('5→A sets A=5', async () => {
    const { variables } = await runProgram([':5→A']);
    expect(variables['A']).toBe(5);
  });

  test('expression result stored in variable', async () => {
    const { variables } = await runProgram([':2+3→B']);
    expect(variables['B']).toBe(5);
  });

  test('variable used in subsequent expression', async () => {
    const prog = [':10→A', ':A×2→B', ':Disp B'];
    const { output } = await runProgram(prog);
    expect(output.some((o) => o.includes('20'))).toBe(true);
  });

  test('reassignment overwrites previous value', async () => {
    const { variables } = await runProgram([':5→A', ':10→A']);
    expect(variables['A']).toBe(10);
  });

  test('stores 0', async () => {
    const { variables } = await runProgram([':0→A']);
    expect(variables['A']).toBe(0);
  });

  test('stores negative value', async () => {
    const { variables } = await runProgram([':-7→A']);
    expect(variables['A']).toBe(-7);
  });

  test('stores float', async () => {
    const { variables } = await runProgram([':3.14→A']);
    expect((variables['A'] as number)).toBeCloseTo(3.14);
  });

  test('STO uses previous variable in expression', async () => {
    const { variables } = await runProgram([':5→A', ':A+1→A']);
    expect(variables['A']).toBe(6);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Input', () => {
  test('Input reads from input queue', async () => {
    const { variables } = await runProgram([':Input A'], { inputResponses: ['42'] });
    expect(variables['A']).toBe(42);
  });

  test('Input with prompt string', async () => {
    const { variables } = await runProgram([':Input "ENTER X:",A'], { inputResponses: ['7'] });
    expect(variables['A']).toBe(7);
  });

  test('multiple Input statements each consume from queue', async () => {
    const { variables } = await runProgram([':Input A', ':Input B'], { inputResponses: ['3', '8'] });
    expect(variables['A']).toBe(3);
    expect(variables['B']).toBe(8);
  });

  test('Input with no responses defaults to 0', async () => {
    const { variables } = await runProgram([':Input A']);
    expect(variables['A']).toBe(0);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — If / Then / Else / End', () => {
  test('If condition true: executes body', async () => {
    const { output } = await runProgram([
      ':1→A',
      ':If A=1',
      ':Then',
      ':Disp "TRUE"',
      ':End',
    ]);
    expect(output).toContain('TRUE');
  });

  test('If condition false: skips body', async () => {
    const { output } = await runProgram([
      ':0→A',
      ':If A=1',
      ':Then',
      ':Disp "TRUE"',
      ':End',
    ]);
    expect(output).not.toContain('TRUE');
  });

  test('If/Else: true branch taken', async () => {
    const { output } = await runProgram([
      ':1→A',
      ':If A=1',
      ':Then',
      ':Disp "YES"',
      ':Else',
      ':Disp "NO"',
      ':End',
    ]);
    expect(output).toContain('YES');
    expect(output).not.toContain('NO');
  });

  test('If/Else: false → else branch', async () => {
    const { output } = await runProgram([
      ':0→A',
      ':If A=1',
      ':Then',
      ':Disp "YES"',
      ':Else',
      ':Disp "NO"',
      ':End',
    ]);
    expect(output).not.toContain('YES');
    expect(output).toContain('NO');
  });

  test('If without Then: single-line conditional', async () => {
    const { output } = await runProgram([
      ':1→A',
      ':If A>0',
      ':Disp "POSITIVE"',
    ]);
    expect(output).toContain('POSITIVE');
  });

  test('If without Then: skips next line when false', async () => {
    const { output } = await runProgram([
      ':0→A',
      ':If A>0',
      ':Disp "SKIP"',
      ':Disp "ALWAYS"',
    ]);
    expect(output).not.toContain('SKIP');
    expect(output).toContain('ALWAYS');
  });

  test('nested If statements', async () => {
    const { output } = await runProgram([
      ':1→A',
      ':2→B',
      ':If A=1',
      ':Then',
      ':If B=2',
      ':Then',
      ':Disp "NESTED"',
      ':End',
      ':End',
    ]);
    expect(output).toContain('NESTED');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — For Loop', () => {
  test('For loop iterates correct number of times', async () => {
    const { output } = await runProgram([
      ':For(I,1,5)',
      ':Disp I',
      ':End',
    ]);
    expect(output.filter((o) => /^\d+$/.test(o.trim()))).toHaveLength(5);
  });

  test('For loop variable increments correctly', async () => {
    const { output } = await runProgram([
      ':For(I,1,3)',
      ':Disp I',
      ':End',
    ]);
    const nums = output.map(Number).filter((n) => !isNaN(n));
    expect(nums).toEqual(expect.arrayContaining([1, 2, 3]));
  });

  test('For loop with step=2', async () => {
    const { output } = await runProgram([
      ':For(I,0,8,2)',
      ':Disp I',
      ':End',
    ]);
    const nums = output.map(Number).filter((n) => !isNaN(n));
    expect(nums).toEqual(expect.arrayContaining([0, 2, 4, 6, 8]));
  });

  test('For loop result: sum 1..10=55', async () => {
    const prog = [
      ':0→S',
      ':For(I,1,10)',
      ':S+I→S',
      ':End',
      ':Disp S',
    ];
    const { output } = await runProgram(prog);
    expect(output.some((o) => o.includes('55'))).toBe(true);
  });

  test('For loop does not execute if start > end (ascending)', async () => {
    const { output } = await runProgram([
      ':For(I,5,1)',
      ':Disp "BODY"',
      ':End',
    ]);
    expect(output).not.toContain('BODY');
  });

  test('nested For loops (multiplication table cell)', async () => {
    const prog = [
      ':For(I,1,3)',
      ':For(J,1,3)',
      ':I×J→P',
      ':End',
      ':End',
      ':Disp P',
    ];
    const { output } = await runProgram(prog);
    expect(output.some((o) => o.includes('9'))).toBe(true); // 3×3=9
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — While Loop', () => {
  test('While loop runs while condition true', async () => {
    const prog = [
      ':1→N',
      ':While N<5',
      ':N+1→N',
      ':End',
      ':Disp N',
    ];
    const { output } = await runProgram(prog);
    expect(output.some((o) => o.includes('5'))).toBe(true);
  });

  test('While loop with output accumulation', async () => {
    const prog = [
      ':0→S',
      ':1→I',
      ':While I≤5',
      ':S+I→S',
      ':I+1→I',
      ':End',
      ':Disp S',
    ];
    const { output } = await runProgram(prog);
    expect(output.some((o) => o.includes('15'))).toBe(true);
  });

  test('While condition false initially: body skipped', async () => {
    const { output } = await runProgram([
      ':0→N',
      ':While N>10',
      ':Disp "SKIP"',
      ':End',
    ]);
    expect(output).not.toContain('SKIP');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Goto / Lbl', () => {
  test('Goto jumps to Lbl', async () => {
    const prog = [
      ':Goto END',
      ':Disp "SKIPPED"',
      ':Lbl END',
      ':Disp "REACHED"',
    ];
    const { output } = await runProgram(prog);
    expect(output).not.toContain('SKIPPED');
    expect(output).toContain('REACHED');
  });

  test('Lbl as loop target (counted with counter)', async () => {
    const prog = [
      ':0→N',
      ':Lbl LOOP',
      ':N+1→N',
      ':If N<3',
      ':Goto LOOP',
      ':Disp N',
    ];
    const { output } = await runProgram(prog);
    expect(output.some((o) => o.includes('3'))).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — ClrHome', () => {
  test('ClrHome clears output', async () => {
    const { output } = await runProgram([
      ':Disp "FIRST"',
      ':ClrHome',
      ':Disp "SECOND"',
    ]);
    expect(output).not.toContain('FIRST');
    expect(output).toContain('SECOND');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Stop / Return', () => {
  test('Stop halts execution early', async () => {
    const { output } = await runProgram([
      ':Disp "BEFORE"',
      ':Stop',
      ':Disp "AFTER"',
    ]);
    expect(output).toContain('BEFORE');
    expect(output).not.toContain('AFTER');
  });

  test('Return halts execution early', async () => {
    const { output } = await runProgram([
      ':Disp "BEFORE"',
      ':Return',
      ':Disp "AFTER"',
    ]);
    expect(output).toContain('BEFORE');
    expect(output).not.toContain('AFTER');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Pause', () => {
  test('Pause does not throw', async () => {
    await expect(
      runProgram([':Disp "X"', ':Pause'])
    ).resolves.toBeDefined();
  });

  test('Pause with message', async () => {
    await expect(
      runProgram([':Pause "PRESS ENTER"'])
    ).resolves.toBeDefined();
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Prompt', () => {
  test('Prompt stores input in variable', async () => {
    const { variables } = await runProgram([':Prompt A'], { inputResponses: ['99'] });
    expect(variables['A']).toBe(99);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Output(', () => {
  test('Output displays text', async () => {
    const { output } = await runProgram([':Output(1,1,"HELLO")']);
    expect(output.some((o) => o.includes('HELLO'))).toBe(true);
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Error Handling', () => {
  test('undefined label throws or resolves gracefully', async () => {
    await expect(
      runProgram([':Goto UNDEFINED_LABEL'])
    ).rejects.toBeDefined();
  });

  test('empty program resolves without output', async () => {
    const { output } = await runProgram([]);
    expect(output).toHaveLength(0);
  });

  test('comment-only lines are ignored', async () => {
    const { output } = await runProgram([
      '/* This is a comment',
      ':Disp "REAL"',
    ]);
    expect(output).toContain('REAL');
  });
});

// ════════════════════════════════════════════════════════════════════════════
describe('TI-BASIC — Integration Programs', () => {
  test('Fibonacci: first 7 terms correctly computed', async () => {
    const prog = [
      ':1→A',
      ':1→B',
      ':For(I,1,5)',
      ':A+B→C',
      ':B→A',
      ':C→B',
      ':End',
      ':Disp B', // Should be F(7) = 13
    ];
    const { output } = await runProgram(prog);
    expect(output.some((o) => o.includes('13'))).toBe(true);
  });

  test('Factorial: 5! using loop', async () => {
    const prog = [
      ':1→R',
      ':For(I,1,5)',
      ':R×I→R',
      ':End',
      ':Disp R',
    ];
    const { output } = await runProgram(prog);
    expect(output.some((o) => o.includes('120'))).toBe(true);
  });

  test('Power of 2: 2^8 using loop', async () => {
    const prog = [
      ':1→R',
      ':For(I,1,8)',
      ':R×2→R',
      ':End',
      ':Disp R',
    ];
    const { output } = await runProgram(prog);
    expect(output.some((o) => o.includes('256'))).toBe(true);
  });

  test('Collatz sequence from 6: reaches 1', async () => {
    const prog = [
      ':6→N',
      ':While N>1',
      ':If N/2=int(N/2)',
      ':Then',
      ':N/2→N',
      ':Else',
      ':3N+1→N',
      ':End',
      ':Disp N',
      ':End'
    ];
    const { output } = await runProgram(prog);
    console.log('COLLATZ OUTPUT:', output);
    expect(output.some((o) => o.trim() === '1')).toBe(true);
  });
});
