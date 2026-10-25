import React, { useState } from 'react';
import { useShop } from '../../context/ShopContext';
import { DailyMasterRow } from '../../types';
import { formatIndianCurrency, exportToCsv } from '../../utils/calculations';
import { Download, Table, Edit2, Check, X, Plus } from 'lucide-react';

export const MasterSheetTab: React.FC = () => {
  const { dailyMasterRows, updateMasterRow, todayDate } = useShop();

  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<DailyMasterRow | null>(null);

  const startEditing = (row: DailyMasterRow) => {
    setEditingDate(row.date);
    setEditFormData({ ...row });
  };

  const cancelEditing = () => {
    setEditingDate(null);
    setEditFormData(null);
  };

  const saveEditing = () => {
    if (editFormData) {
      // Recalculate Total Business & PF or Loss
      const totalBusiness =
        editFormData.moneySales +
        editFormData.shreeDemo +
        editFormData.sanjayDemo +
        editFormData.accessories +
        editFormData.redeem +
        editFormData.vibhaJama +
        editFormData.otherJama;

      const totalOutflow =
        editFormData.moneyPay +
        editFormData.airtelPay +
        editFormData.debitOther +
        editFormData.demoPay +
        editFormData.otherPay +
        editFormData.rohitCms;

      const closingCash = editFormData.closingCash;
      const profitOrLoss = editFormData.profitOrLoss;

      updateMasterRow({
        ...editFormData,
        totalBusiness,
        closingCash,
        profitOrLoss,
      });
    }
    cancelEditing();
  };

  const handleExportCsv = () => {
    const headers = [
      'DATE',
      'OPP CASH',
      'MONEY SALES',
      'SHREE DEMO',
      'SANJAY DEMO',
      'ASSESORIES',
      'REDEEM',
      'VIBHA JAMA',
      'OTHER JAMA',
      'TOTAL BUSSNES',
      'MONEY PAY',
      'AIRTEL PAY',
      'DEBIT OTHER',
      'DEMO PAY',
      'OTHER PAY',
      'ROHIT CMS',
      'CASH',
      'PF OR LOSS',
    ];

    const rows = dailyMasterRows.map((r) => [
      r.date,
      r.oppCash,
      r.moneySales,
      r.shreeDemo,
      r.sanjayDemo,
      r.accessories,
      r.redeem,
      r.vibhaJama,
      r.otherJama,
      r.totalBusiness,
      r.moneyPay,
      r.airtelPay,
      r.debitOther,
      r.demoPay,
      r.otherPay,
      r.rohitCms,
      r.closingCash,
      r.profitOrLoss,
    ]);

    exportToCsv('shop_master_daily_ledger', headers, rows);
  };

  // Grand totals across all days
  const grandTotalBusiness = dailyMasterRows.reduce((acc, r) => acc + r.totalBusiness, 0);
  const grandTotalMoneySales = dailyMasterRows.reduce((acc, r) => acc + r.moneySales, 0);
  const grandTotalShreeDemo = dailyMasterRows.reduce((acc, r) => acc + r.shreeDemo, 0);

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Master Daily Cash Flow & Profit/Loss Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Digital mirror of your Master Excel Sheet (Image 1) with daily opening cash, money sales, demo recharges, payouts, and net P&L
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export Master Sheet (.CSV)</span>
          </button>
        </div>
      </div>

      {/* Spreadsheet Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 uppercase tracking-tight text-[11px]">
              <tr>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700">DATE</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-300">OPP CASH</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right bg-blue-50/50 dark:bg-blue-950/40 text-blue-900 dark:text-blue-300">MONEY SALES</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right bg-orange-50/50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300">SHREE DEMO</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right bg-orange-50/50 dark:bg-orange-950/40 text-orange-900 dark:text-orange-300">SANJAY DEMO</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right">ASSESORIES</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right">REDEEM</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right">VIBHA JAMA</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right">OTHER JAMA</th>
                <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-right font-extrabold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-900 dark:text-indigo-200">
                  TOTAL BUSSNES
                </th>
                {/* Outflow Columns */}
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right bg-rose-50/50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300">MONEY PAY</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right">AIRTEL PAY</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right">DEBIT OTHER</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right">DEMO PAY</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right">OTHER PAY</th>
                <th className="py-2.5 px-3 border-r border-slate-200 dark:border-slate-700 text-right">ROHIT CMS</th>
                <th className="py-2.5 px-3 border-r border-slate-300 dark:border-slate-700 text-right font-extrabold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-950 dark:text-emerald-200">
                  CASH
                </th>
                <th className="py-2.5 px-3 text-right font-extrabold bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100">
                  PF OR LOSS
                </th>
                <th className="py-2.5 px-2 text-center">EDIT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-800 font-mono text-[11px] tabular-nums">
              {dailyMasterRows.map((row) => {
                const isEditing = editingDate === row.date;
                const isToday = row.date === todayDate;

                if (isEditing && editFormData) {
                  return (
                    <tr key={row.date} className="bg-indigo-50/60">
                      <td className="py-2 px-3 font-bold border-r border-slate-200 text-slate-900">
                        {editFormData.date}
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.oppCash}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, oppCash: parseFloat(e.target.value) || 0 })
                          }
                          className="w-20 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.moneySales}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, moneySales: parseFloat(e.target.value) || 0 })
                          }
                          className="w-20 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.shreeDemo}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, shreeDemo: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.sanjayDemo}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, sanjayDemo: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.accessories}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, accessories: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.redeem}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, redeem: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.vibhaJama}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, vibhaJama: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.otherJama}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, otherJama: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-3 border-r border-slate-300 text-right font-bold text-indigo-900">
                        {editFormData.moneySales + editFormData.shreeDemo + editFormData.sanjayDemo + editFormData.accessories + editFormData.otherJama}
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.moneyPay}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, moneyPay: parseFloat(e.target.value) || 0 })
                          }
                          className="w-20 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.airtelPay}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, airtelPay: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.debitOther}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, debitOther: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.demoPay}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, demoPay: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.otherPay}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, otherPay: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-200 text-right">
                        <input
                          type="number"
                          value={editFormData.rohitCms}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, rohitCms: parseFloat(e.target.value) || 0 })
                          }
                          className="w-16 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 border-r border-slate-300 text-right font-bold text-emerald-900">
                        <input
                          type="number"
                          value={editFormData.closingCash}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, closingCash: parseFloat(e.target.value) || 0 })
                          }
                          className="w-20 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-1 text-right font-bold">
                        <input
                          type="number"
                          value={editFormData.profitOrLoss}
                          onChange={(e) =>
                            setEditFormData({ ...editFormData, profitOrLoss: parseFloat(e.target.value) || 0 })
                          }
                          className="w-20 text-right px-1 py-0.5 border border-indigo-400 bg-white rounded font-mono"
                        />
                      </td>
                      <td className="py-2 px-2 text-center">
                        <div className="flex items-center gap-1 justify-center">
                          <button
                            type="button"
                            onClick={saveEditing}
                            className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="p-1 bg-slate-300 text-slate-700 rounded hover:bg-slate-400"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr
                    key={row.date}
                    className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                      isToday ? 'bg-indigo-50/40 dark:bg-indigo-950/30 font-bold' : ''
                    }`}
                  >
                    <td className="py-2 px-3 font-sans font-bold border-r border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100">
                      {row.date}
                      {isToday && (
                        <span className="ml-1 text-[9px] text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/40 px-1 py-0.2 rounded font-sans">
                          Today
                        </span>
                      )}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-700 dark:text-slate-300 bg-amber-50/20 dark:bg-amber-950/20">
                      {row.oppCash.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right font-bold text-blue-900 dark:text-blue-300 bg-blue-50/20 dark:bg-blue-950/20">
                      {row.moneySales.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-orange-900 dark:text-orange-300 bg-orange-50/20 dark:bg-orange-950/20">
                      {row.shreeDemo.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.sanjayDemo > 0 ? row.sanjayDemo.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-purple-900 dark:text-purple-300">
                      {row.accessories > 0 ? row.accessories.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.redeem > 0 ? row.redeem.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.vibhaJama > 0 ? row.vibhaJama.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.otherJama > 0 ? row.otherJama.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 text-right font-extrabold bg-indigo-50 dark:bg-indigo-950/40 text-indigo-950 dark:text-indigo-200">
                      {row.totalBusiness.toLocaleString('en-IN')}
                    </td>

                    {/* Outflows */}
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right font-semibold text-rose-900 dark:text-rose-300 bg-rose-50/20 dark:bg-rose-950/20">
                      {row.moneyPay > 0 ? row.moneyPay.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.airtelPay > 0 ? row.airtelPay.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.debitOther > 0 ? row.debitOther.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.demoPay > 0 ? row.demoPay.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.otherPay > 0 ? row.otherPay.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 dark:border-slate-800 text-right text-slate-600 dark:text-slate-400">
                      {row.rohitCms > 0 ? row.rohitCms.toLocaleString('en-IN') : '0'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-300 dark:border-slate-700 text-right font-extrabold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200">
                      {row.closingCash.toLocaleString('en-IN')}
                    </td>
                    <td
                      className={`py-2 px-3 text-right font-extrabold ${
                        row.profitOrLoss >= 0 ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50/50 dark:bg-emerald-950/30' : 'text-rose-700 dark:text-rose-400 bg-rose-50/50 dark:bg-rose-950/30'
                      }`}
                    >
                      {row.profitOrLoss.toLocaleString('en-IN')}
                    </td>
                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => startEditing(row)}
                        title="Edit Row"
                        className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors inline-block"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
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
