'use client';
// ============================================================
// MenuOverlay — Generic scrollable menu (MATH, DISTR, etc.)
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useCalculatorStore, dispatchAction } from '@/store/useCalculatorStore';
import { MenuState } from '@/types/calculator';

interface MenuOverlayProps {
  menu: MenuState | MenuState[];
}

export default function MenuOverlay({ menu }: MenuOverlayProps) {
  const { closeMenu, appendInput } = useCalculatorStore();
  const listRef = useRef<HTMLDivElement>(null);
  
  const isMultiTab = Array.isArray(menu);
  const menus = isMultiTab ? menu : [menu];
  
  const [activeTab, setActiveTab] = useState(0);
  const currentMenu = menus[activeTab];
  // Internal state for selected index (since store's index might be out of sync in multi-tab)
  const [selectedIndex, setSelectedIndex] = useState(currentMenu.selectedIndex ?? 0);

  // When changing tabs, reset selected index to 0 or its saved state
  useEffect(() => {
    setSelectedIndex(currentMenu.selectedIndex ?? 0);
  }, [activeTab, currentMenu]);

  useEffect(() => {
    const el = listRef.current?.children[selectedIndex] as HTMLElement | undefined;
    el?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex, activeTab]);

  const handleSelect = (idx: number) => {
    const item = currentMenu.items[idx];
    if (item.action === 'insert' && item.value) {
      appendInput(String(item.value));
    } else if (item.action) {
      dispatchAction(item.action as never);
    }
    closeMenu();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault(); // prevent weird jumping
    if (e.key === 'Escape') { closeMenu(); return; }
    
    if (e.key === 'ArrowRight' && isMultiTab) {
      setActiveTab((prev) => (prev + 1) % menus.length);
      return;
    }
    if (e.key === 'ArrowLeft' && isMultiTab) {
      setActiveTab((prev) => (prev - 1 + menus.length) % menus.length);
      return;
    }

    if (e.key === 'ArrowDown') {
      setSelectedIndex((prev) => (prev + 1) % currentMenu.items.length);
    }
    if (e.key === 'ArrowUp') {
      setSelectedIndex((prev) => (prev - 1 + currentMenu.items.length) % currentMenu.items.length);
    }
    if (e.key === 'Enter') {
      handleSelect(selectedIndex);
    }
    
    // Number shortcuts
    if (/^[0-9A-Fa-f]$/.test(e.key)) {
      const num = parseInt(e.key, 16);
      const idx = num === 0 ? 9 : num - 1;
      if (idx >= 0 && idx < currentMenu.items.length) handleSelect(idx);
    }
  };

  return (
    <div
      className="absolute inset-0 z-50 flex items-start justify-center outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
      autoFocus
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={closeMenu} />

      {/* Menu panel */}
      <div className="relative mt-4 w-[90%] max-h-[220px] bg-[#E8F4E8] border-2 border-black rounded shadow-xl overflow-hidden flex flex-col font-mono">
        {/* Title / Tabs */}
        {isMultiTab ? (
           <div className="flex bg-[#1A3A1A] text-white text-[10px] overflow-x-auto border-b border-black">
             {menus.map((m, idx) => (
               <div 
                 key={idx} 
                 className={`px-2 py-1 cursor-pointer select-none whitespace-nowrap ${idx === activeTab ? 'bg-[#E8F4E8] text-black font-bold' : 'hover:bg-[#2A4A2A]'}`}
                 onClick={() => setActiveTab(idx)}
               >
                 {m.title}
               </div>
             ))}
           </div>
        ) : (
          <div className="bg-[#1A3A1A] text-white text-xs px-2 py-1 flex justify-between select-none">
            <span>{currentMenu.title}</span>
            <span className="opacity-60 text-[10px]">↑↓ Enter</span>
          </div>
        )}

        {/* Items */}
        <div ref={listRef} className="overflow-y-auto flex-1 pb-1">
          {currentMenu.items.map((item, idx) => (
            <div
              key={idx}
              className={`
                px-2 py-0.5 text-xs cursor-pointer select-none
                ${idx === selectedIndex ? 'bg-[#1A3A1A] text-white' : 'text-black hover:bg-gray-300'}
              `}
              onClick={() => handleSelect(idx)}
            >
              {item.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
