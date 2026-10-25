import React from 'react';
import { Transaction } from '../types';
import { formatIndianCurrency } from '../utils/calculations';
import { X, Printer, CheckCircle2 } from 'lucide-react';

interface ReceiptModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ transaction, isOpen, onClose }) => {
  if (!isOpen || !transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <span className="text-sm font-bold text-slate-800">Customer Transaction Receipt</span>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Printable thermal container */}
        <div id="printable-receipt" className="p-6 bg-white font-mono text-slate-800 text-xs">
          {/* Shop Header */}
          <div className="text-center pb-4 border-b border-dashed border-slate-300">
            <h1 className="text-lg font-extrabold uppercase tracking-wide text-slate-950 font-sans">
              OM ENTERPRISES
            </h1>
            <p className="text-[11px] text-slate-600 mt-0.5">
              Authorized Retail CMS, Money Transfer & Multi-LAPU Center
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Go Payments · The Simple Pay · VD Pays · Airtel Mitra · Jio POS+
            </p>
            <p className="text-[10px] text-slate-500">Retail Counter Terminal 01 · All Services Regd.</p>
          </div>

          {/* Status Badge */}
          <div className="my-3 py-1.5 px-3 bg-emerald-50 text-emerald-800 rounded flex items-center justify-center gap-1.5 font-sans font-bold text-xs">
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
              <span className="font-bold">{transaction.category.replace(/_/g, ' ')}</span>
            </div>
            {transaction.sourcePortal && (
              <div className="flex justify-between">
                <span className="text-slate-500">API Gateway:</span>
                <span className="font-bold text-indigo-700">{transaction.sourcePortal}</span>
              </div>
            )}
            {transaction.portal && (
              <div className="flex justify-between">
                <span className="text-slate-500">Gateway / Portal:</span>
                <span className="font-bold">{transaction.portal.replace(/_/g, ' ')}</span>
              </div>
            )}
            {transaction.operator && (
              <div className="flex justify-between">
                <span className="text-slate-500">Operator:</span>
                <span className="font-bold">{transaction.operator}</span>
              </div>
            )}
            {transaction.customerPhone && (
              <div className="flex justify-between">
                <span className="text-slate-500">Mobile / Account:</span>
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
              <span>Transaction Value:</span>
              <span className="font-bold tabular-nums">{formatIndianCurrency(transaction.amount)}</span>
            </div>
            {transaction.customerFee > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>Convenience / Service Fee:</span>
                <span className="tabular-nums">{formatIndianCurrency(transaction.customerFee)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold pt-2 border-t border-slate-200 text-slate-950 font-sans">
              <span>Total Paid:</span>
              <span className="tabular-nums font-mono">
                {formatIndianCurrency(transaction.totalCollected || transaction.amount)}
              </span>
            </div>
          </div>

          {/* Payment breakdown */}
          <div className="py-3 border-b border-dashed border-slate-300 text-[10px] space-y-1 text-slate-600">
            <div className="flex justify-between">
              <span>Payment Mode:</span>
              <span className="font-bold text-slate-900">{transaction.paymentMethod}</span>
            </div>
            {transaction.cashAccepted ? (
              <div className="flex justify-between">
                <span>Cash Received:</span>
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

          {/* Footer notice */}
          <div className="text-center pt-3 text-[10px] text-slate-500">
            <p>Thank you for visiting OM ENTERPRISES!</p>
            <p>Computer Generated Retail Receipt</p>
          </div>
        </div>

        {/* Modal actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 rounded-lg"
          >
            Close
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
          >
            <Printer className="w-4 h-4" />
            Print Receipt
          </button>
        </div>
      </div>
    </div>
  );
};
