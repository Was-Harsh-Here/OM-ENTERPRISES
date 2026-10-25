import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { Transaction, TransactionCategory, PaymentMethod, DmtPortal } from '../../types';
import { formatIndianCurrency, exportToCsv } from '../../utils/calculations';
import {
  Search,
  Download,
  Printer,
  Trash2,
  Filter,
  PlusCircle,
  Coins,
  Send,
  Zap,
  Smartphone,
  FileText,
  Gamepad2,
  Bike,
  Fingerprint,
} from 'lucide-react';

interface TransactionsLedgerTabProps {
  onOpenNewTxn: () => void;
  onViewReceipt: (txn: Transaction) => void;
}

export const TransactionsLedgerTab: React.FC<TransactionsLedgerTabProps> = ({
  onOpenNewTxn,
  onViewReceipt,
}) => {
  const { transactions, deleteTransaction, todayDate } = useShop();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPayment, setSelectedPayment] = useState<string>('ALL');
  const [selectedPortal, setSelectedPortal] = useState<string>('ALL');
  const [dateFilter, setDateFilter] = useState<string>('ALL');

  // Available unique dates
  const uniqueDates = useMemo(() => {
    const dates = Array.from(new Set(transactions.map((t) => t.dateFormatted)));
    return dates;
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((txn) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          txn.referenceId?.toLowerCase().includes(q) ||
          txn.customerPhone?.toLowerCase().includes(q) ||
          txn.customerName?.toLowerCase().includes(q) ||
          txn.serviceDetail?.toLowerCase().includes(q) ||
          txn.operator?.toLowerCase().includes(q) ||
          txn.portal?.toLowerCase().includes(q);
        if (!match) return false;
      }

      // Category
      if (selectedCategory !== 'ALL' && txn.category !== selectedCategory) {
        return false;
      }

      // Payment Method
      if (selectedPayment !== 'ALL' && txn.paymentMethod !== selectedPayment) {
        return false;
      }

      // Portal
      if (selectedPortal !== 'ALL' && txn.portal !== selectedPortal) {
        return false;
      }

      // Date
      if (dateFilter !== 'ALL' && txn.dateFormatted !== dateFilter) {
        return false;
      }

      return true;
    });
  }, [transactions, searchQuery, selectedCategory, selectedPayment, selectedPortal, dateFilter]);

  // Summary of filtered
  const totalAmount = filteredTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalProfit = filteredTransactions.reduce((acc, t) => acc + (t.netProfit || 0), 0);

  const handleExportCsv = () => {
    const headers = [
      'Txn ID',
      'Date',
      'Time',
      'Category',
      'Gateway / Operator',
      'Reference / RRN',
      'Customer Name',
      'Customer Phone',
      'Service Detail',
      'Amount (INR)',
      'Customer Fee (INR)',
      'Distributor Cost (INR)',
      'Net Profit (INR)',
      'Payment Mode',
      'Cash Received',
      'Change Given',
      'Status',
    ];

    const rows = filteredTransactions.map((t) => [
      t.id,
      t.dateFormatted,
      t.timeFormatted,
      t.category,
      t.portal || t.operator || '',
      t.referenceId,
      t.customerName || '',
      t.customerPhone || '',
      t.serviceDetail || '',
      t.amount,
      t.customerFee,
      t.distributorCost,
      t.netProfit,
      t.paymentMethod,
      t.cashAccepted || 0,
      t.cashGivenBack || 0,
      t.status,
    ]);

    exportToCsv(`transactions_ledger_${dateFilter === 'ALL' ? 'all' : dateFilter}`, headers, rows);
  };

  return (
    <div className="space-y-5">
      {/* Top Controls Bar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Retail Transaction Ledger
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Detailed history with exact timestamps, cash denomination, and per-transaction net margin
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              type="button"
              onClick={onOpenNewTxn}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-all shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>New Entry</span>
            </button>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search phone, customer, UTR, particulars..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="ALL">All Categories</option>
              <option value="MONEY_TRANSFER">Money Transfer (DMT)</option>
              <option value="INDO_NEPAL">Indo-Nepal Remittance 🇳🇵</option>
              <option value="RECHARGE">Recharge (LAPU)</option>
              <option value="ACCESSORIES">Retail Accessories</option>
              <option value="BBPS_BILL">BBPS Bill Pay</option>
              <option value="REDEEM_CODE">Redeem Codes</option>
              <option value="CMS_DEPOSIT">Zomato/Swiggy CMS</option>
              <option value="AEPS">AEPS Cash Banking</option>
              <option value="EXTERNAL_JAMA">External Deposit (Jama)</option>
              <option value="EXTERNAL_DEBIT">External Debit (Kharcha)</option>
            </select>
          </div>

          {/* Portal Dropdown */}
          <div>
            <select
              value={selectedPortal}
              onChange={(e) => setSelectedPortal(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="ALL">All Portals / Gateways</option>
              <option value="GO_PAYMENTS">Go Payments</option>
              <option value="THE_SIMPLE_PAY">The Simple Pay (TSP)</option>
              <option value="VD_PAYS">VD Pays</option>
              <option value="AIRTEL_CMS">Airtel CMS</option>
              <option value="ONE_STOP">One Stop</option>
              <option value="AIRPAY">Airpay</option>
            </select>
          </div>

          {/* Date Selector */}
          <div>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="w-full py-2 px-2.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="ALL">All Dates</option>
              {uniqueDates.map((d) => (
                <option key={d} value={d}>
                  {d} {d === todayDate ? '(Today)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Summary Metrics */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <span>Showing:</span>
            <span className="font-bold font-mono text-slate-900 dark:text-slate-100">{filteredTransactions.length}</span>
            <span>of {transactions.length} records</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">Filtered Turnover:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                {formatIndianCurrency(totalAmount)}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 dark:text-slate-400">Total Margin Earned:</span>
              <span className="font-mono font-bold text-emerald-700 dark:text-emerald-400 tabular-nums">
                {formatIndianCurrency(totalProfit)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-3.5">Timestamp</th>
                <th className="py-3 px-3.5">Service / Gateway</th>
                <th className="py-3 px-3.5">Particulars / Customer</th>
                <th className="py-3 px-3.5 text-right">Face Value</th>
                <th className="py-3 px-3.5 text-right">Fee / Surcharge</th>
                <th className="py-3 px-3.5 text-right">Net Profit</th>
                <th className="py-3 px-3.5">Payment & Cash</th>
                <th className="py-3 px-3.5 text-center">Receipt</th>
                <th className="py-3 px-3.5 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No transactions found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    {/* Timestamp */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200 block">{txn.timeFormatted}</span>
                      <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400 block">{txn.dateFormatted}</span>
                    </td>

                    {/* Category & Gateway */}
                    <td className="py-3 px-3.5">
                      {txn.category === 'INDO_NEPAL' ? (
                        <div>
                          <span className="font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1">
                            <span>🇳🇵</span> Indo-Nepal
                          </span>
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 inline-block mt-0.5">
                            {txn.indoNepalTransferType === 'ACCOUNT_DEPOSIT' ? 'Bank A/c (+₹150)' : 'Cash Payout (+₹100)'}
                          </span>
                        </div>
                      ) : (
                        <div>
                          <span className="font-bold text-slate-900 dark:text-slate-100 block">{txn.category.replace(/_/g, ' ')}</span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                            {txn.portal?.replace(/_/g, ' ') || txn.operator || txn.referenceId}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Customer & Particulars */}
                    <td className="py-3 px-3.5">
                      <span className="text-slate-900 dark:text-slate-100 font-semibold block">
                        {txn.customerName || txn.customerPhone || 'Counter Customer'}
                      </span>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-mono truncate max-w-[240px]">
                        {txn.serviceDetail || txn.referenceId}
                      </span>
                    </td>

                    {/* Face Value */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatIndianCurrency(txn.amount)}
                    </td>

                    {/* Fee / Surcharge */}
                    <td className="py-3 px-3.5 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                      {txn.customerFee > 0 ? formatIndianCurrency(txn.customerFee) : '-'}
                    </td>

                    {/* Net Profit */}
                    <td className="py-3 px-3.5 text-right font-mono font-bold tabular-nums">
                      {txn.netProfit >= 0 ? (
                        <span className="text-emerald-700 dark:text-emerald-400">+{formatIndianCurrency(txn.netProfit)}</span>
                      ) : (
                        <span className="text-rose-600 dark:text-rose-400">{formatIndianCurrency(txn.netProfit)}</span>
                      )}
                    </td>

                    {/* Payment & Cash */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <span className="px-1.5 py-0.5 rounded font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                          {txn.paymentMethod}
                        </span>
                        {txn.cashAccepted ? (
                          <span className="text-slate-500 dark:text-slate-400">Rec: {formatIndianCurrency(txn.cashAccepted)}</span>
                        ) : null}
                      </div>
                      {txn.cashGivenBack ? (
                        <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono block">
                          Change: {formatIndianCurrency(txn.cashGivenBack)}
                        </span>
                      ) : null}
                    </td>

                    {/* Receipt */}
                    <td className="py-3 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => onViewReceipt(txn)}
                        title="Print Customer Receipt"
                        className="p-1.5 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 rounded-lg transition-colors inline-block"
                      >
                        <Printer className="w-4 h-4" />
                      </button>
                    </td>

                    {/* Delete */}
                    <td className="py-3 px-3.5 text-center">
                      <button
                        type="button"
                        onClick={() => deleteTransaction(txn.id)}
                        title="Delete Record"
                        className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors inline-block"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
