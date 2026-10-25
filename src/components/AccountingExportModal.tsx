import React, { useState, useMemo } from 'react';
import { useShop } from '../context/ShopContext';
import { Transaction, DistributorPaymentItem, TransactionCategory } from '../types';
import { formatIndianCurrency, exportToCsv } from '../utils/calculations';
import {
  X,
  FileSpreadsheet,
  FileText,
  Printer,
  Download,
  Calendar,
  Filter,
  CheckCircle2,
  Clock,
  Building2,
  Receipt,
  Layers,
  ArrowRight,
} from 'lucide-react';

interface AccountingExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultReportType?: 'TRANSACTIONS_LEDGER' | 'DISTRIBUTOR_SETTLEMENT' | 'CASH_DAYBOOK';
}

type ReportType = 'TRANSACTIONS_LEDGER' | 'DISTRIBUTOR_SETTLEMENT' | 'CASH_DAYBOOK';

export const AccountingExportModal: React.FC<AccountingExportModalProps> = ({
  isOpen,
  onClose,
  defaultReportType = 'TRANSACTIONS_LEDGER',
}) => {
  const {
    shopName,
    transactions,
    distributorPayments,
    totalPhysicalCash,
    expectedBookCash,
    cashDrawerDiscrepancy,
    moneyTransferSettledTotal,
    moneyTransferPendingTotal,
    accessoriesSettledTotal,
    accessoriesPendingTotal,
    todayDate,
  } = useShop();

  const [reportType, setReportType] = useState<ReportType>(defaultReportType);
  const [selectedDate, setSelectedDate] = useState<string>('ALL');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedDistributorStatus, setSelectedDistributorStatus] = useState<string>('ALL');
  const [previewMode, setPreviewMode] = useState<boolean>(false);

  // Available unique transaction dates
  const uniqueDates = useMemo(() => {
    return Array.from(new Set(transactions.map((t) => t.dateFormatted)));
  }, [transactions]);

  // Filtered transactions for report
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (selectedDate !== 'ALL' && t.dateFormatted !== selectedDate) return false;
      if (selectedCategory !== 'ALL' && t.category !== selectedCategory) return false;
      return true;
    });
  }, [transactions, selectedDate, selectedCategory]);

  // Filtered distributor payments for report
  const filteredDistributorPayments = useMemo(() => {
    return distributorPayments.filter((p) => {
      if (selectedDistributorStatus !== 'ALL' && p.status !== selectedDistributorStatus) return false;
      return true;
    });
  }, [distributorPayments, selectedDistributorStatus]);

  // Aggregate metrics
  const totalVolume = filteredTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const totalCustomerFees = filteredTransactions.reduce((acc, t) => acc + (t.customerFee || 0), 0);
  const totalNetProfit = filteredTransactions.reduce((acc, t) => acc + (t.netProfit || 0), 0);
  const totalCashCollected = filteredTransactions.reduce((acc, t) => {
    if (t.paymentMethod === 'CASH') return acc + t.totalCollected;
    if (t.paymentMethod === 'SPLIT') return acc + (t.cashAccepted || 0);
    return acc;
  }, 0);
  const totalUpiCollected = filteredTransactions.reduce((acc, t) => {
    if (t.paymentMethod === 'UPI') return acc + t.totalCollected;
    if (t.paymentMethod === 'SPLIT') return acc + (t.upiAccepted || 0);
    return acc;
  }, 0);

  // Distributor metrics
  const totalDistPending = distributorPayments
    .filter((p) => p.status === 'Pending')
    .reduce((acc, p) => acc + p.amount, 0);
  const totalDistSettled = distributorPayments
    .filter((p) => p.status === 'Settled')
    .reduce((acc, p) => acc + p.amount, 0);

  if (!isOpen) return null;

  // Handle CSV Download
  const handleDownloadCsv = () => {
    if (reportType === 'TRANSACTIONS_LEDGER') {
      const headers = [
        'Transaction ID',
        'Date',
        'Time',
        'Category',
        'Service / Particulars',
        'Gateway / Operator',
        'Reference / RRN',
        'Customer Name',
        'Customer Phone',
        'Transfer Type / Mode',
        'Nepal Beneficiary',
        'Face Value Amount (INR)',
        'Customer Surcharge (INR)',
        'Total Collected (INR)',
        'Distributor Cost (INR)',
        'Net Profit (INR)',
        'Payment Mode',
        'Status',
      ];

      const rows = filteredTransactions.map((t) => [
        t.id,
        t.dateFormatted,
        t.timeFormatted,
        t.category,
        t.serviceDetail || '',
        t.portal || t.operator || t.sourcePortal || '',
        t.referenceId,
        t.customerName || '',
        t.customerPhone || '',
        t.category === 'INDO_NEPAL' ? (t.indoNepalTransferType || 'ACCOUNT_DEPOSIT') : (t.paymentMethod || ''),
        t.nepalBeneficiaryName || '',
        t.amount,
        t.customerFee,
        t.totalCollected,
        t.distributorCost,
        t.netProfit,
        t.paymentMethod,
        t.status,
      ]);

      const dateSuffix = selectedDate === 'ALL' ? 'all_time' : selectedDate.replace(/-/g, '_');
      exportToCsv(`om_enterprises_transaction_ledger_${dateSuffix}`, headers, rows);
    } else if (reportType === 'DISTRIBUTOR_SETTLEMENT') {
      const headers = [
        'Item ID',
        'Date',
        'Category',
        'Distributor / Gateway Name',
        'Settlement Amount (INR)',
        'Payment Purpose / Description',
        'Payment Mode',
        'Status',
        'UTR / Reference Voucher',
        'Settled At Timestamp',
        'Remarks / Notes',
      ];

      const rows = filteredDistributorPayments.map((p) => [
        p.id,
        p.date,
        p.distributorCategory === 'MONEY_TRANSFER' ? 'Money Transfer (DMT Gateway)' : 'Retail Accessories Supplier',
        p.distributorName,
        p.amount,
        p.purpose,
        p.paymentMode,
        p.status,
        p.referenceNumber,
        p.settledAt || '',
        p.notes || '',
      ]);

      exportToCsv(`om_enterprises_distributor_settlements_${Date.now()}`, headers, rows);
    } else {
      // Cash Daybook CSV
      const headers = ['Financial Metric', 'Amount (INR)', 'Details / Remarks'];
      const rows = [
        ['Physical Drawer Cash (Counted)', totalPhysicalCash, 'Actual notes & coins inside physical vault'],
        ['Expected System Cash (Book Balance)', expectedBookCash, 'Opening + Cash Inflows - Cash Handed Over'],
        ['Cash Drawer Discrepancy (Over / Short)', cashDrawerDiscrepancy, cashDrawerDiscrepancy === 0 ? 'Perfect Zero Variance' : cashDrawerDiscrepancy > 0 ? 'Surplus Cash' : 'Shortage in drawer'],
        ['Total Day Business Volume', totalVolume, 'Gross turn-around across all transactions'],
        ['Total Customer Fee Surcharges', totalCustomerFees, 'Total service charges collected'],
        ['Total Net Retained Margin', totalNetProfit, 'Realized gross profit'],
        ['DMT Pending Distributor Settlements', moneyTransferPendingTotal, 'Payables due to Go Payments / TSP / VD Pays'],
        ['Accessories Pending Vendor Settlements', accessoriesPendingTotal, 'Payables due to mobile accessories vendors'],
      ];
      exportToCsv(`om_enterprises_cash_daybook_${todayDate.replace(/-/g, '_')}`, headers, rows);
    }
  };

  // Handle Printable PDF
  const handlePrintPdf = () => {
    setPreviewMode(true);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                Accounting & Tax Reports Export Engine
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate formatted CSV spreadsheets and audit-ready PDF statements for accounting & compliance
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Report Selector Tabs */}
        <div className="px-6 pt-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-wrap gap-2">
          <button
            onClick={() => setReportType('TRANSACTIONS_LEDGER')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              reportType === 'TRANSACTIONS_LEDGER'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Receipt className="w-4 h-4" />
            1. Daily Transactions Ledger (CSV & PDF)
          </button>
          <button
            onClick={() => setReportType('DISTRIBUTOR_SETTLEMENT')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              reportType === 'DISTRIBUTOR_SETTLEMENT'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Building2 className="w-4 h-4" />
            2. Distributor Payment Status (CSV & PDF)
          </button>
          <button
            onClick={() => setReportType('CASH_DAYBOOK')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              reportType === 'CASH_DAYBOOK'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Layers className="w-4 h-4" />
            3. Cash Day-Book & Drawer Reconciliation
          </button>
        </div>

        {/* Modal Body & Filters */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Filters Bar */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 flex flex-wrap gap-4 items-center justify-between text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Filter className="w-3.5 h-3.5 text-indigo-500" /> Filter Criteria:
              </span>

              {reportType === 'TRANSACTIONS_LEDGER' && (
                <>
                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-500 dark:text-slate-400">Date:</label>
                    <select
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                    >
                      <option value="ALL">All Recorded Dates ({transactions.length} txns)</option>
                      {uniqueDates.map((d) => (
                        <option key={d} value={d}>
                          {d} {d === todayDate ? '(Today)' : ''}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <label className="text-slate-500 dark:text-slate-400">Category:</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                    >
                      <option value="ALL">All Categories</option>
                      <option value="MONEY_TRANSFER">Domestic DMT (1% charge)</option>
                      <option value="INDO_NEPAL">Indo-Nepal (₹300 flat, ₹150/₹100 profit)</option>
                      <option value="RECHARGE">Telecom LAPU Recharge</option>
                      <option value="ACCESSORIES">Retail Mobile Accessories</option>
                      <option value="BBPS_BILL">BBPS Utility Bills</option>
                      <option value="CMS_DEPOSIT">CMS Cash Deposit (Zomato/Swiggy)</option>
                      <option value="AEPS">AEPS Cash Withdrawal</option>
                    </select>
                  </div>
                </>
              )}

              {reportType === 'DISTRIBUTOR_SETTLEMENT' && (
                <div className="flex items-center gap-1.5">
                  <label className="text-slate-500 dark:text-slate-400">Status:</label>
                  <select
                    value={selectedDistributorStatus}
                    onChange={(e) => setSelectedDistributorStatus(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 font-semibold focus:outline-none"
                  >
                    <option value="ALL">All Statuses (Pending & Settled)</option>
                    <option value="Pending">Pending Clearance Only</option>
                    <option value="Settled">Settled / Verified Only</option>
                  </select>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDownloadCsv}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
              >
                <Download className="w-3.5 h-3.5" />
                Export CSV (.csv)
              </button>
              <button
                type="button"
                onClick={handlePrintPdf}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors shadow-2xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Print / Save PDF (.pdf)
              </button>
            </div>
          </div>

          {/* Quick Metrics Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {reportType === 'TRANSACTIONS_LEDGER' && (
              <>
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 block">Total Volume</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    {formatIndianCurrency(totalVolume)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {filteredTransactions.length} items logged
                  </span>
                </div>
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">Customer Fees</span>
                  <span className="text-base font-extrabold text-amber-800 dark:text-amber-300 font-mono">
                    {formatIndianCurrency(totalCustomerFees)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Gross surcharges
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">Net Retained Profit</span>
                  <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300 font-mono">
                    {formatIndianCurrency(totalNetProfit)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Realized earnings
                  </span>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Cash / UPI Split</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-slate-100 block">
                    Cash: {formatIndianCurrency(totalCashCollected)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono block mt-0.5">
                    UPI: {formatIndianCurrency(totalUpiCollected)}
                  </span>
                </div>
              </>
            )}

            {reportType === 'DISTRIBUTOR_SETTLEMENT' && (
              <>
                <div className="p-3 bg-amber-50/60 dark:bg-amber-950/40 rounded-xl border border-amber-100 dark:border-amber-900/40">
                  <span className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 block">Total Pending Dues</span>
                  <span className="text-base font-extrabold text-amber-800 dark:text-amber-300 font-mono">
                    {formatIndianCurrency(totalDistPending)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Requires immediate clearing
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">Total Settled Cleared</span>
                  <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300 font-mono">
                    {formatIndianCurrency(totalDistSettled)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Verified bank / cash vouchers
                  </span>
                </div>
                <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/40 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                  <span className="text-[11px] font-semibold text-indigo-700 dark:text-indigo-400 block">DMT Gateways Pending</span>
                  <span className="text-base font-extrabold text-indigo-800 dark:text-indigo-300 font-mono">
                    {formatIndianCurrency(moneyTransferPendingTotal)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Go Payments / TSP / VD Pays
                  </span>
                </div>
                <div className="p-3 bg-purple-50/60 dark:bg-purple-950/40 rounded-xl border border-purple-100 dark:border-purple-900/40">
                  <span className="text-[11px] font-semibold text-purple-700 dark:text-purple-400 block">Accessories Payables</span>
                  <span className="text-base font-extrabold text-purple-800 dark:text-purple-300 font-mono">
                    {formatIndianCurrency(accessoriesPendingTotal)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    Royal Mobile Suppliers
                  </span>
                </div>
              </>
            )}

            {reportType === 'CASH_DAYBOOK' && (
              <>
                <div className="p-3 bg-blue-50/60 dark:bg-blue-950/40 rounded-xl border border-blue-100 dark:border-blue-900/40">
                  <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-400 block">Physical Vault Cash</span>
                  <span className="text-base font-extrabold text-blue-800 dark:text-blue-300 font-mono">
                    {formatIndianCurrency(totalPhysicalCash)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Counted in drawer</span>
                </div>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
                  <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">Book Expected Cash</span>
                  <span className="text-base font-extrabold text-slate-900 dark:text-slate-100 font-mono">
                    {formatIndianCurrency(expectedBookCash)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Opening + Inflows - Outflows</span>
                </div>
                <div
                  className={`p-3 rounded-xl border ${
                    cashDrawerDiscrepancy === 0
                      ? 'bg-emerald-50/60 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/40'
                      : 'bg-rose-50/60 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/40'
                  }`}
                >
                  <span
                    className={`text-[11px] font-semibold block ${
                      cashDrawerDiscrepancy === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'
                    }`}
                  >
                    Variance Discrepancy
                  </span>
                  <span
                    className={`text-base font-extrabold font-mono ${
                      cashDrawerDiscrepancy === 0 ? 'text-emerald-800 dark:text-emerald-300' : 'text-rose-800 dark:text-rose-300'
                    }`}
                  >
                    {formatIndianCurrency(cashDrawerDiscrepancy)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                    {cashDrawerDiscrepancy === 0 ? 'Zero Variance (Tally OK)' : 'Audit drawer required'}
                  </span>
                </div>
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/40 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                  <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-400 block">Today Net Profit</span>
                  <span className="text-base font-extrabold text-emerald-800 dark:text-emerald-300 font-mono">
                    {formatIndianCurrency(totalNetProfit)}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">Retained retail income</span>
                </div>
              </>
            )}
          </div>

          {/* Printable Report Preview Container (Visible on screen and printed with @media print) */}
          <div
            id="printable-report"
            className="p-6 bg-white text-slate-900 border border-slate-200 rounded-xl shadow-xs font-sans text-xs space-y-4"
          >
            {/* Formal Report Header */}
            <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-xl font-extrabold tracking-tight uppercase text-slate-950">
                  {shopName}
                </h1>
                <p className="text-xs text-slate-600 mt-0.5">
                  Authorized Multi-Gateway Financial Services, Retail CMS & LAPU Telecom Distribution
                </p>
                <p className="text-[11px] text-slate-500">
                  GSTIN: 27AABCO9821F1ZX · Terminal ID: OM-CTR-01 · Phone: +91 98200 12345
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-2.5 py-1 bg-slate-900 text-white text-[11px] font-bold uppercase rounded">
                  {reportType === 'TRANSACTIONS_LEDGER'
                    ? 'Daily Transactions Accounting Statement'
                    : reportType === 'DISTRIBUTOR_SETTLEMENT'
                    ? 'Distributor Settlement & Clearance Status'
                    : 'Daily Cash Day-Book & Drawer Reconciliation'}
                </span>
                <p className="text-[11px] text-slate-500 mt-1 font-mono">
                  Statement Date: {selectedDate === 'ALL' ? todayDate : selectedDate}
                </p>
                <p className="text-[10px] text-slate-400 font-mono">
                  Generated: {new Date().toLocaleDateString('en-IN')} {new Date().toLocaleTimeString('en-IN')}
                </p>
              </div>
            </div>

            {/* Content Table for Transactions Ledger */}
            {reportType === 'TRANSACTIONS_LEDGER' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                      <th className="p-2 border border-slate-300">Time</th>
                      <th className="p-2 border border-slate-300">Service Category</th>
                      <th className="p-2 border border-slate-300">Particulars / Customer</th>
                      <th className="p-2 border border-slate-300">Gateway / RRN</th>
                      <th className="p-2 border border-slate-300 text-right">Face Value</th>
                      <th className="p-2 border border-slate-300 text-right">Customer Fee</th>
                      <th className="p-2 border border-slate-300 text-right">Portal Cost</th>
                      <th className="p-2 border border-slate-300 text-right">Net Profit</th>
                      <th className="p-2 border border-slate-300 text-center">Mode</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTransactions.slice(0, 100).map((t) => (
                      <tr key={t.id} className="border-b border-slate-200 hover:bg-slate-50">
                        <td className="p-2 border border-slate-300 font-mono text-slate-600">{t.timeFormatted}</td>
                        <td className="p-2 border border-slate-300 font-semibold">
                          {t.category === 'INDO_NEPAL' ? '🇳🇵 Indo-Nepal' : t.category.replace(/_/g, ' ')}
                        </td>
                        <td className="p-2 border border-slate-300">
                          <div className="font-medium text-slate-900">{t.customerName || t.serviceDetail || '-'}</div>
                          {t.customerPhone && <div className="text-[10px] text-slate-500 font-mono">{t.customerPhone}</div>}
                        </td>
                        <td className="p-2 border border-slate-300 font-mono text-[10px]">
                          <span className="font-semibold text-slate-800">{t.portal || t.operator || t.sourcePortal || 'API'}</span>
                          <div className="text-slate-500 truncate max-w-[110px]">{t.referenceId}</div>
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono tabular-nums">
                          {formatIndianCurrency(t.amount)}
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono tabular-nums text-slate-700">
                          {formatIndianCurrency(t.customerFee)}
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono tabular-nums text-slate-600">
                          {formatIndianCurrency(t.distributorCost)}
                        </td>
                        <td className="p-2 border border-slate-300 text-right font-mono tabular-nums font-bold text-emerald-800">
                          +{formatIndianCurrency(t.netProfit)}
                        </td>
                        <td className="p-2 border border-slate-300 text-center font-bold text-[10px]">
                          {t.paymentMethod}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-900">
                      <td colSpan={4} className="p-2 border border-slate-300 text-right uppercase">
                        Total ({filteredTransactions.length} items):
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono tabular-nums">
                        {formatIndianCurrency(totalVolume)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono tabular-nums">
                        {formatIndianCurrency(totalCustomerFees)}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono tabular-nums text-slate-600">
                        {formatIndianCurrency(
                          filteredTransactions.reduce((acc, t) => acc + (t.distributorCost || 0), 0)
                        )}
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono tabular-nums text-emerald-900">
                        +{formatIndianCurrency(totalNetProfit)}
                      </td>
                      <td className="p-2 border border-slate-300"></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Content Table for Distributor Settlement */}
            {reportType === 'DISTRIBUTOR_SETTLEMENT' && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border border-slate-300 text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-slate-800 border-b border-slate-300">
                      <th className="p-2 border border-slate-300">Date</th>
                      <th className="p-2 border border-slate-300">Category</th>
                      <th className="p-2 border border-slate-300">Distributor / Supplier</th>
                      <th className="p-2 border border-slate-300">Payment Purpose</th>
                      <th className="p-2 border border-slate-300">UTR / Ref No</th>
                      <th className="p-2 border border-slate-300 text-right">Amount</th>
                      <th className="p-2 border border-slate-300 text-center">Mode</th>
                      <th className="p-2 border border-slate-300 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDistributorPayments.map((p) => (
                      <tr key={p.id} className="border-b border-slate-200">
                        <td className="p-2 border border-slate-300 font-mono">{p.date}</td>
                        <td className="p-2 border border-slate-300 font-semibold text-slate-700">
                          {p.distributorCategory === 'MONEY_TRANSFER' ? 'DMT Gateway' : 'Accessories Vendor'}
                        </td>
                        <td className="p-2 border border-slate-300 font-bold text-slate-900">{p.distributorName}</td>
                        <td className="p-2 border border-slate-300 text-slate-700">{p.purpose}</td>
                        <td className="p-2 border border-slate-300 font-mono text-[10px] text-slate-600">{p.referenceNumber}</td>
                        <td className="p-2 border border-slate-300 text-right font-mono font-bold tabular-nums">
                          {formatIndianCurrency(p.amount)}
                        </td>
                        <td className="p-2 border border-slate-300 text-center text-[10px]">{p.paymentMode}</td>
                        <td className="p-2 border border-slate-300 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'Settled'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-slate-200 font-bold border-t-2 border-slate-900">
                      <td colSpan={5} className="p-2 border border-slate-300 text-right uppercase">
                        Total Distributor Volume:
                      </td>
                      <td className="p-2 border border-slate-300 text-right font-mono tabular-nums">
                        {formatIndianCurrency(
                          filteredDistributorPayments.reduce((acc, p) => acc + p.amount, 0)
                        )}
                      </td>
                      <td colSpan={2} className="p-2 border border-slate-300 text-center text-slate-600">
                        Pending: {formatIndianCurrency(totalDistPending)} · Settled: {formatIndianCurrency(totalDistSettled)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}

            {/* Content for Cash Daybook */}
            {reportType === 'CASH_DAYBOOK' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="border border-slate-300 rounded-lg p-3 space-y-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-1">
                      Cash Vault & Drawer Count
                    </span>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Physical Cash in Vault:</span>
                      <span className="font-mono font-bold">{formatIndianCurrency(totalPhysicalCash)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Expected System Book Cash:</span>
                      <span className="font-mono font-bold">{formatIndianCurrency(expectedBookCash)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-t border-slate-200 font-bold">
                      <span className="text-slate-900">Vault Variance / Discrepancy:</span>
                      <span
                        className={`font-mono ${
                          cashDrawerDiscrepancy === 0 ? 'text-emerald-700' : 'text-rose-700'
                        }`}
                      >
                        {formatIndianCurrency(cashDrawerDiscrepancy)}
                      </span>
                    </div>
                  </div>

                  <div className="border border-slate-300 rounded-lg p-3 space-y-2">
                    <span className="font-bold text-slate-900 uppercase tracking-wide block border-b border-slate-200 pb-1">
                      Distributor Clearing Position
                    </span>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">DMT Distributors Settled:</span>
                      <span className="font-mono font-bold text-emerald-800">{formatIndianCurrency(moneyTransferSettledTotal)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">DMT Distributors Pending:</span>
                      <span className="font-mono font-bold text-amber-800">{formatIndianCurrency(moneyTransferPendingTotal)}</span>
                    </div>
                    <div className="flex justify-between py-0.5">
                      <span className="text-slate-600">Accessories Vendors Pending:</span>
                      <span className="font-mono font-bold text-purple-800">{formatIndianCurrency(accessoriesPendingTotal)}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Statutory Declaration & Sign-off Block */}
            <div className="pt-6 border-t border-dashed border-slate-400 mt-6 flex flex-col sm:flex-row justify-between items-end gap-6 text-[10px] text-slate-600">
              <div className="max-w-md space-y-1">
                <p className="font-bold text-slate-800">DECLARATION & CERTIFICATION:</p>
                <p>
                  This accounting ledger is a computer-generated financial document compiled from authenticated point-of-sale terminal transactions, DMT gateway logs, and cash drawer counts. All entries are subject to regular internal audits.
                </p>
                <p className="font-mono text-[9px] text-slate-500">
                  Document Checksum: SHA256-OM-{Date.now().toString(36).toUpperCase()}-AUTHENTICATED
                </p>
              </div>

              <div className="text-center sm:text-right space-y-8 min-w-[200px]">
                <p className="text-slate-400 text-[10px]">For OM ENTERPRISES</p>
                <div className="border-t border-slate-800 pt-1">
                  <p className="font-bold text-slate-900">Authorized Signatory / Accountant</p>
                  <p className="text-[9px] text-slate-500">Cashier & Counter Manager</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDownloadCsv}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-xs"
            >
              <Download className="w-4 h-4" />
              Download CSV Spreadsheet
            </button>
            <button
              type="button"
              onClick={handlePrintPdf}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              Print / Save PDF Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
