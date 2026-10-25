import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { DmtPortalDailyRow } from '../../types';
import { exportToCsv } from '../../utils/calculations';
import { Download, Landmark, Plus, CheckCircle2, AlertTriangle } from 'lucide-react';

export const DmtPortalsTab: React.FC = () => {
  const { dmtPortalRows, updateDmtRow, todayDate } = useShop();

  const handleExportCsv = () => {
    const headers = [
      'DATE',
      'ONE STOP OPP',
      'AIRTEL OPP',
      'OTHER OPP',
      'GO OPP',
      'AIRPAY OPP',
      'ONE STOP ADD',
      'AIRTEL BAL',
      'TSP ADD',
      'GO BAL ADD',
      'AIRPAY BAL',
      'CLOSING ONE STOP',
      'CLOSING AIRTEL',
      'CLOSING TSP',
      'CLOSING GO',
      'CLOSING AIRPAY',
      'ONE STOP SALES',
      'AIRTEL SALES',
      'TSP SALES',
      'GO SALES',
      'AIRPAY SALES',
      'TOTAL SALES',
    ];

    const rows = dmtPortalRows.map((r) => [
      r.date,
      r.oneStopOpp,
      r.airtelOpp,
      r.otherOpp,
      r.goOpp,
      r.airpayOpp,
      r.oneStopAdd,
      r.airtelAdd,
      r.tspAdd,
      r.goAdd,
      r.airpayAdd,
      r.closingOneStop,
      r.closingAirtel,
      r.closingTsp,
      r.closingGo,
      r.closingAirpay,
      r.oneStopSales,
      r.airtelSales,
      r.tspSales,
      r.goSales,
      r.airpaySales,
      r.totalSales,
    ]);

    exportToCsv('dmt_portal_ledger_sheet', headers, rows);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Landmark className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Money Transfer (DMT) Gateways & Settlement Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Digital mirror of your DMT Excel Sheet (Image 2) tracking Go Payments, TSP, VD Pays, Airtel, One Stop & Airpay
          </p>
        </div>

        <button
          type="button"
          onClick={handleExportCsv}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
        >
          <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
          <span>Export DMT Sheet (.CSV)</span>
        </button>
      </div>

      {/* Spreadsheet grid */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            {/* Super header grouped */}
            <thead className="bg-slate-200 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 font-extrabold text-slate-800 dark:text-slate-200 text-[11px] uppercase tracking-wider text-center">
              <tr>
                <th className="py-2 px-3 border-r border-slate-300 dark:border-slate-700">Header</th>
                <th colSpan={5} className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 bg-blue-100/70 dark:bg-blue-950/60 text-blue-950 dark:text-blue-200">
                  Opening Balance (OPP BAL)
                </th>
                <th colSpan={5} className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 bg-emerald-100/70 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200">
                  Top-up Added by Distributor (BAL ADD)
                </th>
                <th colSpan={5} className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 bg-amber-100/70 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200">
                  Closing Balance
                </th>
                <th colSpan={6} className="py-2 px-3 bg-indigo-100/70 dark:bg-indigo-950/60 text-indigo-950 dark:text-indigo-200">
                  Sales Disbursal (Outflow)
                </th>
              </tr>
              <tr className="bg-slate-100 dark:bg-slate-800/80 border-b border-slate-300 dark:border-slate-700 text-[10px] text-slate-700 dark:text-slate-300 font-bold">
                <th className="py-2 px-3 border-r border-slate-200 dark:border-slate-700 text-left">DATE</th>
                {/* OPP */}
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">ONE STOP</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">AIRTEL</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">OTHER</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">GO</th>
                <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-700 text-right">AIRPAY</th>
                {/* BAL ADD */}
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">ONE STOP</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">AIRTEL</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300">TSP</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300">GO BAL</th>
                <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-700 text-right">AIRPAY</th>
                {/* CLOSING */}
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">ONE STOP</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">AIRTEL</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">TSP</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">GO</th>
                <th className="py-2 px-2.5 border-r border-slate-300 dark:border-slate-700 text-right">AIRPAY</th>
                {/* SALES */}
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">ONE STOP</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">AIRTEL</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right bg-indigo-50 dark:bg-indigo-950/50 font-bold text-indigo-900 dark:text-indigo-300">TSP SALES</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right bg-indigo-50 dark:bg-indigo-950/50 font-bold text-indigo-900 dark:text-indigo-300">GO SALES</th>
                <th className="py-2 px-2.5 border-r border-slate-200 dark:border-slate-700 text-right">AIRPAY</th>
                <th className="py-2 px-3 text-right bg-indigo-200/60 dark:bg-indigo-900/60 font-extrabold text-indigo-950 dark:text-indigo-200">TOTAL SALES</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px] tabular-nums">
              {dmtPortalRows.map((row) => {
                const isToday = row.date === todayDate;

                return (
                  <tr
                    key={row.date}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      isToday ? 'bg-indigo-50/40 dark:bg-indigo-950/30 font-bold' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-sans font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                      {row.date}
                      {isToday && (
                        <span className="ml-1 text-[9px] text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 px-1 py-0.2 rounded font-sans">
                          Today
                        </span>
                      )}
                    </td>

                    {/* Opening */}
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300">{row.oneStopOpp.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300">{row.airtelOpp.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300">{row.otherOpp.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right font-semibold text-blue-900 dark:text-blue-300">{row.goOpp.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-300 dark:border-slate-700 text-right text-slate-700 dark:text-slate-300">{row.airpayOpp.toLocaleString('en-IN')}</td>

                    {/* Bal Add */}
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-500 dark:text-slate-400">{row.oneStopAdd || 0}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-500 dark:text-slate-400">{row.airtelAdd || 0}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/30">
                      {row.tspAdd > 0 ? row.tspAdd.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50/30 dark:bg-emerald-950/30">
                      {row.goAdd > 0 ? row.goAdd.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-slate-300 dark:border-slate-700 text-right text-slate-500 dark:text-slate-400">{row.airpayAdd || 0}</td>

                    {/* Closing */}
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300">{row.closingOneStop.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300">{row.closingAirtel.toLocaleString('en-IN')}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right font-bold bg-amber-50/30 dark:bg-amber-950/30 text-amber-950 dark:text-amber-300">
                      {row.closingTsp.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right font-bold bg-amber-50/30 dark:bg-amber-950/30 text-amber-950 dark:text-amber-300">
                      {row.closingGo.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-slate-300 dark:border-slate-700 text-right text-slate-700 dark:text-slate-300">{row.closingAirpay.toLocaleString('en-IN')}</td>

                    {/* Sales */}
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-500 dark:text-slate-400">{row.oneStopSales || 0}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-500 dark:text-slate-400">{row.airtelSales || 0}</td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right font-extrabold text-blue-900 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/30">
                      {row.tspSales > 0 ? row.tspSales.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right font-extrabold text-blue-900 dark:text-blue-300 bg-blue-50/30 dark:bg-blue-950/30">
                      {row.goSales > 0 ? row.goSales.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2.5 px-2.5 border-r border-slate-200 dark:border-slate-800 text-right text-slate-500 dark:text-slate-400">{row.airpaySales || 0}</td>
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
