import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { formatIndianCurrency } from '../../utils/calculations';
import {
  TrendingUp,
  BarChart3,
  Wallet,
  CheckCircle2,
  PieChart,
  Send,
  Smartphone,
  ShieldCheck,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const {
    transactions,
    dailyMasterRows,
    todayDate,
    totalPhysicalCash,
    expectedBookCash,
    distributorPayments,
    moneyTransferSettledTotal,
    moneyTransferPendingTotal,
    accessoriesSettledTotal,
    accessoriesPendingTotal,
  } = useShop();

  const [timeRange, setTimeRange] = useState<'7' | '14' | 'ALL'>('14');
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<any | null>(null);

  // 1. Profit by Service Category
  const categoryStats: Record<string, { totalAmount: number; totalProfit: number; count: number }> = {};
  transactions.forEach((t) => {
    if (!categoryStats[t.category]) {
      categoryStats[t.category] = { totalAmount: 0, totalProfit: 0, count: 0 };
    }
    categoryStats[t.category].totalAmount += t.amount || 0;
    categoryStats[t.category].totalProfit += t.netProfit || 0;
    categoryStats[t.category].count += 1;
  });

  const categoryEntries = Object.entries(categoryStats).sort((a, b) => b[1].totalProfit - a[1].totalProfit);
  const totalAllProfit = categoryEntries.reduce((acc, [, v]) => acc + v.totalProfit, 0);

  // 2. Cash vs Digital volume
  let cashVolume = 0;
  let upiVolume = 0;
  transactions.forEach((t) => {
    if (t.paymentMethod === 'CASH') cashVolume += t.amount;
    else if (t.paymentMethod === 'UPI') upiVolume += t.amount;
    else {
      cashVolume += t.cashAccepted || 0;
      upiVolume += t.upiAccepted || 0;
    }
  });
  const totalPaymentVol = cashVolume + upiVolume || 1;
  const cashPct = Math.round((cashVolume / totalPaymentVol) * 100);
  const upiPct = 100 - cashPct;

  // 3. Multi-Day Profit Trend from Master Excel Rows
  const trendRows = useMemo(() => {
    if (timeRange === '7') return dailyMasterRows.slice(-7);
    if (timeRange === '14') return dailyMasterRows.slice(-14);
    return dailyMasterRows;
  }, [dailyMasterRows, timeRange]);

  const maxDailyProfit = Math.max(...trendRows.map((r) => r.profitOrLoss), 5000);
  const minDailyProfit = Math.min(...trendRows.map((r) => r.profitOrLoss), 0);
  const avgDailyProfit = Math.round(
    trendRows.reduce((acc, r) => acc + r.profitOrLoss, 0) / (trendRows.length || 1)
  );

  // 4. Indo-Nepal Remittance Specific Analytics
  const indoNepalTxns = transactions.filter((t) => t.category === 'INDO_NEPAL');
  const indoNepalAccountCount = indoNepalTxns.filter((t) => t.indoNepalTransferType === 'ACCOUNT_DEPOSIT').length;
  const indoNepalCashCount = indoNepalTxns.filter((t) => t.indoNepalTransferType === 'CASH_PAYOUT').length;
  const indoNepalTotalInr = indoNepalTxns.reduce((acc, t) => acc + (t.amount || 0), 0);
  const indoNepalTotalNpr = indoNepalTxns.reduce(
    (acc, t) => acc + (t.nprAmountEstimated || (t.amount || 0) * 1.6),
    0
  );
  const indoNepalProfit = indoNepalTxns.reduce((acc, t) => acc + (t.netProfit || 0), 0);

  // 5. DMT Portal Distribution
  const portalStats: Record<string, { count: number; volume: number }> = {
    'GO_PAYMENTS': { count: 0, volume: 0 },
    'THE_SIMPLE_PAY': { count: 0, volume: 0 },
    'VD_PAYS': { count: 0, volume: 0 },
    'AIRTEL_CMS': { count: 0, volume: 0 },
    'AIRPAY': { count: 0, volume: 0 },
    'ONE_STOP': { count: 0, volume: 0 },
  };

  transactions.forEach((t) => {
    if (t.portal && portalStats[t.portal]) {
      portalStats[t.portal].count += 1;
      portalStats[t.portal].volume += t.amount;
    }
  });

  const totalDmtVol = Object.values(portalStats).reduce((acc, p) => acc + p.volume, 0) || 1;

  // 6. Distributor Settlement Health
  const totalDistPending = moneyTransferPendingTotal + accessoriesPendingTotal;
  const totalDistSettled = moneyTransferSettledTotal + accessoriesSettledTotal;
  const totalDistAll = totalDistPending + totalDistSettled || 1;
  const settledRatio = Math.round((totalDistSettled / totalDistAll) * 100);

  // SVG Chart Dimensions
  const svgWidth = 800;
  const svgHeight = 220;
  const paddingX = 40;
  const paddingY = 30;
  const chartW = svgWidth - paddingX * 2;
  const chartH = svgHeight - paddingY * 2;

  // Generate trend line points
  const points = trendRows.map((r, i) => {
    const x = paddingX + (i / Math.max(1, trendRows.length - 1)) * chartW;
    const normalized = (r.profitOrLoss - minDailyProfit) / Math.max(1, maxDailyProfit - minDailyProfit);
    const y = svgHeight - paddingY - normalized * chartH;
    return { x, y, data: r };
  });

  const pathD = points.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x} ${pt.y}`, '');
  const areaD = points.length
    ? `${pathD} L ${points[points.length - 1].x} ${svgHeight - paddingY} L ${points[0].x} ${svgHeight - paddingY} Z`
    : '';

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-slate-100">
              Financial Intelligence & Statistical Graphs
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time analytics across all 8 integrated gateways, Indo-Nepal remittance margins, LAPU channels, and distributor payables
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300">
            <button
              onClick={() => setTimeRange('7')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === '7' ? 'bg-white dark:bg-slate-900 text-indigo-600 font-bold shadow-2xs' : ''
              }`}
            >
              7 Days
            </button>
            <button
              onClick={() => setTimeRange('14')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === '14' ? 'bg-white dark:bg-slate-900 text-indigo-600 font-bold shadow-2xs' : ''
              }`}
            >
              14 Days
            </button>
            <button
              onClick={() => setTimeRange('ALL')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                timeRange === 'ALL' ? 'bg-white dark:bg-slate-900 text-indigo-600 font-bold shadow-2xs' : ''
              }`}
            >
              Month All ({dailyMasterRows.length}d)
            </button>
          </div>
        </div>
      </div>

      {/* Visual Chart 1: Interactive Daily Profit Trend Area Chart */}
      <div className="p-6 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" />
              Daily Net Profit Trend (Excel Daily Master Sheet)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive timeline from Excel master daybook showing daily net retained margin
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono">
            <span className="text-slate-500 dark:text-slate-400">
              Daily Avg: <strong className="text-slate-900 dark:text-slate-100">{formatIndianCurrency(avgDailyProfit)}</strong>
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
              Peak Day: {formatIndianCurrency(maxDailyProfit)}
            </span>
          </div>
        </div>

        {/* SVG Area Chart */}
        <div className="relative w-full overflow-hidden">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-56 sm:h-64 overflow-visible"
          >
            <defs>
              <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.35" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            <line
              x1={paddingX}
              y1={paddingY}
              x2={svgWidth - paddingX}
              y2={paddingY}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-slate-200 dark:text-slate-800"
            />
            <line
              x1={paddingX}
              y1={paddingY + chartH / 2}
              x2={svgWidth - paddingX}
              y2={paddingY + chartH / 2}
              stroke="currentColor"
              strokeDasharray="4 4"
              className="text-slate-200 dark:text-slate-800"
            />
            <line
              x1={paddingX}
              y1={svgHeight - paddingY}
              x2={svgWidth - paddingX}
              y2={svgHeight - paddingY}
              stroke="currentColor"
              className="text-slate-300 dark:text-slate-700"
            />

            {/* Area fill */}
            {areaD && <path d={areaD} fill="url(#profitGrad)" />}

            {/* Main Trend Line */}
            {pathD && (
              <path
                d={pathD}
                fill="none"
                stroke="#6366f1"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Points & Interactive Tooltips */}
            {points.map((pt, idx) => {
              const isHovered = hoveredTrendPoint?.date === pt.data.date;
              const isPeak = pt.data.profitOrLoss === maxDailyProfit;

              return (
                <g key={idx}>
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r={isHovered ? 6 : isPeak ? 5 : 4}
                    fill={isPeak ? '#10b981' : '#6366f1'}
                    stroke="#ffffff"
                    strokeWidth={isHovered ? 2.5 : 1.5}
                    className="cursor-pointer transition-all duration-150"
                    onMouseEnter={() => setHoveredTrendPoint(pt.data)}
                    onMouseLeave={() => setHoveredTrendPoint(null)}
                  />
                  {/* Date labels on X-axis */}
                  {(trendRows.length <= 14 || idx % 2 === 0) && (
                    <text
                      x={pt.x}
                      y={svgHeight - paddingY + 16}
                      textAnchor="middle"
                      className="text-[9px] fill-slate-400 font-mono"
                    >
                      {pt.data.date.split('-')[0]}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Hover Tooltip Box */}
          {hoveredTrendPoint && (
            <div className="absolute top-2 right-4 p-3 bg-slate-900/90 text-white rounded-xl shadow-lg border border-slate-700 text-xs font-mono space-y-1 backdrop-blur-xs">
              <div className="font-bold font-sans text-indigo-300">
                Date: {hoveredTrendPoint.date}
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Net Profit:</span>
                <span className="font-bold text-emerald-400">
                  +{formatIndianCurrency(hoveredTrendPoint.profitOrLoss)}
                </span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Total Inflow:</span>
                <span>{formatIndianCurrency(hoveredTrendPoint.totalBusiness)}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">Closing Cash:</span>
                <span>{formatIndianCurrency(hoveredTrendPoint.closingCash)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Grid: Service Breakdown, Indo-Nepal Spotlight, and Payment Modes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Category Profit Contribution */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <PieChart className="w-4 h-4 text-indigo-500" />
              Category Profit Margin
            </h3>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-400">
              +{formatIndianCurrency(totalAllProfit)}
            </span>
          </div>

          <div className="space-y-3">
            {categoryEntries.map(([cat, stats]) => {
              const profitShare = totalAllProfit > 0 ? Math.round((stats.totalProfit / totalAllProfit) * 100) : 0;
              const marginPct = stats.totalAmount > 0 ? ((stats.totalProfit / stats.totalAmount) * 100).toFixed(1) : '0';

              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {cat === 'INDO_NEPAL' ? '🇳🇵 Indo-Nepal' : cat.replace(/_/g, ' ')}
                    </span>
                    <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
                      +{formatIndianCurrency(stats.totalProfit)} ({profitShare}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, profitShare)}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                    <span>{stats.count} txns · Vol: {formatIndianCurrency(stats.totalAmount)}</span>
                    <span>Margin: {marginPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Indo-Nepal Remittance Performance Spotlight */}
        <div className="p-5 bg-linear-to-br from-indigo-950 via-slate-900 to-slate-900 text-white rounded-2xl border border-indigo-900/50 shadow-2xs flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-lg">🇳🇵</span>
                <h3 className="text-sm font-extrabold text-white">Indo-Nepal Remittance</h3>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 font-mono font-bold">
                1 INR = 1.60 NPR
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Highest per-transaction margin in the shop. Customer charge is fixed at ₹300, delivering maximum net earnings.
            </p>

            <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-mono">
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block font-sans">Account Deposit</span>
                <span className="text-emerald-400 font-bold block text-sm">₹150 Net Profit</span>
                <span className="text-[10px] text-slate-400 block">{indoNepalAccountCount} completed</span>
              </div>
              <div className="p-2.5 rounded-xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-[10px] text-slate-400 block font-sans">Cash Payout</span>
                <span className="text-amber-400 font-bold block text-sm">₹100 Net Profit</span>
                <span className="text-[10px] text-slate-400 block">{indoNepalCashCount} completed</span>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl space-y-1 font-mono text-xs">
              <div className="flex justify-between text-slate-300">
                <span>Total Remitted:</span>
                <span>{formatIndianCurrency(indoNepalTotalInr)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-bold">
                <span>Disbursed in Nepal:</span>
                <span>NPR {indoNepalTotalNpr.toLocaleString('en-IN')}</span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 mt-3 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400 font-sans">Total Indo-Nepal Income:</span>
            <span className="text-emerald-400 font-bold text-sm">+{formatIndianCurrency(indoNepalProfit)}</span>
          </div>
        </div>

        {/* DMT Portal Volume Share */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-indigo-500" />
              DMT Portal Volume Share
            </h3>
            <span className="text-xs text-slate-500 font-mono">6 Portals Active</span>
          </div>

          <div className="space-y-2.5 text-xs">
            {Object.entries(portalStats).map(([portal, stats]) => {
              const pct = Math.round((stats.volume / totalDmtVol) * 100) || 0;
              const portalName = portal.replace(/_/g, ' ');

              return (
                <div key={portal} className="space-y-1">
                  <div className="flex justify-between text-[11px]">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{portalName}</span>
                    <span className="font-mono text-slate-600 dark:text-slate-400">
                      {formatIndianCurrency(stats.volume)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full"
                      style={{ width: `${Math.max(3, pct)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          {/* Distributor Clearing Health Meter */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-bold text-slate-800 dark:text-slate-200">Distributor Dues Cleared</span>
              <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{settledRatio}% Settled</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
              <div className="bg-emerald-500 h-full" style={{ width: `${settledRatio}%` }} />
              <div className="bg-amber-500 h-full" style={{ width: `${100 - settledRatio}%` }} />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>Settled: {formatIndianCurrency(totalDistSettled)}</span>
              <span className="text-amber-600 dark:text-amber-400">Pending: {formatIndianCurrency(totalDistPending)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
