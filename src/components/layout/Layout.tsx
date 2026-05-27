import React from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { mockCategories } from '../../data/mock';

export function Layout({ children, selectedLedgerId, onSelectLedger }: { children: React.ReactNode, selectedLedgerId: string | null, onSelectLedger: (id: string) => void }) {
  
  let currentTitle = '台账总览';
  let currentCategory = '业务概览';
  
  if (selectedLedgerId && selectedLedgerId !== 'overview') {
    mockCategories.forEach(c => {
      const ledger = c.ledgers.find(l => l.id === selectedLedgerId);
      if (ledger) {
        currentTitle = ledger.name;
        currentCategory = c.name;
      }
    });
  }

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-900 font-sans">
      <Sidebar selectedLedgerId={selectedLedgerId} onSelectLedger={onSelectLedger} />
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <Header title={currentTitle} categoryName={currentCategory} />
        <main className="flex-1 overflow-hidden relative">
          {children}
        </main>
      </div>
    </div>
  );
}
