import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import {
  DistributorPaymentItem,
  DistributorCategoryType,
  DistributorPaymentStatus,
  DistributorEntryType,
} from '../../types';
import { formatIndianCurrency, exportToCsv } from '../../utils/calculations';
import {
  Building2,
  PlusCircle,
  Download,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Edit2,
  Coins,
  Send,
  Smartphone,
  ShieldCheck,
  Check,
  X,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Wallet,
} from 'lucide-react';

export const DistributorPaymentsTab: React.FC = () => {
  const {
    distributorPayments,
    addDistributorPaymentItem,
    updateDistributorPaymentItem,
    deleteDistributorPaymentItem,
    togglePaymentStatus,
    moneyTransferSettledTotal,
    moneyTransferPendingTotal,
    accessoriesSettledTotal,
    accessoriesPendingTotal,
    distributorBalanceReceivedTotal,
    todayDate,
    currentTime,
    currentLiveDate,
    currentDeviceFullDate,
    lastLedgerRefreshTime,
    forceRefreshLedger,
  } = useShop();

  // Filter state
  const [activeCategoryTab, setActiveCategoryTab] = useState<'ALL' | DistributorCategoryType | 'BALANCE_RECEIVED' | 'PAYMENT_SENT'>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | DistributorPaymentStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DistributorPaymentItem | null>(null);

  // Form fields
  const [formDate, setFormDate] = useState('2026-10-25');
  const [formEntryType, setFormEntryType] = useState<DistributorEntryType>('PAYMENT_TO_DISTRIBUTOR');
  const [formTargetPortal, setFormTargetPortal] = useState<string>('VD_PAYS');
  const [formCategory, setFormCategory] = useState<DistributorCategoryType>('MONEY_TRANSFER');
  const [formDistributorName, setFormDistributorName] = useState('Go Payments Pvt Ltd');
  const [formAmount, setFormAmount] = useState('');
  const [formPurpose, setFormPurpose] = useState('');
  const [formPaymentMode, setFormPaymentMode] = useState<'CASH_HANDOVER' | 'BANK_NEFT_IMPS' | 'UPI' | 'CHEQUE'>('BANK_NEFT_IMPS');
  const [formStatus, setFormStatus] = useState<DistributorPaymentStatus>('Settled');
  const [formReference, setFormReference] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const filteredPayments = useMemo(() => {
    return distributorPayments.filter((p) => {
      // Filter by category or entry type
      if (activeCategoryTab === 'BALANCE_RECEIVED') {
        if (p.entryType !== 'BALANCE_RECEIVED') return false;
      } else if (activeCategoryTab === 'PAYMENT_SENT') {
        if (p.entryType === 'BALANCE_RECEIVED') return false;
      } else if (activeCategoryTab !== 'ALL' && p.distributorCategory !== activeCategoryTab) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'ALL' && p.status !== selectedStatus) {
        return false;
      }
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const match =
          p.distributorName.toLowerCase().includes(q) ||
          p.purpose.toLowerCase().includes(q) ||
          p.referenceNumber?.toLowerCase().includes(q) ||
          p.targetPortalOrOperator?.toLowerCase().includes(q) ||
          p.date.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [distributorPayments, activeCategoryTab, selectedStatus, searchQuery]);

  const openAddModal = (entryType: DistributorEntryType = 'PAYMENT_TO_DISTRIBUTOR', cat?: DistributorCategoryType) => {
    setEditingItem(null);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormEntryType(entryType);
    setFormCategory(cat || (activeCategoryTab === 'RETAIL_ACCESSORIES' ? 'RETAIL_ACCESSORIES' : 'MONEY_TRANSFER'));
    setFormTargetPortal(entryType === 'BALANCE_RECEIVED' ? 'VD_PAYS' : '');
    setFormDistributorName(
      entryType === 'BALANCE_RECEIVED'
        ? 'VD Pays Solutions'
        : cat === 'RETAIL_ACCESSORIES'
        ? 'Royal Mobile Accessories'
        : 'Go Payments Pvt Ltd'
    );
    setFormAmount('');
    setFormPurpose(
      entryType === 'BALANCE_RECEIVED'
        ? 'Distributor Float Credit / Top-up Received into VD Pays Wallet'
        : 'Payment handover for Sunday DMT float settlement'
    );
    setFormPaymentMode('BANK_NEFT_IMPS');
    setFormStatus('Settled');
    setFormReference(`IMPS${Date.now().toString().slice(-8)}`);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: DistributorPaymentItem) => {
    setEditingItem(item);
    setFormDate(item.date);
    setFormEntryType(item.entryType || 'PAYMENT_TO_DISTRIBUTOR');
    setFormTargetPortal(item.targetPortalOrOperator || 'VD_PAYS');
    setFormCategory(item.distributorCategory);
    setFormDistributorName(item.distributorName);
    setFormAmount(item.amount.toString());
    setFormPurpose(item.purpose);
    setFormPaymentMode(item.paymentMode);
    setFormStatus(item.status);
    setFormReference(item.referenceNumber);
    setFormNotes(item.notes || '');
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(formAmount);
    if (isNaN(numAmount) || numAmount <= 0) return;

    if (editingItem) {
      updateDistributorPaymentItem({
        ...editingItem,
        date: formDate,
        entryType: formEntryType,
        targetPortalOrOperator: formEntryType === 'BALANCE_RECEIVED' ? formTargetPortal : undefined,
        distributorCategory: formCategory,
        distributorName: formDistributorName,
        amount: numAmount,
        purpose: formPurpose,
        paymentMode: formPaymentMode,
        status: formStatus,
        referenceNumber: formReference,
        notes: formNotes,
      });
    } else {
      addDistributorPaymentItem({
        date: formDate,
        entryType: formEntryType,
        targetPortalOrOperator: formEntryType === 'BALANCE_RECEIVED' ? formTargetPortal : undefined,
        distributorCategory: formCategory,
        distributorName: formDistributorName,
        amount: numAmount,
        purpose: formPurpose,
        paymentMode: formPaymentMode,
        status: formStatus,
        referenceNumber: formReference,
        notes: formNotes,
      });
    }

    setIsAddModalOpen(false);
  };

  const handleExportCsv = () => {
    const headers = [
      'Payment ID',
      'Date',
      'Distributor Category',
      'Distributor Name',
      'Amount (INR)',
      'Purpose of Payment',
      'Payment Mode',
      'Settlement Status',
      'Reference / UTR',
      'Timestamp',
      'Settled At',
      'Notes',
    ];

    const rows = filteredPayments.map((p) => [
      p.id,
      p.date,
      p.distributorCategory === 'MONEY_TRANSFER' ? 'Money Transfer' : 'Retail Accessories',
      p.distributorName,
      p.amount,
      p.purpose,
      p.paymentMode,
      p.status,
      p.referenceNumber,
      p.timestamp,
      p.settledAt || '',
      p.notes || '',
    ]);

    exportToCsv(`om_enterprises_distributor_payments_${activeCategoryTab.toLowerCase()}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Distributor Settlements & Balance Top-up Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Log both payment handovers to distributors (Outflows) and wallet balance float top-ups received (Inflows)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Live Device Sync time badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800 text-[11px] font-mono text-slate-600 dark:text-slate-300">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>{currentLiveDate} · <strong className="text-indigo-600 dark:text-indigo-400">{currentTime}</strong></span>
          </div>

          <button
            type="button"
            onClick={forceRefreshLedger}
            title="Recalculate all formulas now"
            className="p-1.5 text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export (.CSV)</span>
          </button>

          {/* Dedicated Balance Received Button */}
          <button
            type="button"
            onClick={() => openAddModal('BALANCE_RECEIVED')}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-emerald-900 dark:text-emerald-100 bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-900/60 dark:hover:bg-emerald-800/80 border border-emerald-300 dark:border-emerald-700 rounded-lg transition-all shadow-xs"
          >
            <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-300" />
            <span>+ Balance Received (Top-up)</span>
          </button>

          {/* Payment Handover Button */}
          <button
            type="button"
            onClick={() => openAddModal('PAYMENT_TO_DISTRIBUTOR')}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-all shadow-xs"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>+ Log Payment Handover</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards: Balance Received vs Payments */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Balance Received (Inflow) */}
        <div className="p-4 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800/50 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-emerald-900 dark:text-emerald-300 uppercase flex items-center gap-1.5">
              <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Balance Top-ups Received
            </span>
            <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-200 bg-emerald-200/80 dark:bg-emerald-900/80 px-2 py-0.5 rounded font-mono">
              Inflow (+)
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-emerald-950 dark:text-emerald-100 tabular-nums mt-1">
            {formatIndianCurrency(distributorBalanceReceivedTotal)}
          </div>
          <p className="text-[11px] text-emerald-700 dark:text-emerald-400 mt-1">
            Float credited to VD Pays, Go, TSP wallets
          </p>
        </div>

        {/* Money Transfer Settled Payouts */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              DMT Settled Payouts
            </span>
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800/40 px-2 py-0.5 rounded">
              Outflow (-)
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums mt-1">
            {formatIndianCurrency(moneyTransferSettledTotal)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Cash handover & NEFT bank settlements</p>
        </div>

        {/* Accessories Settled */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Accessories Settled
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded">
              Settled
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums mt-1">
            {formatIndianCurrency(accessoriesSettledTotal)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Cables, adaptors, glass wholesale</p>
        </div>

        {/* Pending Verification */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Total Pending Verifications
            </span>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded">
              Pending
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums mt-1">
            {formatIndianCurrency(moneyTransferPendingTotal + accessoriesPendingTotal)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Awaiting vendor receipt confirmation</p>
        </div>
      </div>

      {/* Main Filter Tabs: Flow Type & Categories */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Category Buttons */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveCategoryTab('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategoryTab === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All Records ({distributorPayments.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('BALANCE_RECEIVED')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategoryTab === 'BALANCE_RECEIVED'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
              }`}
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Balance Received (Inflows)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('PAYMENT_SENT')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategoryTab === 'PAYMENT_SENT'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Payments Sent (Outflows)</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('MONEY_TRANSFER')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategoryTab === 'MONEY_TRANSFER'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Money Transfer</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveCategoryTab('RETAIL_ACCESSORIES')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategoryTab === 'RETAIL_ACCESSORIES'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Accessories</span>
            </button>
          </div>
        </div>

        {/* Search & Status Filter */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="sm:col-span-2 relative">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search distributor name, target wallet (VD Pays, Go, TSP), purpose, UTR reference..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              className="w-full py-1.5 px-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="Settled">Settled (Zero Discrepancy)</option>
              <option value="Pending">Pending Verification</option>
              <option value="Failed">Failed / Disputed</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table of Distributor Payments & Balance Received */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Flow Type</th>
                <th className="py-3 px-3.5">Distributor & Wallet</th>
                <th className="py-3 px-3.5 text-right">Amount (₹)</th>
                <th className="py-3 px-3.5">Purpose / Notes</th>
                <th className="py-3 px-3.5">Payment Mode</th>
                <th className="py-3 px-3.5">Settlement Status</th>
                <th className="py-3 px-3.5">Reference / UTR</th>
                <th className="py-3 px-3.5 text-center">Quick Action</th>
                <th className="py-3 px-3.5 text-center">Manage</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400 dark:text-slate-500">
                    No records found matching this filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((item) => {
                  const isBalanceReceived = item.entryType === 'BALANCE_RECEIVED';

                  return (
                    <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                      {/* Date */}
                      <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                        {item.date}
                      </td>

                      {/* Flow Type Badge */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {isBalanceReceived ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800">
                            <ArrowDownLeft className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                            Balance Received
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/70 dark:bg-amber-950/70 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                            <ArrowUpRight className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                            Payment Sent
                          </span>
                        )}
                      </td>

                      {/* Distributor & Target Portal */}
                      <td className="py-3 px-3.5">
                        <div className="font-bold text-slate-900 dark:text-slate-100">{item.distributorName}</div>
                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                          {item.targetPortalOrOperator && (
                            <span className="px-1.5 py-0.2 bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 rounded font-semibold text-[10px]">
                              {item.targetPortalOrOperator.replace('_', ' ')}
                            </span>
                          )}
                          <span>{item.distributorCategory === 'MONEY_TRANSFER' ? 'DMT Provider' : 'Retail Accessories'}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="py-3 px-3.5 text-right font-mono font-bold whitespace-nowrap">
                        {isBalanceReceived ? (
                          <span className="text-emerald-700 dark:text-emerald-400 text-sm">
                            + {formatIndianCurrency(item.amount)}
                          </span>
                        ) : (
                          <span className="text-slate-900 dark:text-slate-100 text-sm">
                            - {formatIndianCurrency(item.amount)}
                          </span>
                        )}
                      </td>

                      {/* Purpose */}
                      <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300 max-w-xs truncate" title={item.purpose}>
                        {item.purpose}
                      </td>

                      {/* Payment Mode */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {item.paymentMode.replace(/_/g, ' ')}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-3.5 whitespace-nowrap">
                        {item.status === 'Settled' && (
                          <span className="text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 font-mono text-[11px]">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Settled
                          </span>
                        )}
                        {item.status === 'Pending' && (
                          <span className="text-amber-700 dark:text-amber-400 font-bold flex items-center gap-1 font-mono text-[11px]">
                            <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Pending
                          </span>
                        )}
                        {item.status === 'Failed' && (
                          <span className="text-rose-700 dark:text-rose-400 font-bold flex items-center gap-1 font-mono text-[11px]">
                            <AlertCircle className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400" /> Failed
                          </span>
                        )}
                      </td>

                      {/* Reference / UTR */}
                      <td className="py-3 px-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap text-[11px]">
                        {item.referenceNumber}
                      </td>

                      {/* Quick Status Toggle */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        {item.status === 'Pending' ? (
                          <button
                            type="button"
                            onClick={() => togglePaymentStatus(item.id, 'Settled')}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                          >
                            Mark Settled
                          </button>
                        ) : item.status === 'Settled' ? (
                          <button
                            type="button"
                            onClick={() => togglePaymentStatus(item.id, 'Pending')}
                            className="text-[10px] text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 underline"
                          >
                            Reopen
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => togglePaymentStatus(item.id, 'Settled')}
                            className="px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded border border-emerald-200 dark:border-emerald-800 transition-colors"
                          >
                            Retry Settle
                          </button>
                        )}
                      </td>

                      {/* Manage (Edit/Delete) */}
                      <td className="py-3 px-3.5 text-center whitespace-nowrap">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(item)}
                            title="Edit Record"
                            className="p-1 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 rounded transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteDistributorPaymentItem(item.id)}
                            title="Delete Record"
                            className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Distributor Payment & Balance Received Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {editingItem
                    ? 'Edit Distributor Record'
                    : formEntryType === 'BALANCE_RECEIVED'
                    ? 'Log Distributor Balance Received (Float Top-up)'
                    : 'Log Distributor Payment Handover (Outflow)'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formEntryType === 'BALANCE_RECEIVED'
                    ? 'Records float received from distributor and auto-updates portal added balance'
                    : 'Records cash or bank payout to distributor with live daily ledger sync'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              {/* Flow Selector Tabs: Outflow vs Inflow */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Transaction Type *
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setFormEntryType('PAYMENT_TO_DISTRIBUTOR');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      formEntryType === 'PAYMENT_TO_DISTRIBUTOR'
                        ? 'border-indigo-600 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 ring-2 ring-indigo-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ArrowUpRight className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Payment to Distributor</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Cash/Bank Outflow to Vendor</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormEntryType('BALANCE_RECEIVED');
                      if (!formTargetPortal) setFormTargetPortal('VD_PAYS');
                      if (formCategory !== 'MONEY_TRANSFER') setFormCategory('MONEY_TRANSFER');
                    }}
                    className={`p-2.5 rounded-lg border text-left flex items-center gap-2 transition-all ${
                      formEntryType === 'BALANCE_RECEIVED'
                        ? 'border-emerald-600 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500 shadow-xs'
                        : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <ArrowDownLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <div>
                      <div className="text-xs font-bold">Balance Received (Top-up)</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400">Float credited into wallet</div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Target Portal / Wallet slot when Balance is Received */}
              {formEntryType === 'BALANCE_RECEIVED' && (
                <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-lg border border-emerald-200 dark:border-emerald-800/60 space-y-2">
                  <label className="block text-xs font-bold text-emerald-950 dark:text-emerald-200">
                    Wallet / Portal Where Balance Was Received *
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { key: 'VD_PAYS', label: 'VD Pays Solutions (DMT)', dist: 'VD Pays Solutions' },
                      { key: 'GO_PAYMENTS', label: 'Go Payments (DMT & BBPS)', dist: 'Go Payments Pvt Ltd' },
                      { key: 'THE_SIMPLE_PAY', label: 'The Simple Pay (TSP)', dist: 'The Simple Pay (TSP)' },
                      { key: 'ONE_STOP', label: 'One Stop DMT', dist: 'One Stop Agency' },
                      { key: 'AIRPAY', label: 'Airpay Services', dist: 'Airpay Systems' },
                      { key: 'AIRTEL_MITRA', label: 'Airtel Mitra LAPU', dist: 'Airtel Territory Dist.' },
                      { key: 'JIO_POS', label: 'Jio POS Plus LAPU', dist: 'Reliance Jio Dist.' },
                      { key: 'SMART_CONNECT_VI', label: 'VI Smart Connect LAPU', dist: 'Vodafone Idea Dist.' },
                    ].map((portal) => (
                      <button
                        key={portal.key}
                        type="button"
                        onClick={() => {
                          setFormTargetPortal(portal.key);
                          setFormDistributorName(portal.dist);
                          setFormPurpose(`Balance float top-up credited into ${portal.label}`);
                        }}
                        className={`p-2 rounded-lg border text-left text-xs font-semibold transition-all ${
                          formTargetPortal === portal.key
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-emerald-100/50 dark:hover:bg-slate-750'
                        }`}
                      >
                        {portal.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[11px] text-emerald-800 dark:text-emerald-300 mt-1">
                    ⚡ Auto-Refresh: This amount will automatically add into the portal's Added Balance column and update DMT Sales calculations!
                  </p>
                </div>
              )}

              {/* Category Picker when Payment Handover */}
              {formEntryType === 'PAYMENT_TO_DISTRIBUTOR' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Distributor Category *
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => {
                        setFormCategory('MONEY_TRANSFER');
                        if (formDistributorName.includes('Accessories')) {
                          setFormDistributorName('Go Payments Pvt Ltd');
                        }
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                        formCategory === 'MONEY_TRANSFER'
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Send className="w-4 h-4" />
                      Money Transfer
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setFormCategory('RETAIL_ACCESSORIES');
                        if (!formDistributorName.includes('Accessories')) {
                          setFormDistributorName('Royal Mobile Accessories');
                        }
                      }}
                      className={`py-2 px-3 text-xs font-bold rounded-lg border flex items-center justify-center gap-2 transition-colors ${
                        formCategory === 'RETAIL_ACCESSORIES'
                          ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      <Smartphone className="w-4 h-4" />
                      Retail Accessories
                    </button>
                  </div>
                </div>
              )}

              {/* Date & Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Amount (₹) *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500 dark:text-slate-400 font-bold font-mono">₹</span>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="0"
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Distributor Name with Quick Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Distributor / Gateway Name *
                </label>
                <input
                  type="text"
                  required
                  value={formDistributorName}
                  onChange={(e) => setFormDistributorName(e.target.value)}
                  placeholder="e.g. VD Pays Solutions or Go Payments Pvt Ltd"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 self-center">Presets:</span>
                  {(formCategory === 'MONEY_TRANSFER'
                    ? ['VD Pays Solutions', 'Go Payments Pvt Ltd', 'The Simple Pay (TSP)', 'Airtel CMS']
                    : ['Royal Mobile Accessories', 'Hari Om Mobile Spares', 'Kaka Dist. Electronics']
                  ).map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setFormDistributorName(preset)}
                      className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Purpose */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose / Description *
                </label>
                <input
                  type="text"
                  required
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="e.g. Balance Float Top-up for DMT or Wholesale Fast Chargers"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Payment Mode & Settlement Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment / Transfer Mode
                  </label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  >
                    <option value="BANK_NEFT_IMPS">Bank IMPS / NEFT</option>
                    <option value="CASH_HANDOVER">Cash Handover</option>
                    <option value="UPI">UPI Payout</option>
                    <option value="CHEQUE">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Settlement Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  >
                    <option value="Settled">Settled (Auto-Reconcile)</option>
                    <option value="Pending">Pending Verification</option>
                    <option value="Failed">Failed / Disputed</option>
                  </select>
                </div>
              </div>

              {/* Reference & Notes */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Reference / UTR / Voucher No
                  </label>
                  <input
                    type="text"
                    value={formReference}
                    onChange={(e) => setFormReference(e.target.value)}
                    placeholder="e.g. UTR-90481248"
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Notes
                  </label>
                  <input
                    type="text"
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    placeholder="e.g. Verified on distributor admin panel"
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Auto-Calculation Rule:</span>
                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Refreshes Daily Ledger & Portals Immediately
                </span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
                >
                  {editingItem ? 'Save Changes' : formEntryType === 'BALANCE_RECEIVED' ? 'Record Balance Received' : 'Record Payment Handover'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
