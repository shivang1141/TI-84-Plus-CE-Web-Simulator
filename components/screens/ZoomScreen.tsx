'use client';
// ============================================================
// ZoomScreen — Zoom presets menu
// ============================================================

import { useCalculatorStore } from '@/store/useCalculatorStore';
import {
  DEFAULT_GRAPH_WINDOW, ZTRIG_WINDOW, ZDECIMAL_WINDOW, ZINTEGER_WINDOW,
  ZOOM_IN_FACTOR, ZOOM_OUT_FACTOR
} from '@/lib/constants';
import { GraphWindow } from '@/types/calculator';

export default function ZoomScreen() {
  const { setGraphWindow, graphWindow, setScreenMode } = useCalculatorStore();

  const applyZoom = (w: Partial<GraphWindow>) => {
    setGraphWindow(w);
    setScreenMode('graph');
  };

  const centerX = (graphWindow.xMin + graphWindow.xMax) / 2;
  const centerY = (graphWindow.yMin + graphWindow.yMax) / 2;
  const rangeX = (graphWindow.xMax - graphWindow.xMin);
  const rangeY = (graphWindow.yMax - graphWindow.yMin);

  const zooms = [
    {
      label: '1:ZBox', action: () => setScreenMode('graph'), // ZBox requires canvas drag interaction
    },
    {
      label: '2:Zoom In', action: () => applyZoom({
        xMin: centerX - rangeX * ZOOM_IN_FACTOR / 2,
        xMax: centerX + rangeX * ZOOM_IN_FACTOR / 2,
        yMin: centerY - rangeY * ZOOM_IN_FACTOR / 2,
        yMax: centerY + rangeY * ZOOM_IN_FACTOR / 2,
      }),
    },
    {
      label: '3:Zoom Out', action: () => applyZoom({
        xMin: centerX - rangeX * ZOOM_OUT_FACTOR / 2,
        xMax: centerX + rangeX * ZOOM_OUT_FACTOR / 2,
        yMin: centerY - rangeY * ZOOM_OUT_FACTOR / 2,
        yMax: centerY + rangeY * ZOOM_OUT_FACTOR / 2,
      }),
    },
    {
      label: '4:ZDecimal', action: () => applyZoom(ZDECIMAL_WINDOW),
    },
    {
      label: '5:ZSquare', action: () => {
        const aspect = rangeX / rangeY;
        applyZoom({
          xMin: centerX - rangeY * aspect / 2,
          xMax: centerX + rangeY * aspect / 2,
        });
      },
    },
    {
      label: '6:ZStandard', action: () => applyZoom(DEFAULT_GRAPH_WINDOW),
    },
    {
      label: '7:ZTrig', action: () => applyZoom(ZTRIG_WINDOW),
    },
    {
      label: '8:ZInteger', action: () => applyZoom(ZINTEGER_WINDOW),
    },
    {
      label: '9:ZoomStat', action: () => applyZoom(DEFAULT_GRAPH_WINDOW),
    },
    {
      label: '0:ZoomFit', action: () => setScreenMode('graph'),
    },
  ];

  return (
    <div className="w-full h-full bg-[#E8F4E8] font-mono text-black flex flex-col p-1">
      <div className="bg-[#1A3A1A] text-white text-[10px] px-1 py-0.5 mb-2">
        ZOOM
      </div>

      <div className="flex-1 overflow-y-auto">
        {zooms.map((z, i) => (
          <button
            key={i}
            onClick={z.action}
            className="w-full text-left text-[12px] px-1 py-0.5 hover:bg-[#1A3A1A] hover:text-white active:bg-[#0D1E0D] rounded"
          >
            {z.label}
          </button>
        ))}
      </div>
    </div>
  );
}
