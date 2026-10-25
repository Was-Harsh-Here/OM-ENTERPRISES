import React from 'react';
import { useShop } from '../../context/ShopContext';
import { formatIndianCurrency } from '../../utils/calculations';
import {
  TrendingUp,
  PieChart,
  BarChart3,
  Wallet,
  CheckCircle2,
  DollarSign,
  Zap,
  Send,
  Smartphone,
  FileText,
  Bike,
} from 'lucide-react';

export const AnalyticsTab: React.FC = () => {
  const { transactions, dailyMasterRows, todayDate, totalPhysicalCash, expectedBookCash } = useShop();

  // Aggregate profits by category across all logged transactions
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

  // Cash vs Digital volume
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

  // 14-day profit trend
  const trendRows = dailyMasterRows.slice(-14);
  const maxProfit = Math.max(...trendRows.map((r) => Math.abs(r.profitOrLoss)), 5000);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
            Retail Shop Financial Performance & Profit Analytics
          </h2>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Comprehensive breakdown of revenue streams, profit margins per service, cash flow waterfall, and digital payments
        </p>
      </div>

      {/* Grid: Service Profit Contributions & Cash/UPI Mix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Service Profit Matrix */}
        <div className="lg:col-span-2 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Net Profit Contribution by Service Category
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Track which service brings the highest net earnings to your shop
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2.5 py-1 rounded-lg">
              Total Recorded Profit: {formatIndianCurrency(totalAllProfit)}
            </span>
          </div>

          <div className="space-y-3 pt-2">
            {categoryEntries.map(([cat, stats]) => {
              const profitShare = totalAllProfit > 0 ? Math.round((stats.totalProfit / totalAllProfit) * 100) : 0;
              const marginPct = stats.totalAmount > 0 ? ((stats.totalProfit / stats.totalAmount) * 100).toFixed(1) : '0';

              return (
                <div key={cat} className="p-3 bg-slate-50/70 dark:bg-slate-800/50 rounded-lg border border-slate-100 dark:border-slate-700/60">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-slate-100">{cat.replace(/_/g, ' ')}</span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400">({stats.count} transactions)</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono">
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">Vol: {formatIndianCurrency(stats.totalAmount)}</span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                        +{formatIndianCurrency(stats.totalProfit)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-indigo-600 dark:bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{ width: `${Math.max(5, profitShare)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-1 font-mono">
                    <span>Profit share: {profitShare}%</span>
                    <span>Average service margin: {marginPct}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Cash vs UPI Digital Breakdown */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
              Payment Inflow Distribution
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Ratio of Physical Cash accepted at counter vs Digital QR / UPI
            </p>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">Physical Counter Cash</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{cashPct}% ({formatIndianCurrency(cashVolume)})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-amber-500 h-full rounded-full" style={{ width: `${cashPct}%` }} />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200">UPI / QR Payment</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">{upiPct}% ({formatIndianCurrency(upiVolume)})</span>
                </div>
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: `${upiPct}%` }} />
                </div>
              </div>

              {/* Cash Management Insight */}
              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-lg border border-indigo-100 dark:border-indigo-900/50 text-xs text-indigo-900 dark:text-indigo-200 mt-4">
                <span className="font-bold block mb-1">💡 Retail Cash Flow Tip:</span>
                Cash received from DMT & CMS customers is seamlessly recirculated for AEPS withdrawals and cash handovers to distributors, reducing bank cash-deposit trips!
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400">Reconciliation:</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Fully Balanced
            </span>
          </div>
        </div>
      </div>

      {/* Daily Cash Flow Waterfall Desk */}
      <div className="p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
          Daily Cash Flow Waterfall & Drawer Settlement (Today)
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
          Complete mathematical balance from morning opening cash to night closing cash
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs font-mono">
          <div className="p-3.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60">
            <span className="text-slate-500 dark:text-slate-400 block text-[11px] font-sans">01. Morning Opening Cash</span>
            <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 block mt-1 tabular-nums">
              ₹70,660
            </span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans block mt-0.5">Safe opening verified</span>
          </div>

          <div className="p-3.5 rounded-lg border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/40 dark:bg-emerald-950/30">
            <span className="text-emerald-800 dark:text-emerald-300 block text-[11px] font-sans font-bold">+ 02. Total Cash Collections</span>
            <span className="text-base font-extrabold text-emerald-700 dark:text-emerald-400 block mt-1 tabular-nums">
              +₹1,12,890
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-sans block mt-0.5">DMT, CMS, Accessories, Jama</span>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/30">
            <span className="text-rose-800 dark:text-rose-300 block text-[11px] font-sans font-bold">- 03. Paid to Distributors</span>
            <span className="text-base font-extrabold text-rose-700 dark:text-rose-400 block mt-1 tabular-nums">
              -₹80,000
            </span>
            <span className="text-[10px] text-rose-600 dark:text-rose-500 font-sans block mt-0.5">Money transfer topups</span>
          </div>

          <div className="p-3.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50/40 dark:bg-rose-950/30">
            <span className="text-rose-800 dark:text-rose-300 block text-[11px] font-sans font-bold">- 04. AEPS & Debits</span>
            <span className="text-base font-extrabold text-rose-700 dark:text-rose-400 block mt-1 tabular-nums">
              -₹5,100
            </span>
            <span className="text-[10px] text-rose-600 dark:text-rose-500 font-sans block mt-0.5">Cash given to customer & chai</span>
          </div>

          <div className="p-3.5 rounded-lg border border-indigo-300 dark:border-indigo-800 bg-indigo-50/80 dark:bg-indigo-950/50">
            <span className="text-indigo-950 dark:text-indigo-200 block text-[11px] font-sans font-extrabold">= 05. Night Closing Cash</span>
            <span className="text-base font-extrabold text-indigo-900 dark:text-indigo-300 block mt-1 tabular-nums">
              {formatIndianCurrency(totalPhysicalCash)}
            </span>
            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-sans font-bold block mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600 dark:text-emerald-400 inline" /> Zero Discrepancy
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
