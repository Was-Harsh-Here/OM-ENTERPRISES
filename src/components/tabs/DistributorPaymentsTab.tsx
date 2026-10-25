import React, { useState, useMemo } from 'react';
import { useShop } from '../../context/ShopContext';
import { DistributorPaymentItem, DistributorCategoryType, DistributorPaymentStatus } from '../../types';
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
    todayDate,
  } = useShop();

  // Filter state
  const [activeCategoryTab, setActiveCategoryTab] = useState<'ALL' | DistributorCategoryType>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<'ALL' | DistributorPaymentStatus>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Form modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<DistributorPaymentItem | null>(null);

  // Form fields
  const [formDate, setFormDate] = useState('2026-10-25');
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
      // Category filter
      if (activeCategoryTab !== 'ALL' && p.distributorCategory !== activeCategoryTab) {
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
          p.date.includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [distributorPayments, activeCategoryTab, selectedStatus, searchQuery]);

  const openAddModal = (cat?: DistributorCategoryType) => {
    setEditingItem(null);
    setFormDate('2026-10-25');
    setFormCategory(cat || (activeCategoryTab !== 'ALL' ? activeCategoryTab : 'MONEY_TRANSFER'));
    setFormDistributorName(cat === 'RETAIL_ACCESSORIES' ? 'Royal Mobile Accessories' : 'Go Payments Pvt Ltd');
    setFormAmount('');
    setFormPurpose('');
    setFormPaymentMode('BANK_NEFT_IMPS');
    setFormStatus('Settled');
    setFormReference(`IMPS${Date.now().toString().slice(-8)}`);
    setFormNotes('');
    setIsAddModalOpen(true);
  };

  const openEditModal = (item: DistributorPaymentItem) => {
    setEditingItem(item);
    setFormDate(item.date);
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
      <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              Distributor Payments & Settlement Ledger
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track payments made to Money Transfer gateways and Retail Accessories vendors separately to guarantee zero discrepancies in daily cash flow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Export Report (.CSV)</span>
          </button>
          <button
            type="button"
            onClick={() => openAddModal()}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-all shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log Distributor Payment</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards: Money Transfer vs Accessories */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Money Transfer Settled */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              DMT Settled Payouts
            </span>
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded">
              Settled
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-slate-900 dark:text-slate-100 tabular-nums mt-1">
            {formatIndianCurrency(moneyTransferSettledTotal)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Go Payments, TSP & VD Pays wallets</p>
        </div>

        {/* Money Transfer Pending */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <Send className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              DMT Pending Verification
            </span>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded">
              Pending
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums mt-1">
            {formatIndianCurrency(moneyTransferPendingTotal)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Awaiting balance reflection</p>
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

        {/* Accessories Pending */}
        <div className="p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="font-semibold text-slate-500 dark:text-slate-400 uppercase flex items-center gap-1.5">
              <Smartphone className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Accessories Credit Due
            </span>
            <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40 px-2 py-0.5 rounded">
              Pending Invoice
            </span>
          </div>
          <div className="text-xl font-bold font-mono text-amber-700 dark:text-amber-400 tabular-nums mt-1">
            {formatIndianCurrency(accessoriesPendingTotal)}
          </div>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Pending vendor invoice receipt</p>
        </div>
      </div>

      {/* Main Filter Tabs: Money Transfer vs Retail Accessories Separately */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Segmented Category Buttons */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveCategoryTab('ALL')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors ${
                activeCategoryTab === 'ALL'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              All Distributor Payments
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
              <span>Money Transfer Distributors</span>
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
              <span>Retail Accessories Distributors</span>
            </button>
          </div>

          {/* Quick Add For Specific Category */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openAddModal('MONEY_TRANSFER')}
              className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 dark:hover:bg-blue-900/50 border border-blue-200 dark:border-blue-800 rounded-lg transition-colors"
            >
              + Add DMT Payment
            </button>
            <button
              type="button"
              onClick={() => openAddModal('RETAIL_ACCESSORIES')}
              className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/40 hover:bg-purple-100 dark:hover:bg-purple-900/50 border border-purple-200 dark:border-purple-800 rounded-lg transition-colors"
            >
              + Add Accessories Payment
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
              placeholder="Search distributor name, purpose, UTR reference..."
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

      {/* Table of Distributor Payments */}
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-3.5">Date</th>
                <th className="py-3 px-3.5">Category</th>
                <th className="py-3 px-3.5">Distributor Name</th>
                <th className="py-3 px-3.5 text-right">Amount (₹)</th>
                <th className="py-3 px-3.5">Purpose of Payment</th>
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
                    No distributor payments recorded matching this filter.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-3.5 whitespace-nowrap font-mono font-bold text-slate-800 dark:text-slate-200">
                      {item.date}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      {item.distributorCategory === 'MONEY_TRANSFER' ? (
                        <span className="font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/40 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 w-max">
                          <Send className="w-3 h-3" /> Money Transfer
                        </span>
                      ) : (
                        <span className="font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800/40 px-2 py-0.5 rounded text-[11px] flex items-center gap-1 w-max">
                          <Smartphone className="w-3 h-3" /> Retail Accessories
                        </span>
                      )}
                    </td>

                    {/* Distributor Name */}
                    <td className="py-3 px-3.5">
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{item.distributorName}</span>
                      {item.notes && <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate max-w-[200px]">{item.notes}</span>}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-3.5 text-right font-mono font-extrabold text-slate-900 dark:text-slate-100 text-sm tabular-nums">
                      {formatIndianCurrency(item.amount)}
                    </td>

                    {/* Purpose */}
                    <td className="py-3 px-3.5 text-slate-700 dark:text-slate-300">
                      <span className="font-medium">{item.purpose}</span>
                    </td>

                    {/* Mode */}
                    <td className="py-3 px-3.5 whitespace-nowrap">
                      <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
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
                          title="Edit Payment Record"
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Distributor Payment Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  {editingItem ? 'Edit Distributor Payment' : 'Log Distributor Payment'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Record exact payment handover for Money Transfer or Retail Accessories
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
              {/* Category Picker */}
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
                  Distributor Name *
                </label>
                <input
                  type="text"
                  required
                  value={formDistributorName}
                  onChange={(e) => setFormDistributorName(e.target.value)}
                  placeholder="e.g. Go Payments Pvt Ltd or Royal Mobile Accessories"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex flex-wrap gap-1.5 mt-2">
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 self-center">Presets:</span>
                  {(formCategory === 'MONEY_TRANSFER'
                    ? ['Go Payments Pvt Ltd', 'The Simple Pay (TSP)', 'VD Pays Solutions', 'Airtel CMS']
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

              {/* Purpose of Payment */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Purpose of the Payment *
                </label>
                <input
                  type="text"
                  required
                  value={formPurpose}
                  onChange={(e) => setFormPurpose(e.target.value)}
                  placeholder="e.g. Wallet Top-up for DMT rush or 50 Fast Chargers Invoice #418"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Payment Mode & Settlement Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Payment Mode
                  </label>
                  <select
                    value={formPaymentMode}
                    onChange={(e) => setFormPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-medium text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800"
                  >
                    <option value="BANK_NEFT_IMPS">Bank IMPS / NEFT</option>
                    <option value="CASH_HANDOVER">Cash Handover (Draws Cash)</option>
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
                    <option value="Settled">Settled (Zero Discrepancy)</option>
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
                    placeholder="e.g. Collection agent sign received"
                    className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Zero Discrepancy Notice */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Reconciliation Rule:</span>
                <span className="font-bold font-mono text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Settled Payments Update Daily Cash Flow
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
                  {editingItem ? 'Save Changes' : 'Record Distributor Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
