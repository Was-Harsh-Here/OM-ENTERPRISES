import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { DENOMINATION_KEYS, DENOMINATION_VALUES, calculateDenominationTotal, formatIndianCurrency } from '../utils/calculations';
import { DenominationMap } from '../types';
import { X, CheckCircle2, AlertTriangle, Coins, RefreshCw, Save } from 'lucide-react';

interface CashDrawerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CashDrawerModal: React.FC<CashDrawerModalProps> = ({ isOpen, onClose }) => {
  const { physicalDenominations, updatePhysicalDenominations, expectedBookCash } = useShop();

  const [denominations, setDenominations] = useState<DenominationMap>({ ...physicalDenominations });
  const [successNotice, setSuccessNotice] = useState(false);

  if (!isOpen) return null;

  const currentTotal = calculateDenominationTotal(denominations);
  const discrepancy = currentTotal - expectedBookCash;

  const handleCountChange = (key: keyof DenominationMap, val: string) => {
    const num = parseInt(val, 10);
    setDenominations((prev) => ({
      ...prev,
      [key]: isNaN(num) || num < 0 ? 0 : num,
    }));
  };

  const handleQuickAdd = (key: keyof DenominationMap, count: number) => {
    setDenominations((prev) => ({
      ...prev,
      [key]: (prev[key] || 0) + count,
    }));
  };

  const handleClearAll = () => {
    const empty: DenominationMap = {
      '2000': 0,
      '500': 0,
      '200': 0,
      '100': 0,
      '50': 0,
      '20': 0,
      '10': 0,
      '5': 0,
      '2': 0,
      '1': 0,
      'coins': 0,
    };
    setDenominations(empty);
  };

  const handleSave = () => {
    updatePhysicalDenominations(denominations);
    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              Cash Drawer Denomination & Daily Reconciliation
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Verify physical currency in OM ENTERPRISES drawer against system book ledger
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Summary Banner */}
        <div className="grid grid-cols-3 divide-x divide-slate-200 dark:divide-slate-800 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/40">
          <div className="p-4 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Physical Cash In Hand</span>
            <div className="text-xl font-bold font-mono text-slate-900 dark:text-white tabular-nums mt-1">
              {formatIndianCurrency(currentTotal)}
            </div>
          </div>
          <div className="p-4 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">System Expected Book Cash</span>
            <div className="text-xl font-bold font-mono text-slate-700 dark:text-slate-300 tabular-nums mt-1">
              {formatIndianCurrency(expectedBookCash)}
            </div>
          </div>
          <div className="p-4 text-center">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Discrepancy Status</span>
            <div className="mt-1 flex items-center justify-center gap-1 font-mono text-sm font-bold tabular-nums">
              {discrepancy === 0 ? (
                <span className="text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 inline" /> Zero Discrepancy
                </span>
              ) : discrepancy > 0 ? (
                <span className="text-amber-700 dark:text-amber-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 inline" /> +{formatIndianCurrency(discrepancy)} Excess
                </span>
              ) : (
                <span className="text-rose-700 dark:text-rose-400 flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 inline" /> {formatIndianCurrency(discrepancy)} Short
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Denomination Table */}
        <div className="p-6 max-h-[50vh] overflow-y-auto">
          <div className="space-y-2.5">
            {DENOMINATION_KEYS.map((key) => {
              const noteVal = DENOMINATION_VALUES[key];
              const count = denominations[key] || 0;
              const subtotal = count * noteVal;

              return (
                <div
                  key={key}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <div className="w-28 flex items-center gap-2">
                    <span className="font-mono text-sm font-bold text-slate-800 dark:text-slate-200">
                      {key === 'coins' ? 'Coins' : `₹${key}`}
                    </span>
                    <span className="text-xs text-slate-400">×</span>
                  </div>

                  {/* Count input */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(key, -1)}
                      disabled={count <= 0}
                      className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 text-sm font-bold"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      min={0}
                      value={count === 0 ? '' : count}
                      placeholder="0"
                      onChange={(e) => handleCountChange(key, e.target.value)}
                      className="w-20 text-center font-mono font-semibold py-1 px-2 border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(key, 1)}
                      className="w-7 h-7 flex items-center justify-center rounded border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-bold"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(key, 5)}
                      className="px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      +5
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickAdd(key, 10)}
                      className="px-2 py-1 text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-slate-700 rounded hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                    >
                      +10
                    </button>
                  </div>

                  {/* Subtotal */}
                  <div className="w-32 text-right font-mono font-bold text-sm text-slate-900 dark:text-white tabular-nums">
                    {formatIndianCurrency(subtotal)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850">
          <button
            type="button"
            onClick={handleClearAll}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Clear Count
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="flex items-center gap-1.5 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
            >
              <Save className="w-4 h-4" />
              {successNotice ? 'Saved!' : 'Save & Lock Cash Drawer'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
