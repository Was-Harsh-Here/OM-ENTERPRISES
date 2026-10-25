import React, { useState } from 'react';
import { Transaction, PaymentMethod, AccessoryItemEntry } from '../types';
import { formatIndianCurrency } from '../utils/calculations';
import {
  X,
  Printer,
  CheckCircle2,
  Plus,
  Trash2,
  Edit3,
  ShieldCheck,
  FileText,
  Sliders,
  Receipt,
  Sparkles,
} from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  const isAccessoryTxn = transaction.category === 'ACCESSORIES';

  // Modal display tab: standard receipt vs accessories customizable bill
  const [activeMode, setActiveMode] = useState<'STANDARD' | 'ACCESSORIES_BILL'>(
    isAccessoryTxn ? 'ACCESSORIES_BILL' : 'STANDARD'
  );

  // Accessories Bill Customization State
  const [shopName, setShopName] = useState('OM ENTERPRISES');
  const [shopGstin, setShopGstin] = useState('27AABCO9821F1ZX');
  const [shopAddress, setShopAddress] = useState('Shop No. 4, Market Complex, Station Road');
  const [shopPhone, setShopPhone] = useState('+91 98200 12345');
  const [invoiceNumber, setInvoiceNumber] = useState(
    `OM/ACC/${new Date().getFullYear()}/${transaction.referenceId.slice(-6) || '0491'}`
  );
  const [customerName, setCustomerName] = useState(transaction.customerName || 'Walk-in Customer');
  const [customerPhone, setCustomerPhone] = useState(transaction.customerPhone || '');
  const [customerGst, setCustomerGst] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>(transaction.paymentMethod || 'CASH');
  const [taxMode, setTaxMode] = useState<'INCLUSIVE_18' | 'EXCLUSIVE_18' | 'EXEMPT'>('INCLUSIVE_18');
  const [paperFormat, setPaperFormat] = useState<'THERMAL_80MM' | 'A4_INVOICE'>('THERMAL_80MM');

  // Line items list for accessories
  const [accessoryItems, setAccessoryItems] = useState<AccessoryItemEntry[]>([
    {
      id: 'acc-1',
      name: transaction.serviceDetail || 'Fast Braided USB Type-C Cable 65W',
      hsn: '8544',
      qty: 1,
      rate: transaction.amount || 299,
      amount: transaction.amount || 299,
      warranty: '6 Months Replacement Warranty',
      serialNo: 'SN-' + Date.now().toString().slice(-6),
    },
  ]);

  const handleAddItem = () => {
    const newItem: AccessoryItemEntry = {
      id: 'acc-' + (accessoryItems.length + 1) + '-' + Date.now(),
      name: '33W Turbo Flash Charger Adapter',
      hsn: '8504',
      qty: 1,
      rate: 499,
      amount: 499,
      warranty: '6 Months Replacement Warranty',
      serialNo: 'SN-' + Date.now().toString().slice(-6),
    };
    setAccessoryItems([...accessoryItems, newItem]);
  };

  const handleRemoveItem = (id: string) => {
    if (accessoryItems.length <= 1) return;
    setAccessoryItems(accessoryItems.filter((item) => item.id !== id));
  };

  const handleUpdateItem = (id: string, field: keyof AccessoryItemEntry, value: any) => {
    setAccessoryItems(
      accessoryItems.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'qty' || field === 'rate') {
            updated.amount = (Number(updated.qty) || 1) * (Number(updated.rate) || 0);
          }
          return updated;
        }
        return item;
      })
    );
  };

  // Tax and Total calculations
  const rawSubtotal = accessoryItems.reduce((acc, item) => acc + (item.amount || 0), 0);
  let taxableAmount = rawSubtotal;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let grandTotal = rawSubtotal;

  if (taxMode === 'INCLUSIVE_18') {
    taxableAmount = Number((rawSubtotal / 1.18).toFixed(2));
    const totalGst = Number((rawSubtotal - taxableAmount).toFixed(2));
    cgstAmount = Number((totalGst / 2).toFixed(2));
    sgstAmount = Number((totalGst / 2).toFixed(2));
    grandTotal = rawSubtotal;
  } else if (taxMode === 'EXCLUSIVE_18') {
    taxableAmount = rawSubtotal;
    cgstAmount = Number((rawSubtotal * 0.09).toFixed(2));
    sgstAmount = Number((rawSubtotal * 0.09).toFixed(2));
    grandTotal = Number((rawSubtotal + cgstAmount + sgstAmount).toFixed(2));
  } else {
    taxableAmount = rawSubtotal;
    cgstAmount = 0;
    sgstAmount = 0;
    grandTotal = rawSubtotal;
  }

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl max-h-[94vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div className="flex items-center gap-2">
            <span className="text-sm font-extrabold text-slate-800 dark:text-slate-100">
              Receipt & Bill Terminal
            </span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-400 font-mono font-bold">
              #{transaction.referenceId.slice(-8)}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle: Standard Receipt vs Accessories Customizable Bill */}
        <div className="px-5 pt-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveMode('STANDARD')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeMode === 'STANDARD'
                  ? 'bg-slate-800 dark:bg-slate-200 text-white dark:text-slate-900 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              Standard Receipt
            </button>
            <button
              type="button"
              onClick={() => setActiveMode('ACCESSORIES_BILL')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                activeMode === 'ACCESSORIES_BILL'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              Accessories Computer Bill & Warranty
            </button>
          </div>

          {activeMode === 'ACCESSORIES_BILL' && (
            <div className="flex items-center gap-1.5 text-[11px]">
              <span className="text-slate-500 dark:text-slate-400">Layout:</span>
              <button
                type="button"
                onClick={() => setPaperFormat('THERMAL_80MM')}
                className={`px-2 py-1 rounded font-semibold text-[10px] ${
                  paperFormat === 'THERMAL_80MM'
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'text-slate-500'
                }`}
              >
                Thermal POS (80mm)
              </button>
              <button
                type="button"
                onClick={() => setPaperFormat('A4_INVOICE')}
                className={`px-2 py-1 rounded font-semibold text-[10px] ${
                  paperFormat === 'A4_INVOICE'
                    ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 font-bold'
                    : 'text-slate-500'
                }`}
              >
                Tax Invoice (A4)
              </button>
            </div>
          )}
        </div>

        {/* Scrollable Container */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* ================= MODE 1: STANDARD RECEIPT ================= */}
          {activeMode === 'STANDARD' && (
            <div
              id="printable-receipt"
              className="max-w-md mx-auto p-5 sm:p-6 bg-white font-mono text-slate-800 text-xs border border-slate-200 rounded-xl shadow-xs"
            >
              {/* Shop Header */}
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <h1 className="text-lg font-black uppercase tracking-wide text-slate-950 font-sans">
                  OM ENTERPRISES
                </h1>
                <p className="text-[11px] text-slate-600 mt-0.5">
                  Authorized Retail CMS, Money Transfer & Multi-LAPU Center
                </p>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  GSTIN: 27AABCO9821F1ZX · Counter Terminal 01
                </p>
                <p className="text-[10px] text-slate-500">Go Payments · TSP · VD Pays · Airtel · Jio POS+</p>
              </div>

              {/* Status Badge */}
              <div className="my-3 py-1.5 px-3 bg-emerald-50 text-emerald-800 rounded flex items-center justify-center gap-1.5 font-sans font-bold text-xs border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                TRANSACTION SUCCESSFUL
              </div>

              {/* Transaction Metadata */}
              <div className="space-y-1.5 py-3 border-b border-dashed border-slate-300 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Time:</span>
                  <span className="font-bold">{transaction.dateFormatted} {transaction.timeFormatted}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Txn / RRN ID:</span>
                  <span className="font-bold truncate max-w-[180px]">{transaction.referenceId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Service Category:</span>
                  <span className="font-bold">
                    {transaction.category === 'INDO_NEPAL' ? '🇳🇵 Indo-Nepal Remittance' : transaction.category.replace(/_/g, ' ')}
                  </span>
                </div>

                {/* Indo-Nepal specific lines */}
                {transaction.category === 'INDO_NEPAL' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Transfer Type:</span>
                      <span className="font-bold text-rose-700">
                        {transaction.indoNepalTransferType === 'ACCOUNT_DEPOSIT' ? 'Bank Account Deposit' : 'Cash Counter Pickup'}
                      </span>
                    </div>
                    {transaction.nepalBeneficiaryName && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nepal Beneficiary:</span>
                        <span className="font-bold">{transaction.nepalBeneficiaryName}</span>
                      </div>
                    )}
                    {transaction.nepalBeneficiaryPhone && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nepal Phone:</span>
                        <span className="font-mono font-bold">{transaction.nepalBeneficiaryPhone}</span>
                      </div>
                    )}
                    {transaction.nepalBankName && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nepal Bank:</span>
                        <span className="font-bold">{transaction.nepalBankName}</span>
                      </div>
                    )}
                    {transaction.nepalAccountNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Nepal A/c No:</span>
                        <span className="font-mono font-bold">{transaction.nepalAccountNumber}</span>
                      </div>
                    )}
                    {transaction.nepalPickupAgent && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cash Pickup Partner:</span>
                        <span className="font-bold">{transaction.nepalPickupAgent}</span>
                      </div>
                    )}
                  </>
                )}

                {transaction.sourcePortal && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">API Gateway:</span>
                    <span className="font-bold text-indigo-700">{transaction.sourcePortal}</span>
                  </div>
                )}
                {transaction.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Mobile:</span>
                    <span className="font-bold">{transaction.customerPhone}</span>
                  </div>
                )}
                {transaction.customerName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Name:</span>
                    <span className="font-bold">{transaction.customerName}</span>
                  </div>
                )}
                {transaction.serviceDetail && (
                  <div className="pt-1 text-slate-700 font-sans text-[11px]">
                    <span className="text-slate-500 block">Particulars:</span>
                    <span className="font-medium">{transaction.serviceDetail}</span>
                  </div>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="py-3 border-b border-dashed border-slate-300 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span>Face Value / Remittance:</span>
                  <span className="font-bold tabular-nums">{formatIndianCurrency(transaction.amount)}</span>
                </div>
                {transaction.customerFee > 0 && (
                  <div className="flex justify-between text-slate-600">
                    <span>{transaction.category === 'INDO_NEPAL' ? 'Indo-Nepal Transfer Fee:' : 'Convenience Fee:'}</span>
                    <span className="tabular-nums font-bold">{formatIndianCurrency(transaction.customerFee)}</span>
                  </div>
                )}

                {/* Indo-Nepal NPR Payout line */}
                {transaction.category === 'INDO_NEPAL' && (
                  <div className="my-1.5 p-2 bg-emerald-50 rounded border border-emerald-200 text-emerald-950 font-sans">
                    <div className="flex justify-between text-[10px] text-emerald-700">
                      <span>Official Peg Rate:</span>
                      <span className="font-mono">1 INR = 1.60 NPR</span>
                    </div>
                    <div className="flex justify-between font-bold text-xs mt-0.5">
                      <span>Beneficiary Receives (Nepal):</span>
                      <span className="font-mono text-emerald-800">
                        NPR {(transaction.nprAmountEstimated || transaction.amount * 1.6).toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                )}

                <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 text-slate-950 font-sans">
                  <span>Total Amount Paid:</span>
                  <span className="tabular-nums font-mono">
                    {formatIndianCurrency(transaction.totalCollected || transaction.amount + (transaction.customerFee || 0))}
                  </span>
                </div>
              </div>

              {/* Payment Mode */}
              <div className="py-3 border-b border-dashed border-slate-300 text-[10px] space-y-1 text-slate-600">
                <div className="flex justify-between">
                  <span>Payment Mode:</span>
                  <span className="font-bold text-slate-900">{transaction.paymentMethod}</span>
                </div>
                {transaction.cashAccepted ? (
                  <div className="flex justify-between">
                    <span>Cash Tendered:</span>
                    <span className="font-mono">{formatIndianCurrency(transaction.cashAccepted)}</span>
                  </div>
                ) : null}
                {transaction.cashGivenBack ? (
                  <div className="flex justify-between">
                    <span>Change Returned:</span>
                    <span className="font-mono">{formatIndianCurrency(transaction.cashGivenBack)}</span>
                  </div>
                ) : null}
              </div>

              {/* Explicit Computer Generated declaration */}
              <div className="text-center pt-3 text-[10px] text-slate-500 space-y-0.5">
                <p className="font-bold text-slate-700 uppercase">
                  THIS IS A COMPUTER GENERATED RECEIPT
                </p>
                <p>REQUIRES NO PHYSICAL SIGNATURE</p>
                <p className="text-[9px] text-slate-400">Thank you for visiting OM ENTERPRISES!</p>
              </div>
            </div>
          )}

          {/* ================= MODE 2: CUSTOMIZABLE ACCESSORIES TAX BILL ================= */}
          {activeMode === 'ACCESSORIES_BILL' && (
            <div className="space-y-6">
              {/* Interactive Customizer Panel */}
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-indigo-500" /> Bill & Warranty Customizer
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Modify line items, warranty periods & customer particulars below
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Invoice Number:</label>
                    <input
                      type="text"
                      value={invoiceNumber}
                      onChange={(e) => setInvoiceNumber(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono font-semibold text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Customer Name:</label>
                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Customer Name"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                    />
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Customer Mobile:</label>
                    <input
                      type="text"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="10-digit Phone"
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">GST Taxation Mode:</label>
                    <select
                      value={taxMode}
                      onChange={(e) => setTaxMode(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value="INCLUSIVE_18">GST 18% Included in Price (Standard MRP)</option>
                      <option value="EXCLUSIVE_18">Add 18% GST (CGST 9% + SGST 9%)</option>
                      <option value="EXEMPT">Exempt / Bill of Supply (Composite Scheme)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Payment Method:</label>
                    <select
                      value={paymentMode}
                      onChange={(e) => setPaymentMode(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-semibold text-slate-900 dark:text-slate-100"
                    >
                      <option value="CASH">Cash Counter Payment</option>
                      <option value="UPI">UPI / QR Code Scan</option>
                      <option value="SPLIT">Split Cash + UPI</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1">Shop GSTIN:</label>
                    <input
                      type="text"
                      value={shopGstin}
                      onChange={(e) => setShopGstin(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg font-mono text-slate-900 dark:text-slate-100"
                    />
                  </div>
                </div>

                {/* Accessory Items Editor */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-700 dark:text-slate-300">Itemized Products & Warranty:</span>
                    <button
                      type="button"
                      onClick={handleAddItem}
                      className="flex items-center gap-1 px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 font-bold rounded-lg border border-indigo-200 dark:border-indigo-800/40"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Accessory Item
                    </button>
                  </div>

                  {accessoryItems.map((item, idx) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700/80 space-y-2"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center">
                        <div className="sm:col-span-5">
                          <input
                            type="text"
                            value={item.name}
                            onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                            placeholder="Item name / description"
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-semibold text-slate-900 dark:text-slate-100 text-xs"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <input
                            type="text"
                            value={item.hsn}
                            onChange={(e) => handleUpdateItem(item.id, 'hsn', e.target.value)}
                            placeholder="HSN"
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs text-slate-900 dark:text-slate-100"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">Qty:</span>
                            <input
                              type="number"
                              min="1"
                              value={item.qty}
                              onChange={(e) => handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-2">
                          <div className="flex items-center gap-1">
                            <span className="text-[10px] text-slate-400">Rate:</span>
                            <input
                              type="number"
                              min="0"
                              value={item.rate}
                              onChange={(e) => handleUpdateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-xs text-slate-900 dark:text-slate-100"
                            />
                          </div>
                        </div>
                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.id)}
                            disabled={accessoryItems.length <= 1}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Warranty & Serial No Row */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold whitespace-nowrap">
                            Warranty:
                          </span>
                          <select
                            value={item.warranty}
                            onChange={(e) => handleUpdateItem(item.id, 'warranty', e.target.value)}
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded text-[11px] font-semibold text-slate-900 dark:text-slate-100"
                          >
                            <option value="6 Months Replacement Warranty">6 Months Replacement Warranty</option>
                            <option value="1 Year Brand Warranty">1 Year Brand Warranty</option>
                            <option value="3 Months Store Replacement">3 Months Store Replacement</option>
                            <option value="30 Days Testing Guarantee">30 Days Testing Guarantee</option>
                            <option value="No Warranty (Sold as is)">No Warranty</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] text-slate-500 whitespace-nowrap">Serial / Batch:</span>
                          <input
                            type="text"
                            value={item.serialNo || ''}
                            onChange={(e) => handleUpdateItem(item.id, 'serialNo', e.target.value)}
                            placeholder="Optional Serial No / IMEI"
                            className="w-full px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded font-mono text-[11px] text-slate-900 dark:text-slate-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* The Actual Printable Thermal Bill Slip Container */}
              <div
                id="printable-thermal-bill"
                className={`mx-auto bg-white text-slate-900 border border-slate-300 rounded-xl p-5 sm:p-6 shadow-sm ${
                  paperFormat === 'THERMAL_80MM' ? 'max-w-md font-mono text-xs' : 'w-full font-sans text-xs'
                }`}
              >
                {/* Header */}
                <div className="text-center pb-3 border-b border-dashed border-slate-400">
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wider text-slate-950 font-sans">
                    {shopName}
                  </h1>
                  <p className="text-[11px] text-slate-600 font-sans">{shopAddress}</p>
                  <p className="text-[10px] text-slate-500 font-sans">
                    Contact: {shopPhone} · GSTIN: <span className="font-bold">{shopGstin}</span>
                  </p>
                  <div className="mt-1 inline-block px-2 py-0.5 bg-slate-900 text-white text-[10px] font-bold uppercase rounded font-sans">
                    Retail Accessories Tax Invoice / Cash Bill
                  </div>
                </div>

                {/* Invoice Metadata */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Invoice No:</span>
                    <span className="font-bold text-slate-900">{invoiceNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date & Time:</span>
                    <span>{transaction.dateFormatted} {transaction.timeFormatted}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Customer Name:</span>
                    <span className="font-bold">{customerName}</span>
                  </div>
                  {customerPhone && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer Mobile:</span>
                      <span className="font-bold">{customerPhone}</span>
                    </div>
                  )}
                  {customerGst && (
                    <div className="flex justify-between">
                      <span className="text-slate-500">Customer GSTIN:</span>
                      <span className="font-bold">{customerGst}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-500">Payment Mode:</span>
                    <span className="font-bold text-slate-900">{paymentMode}</span>
                  </div>
                </div>

                {/* Items List */}
                <div className="py-3 border-b border-dashed border-slate-400">
                  <div className="font-bold text-[10px] text-slate-500 border-b border-slate-200 pb-1 mb-2 flex justify-between">
                    <span>ITEM / WARRANTY</span>
                    <span className="text-right">QTY · RATE · AMOUNT</span>
                  </div>

                  <div className="space-y-2.5">
                    {accessoryItems.map((item, idx) => (
                      <div key={item.id} className="text-[11px] space-y-0.5">
                        <div className="flex justify-between items-baseline font-bold text-slate-900">
                          <span className="truncate pr-2">
                            {idx + 1}. {item.name}
                          </span>
                          <span className="font-mono tabular-nums whitespace-nowrap">
                            {formatIndianCurrency(item.amount)}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>HSN: {item.hsn} {item.serialNo ? `· SN: ${item.serialNo}` : ''}</span>
                          <span className="font-mono">
                            {item.qty} × {formatIndianCurrency(item.rate)}
                          </span>
                        </div>
                        <div className="inline-block px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-sans font-bold rounded border border-emerald-200">
                          🛡️ {item.warranty}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total & Tax Breakdown */}
                <div className="py-2.5 border-b border-dashed border-slate-400 text-[11px] space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Taxable Value:</span>
                    <span className="font-mono">{formatIndianCurrency(taxableAmount)}</span>
                  </div>
                  {taxMode === 'INCLUSIVE_18' && (
                    <>
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span>CGST (9% included):</span>
                        <span className="font-mono">{formatIndianCurrency(cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 text-[10px]">
                        <span>SGST (9% included):</span>
                        <span className="font-mono">{formatIndianCurrency(sgstAmount)}</span>
                      </div>
                    </>
                  )}
                  {taxMode === 'EXCLUSIVE_18' && (
                    <>
                      <div className="flex justify-between text-slate-600">
                        <span>CGST (9%):</span>
                        <span className="font-mono">{formatIndianCurrency(cgstAmount)}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>SGST (9%):</span>
                        <span className="font-mono">{formatIndianCurrency(sgstAmount)}</span>
                      </div>
                    </>
                  )}

                  <div className="flex justify-between text-sm font-black pt-1.5 border-t border-slate-300 text-slate-950 font-sans">
                    <span>GRAND TOTAL:</span>
                    <span className="font-mono tabular-nums text-base">{formatIndianCurrency(grandTotal)}</span>
                  </div>
                </div>

                {/* Statutory Computer-Generated Declaration Banner */}
                <div className="my-3 p-2 bg-slate-100 rounded text-center border border-slate-300">
                  <p className="font-black text-[10px] tracking-wider text-slate-900 uppercase font-sans">
                    *** THIS IS A COMPUTER GENERATED INVOICE / RECEIPT ***
                  </p>
                  <p className="text-[9px] text-slate-600 font-sans font-semibold">
                    NO PHYSICAL SIGNATURE OR STAMP REQUIRED (AS PER IT ACT)
                  </p>
                </div>

                {/* Warranty Terms & Conditions */}
                <div className="text-[9px] text-slate-500 space-y-0.5 border-t border-dashed border-slate-300 pt-2 font-sans">
                  <p className="font-bold text-slate-700">WARRANTY TERMS & CONDITIONS:</p>
                  <p>1. Warranty applies against manufacturing defect only. Physical damage, burnt IC, water damage, or cable cuts are strictly non-claimable.</p>
                  <p>2. Keep this computer-generated bill / slip or photo for warranty claim verification.</p>
                  <p>3. Goods once sold are not eligible for cash refund. Replacement subject to inspection.</p>
                </div>

                {/* Footer sign-off */}
                <div className="text-center pt-2 text-[10px] text-slate-600 font-sans">
                  <p className="font-bold">Thank you for shopping with OM ENTERPRISES!</p>
                  <p className="text-[9px] text-slate-400">Visit again for genuine accessories & fast mobile services.</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 rounded-lg transition-colors"
          >
            Close
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              {activeMode === 'ACCESSORIES_BILL' ? 'Print Computer Generated Bill' : 'Print Receipt'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
