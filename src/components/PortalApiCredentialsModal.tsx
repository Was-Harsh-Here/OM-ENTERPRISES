import React, { useState } from 'react';
import { useShop } from '../context/ShopContext';
import { PortalApiCredential } from '../types';
import { formatIndianCurrency } from '../utils/calculations';
import {
  X,
  Key,
  ShieldCheck,
  RefreshCw,
  Cpu,
  CheckCircle2,
  Send,
  Zap,
  Lock,
  Globe,
  Radio,
  Save,
} from 'lucide-react';

interface PortalApiCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PortalApiCredentialsModal: React.FC<PortalApiCredentialsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    portalCredentials,
    updatePortalCredential,
    fetchTransactionsFromPortal,
    syncAllConnectedPortals,
    shopName,
  } = useShop();

  const [activePortalId, setActivePortalId] = useState<string>(portalCredentials[0]?.portalId || 'go_payments');
  const [syncingPortalId, setSyncingPortalId] = useState<string | null>(null);
  const [syncingAll, setSyncingAll] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Editable credential state
  const currentCred = portalCredentials.find((c) => c.portalId === activePortalId) || portalCredentials[0];

  const [loginId, setLoginId] = useState(currentCred.loginId);
  const [apiKey, setApiKey] = useState(currentCred.apiKey);
  const [secretOrPin, setSecretOrPin] = useState(currentCred.secretOrPin);
  const [terminalCode, setTerminalCode] = useState(currentCred.terminalCode || '');
  const [autoSync, setAutoSync] = useState(currentCred.autoSync);

  // When switching portals
  const handleSelectPortal = (portalId: string) => {
    setActivePortalId(portalId);
    const target = portalCredentials.find((c) => c.portalId === portalId);
    if (target) {
      setLoginId(target.loginId);
      setApiKey(target.apiKey);
      setSecretOrPin(target.secretOrPin);
      setTerminalCode(target.terminalCode || '');
      setAutoSync(target.autoSync);
    }
  };

  const handleSaveCredential = (e: React.FormEvent) => {
    e.preventDefault();
    updatePortalCredential({
      ...currentCred,
      loginId,
      apiKey,
      secretOrPin,
      terminalCode: terminalCode || undefined,
      autoSync,
      isConnected: Boolean(apiKey.trim() && loginId.trim()),
    });
    setFeedbackMessage({
      type: 'success',
      text: `${currentCred.name} credentials saved! Live sync enabled for ${shopName}.`,
    });
    setTimeout(() => setFeedbackMessage(null), 3000);
  };

  const handleFetchFromCurrent = async () => {
    setSyncingPortalId(activePortalId);
    setFeedbackMessage(null);
    const res = await fetchTransactionsFromPortal(activePortalId);
    setSyncingPortalId(null);
    setFeedbackMessage({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  const handleSyncAll = async () => {
    setSyncingAll(true);
    setFeedbackMessage(null);
    const res = await syncAllConnectedPortals();
    setSyncingAll(false);
    setFeedbackMessage({
      type: 'success',
      text: `Sync complete! Automatically fetched ${res.totalFetched} new transactions across all connected gateways for ${shopName}.`,
    });
    setTimeout(() => setFeedbackMessage(null), 4000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-slate-950/80 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-800 w-full max-w-4xl overflow-hidden max-h-[92vh] flex flex-col animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60">
          <div>
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                {shopName} · Portal Login & Automated API Integration Hub
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Connect Go Payments, The Simple Pay, VD Pays, Airtel Mitra, Ctopup, Jio POS, Smart Connect, and Tata mSales
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Sync Banner */}
        <div className="px-6 py-3 bg-indigo-50/70 dark:bg-indigo-950/40 border-b border-indigo-100 dark:border-indigo-900/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-indigo-950 dark:text-indigo-200 font-medium">
            <Radio className="w-4 h-4 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            <span>
              Real-time Webhook listener & Auto-poller active for <strong>{shopName}</strong> counter
            </span>
          </div>
          <button
            type="button"
            onClick={handleSyncAll}
            disabled={syncingAll}
            className="flex items-center justify-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-xs shrink-0"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${syncingAll ? 'animate-spin' : ''}`} />
            <span>{syncingAll ? 'Syncing All Gateways...' : 'Fetch All Portals Now'}</span>
          </button>
        </div>

        {/* Feedback alert */}
        {feedbackMessage && (
          <div
            className={`px-6 py-2.5 text-xs font-semibold flex items-center gap-2 ${
              feedbackMessage.type === 'success'
                ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800/50'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-300 border-b border-rose-200 dark:border-rose-800/50'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>{feedbackMessage.text}</span>
          </div>
        )}

        {/* Split Body: Left List of 8 Portals, Right Active Credentials Config */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-12 overflow-hidden">
          {/* Left Portal Selector List */}
          <div className="md:col-span-5 border-r border-slate-200 dark:border-slate-800 overflow-y-auto p-4 space-y-2 bg-slate-50/50 dark:bg-slate-900/60">
            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1 mb-1">
              DMT & BBPS Gateways
            </span>
            {portalCredentials
              .filter((c) => c.category === 'DMT')
              .map((c) => (
                <button
                  key={c.portalId}
                  type="button"
                  onClick={() => handleSelectPortal(c.portalId)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activePortalId === c.portalId
                      ? 'bg-white dark:bg-slate-800 border-blue-600 dark:border-blue-500 shadow-xs ring-1 ring-blue-500'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Send className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{c.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">ID: {c.loginId || 'Unset'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </button>
              ))}

            <span className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-1 pt-3 mb-1">
              Telecom & DTH LAPU Systems
            </span>
            {portalCredentials
              .filter((c) => c.category === 'TELECOM_LAPU')
              .map((c) => (
                <button
                  key={c.portalId}
                  type="button"
                  onClick={() => handleSelectPortal(c.portalId)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-all flex items-center justify-between ${
                    activePortalId === c.portalId
                      ? 'bg-white dark:bg-slate-800 border-amber-600 dark:border-amber-500 shadow-xs ring-1 ring-amber-500'
                      : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:bg-slate-100/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100 block">{c.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">Login: {c.loginId || 'Unset'}</span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold font-mono text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/40 px-1.5 py-0.5 rounded">
                    Active
                  </span>
                </button>
              ))}
          </div>

          {/* Right Active Portal Form */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-5 bg-white dark:bg-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  {currentCred.name} Settings
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Configure your login ID, secret keys, and webhook integration
                </p>
              </div>

              <button
                type="button"
                onClick={handleFetchFromCurrent}
                disabled={syncingPortalId === currentCred.portalId}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/40 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncingPortalId === currentCred.portalId ? 'animate-spin' : ''}`} />
                <span>Fetch Transactions</span>
              </button>
            </div>

            <form onSubmit={handleSaveCredential} className="space-y-4">
              {/* Login ID / Merchant ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Retailer Login ID / Merchant PRN / Registered Mobile *
                </label>
                <input
                  type="text"
                  required
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. 9845012345 or OM_ENT_491"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono font-bold text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* API Key */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Portal API Key / Merchant Gateway Key *
                </label>
                <input
                  type="text"
                  required
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="e.g. gopay_live_•••••• or mitra_key_••••••"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Secret or PIN */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  API Secret Token / LAPU MPIN *
                </label>
                <input
                  type="password"
                  required
                  value={secretOrPin}
                  onChange={(e) => setSecretOrPin(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Terminal Code or Webhook Callback */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Terminal Code / Webhook Callback URL (Optional)
                </label>
                <input
                  type="text"
                  value={terminalCode}
                  onChange={(e) => setTerminalCode(e.target.value)}
                  placeholder="https://om-enterprises.in/api/webhooks/dmt"
                  className="w-full px-3 py-2 border border-slate-300 dark:border-slate-700 rounded-lg text-xs font-mono text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Auto Sync Toggle */}
              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <input
                    type="checkbox"
                    checked={autoSync}
                    onChange={(e) => setAutoSync(e.target.checked)}
                    className="rounded border-slate-300 dark:border-slate-600 text-indigo-600 focus:ring-indigo-500 bg-white dark:bg-slate-800"
                  />
                  <span>Automatically log every transaction from this portal into OM ENTERPRISES ledger</span>
                </label>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 ml-5 mt-0.5">
                  Amount, customer phone number, operator fees and profit are captured automatically, leaving only cash denomination prompts.
                </p>
              </div>

              {/* Save Button */}
              <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[11px] text-slate-400 dark:text-slate-500">
                  Last synced: {currentCred.lastSyncTime || 'Pending'}
                </span>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500 rounded-lg transition-colors shadow-xs"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Portal Credentials</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
