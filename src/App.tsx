/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ShopProvider, useShop } from './context/ShopContext';
import { Navbar, ActiveTab } from './components/Navbar';
import { DashboardTab } from './components/tabs/DashboardTab';
import { TransactionsLedgerTab } from './components/tabs/TransactionsLedgerTab';
import { DistributorPaymentsTab } from './components/tabs/DistributorPaymentsTab';
import { MasterSheetTab } from './components/tabs/MasterSheetTab';
import { DmtPortalsTab } from './components/tabs/DmtPortalsTab';
import { RechargeLapuTab } from './components/tabs/RechargeLapuTab';
import { AnalyticsTab } from './components/tabs/AnalyticsTab';
import { CashDrawerModal } from './components/CashDrawerModal';
import { NewTransactionModal } from './components/NewTransactionModal';
import { PortalApiCredentialsModal } from './components/PortalApiCredentialsModal';
import { ReceiptModal } from './components/ReceiptModal';
import { AndroidApkModal } from './components/AndroidApkModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { Transaction, TransactionCategory } from './types';
import { RotateCcw, Cpu, Smartphone } from 'lucide-react';

const AppContent: React.FC = () => {
  const { shopName, resetToCleanState, clearAllTransactions, transactions } = useShop();

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Modals state
  const [isCashDrawerOpen, setIsCashDrawerOpen] = useState(false);
  const [isNewTxnOpen, setIsNewTxnOpen] = useState(false);
  const [newTxnCategory, setNewTxnCategory] = useState<TransactionCategory>('MONEY_TRANSFER');
  const [isPortalApisOpen, setIsPortalApisOpen] = useState(false);
  const [isAndroidApkOpen, setIsAndroidApkOpen] = useState(false);
  const [selectedReceiptTxn, setSelectedReceiptTxn] = useState<Transaction | null>(null);

  const handleOpenNewTxnWithCategory = (cat: TransactionCategory) => {
    setNewTxnCategory(cat);
    setIsNewTxnOpen(true);
  };

  const handleClearTransactions = () => {
    if (window.confirm('Clear all logged transactions from OM ENTERPRISES ledger to start fresh? (Distributor settings and LAPU balance sheets will be preserved).')) {
      clearAllTransactions();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col text-slate-900 dark:text-slate-100 font-sans transition-colors duration-150">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onOpenNewTxn={() => {
          setNewTxnCategory('MONEY_TRANSFER');
          setIsNewTxnOpen(true);
        }}
        onOpenCashDrawer={() => setIsCashDrawerOpen(true)}
        onOpenPortalApis={() => setIsPortalApisOpen(true)}
        onOpenAndroidApk={() => setIsAndroidApkOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'dashboard' && (
          <DashboardTab
            onOpenNewTxnWithCategory={handleOpenNewTxnWithCategory}
            onOpenCashDrawer={() => setIsCashDrawerOpen(true)}
            onOpenPortalApis={() => setIsPortalApisOpen(true)}
            onOpenAndroidApk={() => setIsAndroidApkOpen(true)}
            onViewReceipt={(txn) => setSelectedReceiptTxn(txn)}
            onNavigateToTab={setActiveTab}
          />
        )}

        {activeTab === 'transactions' && (
          <TransactionsLedgerTab
            onOpenNewTxn={() => setIsNewTxnOpen(true)}
            onViewReceipt={(txn) => setSelectedReceiptTxn(txn)}
          />
        )}

        {activeTab === 'distributor-payments' && <DistributorPaymentsTab />}

        {activeTab === 'master-sheet' && <MasterSheetTab />}

        {activeTab === 'dmt-portals' && <DmtPortalsTab />}

        {activeTab === 'recharge-lapu' && <RechargeLapuTab />}

        {activeTab === 'analytics' && <AnalyticsTab />}
      </main>

      {/* Clean quiet footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-4 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-800 dark:text-slate-200">{shopName}</span>
            <span>·</span>
            <span>Retail CMS, Multi-Gateway DMT & Telecom LAPU Center</span>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsPortalApisOpen(true)}
              className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-semibold underline flex items-center gap-1"
            >
              <Cpu className="w-3 h-3 inline" /> 8 Portals Integrated
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setIsAndroidApkOpen(true)}
              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 font-semibold underline flex items-center gap-1"
            >
              <Smartphone className="w-3 h-3 inline" /> Android APK & Remote Mobile
            </button>
          </div>
          <div className="flex items-center gap-4">
            {transactions.length > 0 && (
              <button
                type="button"
                onClick={handleClearTransactions}
                className="flex items-center gap-1 text-slate-400 hover:text-rose-600 transition-colors"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Clear Live Transactions</span>
              </button>
            )}
          </div>
        </div>
      </footer>

      {/* Modals */}
      <CashDrawerModal
        isOpen={isCashDrawerOpen}
        onClose={() => setIsCashDrawerOpen(false)}
      />

      <NewTransactionModal
        isOpen={isNewTxnOpen}
        onClose={() => setIsNewTxnOpen(false)}
        defaultCategory={newTxnCategory}
      />

      <PortalApiCredentialsModal
        isOpen={isPortalApisOpen}
        onClose={() => setIsPortalApisOpen(false)}
      />

      <ReceiptModal
        transaction={selectedReceiptTxn}
        isOpen={!!selectedReceiptTxn}
        onClose={() => setSelectedReceiptTxn(null)}
      />

      <AndroidApkModal
        isOpen={isAndroidApkOpen}
        onClose={() => setIsAndroidApkOpen(false)}
      />

      <OfflineIndicator />
    </div>
  );
};

export default function App() {
  return (
    <ShopProvider>
      <AppContent />
    </ShopProvider>
  );
}
