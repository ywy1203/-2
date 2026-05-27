import React, { useState } from 'react';
import { Search, ChevronDown, ChevronRight, ChevronLeft } from 'lucide-react';
import { mockCategories } from '../../data/mock';
import { cn } from '../../utils/cn';

export function Sidebar({ selectedLedgerId, onSelectLedger }: { selectedLedgerId: string | null, onSelectLedger: (id: string) => void }) {
  const [expandedCats, setExpandedCats] = useState<string[]>(mockCategories.map(c => c.id));
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCat = (id: string) => {
    if (expandedCats.includes(id)) {
      setExpandedCats(expandedCats.filter(c => c !== id));
    } else {
      setExpandedCats([...expandedCats, id]);
    }
  };

  if (isCollapsed) {
    return (
      <aside className="w-12 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full items-center py-4 relative z-10 shadow-[2px_0_8px_rgba(0,0,0,0.05)]">
         <button onClick={() => setIsCollapsed(false)} className="p-2 rounded-full hover:bg-slate-100 mt-2">
            <ChevronRight className="w-5 h-5 text-slate-500" />
         </button>
      </aside>
    );
  }

  return (
    <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white flex flex-col h-full relative z-10 shadow-[2px_0_8px_rgba(0,0,0,0.05)]">
      <div className="p-4 flex items-center justify-between">
        <div className="relative flex-1 mr-2">
          <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input 
            className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
            placeholder="搜索" 
          />
        </div>
        <button 
          onClick={() => setIsCollapsed(true)}
          className="text-blue-600 text-sm font-medium hover:text-blue-700 whitespace-nowrap"
        >
          收起
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto px-2">
        <div className="mb-2">
          <button
            onClick={() => onSelectLedger('overview')}
            className={cn(
              "w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
              selectedLedgerId === 'overview' ? "bg-[#5185ca]/10 text-[#5185ca]" : "text-slate-700 hover:bg-slate-50"
            )}
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
            台账总览
          </button>
        </div>
        <div className="space-y-0.5">
          {mockCategories.map(category => (
            <div key={category.id} className="">
              <div 
                className="flex items-center px-2 py-2 text-sm text-slate-700 cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleCat(category.id)}
              >
                {expandedCats.includes(category.id) ? (
                  <ChevronDown className="w-4 h-4 mr-1 text-slate-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 mr-1 text-slate-400" />
                )}
                {category.name}
              </div>
              {expandedCats.includes(category.id) && (
                <div className="mt-0.5 space-y-0.5 mb-1 pb-1">
                  {category.ledgers.map(ledger => (
                    <button
                      key={ledger.id}
                      onClick={() => onSelectLedger(ledger.id)}
                      className={cn(
                        "w-full flex items-center pl-7 pr-2 py-2 text-sm transition-colors text-left",
                        selectedLedgerId === ledger.id
                          ? "bg-[#eef2ff] text-blue-600 font-medium"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      {ledger.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
      
      <button 
        onClick={() => setIsCollapsed(true)}
        className="absolute top-1/2 -right-3.5 w-7 h-7 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-50 hover:text-slate-600 shadow-sm z-20"
      >
        <ChevronLeft className="w-4 h-4 mr-0.5" />
      </button>
    </aside>
  );
}
