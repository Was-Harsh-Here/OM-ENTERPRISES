import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import {
  TransactionCategory,
  DmtPortal,
  TelecomOperator,
  PaymentMethod,
  DenominationMap,
  IndoNepalTransferType,
} from '../types';
import {
  DENOMINATION_KEYS,
  DENOMINATION_VALUES,
  estimateTransactionProfit,
  formatIndianCurrency,
  calculateNprEquivalent,
  formatNprCurrency,
} from '../utils/calculations';
import {
  X,
  Send,
  Zap,
  Smartphone,
  CreditCard,
  FileText,
  Gamepad2,
  Bike,
  Fingerprint,
  ArrowDownLeft,
  ArrowUpRight,
  Calculator,
  Check,
  Globe,
  Building,
  Coins,
} from 'lucide-react';

interface NewTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: TransactionCategory;
}

export const NewTransactionModal: React.FC<NewTransactionModalProps> = ({
  isOpen,
  onClose,
  defaultCategory = 'MONEY_TRANSFER',
}) => {
  const { addTransaction } = useShop();

  const [category, setCategory] = useState<TransactionCategory>(defaultCategory);
  const [amount, setAmount] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerName, setCustomerName] = useState<string>('');
  const [serviceDetail, setServiceDetail] = useState<string>('');
  const [referenceId, setReferenceId] = useState<string>('');

  // Indo-Nepal specific state
  const [indoNepalType, setIndoNepalType] = useState<IndoNepalTransferType>('ACCOUNT_DEPOSIT');
  const [nepalBeneficiaryName, setNepalBeneficiaryName] = useState<string>('');
  const [nepalBeneficiaryPhone, setNepalBeneficiaryPhone] = useState<string>('');
  const [nepalBankName, setNepalBankName] = useState<string>('Nepal SBI Bank Ltd');
  const [nepalAccountNumber, setNepalAccountNumber] = useState<string>('');
  const [nepalPickupAgent, setNepalPickupAgent] = useState<string>('Prabhu Money Transfer');
  const [nepalDistrict, setNepalDistrict] = useState<string>('Kathmandu');
  const [citizenshipOrId, setCitizenshipOrId] = useState<string>('');

  // Portals & Operators
  const [portal, setPortal] = useState<DmtPortal>('GO_PAYMENTS');
  const [operator, setOperator] = useState<TelecomOperator>('AIRTEL');

  // Profit breakdown
  const [customerFee, setCustomerFee] = useState<number>(0);
  const [distributorCost, setDistributorCost] = useState<number>(0);
  const [netProfit, setNetProfit] = useState<number>(0);
  const [customProfitOverride, setCustomProfitOverride] = useState<boolean>(false);

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('CASH');
  const [cashAccepted, setCashAccepted] = useState<string>('');
  const [cashGivenBack, setCashGivenBack] = useState<string>('');
  const [upiAccepted, setUpiAccepted] = useState<string>('');

  // Cash Denomination Drawer details
  const [showDenomDrawer, setShowDenomDrawer] = useState<boolean>(false);
  const [denomAccepted, setDenomAccepted] = useState<Partial<DenominationMap>>({});
  const [denomGiven, setDenomGiven] = useState<Partial<DenominationMap>>({});

  const [notes, setNotes] = useState<string>('');

  // Reset category on open
  useEffect(() => {
    if (isOpen) {
      setCategory(defaultCategory);
      setReferenceId(`TXN${Date.now().toString().slice(-8)}`);
    }
  }, [isOpen, defaultCategory]);

  // Recalculate profit estimate when amount, category, portal, operator or Indo-Nepal type changes
  useEffect(() => {
    const numAmount = parseFloat(amount) || 0;
    if (!customProfitOverride) {
      const estimate = estimateTransactionProfit(category, numAmount, portal, operator, indoNepalType);
      setCustomerFee(estimate.customerFee);
      setDistributorCost(estimate.distributorCost);
      setNetProfit(estimate.netProfit);

      // Default cash received
      if (paymentMethod === 'CASH') {
        const total = numAmount + estimate.customerFee;
        setCashAccepted(total > 0 ? total.toString() : '');
        setCashGivenBack('0');
      }
    }
  }, [amount, category, portal, operator, paymentMethod, customProfitOverride, indoNepalType]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const numCashAccepted = parseFloat(cashAccepted) || 0;
  const numCashGiven = parseFloat(cashGivenBack) || 0;
  const totalCollected = numAmount + (customerFee || 0);

  const categories: { key: TransactionCategory; label: string; icon: React.ReactNode; color: string }[] = [
    { key: 'MONEY_TRANSFER', label: 'Domestic DMT', icon: <Send className="w-4 h-4" />, color: 'text-blue-600' },
    { key: 'INDO_NEPAL', label: 'Indo-Nepal 🇳🇵', icon: <Globe className="w-4 h-4" />, color: 'text-rose-600' },
    { key: 'RECHARGE', label: 'Mobile & DTH Recharge', icon: <Zap className="w-4 h-4" />, color: 'text-amber-600' },
    { key: 'ACCESSORIES', label: 'Retail Accessories', icon: <Smartphone className="w-4 h-4" />, color: 'text-purple-600' },
    { key: 'BBPS_BILL', label: 'BBPS Bill Pay', icon: <FileText className="w-4 h-4" />, color: 'text-emerald-600' },
    { key: 'REDEEM_CODE', label: 'Redeem Code', icon: <Gamepad2 className="w-4 h-4" />, color: 'text-pink-600' },
    { key: 'CMS_DEPOSIT', label: 'Zomato/Swiggy Deposit', icon: <Bike className="w-4 h-4" />, color: 'text-orange-600' },
    { key: 'AEPS', label: 'AEPS Cash Banking', icon: <Fingerprint className="w-4 h-4" />, color: 'text-cyan-600' },
    { key: 'EXTERNAL_JAMA', label: 'External Deposit (Jama)', icon: <ArrowDownLeft className="w-4 h-4" />, color: 'text-teal-600' },
    { key: 'EXTERNAL_DEBIT', label: 'External Debit (Kharcha)', icon: <ArrowUpRight className="w-4 h-4" />, color: 'text-rose-600' },
  ];

  const handleDenomChange = (type: 'ACCEPTED' | 'GIVEN', key: keyof DenominationMap, val: string) => {
    const count = parseInt(val, 10) || 0;
    if (type === 'ACCEPTED') {
      const updated = { ...denomAccepted, [key]: count };
      setDenomAccepted(updated);
      let total = 0;
      for (const [k, v] of Object.entries(updated)) {
        total += (v || 0) * (DENOMINATION_VALUES[k as keyof DenominationMap] || 0);
      }
      setCashAccepted(total > 0 ? total.toString() : '');
    } else {
      const updated = { ...denomGiven, [key]: count };
      setDenomGiven(updated);
      let total = 0;
      for (const [k, v] of Object.entries(updated)) {
        total += (v || 0) * (DENOMINATION_VALUES[k as keyof DenominationMap] || 0);
      }
      setCashGivenBack(total > 0 ? total.toString() : '');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || numAmount <= 0) return;

    let finalServiceDetail = serviceDetail;
    if (!finalServiceDetail) {
      if (category === 'INDO_NEPAL') {
        const isAccount = indoNepalType === 'ACCOUNT_DEPOSIT';
        const payoutNpr = calculateNprEquivalent(numAmount);
        finalServiceDetail = isAccount
          ? `Nepal A/c: ${nepalBankName} (${nepalAccountNumber || 'A/c N/A'}) · To: ${nepalBeneficiaryName || customerName || 'Recipient'} · Payout: NPR ${payoutNpr.toLocaleString('en-IN')}`
          : `Nepal Cash Payout: ${nepalPickupAgent} (${nepalDistrict}) · To: ${nepalBeneficiaryName || customerName || 'Recipient'} · Payout: NPR ${payoutNpr.toLocaleString('en-IN')}`;
      } else if (category === 'RECHARGE') {
        finalServiceDetail = `${operator} Recharge ${customerPhone ? `(${customerPhone})` : ''}`;
      } else if (category === 'MONEY_TRANSFER') {
        finalServiceDetail = `Transfer via ${portal.replace(/_/g, ' ')} ${customerName ? `to ${customerName}` : ''}`;
      } else if (category === 'ACCESSORIES') {
        finalServiceDetail = 'Mobile Accessories Sale';
      } else if (category === 'BBPS_BILL') {
        finalServiceDetail = 'BBPS Utility Bill Payment';
      } else if (category === 'CMS_DEPOSIT') {
        finalServiceDetail = 'Rider Cash CMS Collection';
      } else if (category === 'AEPS') {
        finalServiceDetail = 'Aadhaar Biometric Cash Outflow';
      } else if (category === 'REDEEM_CODE') {
        finalServiceDetail = 'Google Play Redeem Code';
      } else if (category === 'EXTERNAL_JAMA') {
        finalServiceDetail = 'External Cash Deposit (Jama)';
      } else {
        finalServiceDetail = 'External Debit / Shop Expense';
      }
    }

    addTransaction({
      category,
      portal: category === 'MONEY_TRANSFER' || category === 'BBPS_BILL' ? portal : undefined,
      operator: category === 'RECHARGE' ? operator : undefined,
      serviceDetail: finalServiceDetail,
      customerPhone: customerPhone || undefined,
      customerName: customerName || undefined,
      referenceId: referenceId || `TXN${Date.now().toString().slice(-6)}`,
      amount: numAmount,
      customerFee,
      totalCollected: category === 'EXTERNAL_DEBIT' ? 0 : totalCollected,
      distributorCost,
      distributorCommission:
        category === 'CMS_DEPOSIT' || category === 'AEPS' || category === 'INDO_NEPAL' ? netProfit : 0,
      netProfit,
      // Indo-Nepal remittance metadata
      indoNepalTransferType: category === 'INDO_NEPAL' ? indoNepalType : undefined,
      nepalBeneficiaryName: category === 'INDO_NEPAL' ? (nepalBeneficiaryName || customerName) : undefined,
      nepalBeneficiaryPhone: category === 'INDO_NEPAL' ? (nepalBeneficiaryPhone || customerPhone) : undefined,
      nepalBankName: category === 'INDO_NEPAL' && indoNepalType === 'ACCOUNT_DEPOSIT' ? nepalBankName : undefined,
      nepalAccountNumber: category === 'INDO_NEPAL' && indoNepalType === 'ACCOUNT_DEPOSIT' ? nepalAccountNumber : undefined,
      nepalPickupAgent: category === 'INDO_NEPAL' && indoNepalType === 'CASH_PAYOUT' ? nepalPickupAgent : undefined,
      nepalDistrict: category === 'INDO_NEPAL' ? nepalDistrict : undefined,
      citizenshipOrId: category === 'INDO_NEPAL' ? citizenshipOrId : undefined,
      nprAmountEstimated: category === 'INDO_NEPAL' ? calculateNprEquivalent(numAmount) : undefined,
      paymentMethod,
      cashAccepted: paymentMethod === 'CASH' || paymentMethod === 'SPLIT' ? numCashAccepted : 0,
      cashGivenBack: numCashGiven,
      upiAccepted: paymentMethod === 'UPI' ? totalCollected : parseFloat(upiAccepted) || 0,
      cashDenominationsAccepted: Object.keys(denomAccepted).length > 0 ? denomAccepted : undefined,
      cashDenominationsGiven: Object.keys(denomGiven).length > 0 ? denomGiven : undefined,
      status: 'SUCCESS',
      notes: notes || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-3xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              New Retail Transaction Entry
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Fast-entry with auto profit tracking, cash denomination drawer, and multi-portal ledger
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-6">
          {/* Category Selector Tabs */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-2">
              Select Transaction Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.key}
                  type="button"
                  onClick={() => {
                    setCategory(cat.key);
                    setCustomProfitOverride(false);
                  }}
                  className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-semibold transition-all ${
                    category === cat.key
                      ? 'border-indigo-600 dark:border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 shadow-xs ring-1 ring-indigo-500'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <span className={cat.color}>{cat.icon}</span>
                  <span className="truncate">{cat.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Dynamic Category Specific Controls */}
          <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-lg border border-slate-200 dark:border-slate-800 space-y-4">
            {/* INDO-NEPAL REMITTANCE SLOT */}
            {category === 'INDO_NEPAL' && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                      <span className="text-base">🇳🇵</span> Indo-Nepal Remittance Mode (Cross-Border Transfer)
                    </label>
                    <span className="text-[11px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 px-2 py-0.5 rounded">
                      Customer Charge: Flat ₹300
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Account Deposit Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIndoNepalType('ACCOUNT_DEPOSIT');
                        setCustomProfitOverride(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        indoNepalType === 'ACCOUNT_DEPOSIT'
                          ? 'border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 text-slate-900 dark:text-slate-100 ring-2 ring-rose-500 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <Building className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          Account Deposit (Nepal Bank)
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-mono font-bold text-[11px]">
                          +₹150 Profit
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Direct credit into beneficiary bank account in Nepal
                      </p>
                      <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                        Customer Charge: ₹300 | Distributor Cost: ₹150 | <strong className="text-emerald-600 dark:text-emerald-400">Your Earning: ₹150</strong>
                      </div>
                    </button>

                    {/* Cash Payout Button */}
                    <button
                      type="button"
                      onClick={() => {
                        setIndoNepalType('CASH_PAYOUT');
                        setCustomProfitOverride(false);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        indoNepalType === 'CASH_PAYOUT'
                          ? 'border-rose-500 bg-rose-50/90 dark:bg-rose-950/40 text-slate-900 dark:text-slate-100 ring-2 ring-rose-500 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-750'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs flex items-center gap-1.5">
                          <Coins className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                          Cash Payout (Counter Pickup)
                        </span>
                        <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded font-mono font-bold text-[11px]">
                          +₹100 Profit
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        Instant cash pickup at Prabhu, IME, or City Express counters in Nepal
                      </p>
                      <div className="mt-2 text-[10px] text-slate-600 dark:text-slate-400 font-mono">
                        Customer Charge: ₹300 | Distributor Cost: ₹200 | <strong className="text-emerald-600 dark:text-emerald-400">Your Earning: ₹100</strong>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Nepal Remittance Live Exchange Peg Card */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-gradient-to-r from-rose-50 via-amber-50/60 to-emerald-50 dark:from-rose-950/30 dark:via-slate-800/60 dark:to-emerald-950/30 p-3 rounded-lg border border-rose-200 dark:border-rose-900/40 text-xs gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">🇳🇵</span>
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">
                        Official Exchange Peg: 1 INR = 1.60 NPR
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400">
                        Customer pays: {formatIndianCurrency(numAmount)} + ₹300 fee = <strong className="text-slate-900 dark:text-slate-100 font-mono">{formatIndianCurrency(totalCollected)}</strong>
                      </span>
                    </div>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 block">Payout to Beneficiary in Nepal:</span>
                    <span className="font-mono font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                      {formatNprCurrency(calculateNprEquivalent(numAmount))}
                    </span>
                  </div>
                </div>

                {/* Destination Details */}
                {indoNepalType === 'ACCOUNT_DEPOSIT' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nepal Bank Name *
                      </label>
                      <select
                        value={nepalBankName}
                        onChange={(e) => setNepalBankName(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="Nepal SBI Bank Ltd">Nepal SBI Bank Ltd (State Bank of India JV)</option>
                        <option value="Everest Bank Ltd">Everest Bank Ltd (PNB JV)</option>
                        <option value="Global IME Bank Ltd">Global IME Bank Ltd</option>
                        <option value="Nabil Bank Ltd">Nabil Bank Ltd</option>
                        <option value="NIC Asia Bank Ltd">NIC Asia Bank Ltd</option>
                        <option value="Rastriya Banijya Bank">Rastriya Banijya Bank (RBB)</option>
                        <option value="Nepal Investment Mega Bank">Nepal Investment Mega Bank (NIMB)</option>
                        <option value="Prabhu Bank Ltd">Prabhu Bank Ltd</option>
                        <option value="Himalayan Bank Ltd">Himalayan Bank Ltd</option>
                        <option value="Sanima Bank Ltd">Sanima Bank Ltd</option>
                        <option value="Other Nepal Bank">Other Licensed Commercial Bank</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nepal Bank Account Number *
                      </label>
                      <input
                        type="text"
                        value={nepalAccountNumber}
                        onChange={(e) => setNepalAccountNumber(e.target.value)}
                        placeholder="e.g. 0180293849102"
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Cash Pickup Partner Agency *
                      </label>
                      <select
                        value={nepalPickupAgent}
                        onChange={(e) => setNepalPickupAgent(e.target.value)}
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-rose-500"
                      >
                        <option value="Prabhu Money Transfer">Prabhu Money Transfer (All Counters)</option>
                        <option value="IME Forex (IME Ltd)">IME Forex (IME Limited / IME Pay)</option>
                        <option value="City Express Money Transfer">City Express Money Transfer</option>
                        <option value="Nepal SBI Express Remit">Nepal SBI Express Remit Counters</option>
                        <option value="Himal Remit">Himal Remit Network</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                        Nepal Payout District / Counter Location *
                      </label>
                      <input
                        type="text"
                        value={nepalDistrict}
                        onChange={(e) => setNepalDistrict(e.target.value)}
                        placeholder="e.g. Kathmandu / Pokhara / Birgunj / Butwal"
                        className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-rose-500"
                      />
                    </div>
                  </div>
                )}

                {/* Additional Remittance Fields: Nepal Beneficiary & Remitter ID */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nepal Beneficiary Name *
                    </label>
                    <input
                      type="text"
                      value={nepalBeneficiaryName}
                      onChange={(e) => setNepalBeneficiaryName(e.target.value)}
                      placeholder="Receiver name in Nepal"
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-semibold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Nepal Mobile Number *
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      value={nepalBeneficiaryPhone}
                      onChange={(e) => setNepalBeneficiaryPhone(e.target.value)}
                      placeholder="Nepal 10-digit (e.g. 9841...)"
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                      Sender ID / Nagrikta / Aadhaar
                    </label>
                    <input
                      type="text"
                      value={citizenshipOrId}
                      onChange={(e) => setCitizenshipOrId(e.target.value)}
                      placeholder="Aadhaar / Nagrikta No."
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-rose-500"
                    />
                  </div>
                </div>
              </div>
            )}

            {category === 'RECHARGE' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Telecom / DTH Operator
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {(['AIRTEL', 'JIO', 'VI', 'BSNL', 'TATAPLAY', 'AIRTEL_D2H'] as TelecomOperator[]).map((op) => (
                    <button
                      key={op}
                      type="button"
                      onClick={() => setOperator(op)}
                      className={`py-2 px-2 text-center text-xs font-bold rounded-lg border transition-colors ${
                        operator === op
                          ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {op.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Quick Recharge Plans */}
                <div className="mt-3 flex items-center gap-1.5 flex-wrap">
                  <span className="text-xs text-slate-500 dark:text-slate-400 font-medium mr-1">Popular Plans:</span>
                  {[239, 299, 349, 479, 666, 839, 2999].map((plan) => (
                    <button
                      key={plan}
                      type="button"
                      onClick={() => setAmount(plan.toString())}
                      className="px-2.5 py-1 text-xs font-mono font-medium rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-amber-950/40 hover:border-amber-400 text-slate-800 dark:text-slate-200"
                    >
                      ₹{plan}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category === 'MONEY_TRANSFER' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Money Transfer Portal Gateway
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(
                    [
                      { key: 'GO_PAYMENTS', label: 'Go Payments (API Ready)' },
                      { key: 'THE_SIMPLE_PAY', label: 'The Simple Pay (TSP)' },
                      { key: 'VD_PAYS', label: 'VD Pays Solutions' },
                      { key: 'AIRTEL_CMS', label: 'Airtel CMS / Bank' },
                      { key: 'ONE_STOP', label: 'One Stop DMT' },
                      { key: 'AIRPAY', label: 'Airpay Services' },
                    ] as { key: DmtPortal; label: string }[]
                  ).map((p) => (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setPortal(p.key)}
                      className={`p-2 text-left text-xs font-semibold rounded-lg border transition-colors ${
                        portal === p.key
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category === 'ACCESSORIES' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Quick Mobile Accessory Items
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    { name: 'Boat Type-C Cable 65W', price: 299 },
                    { name: 'Micro-USB Fast Cable', price: 150 },
                    { name: '33W SuperVOOC Adaptor', price: 450 },
                    { name: 'Tempered Glass 11D', price: 120 },
                    { name: 'Earphones 3.5mm Jack', price: 199 },
                    { name: 'OTG Adaptor Type-C', price: 60 },
                  ].map((item) => (
                    <button
                      key={item.name}
                      type="button"
                      onClick={() => {
                        setServiceDetail(item.name);
                        setAmount(item.price.toString());
                      }}
                      className="px-2.5 py-1 text-xs rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-purple-50 dark:hover:bg-purple-950/40 text-slate-800 dark:text-slate-200"
                    >
                      {item.name} · ₹{item.price}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {category === 'CMS_DEPOSIT' && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  CMS Delivery Partner
                </label>
                <div className="flex gap-2">
                  {['Zomato Rider Cash Deposit', 'Swiggy Delivery Partner Deposit', 'Flipkart / Amazon CMS'].map((app) => (
                    <button
                      key={app}
                      type="button"
                      onClick={() => setServiceDetail(app)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors ${
                        serviceDetail.includes(app)
                          ? 'bg-orange-600 text-white border-orange-600'
                          : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                      }`}
                    >
                      {app}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Inputs: Amount & Customer Information */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Transaction Amount (₹) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-slate-500 dark:text-slate-400 font-bold font-mono">₹</span>
                  <input
                    type="number"
                    step="any"
                    required
                    value={amount}
                    onChange={(e) => {
                      setAmount(e.target.value);
                      setCustomProfitOverride(false);
                    }}
                    placeholder="0"
                    className="w-full pl-8 pr-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg font-mono font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 text-base"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer / Rider Phone
                </label>
                <input
                  type="tel"
                  maxLength={10}
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="10-digit Mobile Number"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Customer / Beneficiary Name
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Ramesh Kumar"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>

            {/* Reference & Service Description */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Service / Account / Description
                </label>
                <input
                  type="text"
                  value={serviceDetail}
                  onChange={(e) => setServiceDetail(e.target.value)}
                  placeholder="e.g. SBI A/c ••••1234 or Rider ID #4819"
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Bank UTR / Portal Reference ID
                </label>
                <input
                  type="text"
                  value={referenceId}
                  onChange={(e) => setReferenceId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Per-Transaction Profit Calculation Card */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-lg border border-indigo-200 dark:border-indigo-900/60">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                <Calculator className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                Live Profit Engine for this Transaction
              </span>
              <span className="text-xs font-mono font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/40 px-2 py-0.5 rounded">
                Net Profit: {formatIndianCurrency(netProfit)}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white dark:bg-slate-800/90 p-2.5 rounded border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-slate-500 dark:text-slate-400 block">Gross Face Value</span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-sm mt-0.5 block tabular-nums">
                  {formatIndianCurrency(numAmount)}
                </span>
              </div>

              <div className="bg-white dark:bg-slate-800/90 p-2.5 rounded border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-slate-500 dark:text-slate-400 block">Customer Fee / Surcharge</span>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="font-mono text-slate-400">₹</span>
                  <input
                    type="number"
                    value={customerFee}
                    onChange={(e) => {
                      const fee = parseFloat(e.target.value) || 0;
                      setCustomerFee(fee);
                      setCustomProfitOverride(true);
                      setNetProfit(fee - distributorCost);
                    }}
                    className="w-16 font-mono font-bold text-slate-900 dark:text-slate-100 border-b border-indigo-300 dark:border-indigo-500 bg-transparent focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800/90 p-2.5 rounded border border-indigo-100 dark:border-indigo-900/40">
                <span className="text-slate-500 dark:text-slate-400 block">Distributor Cost / Payout</span>
                <span className="font-mono font-bold text-slate-700 dark:text-slate-300 text-sm mt-0.5 block tabular-nums">
                  {formatIndianCurrency(distributorCost)}
                </span>
              </div>

              <div className="bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-emerald-700 dark:text-emerald-300 font-semibold block">Net Margin Earned</span>
                <span className="font-mono font-bold text-emerald-900 dark:text-emerald-200 text-sm mt-0.5 block tabular-nums">
                  {formatIndianCurrency(netProfit)}
                </span>
              </div>
            </div>
          </div>

          {/* Payment Method & Cash Denomination Drawer */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Payment Collection Method</label>
              <div className="flex items-center gap-2">
                {(['CASH', 'UPI', 'SPLIT'] as PaymentMethod[]).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => setPaymentMethod(mode)}
                    className={`px-3 py-1 text-xs font-semibold rounded-md border transition-colors ${
                      paymentMethod === mode
                        ? 'bg-slate-900 dark:bg-indigo-600 text-white border-slate-900 dark:border-indigo-600 shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>

            {/* If Cash or Split: Cash Accepted & Change Given */}
            {(paymentMethod === 'CASH' || paymentMethod === 'SPLIT') && (
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Cash Received (₹)</label>
                    <input
                      type="number"
                      value={cashAccepted}
                      onChange={(e) => setCashAccepted(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-600 dark:text-slate-400 mb-1">Change Handed Back (₹)</label>
                    <input
                      type="number"
                      value={cashGivenBack}
                      onChange={(e) => setCashGivenBack(e.target.value)}
                      placeholder="0"
                      className="w-full px-3 py-1.5 border border-slate-300 dark:border-slate-700 rounded font-mono font-bold text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => setShowDenomDrawer(!showDenomDrawer)}
                      className="w-full py-1.5 px-3 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded transition-colors"
                    >
                      {showDenomDrawer ? 'Hide Denomination Slot' : '+ Breakdown Note Denominations'}
                    </button>
                  </div>
                </div>

                {/* Sub-drawer for exact note denomination count */}
                {showDenomDrawer && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-700 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 block mb-2">
                      Count of Notes Received from Customer:
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {['500', '200', '100', '50', '20', '10'].map((n) => (
                        <div key={n} className="flex items-center gap-1 bg-white dark:bg-slate-800 p-1 rounded border border-slate-200 dark:border-slate-700">
                          <span className="font-mono font-bold text-slate-600 dark:text-slate-300">₹{n}:</span>
                          <input
                            type="number"
                            min={0}
                            placeholder="0"
                            value={denomAccepted[n as keyof DenominationMap] || ''}
                            onChange={(e) =>
                              handleDenomChange('ACCEPTED', n as keyof DenominationMap, e.target.value)
                            }
                            className="w-12 text-center font-mono font-bold border-b border-slate-300 dark:border-slate-600 bg-transparent text-slate-900 dark:text-slate-100 focus:outline-hidden"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Internal Shop Ledger Notes (Optional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Regular customer, promised settlement in evening"
              className="w-full px-3 py-1.5 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Submit Action */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-sm"
            >
              <Check className="w-4 h-4" />
              Save Transaction & Update Ledger
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
