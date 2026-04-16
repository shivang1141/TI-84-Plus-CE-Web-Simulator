'use server';
// ============================================================
// TI-84 Plus CE Simulator — Server Actions (Vercel Postgres)
// ============================================================

import prisma from '@/lib/db';
import { cookies } from 'next/headers';
import type { HistoryEntry, Equation, CalcSettings, GraphWindow, Program } from '@/types/calculator';

interface SessionData {
  history: HistoryEntry[];
  variables: Record<string, number | string>;
  equations: Equation[];
  settings: Partial<CalcSettings>;
  graphWindow: Partial<GraphWindow>;
  programs: Program[];
  lists: Record<string, number[]>;
  lastAnswer: number | string;
}

async function getSessionKey(): Promise<string> {
  const cookieStore = await cookies();
  const key = cookieStore.get('ti84_session')?.value;
  if (key) return key;
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export async function saveCalculatorState(data: SessionData): Promise<{ success: boolean }> {
  try {
    const sessionKey = await getSessionKey();

    await prisma.userSession.upsert({
      where: { sessionKey },
      update: {
        history: JSON.parse(JSON.stringify(data.history)),
        variables: JSON.parse(JSON.stringify(data.variables)),
        equations: JSON.parse(JSON.stringify(data.equations)),
        settings: JSON.parse(JSON.stringify(data.settings)),
        graphWindow: JSON.parse(JSON.stringify(data.graphWindow)),
        programs: JSON.parse(JSON.stringify(data.programs)),
        lists: JSON.parse(JSON.stringify(data.lists)),
        lastAnswer: typeof data.lastAnswer === 'number' ? data.lastAnswer : 0,
      },
      create: {
        sessionKey,
        history: JSON.parse(JSON.stringify(data.history)),
        variables: JSON.parse(JSON.stringify(data.variables)),
        equations: JSON.parse(JSON.stringify(data.equations)),
        settings: JSON.parse(JSON.stringify(data.settings)),
        graphWindow: JSON.parse(JSON.stringify(data.graphWindow)),
        programs: JSON.parse(JSON.stringify(data.programs)),
        lists: JSON.parse(JSON.stringify(data.lists)),
        lastAnswer: typeof data.lastAnswer === 'number' ? data.lastAnswer : 0,
      },
    });

    return { success: true };
  } catch (err) {
    console.error('Failed to save calculator state:', err);
    return { success: false };
  }
}

export async function loadCalculatorState(): Promise<SessionData | null> {
  try {
    const sessionKey = await getSessionKey();

    const session = await prisma.userSession.findUnique({
      where: { sessionKey },
    });

    if (!session) return null;

    return {
      history: (session.history as unknown as HistoryEntry[]) ?? [],
      variables: (session.variables as unknown as Record<string, number | string>) ?? {},
      equations: (session.equations as unknown as Equation[]) ?? [],
      settings: (session.settings as unknown as Partial<CalcSettings>) ?? {},
      graphWindow: (session.graphWindow as unknown as Partial<GraphWindow>) ?? {},
      programs: (session.programs as unknown as Program[]) ?? [],
      lists: (session.lists as unknown as Record<string, number[]>) ?? {},
      lastAnswer: session.lastAnswer ?? 0,
    };
  } catch (err) {
    console.error('Failed to load calculator state:', err);
    return null;
  }
}

export async function clearCalculatorState(): Promise<{ success: boolean }> {
  try {
    const sessionKey = await getSessionKey();
    await prisma.userSession.deleteMany({ where: { sessionKey } });
    return { success: true };
  } catch {
    return { success: false };
  }
}
