import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { LapuOperatorRow } from '../../types';
import { exportToCsv } from '../../utils/calculations';
import { Download, Zap, Layers } from 'lucide-react';

export const RechargeLapuTab: React.FC = () => {
  const { lapuRows, todayDate } = useShop();

  const [activeAccount, setActiveAccount] = useState<'ALL' | 'SHREE_DEMO' | 'SANJAY_DEMO'>('ALL');

  const filteredRows = lapuRows.filter((r) => {
    if (activeAccount === 'ALL') return true;
    return r.demoAccount === activeAccount;
  });

  const handleExportCsv = () => {
    const headers = [
      'DATE',
      'ACCOUNT',
      'JIO OPP',
      'AIRTEL OPP',
      'VI OPP',
      'BSNL OPP',
      'D2H OPP',
      'TATA OPP',
      'JIO ADD',
      'AIRTEL ADD',
      'VI ADD',
      'BSNL ADD',
      'D2H ADD',
      'TATA ADD',
      'JIO CLOSING',
      'AIRTEL CLOSING',
      'VI CLOSING',
      'BSNL CLOSING',
      'D2H CLOSING',
      'TATA CLOSING',
      'JIO SALES',
      'AIRTEL SALES',
      'VI SALES',
      'BSNL SALES',
      'D2H SALES',
      'TATA SALES',
      'TOTAL SALES',
    ];

    const rows = filteredRows.map((r) => [
      r.date,
      r.demoAccount,
      r.jioOpp,
      r.airtelOpp,
      r.viOpp,
      r.bsnlOpp,
      r.d2hOpp,
      r.tataOpp,
      r.jioAdd,
      r.airtelAdd,
      r.viAdd,
      r.bsnlAdd,
      r.d2hAdd,
      r.tataAdd,
      r.jioClosing,
      r.airtelClosing,
      r.viClosing,
      r.bsnlClosing,
      r.d2hClosing,
      r.tataClosing,
      r.jioSales,
      r.airtelSales,
      r.viSales,
      r.bsnlSales,
      r.d2hSales,
      r.tataSales,
      r.totalSales,
    ]);

    exportToCsv('recharge_lapu_ledger_sheet', headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Telecom Multi-Operator LAPU & Demo Recharge Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Digital mirror of your LAPU Sheets (Images 3 & 4) tracking Jio, Airtel, VI, BSNL, Airtel D2H, and TataPlay balances
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Segmented control for demo accounts */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            {(
              [
                { key: 'ALL', label: 'All LAPUs' },
                { key: 'SHREE_DEMO', label: 'Shree Demo' },
                { key: 'SANJAY_DEMO', label: 'Sanjay Demo' },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveAccount(item.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                  activeAccount === item.key
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export LAPU (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 font-extrabold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider text-center">
              <tr>
                <th className="py-2 px-3 border-r border-slate-300 dark:border-slate-700">Header</th>
                <th colSpan={6} className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 bg-amber-100/70 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200">
                  Opening Balance (OPP BAL)
                </th>
                <th colSpan={6} className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200">
                  Balance Added by Distributor (BAL ADD)
                </th>
                <th colSpan={6} className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 bg-blue-100/70 dark:bg-blue-950/60 text-blue-950 dark:text-blue-200">
                  Closing Balance
                </th>
                <th colSpan={7} className="py-2 px-3 bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200">
                  Operator Recharge Sales
                </th>
              </tr>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 text-left">DATE / LAPU</th>
                {/* OPP */}
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">JIO</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">AIRTEL</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">VI</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">BSNL</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">D2H</th>
                <th className="py-2 px-2 border-r border-slate-300 dark:border-slate-700 text-right">TATA</th>
                {/* BAL ADD */}
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">JIO</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">AIRTEL</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">VI</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">BSNL</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">D2H</th>
                <th className="py-2 px-2 border-r border-slate-300 dark:border-slate-700 text-right">TATA</th>
                {/* CLOSING */}
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">JIO</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">AIRTEL</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">VI</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">BSNL</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">D2H</th>
                <th className="py-2 px-2 border-r border-slate-300 dark:border-slate-700 text-right">TATA</th>
                {/* SALES */}
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">JIO</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">AIRTEL</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">VI</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">BSNL</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">D2H</th>
                <th className="py-2 px-2 border-r border-slate-200 dark:border-slate-700 text-right">TATA</th>
                <th className="py-2 px-3 text-right bg-indigo-200/60 dark:bg-indigo-900/60 font-extrabold text-indigo-950 dark:text-indigo-200">TOTAL SALES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px] tabular-nums">
              {filteredRows.map((row, idx) => {
                const isToday = row.date === todayDate;

                return (
                  <tr
                    key={`${row.date}-${row.demoAccount}-${idx}`}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      isToday ? 'bg-indigo-50/40 dark:bg-indigo-950/30 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                      <div>{row.date}</div>
                      <div className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold font-mono">
                        {row.demoAccount.replace('_', ' ')}
                      </div>
                    </td>

                    {/* Opening */}
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300">{row.jioOpp.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300">{row.airtelOpp.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300">{row.viOpp.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300">{row.bsnlOpp.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-400 dark:text-slate-500">{row.d2hOpp || 0}</td>
                    <td className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 text-right text-slate-700 dark:text-slate-300">{row.tataOpp.toLocaleString('en-IN')}</td>

                    {/* Bal Add */}
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/20 dark:bg-emerald-950/20">
                      {row.jioAdd > 0 ? row.jioAdd.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/20 dark:bg-emerald-950/20">
                      {row.airtelAdd > 0 ? row.airtelAdd.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/20 dark:bg-emerald-950/20">
                      {row.viAdd > 0 ? row.viAdd.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-400 dark:text-slate-500">{row.bsnlAdd || 0}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-400 dark:text-slate-500">{row.d2hAdd || 0}</td>
                    <td className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 text-right text-slate-400 dark:text-slate-500">{row.tataAdd || 0}</td>

                    {/* Closing */}
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-medium text-slate-700 dark:text-slate-300">{row.jioClosing.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-medium text-slate-700 dark:text-slate-300">{row.airtelClosing.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-medium text-slate-700 dark:text-slate-300">{row.viClosing.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-medium text-slate-700 dark:text-slate-300">{row.bsnlClosing.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-400 dark:text-slate-500">{row.d2hClosing || 0}</td>
                    <td className="py-2.5 px-2 border-r border-slate-300 dark:border-slate-700 text-right text-slate-700 dark:text-slate-300">{row.tataClosing.toLocaleString('en-IN')}</td>

                    {/* Sales */}
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-amber-900 dark:text-amber-300 bg-amber-50/30 dark:bg-amber-950/30">
                      {row.jioSales > 0 ? row.jioSales.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-amber-900 dark:text-amber-300 bg-amber-50/30 dark:bg-amber-950/30">
                      {row.airtelSales > 0 ? row.airtelSales.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-amber-900 dark:text-amber-300 bg-amber-50/30 dark:bg-amber-950/30">
                      {row.viSales > 0 ? row.viSales.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.bsnlSales > 0 ? row.bsnlSales.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-400 dark:text-slate-500">{row.d2hSales || 0}</td>
                    <td className="py-2.5 px-2 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.tataSales > 0 ? row.tataSales.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-indigo-950 dark:text-indigo-200 bg-indigo-100/50 dark:bg-indigo-950/50">
                      {row.totalSales.toLocaleString('en-IN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
