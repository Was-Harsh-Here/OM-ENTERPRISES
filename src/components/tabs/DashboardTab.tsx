import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { formatIndianCurrency } from '../../utils/calculations';
import { Transaction, TransactionCategory } from '../../types';
import {
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Coins,
  Send,
  Zap,
  Smartphone,
  FileText,
  Gamepad2,
  Bike,
  Fingerprint,
  CheckCircle2,
  AlertTriangle,
  Printer,
  ChevronRight,
  ShieldCheck,
  Building2,
  Cpu,
  QrCode,
} from 'lucide-react';

interface DashboardTabProps {
  onOpenNewTxnWithCategory: (category: TransactionCategory) => void;
  onOpenCashDrawer: () => void;
  onOpenPortalApis: () => void;
  onOpenAndroidApk?: () => void;
  onViewReceipt: (txn: Transaction) => void;
  onNavigateToTab: (tab: any) => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  onOpenNewTxnWithCategory,
  onOpenCashDrawer,
  onOpenPortalApis,
  onOpenAndroidApk,
  onViewReceipt,
  onNavigateToTab,
}) => {
  const {
    shopName,
    transactions,
    dailyMasterRows,
    todayDate,
    totalPhysicalCash,
    expectedBookCash,
    cashDiscrepancy,
    todayProfit,
    todayBusiness,
    portalCredentials,
    distributorPayments,
    moneyTransferSettledTotal,
    accessoriesSettledTotal,
  } = useShop();

  const [hoveredPoint, setHoveredPoint] = useState<{ date: string; business: number; profit: number } | null>(null);

  // Today's summary
  const todayTransactions = transactions.filter((t) => t.dateFormatted === todayDate);

  // Quick Action cards
  const quickActions: {
    category: TransactionCategory;
    title: string;
    sub: string;
    icon: React.ReactNode;
    bg: string;
    text: string;
  }[] = [
    {
      category: 'RECHARGE',
      title: 'Mobile Recharge',
      sub: 'Jio, Airtel, VI, BSNL, TataPlay',
      icon: <Zap className="w-5 h-5" />,
      bg: 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 border-amber-200',
      text: 'text-amber-800',
    },
    {
      category: 'MONEY_TRANSFER',
      title: 'Money Transfer',
      sub: 'Go Payments, TSP, VD Pays',
      icon: <Send className="w-5 h-5" />,
      bg: 'bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 border-blue-200',
      text: 'text-blue-800',
    },
    {
      category: 'CMS_DEPOSIT',
      title: 'Zomato / Swiggy CMS',
      sub: 'Rider cash collection deposit',
      icon: <Bike className="w-5 h-5" />,
      bg: 'bg-orange-500/10 hover:bg-orange-500/20 text-orange-700 border-orange-200',
      text: 'text-orange-800',
    },
    {
      category: 'AEPS',
      title: 'AEPS Cash Banking',
      sub: 'Aadhaar biometric withdrawal',
      icon: <Fingerprint className="w-5 h-5" />,
      bg: 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 border-cyan-200',
      text: 'text-cyan-800',
    },
    {
      category: 'BBPS_BILL',
      title: 'BBPS Utility Bill',
      sub: 'Electricity, Water, Gas, Fastag',
      icon: <FileText className="w-5 h-5" />,
      bg: 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 border-emerald-200',
      text: 'text-emerald-800',
    },
    {
      category: 'ACCESSORIES',
      title: 'Accessories Sale',
      sub: 'Cables, chargers, tempered glass',
      icon: <Smartphone className="w-5 h-5" />,
      bg: 'bg-purple-500/10 hover:bg-purple-500/20 text-purple-700 border-purple-200',
      text: 'text-purple-800',
    },
  ];

  // Prepare Chart Data from dailyMasterRows (14 most recent days)
  const chartRows = dailyMasterRows.slice(-14);
  const maxBusiness = Math.max(...chartRows.map((r) => r.totalBusiness), 100000);
  const chartHeight = 160;

  return (
    <div className="space-y-6">
      {/* Top Banner / OM ENTERPRISES */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-indigo-300 uppercase tracking-wider mb-1">
              <span>{shopName}</span>
              <span>·</span>
              <span>Counter Terminal #01</span>
              <span>·</span>
              <span>Sunday, {todayDate}</span>
              <span>·</span>
              <span className="text-emerald-400 flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> 8/8 Portals Online
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Financial Command & Daily CMS Center
            </h1>
            <p className="text-sm text-slate-300 mt-1 max-w-2xl">
              Automated API sync with Go Payments, The Simple Pay, VD Pays, Airtel Mitra, Ctopup, Jio POS+, Smart Connect, and Tata mSales.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {onOpenAndroidApk && (
              <button
                type="button"
                onClick={onOpenAndroidApk}
                className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 border border-emerald-400/40 rounded-xl text-xs font-bold text-white transition-all shadow-xs"
              >
                <Smartphone className="w-4 h-4 text-emerald-100" />
                <span>Android APK & Remote</span>
              </button>
            )}
            <button
              type="button"
              onClick={onOpenPortalApis}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-indigo-600/90 hover:bg-indigo-600 border border-indigo-400/30 rounded-xl text-xs font-bold text-white transition-all shadow-xs"
            >
              <Cpu className="w-4 h-4" />
              <span>Portal APIs & Sync</span>
            </button>
            <button
              type="button"
              onClick={onOpenCashDrawer}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all shadow-xs"
            >
              <Coins className="w-4 h-4 text-amber-400" />
              <span>Count Drawer Cash</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigateToTab('distributor-payments')}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 rounded-xl text-xs font-bold text-white transition-all shadow-xs"
            >
              <Building2 className="w-4 h-4 text-indigo-300" />
              <span>Distributor Payments</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Total Business */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Today's Business
            </span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded">
              {todayTransactions.length} Live Txns
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            {formatIndianCurrency(todayBusiness)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">DMT + Recharge + CMS</span>
          </div>
        </div>

        {/* Card 2: Today's Net Profit */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Net Profit Earned
            </span>
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded">
              Active Margin
            </span>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-700 dark:text-emerald-400 tabular-nums mt-2">
            {formatIndianCurrency(todayProfit)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>Avg margin:</span>
            <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
              {todayBusiness > 0 ? ((todayProfit / todayBusiness) * 100).toFixed(2) : '0.00'}%
            </span>
            <span>· Tracked per txn</span>
          </div>
        </div>

        {/* Card 3: Physical Cash In Drawer */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Physical Cash Drawer
            </span>
            <button
              onClick={onOpenCashDrawer}
              className="text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 underline"
            >
              Verify
            </button>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            {formatIndianCurrency(totalPhysicalCash)}
          </div>
          <div className="flex items-center gap-1.5 text-xs mt-2">
            {cashDiscrepancy === 0 ? (
              <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 font-mono">
                <CheckCircle2 className="w-3.5 h-3.5" /> Zero Discrepancy
              </span>
            ) : cashDiscrepancy > 0 ? (
              <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" /> +{formatIndianCurrency(cashDiscrepancy)} Excess
              </span>
            ) : (
              <span className="text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3.5 h-3.5" /> {formatIndianCurrency(cashDiscrepancy)} Short
              </span>
            )}
          </div>
        </div>

        {/* Card 4: Distributor Payments Settled */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Distributor Settlements
            </span>
            <button
              onClick={() => onNavigateToTab('distributor-payments')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
            >
              View Desk →
            </button>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900 dark:text-white tabular-nums mt-2">
            {formatIndianCurrency(moneyTransferSettledTotal + accessoriesSettledTotal)}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2">
            <span>DMT: {formatIndianCurrency(moneyTransferSettledTotal)}</span>
            <span>Acc: {formatIndianCurrency(accessoriesSettledTotal)}</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons Grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
            Quick Counter Service Desks
          </h2>
          <span className="text-xs text-slate-500">Click to record instant transaction</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.category}
              type="button"
              onClick={() => onOpenNewTxnWithCategory(action.category)}
              className={`p-3.5 rounded-xl border text-left transition-all hover:scale-[1.02] flex flex-col justify-between ${action.bg}`}
            >
              <div className="mb-2">{action.icon}</div>
              <div>
                <span className={`block font-bold text-xs ${action.text}`}>{action.title}</span>
                <span className="block text-[11px] text-slate-500 truncate mt-0.5">{action.sub}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Visual Data Charts: 14-Day Performance Trend + Connected Portal Status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Daily Business Volume & Net Profit Trend */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                14-Day Business Volume & Daily Profit / Loss Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                OM ENTERPRISES shop master ledger (08-10-2026 to 25-10-2026)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-slate-600 dark:text-slate-400">
                <span className="w-3 h-3 bg-indigo-500 rounded-xs inline-block" /> Business (₹)
              </span>
              <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                <span className="w-3 h-3 bg-emerald-500 rounded-full inline-block" /> Daily Margin (₹)
              </span>
            </div>
          </div>

          <div className="relative pt-4">
            <svg
              viewBox={`0 0 ${chartRows.length * 52} ${chartHeight + 40}`}
              className="w-full h-48 overflow-visible"
            >
              {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => (
                <line
                  key={idx}
                  x1={0}
                  y1={chartHeight * (1 - pct)}
                  x2={chartRows.length * 52}
                  y2={chartHeight * (1 - pct)}
                  stroke="currentColor"
                  className="text-slate-200 dark:text-slate-800"
                  strokeDasharray="3 3"
                />
              ))}

              {chartRows.map((row, idx) => {
                const barHeight = (row.totalBusiness / maxBusiness) * chartHeight;
                const x = idx * 52 + 10;
                const y = chartHeight - barHeight;
                const isToday = row.date === todayDate;

                return (
                  <g
                    key={row.date}
                    className="cursor-pointer group"
                    onMouseEnter={() =>
                      setHoveredPoint({
                        date: row.date,
                        business: row.totalBusiness,
                        profit: row.profitOrLoss,
                      })
                    }
                    onMouseLeave={() => setHoveredPoint(null)}
                  >
                    <rect
                      x={x}
                      y={y}
                      width={28}
                      height={Math.max(barHeight, 4)}
                      rx={4}
                      fill={isToday ? '#4f46e5' : '#818cf8'}
                      className="transition-colors group-hover:fill-indigo-500"
                    />
                    <text
                      x={x + 14}
                      y={chartHeight + 18}
                      textAnchor="middle"
                      fontSize="9"
                      fill="#94a3b8"
                      fontFamily="monospace"
                    >
                      {row.date.split('-')[0]}
                    </text>
                  </g>
                );
              })}
            </svg>

            {hoveredPoint && (
              <div className="absolute top-2 right-4 bg-slate-900 dark:bg-slate-800 text-white text-xs px-3 py-2 rounded-lg shadow-lg pointer-events-none font-mono border border-slate-700">
                <span className="text-slate-400 block">{hoveredPoint.date}</span>
                <span className="font-bold text-white block">
                  Business: {formatIndianCurrency(hoveredPoint.business)}
                </span>
                <span className="text-emerald-400 block">
                  Net PF/Loss: {formatIndianCurrency(hoveredPoint.profit)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Portal Status & Live Feeds */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Connected Portal Gateways
              </h3>
              <button
                onClick={onOpenPortalApis}
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 font-medium"
              >
                Manage APIs →
              </button>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real-time balance & auto-logging status for OM ENTERPRISES
            </p>

            <div className="space-y-2.5 max-h-56 overflow-y-auto">
              {portalCredentials.slice(0, 5).map((p) => (
                <div
                  key={p.portalId}
                  className="p-2 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/60 flex items-center justify-between text-xs"
                >
                  <div className="truncate pr-2">
                    <span className="font-bold text-slate-900 dark:text-slate-100 block truncate">{p.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Login: {p.loginId}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-slate-900 dark:text-white block tabular-nums">
                      {formatIndianCurrency(p.balance || 0)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 flex items-center justify-end gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400" /> Synced
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-500 dark:text-slate-400">Auto Logging:</span>
            <button
              onClick={onOpenPortalApis}
              className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300"
            >
              Configure All 8 Portals
            </button>
          </div>
        </div>
      </div>

      {/* Android APK & Remote Mobile Access Banner */}
      <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-xl border border-indigo-900/60 shadow-xs text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
            <Smartphone className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-white tracking-tight">
                Remote Shop Access on Android APK & Mobile
              </h4>
              <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live & Editable
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl">
              Track shop performance, review DMT volumes, approve distributor payments, and verify cash balances from your Android phone even when away from the shop.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2.5 shrink-0 w-full sm:w-auto">
          {onOpenAndroidApk && (
            <button
              type="button"
              onClick={onOpenAndroidApk}
              className="w-full sm:w-auto py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-lg transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR / Install APK</span>
            </button>
          )}
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Today's Live Transaction Stream
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Instant entry log with exact timestamp, customer ref, cash denomination, and net profit
            </p>
          </div>
          <button
            onClick={() => onNavigateToTab('transactions')}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 flex items-center gap-1"
          >
            <span>View Full Ledger ({transactions.length})</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {todayTransactions.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 dark:border-slate-800 rounded-lg">
            No transactions recorded yet today. Click "New Transaction" or "Portal APIs & Sync" to fetch live entries.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-y border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Time</th>
                  <th className="py-2.5 px-3">Service / Source</th>
                  <th className="py-2.5 px-3">Customer / Details</th>
                  <th className="py-2.5 px-3 text-right">Amount (₹)</th>
                  <th className="py-2.5 px-3 text-right">Profit (₹)</th>
                  <th className="py-2.5 px-3">Payment</th>
                  <th className="py-2.5 px-3 text-center">Receipt</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {todayTransactions.slice(0, 8).map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {txn.timeFormatted}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-semibold text-slate-900 dark:text-white block">{txn.category.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] text-indigo-700 dark:text-indigo-400 font-medium">
                        {txn.sourcePortal || txn.portal?.replace(/_/g, ' ') || txn.operator}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-slate-800 dark:text-slate-200 font-medium block">
                        {txn.customerName || txn.customerPhone || 'Walk-in'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate max-w-[200px] block">
                        {txn.serviceDetail || txn.referenceId}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white tabular-nums">
                      {formatIndianCurrency(txn.amount)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                      +{formatIndianCurrency(txn.netProfit)}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                        {txn.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(txn)}
                        title="Print Customer Receipt"
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded transition-colors"
                      >
                        <Printer className="w-4 h-4 inline" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

