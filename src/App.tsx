/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Layout } from './components/layout/Layout';
import { mockLedgerConfigs } from './data/mock';
import { LedgerWorkspace } from './components/ledger/LedgerWorkspace';
import { LedgerOverview } from './components/ledger/LedgerOverview';

export default function App() {
  const [selectedLedgerId, setSelectedLedgerId] = useState<string | null>('overview');
  
  useEffect(() => {
    const handleNav = (e: CustomEvent<string>) => {
      setSelectedLedgerId(e.detail);
    };
    window.addEventListener('nav-ledger', handleNav as EventListener);
    return () => window.removeEventListener('nav-ledger', handleNav as EventListener);
  }, []);

  const currentConfig = mockLedgerConfigs.find(c => c.id === selectedLedgerId);

  return (
    <Layout selectedLedgerId={selectedLedgerId} onSelectLedger={setSelectedLedgerId}>
      {selectedLedgerId === 'overview' ? (
        <LedgerOverview />
      ) : currentConfig ? (
        <LedgerWorkspace key={currentConfig.id} config={currentConfig} />
      ) : (
        <div className="flex-1 h-full flex items-center justify-center text-slate-400">
          <p>请在左侧选择一个业务台账进行管理</p>
        </div>
      )}
    </Layout>
  );
}
