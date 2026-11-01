import React, { useState } from 'react';
import { PlusCircle, Coins, Cpu, Sun, Moon, Smartphone, FileSpreadsheet, Sparkles, RefreshCw, Clock } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export type ActiveTab =
  | 'dashboard'
  | 'transactions'
  | 'distributor-payments'
  | 'master-sheet'
  | 'dmt-portals'
  | 'recharge-lapu'
  | 'analytics';

interface NavbarProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onOpenNewTxn: () => void;
  onOpenCashDrawer: () => void;
  onOpenPortalApis: () => void;
  onOpenAndroidApk: () => void;
  onOpenAccountingExport: () => void;
  onOpenChatbot: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  onOpenNewTxn,
  onOpenCashDrawer,
  onOpenPortalApis,
  onOpenAndroidApk,
  onOpenAccountingExport,
  onOpenChatbot,
}) => {
  const {
    theme,
    toggleTheme,
    currentTime,
    currentLiveDate,
    lastLedgerRefreshTime,
    isAutoRefreshEnabled,
    toggleAutoRefresh,
    forceRefreshLedger,
  } = useShop();

  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleManualRefresh = () => {
    setIsRefreshing(true);
    forceRefreshLedger();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  const navItems: { key: ActiveTab; label: string }[] = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'transactions', label: 'Transactions' },
    { key: 'distributor-payments', label: 'Distributor Payments' },
    { key: 'master-sheet', label: 'Daily Master' },
    { key: 'dmt-portals', label: 'DMT Portals' },
    { key: 'recharge-lapu', label: 'Recharge LAPU' },
    { key: 'analytics', label: 'Performance' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shadow-2xs transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-4 h-16">
        {/* Zone 1: Single text element wordmark + Live Time Sync */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-indigo-600 dark:bg-indigo-500 flex items-center justify-center text-white font-extrabold text-sm shadow-xs">
              OM
            </span>
            <div className="leading-tight">
              <span className="text-sm font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap block">
                OM ENTERPRISES
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                Fintech & Retail Ledger
              </span>
            </div>
          </div>

          {/* Live Device Hardware Time & Date Sync Badge */}
          <div className="flex items-center gap-1.5 sm:gap-2 px-2 sm:px-2.5 py-1 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-xs">
            <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-200">
              <span className="relative flex h-2 w-2 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-semibold hidden sm:inline">{currentLiveDate}</span>
              <span className="text-slate-400 hidden sm:inline">·</span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 tracking-tight">{currentTime}</span>
            </div>

            <button
              type="button"
              onClick={handleManualRefresh}
              title={`Device Hardware Synced: ${currentLiveDate} ${currentTime}. Auto-Sync: ${isAutoRefreshEnabled ? 'ON' : 'OFF'}. Click to force recalculate.`}
              className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 hover:text-emerald-800 dark:hover:text-emerald-300 pl-1 border-l border-slate-300 dark:border-slate-600 cursor-pointer"
            >
              <RefreshCw className={`w-3 h-3 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden md:inline">Auto-Sync</span>
            </button>
          </div>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="hidden xl:flex items-center gap-1 overflow-x-auto py-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => onTabChange(item.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'bg-slate-900 dark:bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Light / Dark Mode Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* Android APK & Mobile Access */}
          <button
            type="button"
            onClick={onOpenAndroidApk}
            title="Android APK & Remote Mobile Access"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-800/60 rounded-lg transition-colors whitespace-nowrap"
          >
            <Smartphone className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden md:inline">Android APK</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>

          <button
            type="button"
            onClick={onOpenPortalApis}
            title="Portal Logins & API Integration"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/60 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-800/60 rounded-lg transition-colors whitespace-nowrap"
          >
            <Cpu className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="hidden sm:inline">Portal APIs</span>
          </button>

          <button
            type="button"
            onClick={onOpenAccountingExport}
            title="Export Daily Ledger & Distributor Reports (CSV & PDF)"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hidden lg:inline">Export Reports</span>
          </button>

          <button
            type="button"
            onClick={onOpenChatbot}
            title="Om Copilot AI - Intelligent Store Advisor"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg transition-all shadow-xs whitespace-nowrap"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
            <span className="hidden sm:inline">Om Copilot</span>
            <span className="text-[9px] px-1 bg-white/20 rounded font-mono">AI</span>
          </button>

          <button
            type="button"
            onClick={onOpenCashDrawer}
            title="Cash Denomination Drawer & Reconciliation"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap"
          >
            <Coins className="w-4 h-4 text-amber-500" />
            <span className="hidden sm:inline">Cash Drawer</span>
          </button>

          <button
            type="button"
            onClick={onOpenNewTxn}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-all shadow-xs whitespace-nowrap active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            <span>New Transaction</span>
          </button>
        </div>
      </div>

      {/* Mobile scrollable tabs bar */}
      <div className="xl:hidden flex items-center gap-1 px-4 py-2 overflow-x-auto border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        {navItems.map((item) => {
          const isActive = activeTab === item.key;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => onTabChange(item.key)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'bg-slate-900 dark:bg-indigo-600 text-white'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </header>
  );
};
