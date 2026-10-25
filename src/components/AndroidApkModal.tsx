import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Smartphone,
  QrCode,
  Download,
  Share2,
  Copy,
  CheckCircle,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  HardDriveDownload,
  ArrowRight,
  Layers,
  Sparkles,
  Wifi,
  X
} from 'lucide-react';
import { useShop } from '../context/ShopContext';
import { usePWAInstall } from '../hooks/usePWAInstall';

interface AndroidApkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AndroidApkModal: React.FC<AndroidApkModalProps> = ({ isOpen, onClose }) => {
  const {
    shopName,
    transactions,
    distributorPayments,
    generateSyncPayload,
    importSyncPayload,
    lastSyncTimestamp,
  } = useShop();

  const { isInstallable, isInstalled, isAndroid, isIOS, install } = usePWAInstall();

  const [activeTab, setActiveTab] = useState<'qr' | 'apk' | 'sync'>('qr');
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedSyncCode, setCopiedSyncCode] = useState(false);
  const [syncCodeInput, setSyncCodeInput] = useState('');
  const [syncStatusMsg, setSyncStatusMsg] = useState<string | null>(null);

  // Compute live accessible URL for remote phone
  const liveUrl = typeof window !== 'undefined'
    ? (window.location.origin.includes('run.app')
        ? window.location.origin
        : 'https://ais-pre-u6md76tinavnf4lsywspo3-943954576516.asia-southeast1.run.app')
    : 'https://ais-pre-u6md76tinavnf4lsywspo3-943954576516.asia-southeast1.run.app';

  // Generate QR code on open or URL change
  useEffect(() => {
    if (isOpen) {
      // Include current sync snapshot in the QR code if feasible, or pure URL for clean loading
      QRCode.toDataURL(liveUrl, {
        width: 320,
        margin: 1.5,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('QR code generation error:', err));
    }
  }, [isOpen, liveUrl]);

  if (!isOpen) return null;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(liveUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopySyncPayload = () => {
    const payload = generateSyncPayload();
    navigator.clipboard.writeText(payload);
    setCopiedSyncCode(true);
    setTimeout(() => setCopiedSyncCode(false), 2500);
  };

  const handleApplySyncCode = () => {
    if (!syncCodeInput.trim()) {
      setSyncStatusMsg('Please paste a sync code.');
      return;
    }
    const success = importSyncPayload(syncCodeInput.trim());
    if (success) {
      setSyncStatusMsg('Shop data successfully imported and synced!');
      setSyncCodeInput('');
      setTimeout(() => setSyncStatusMsg(null), 4000);
    } else {
      setSyncStatusMsg('Invalid sync code format. Please check and try again.');
    }
  };

  const handleExportBackupFile = () => {
    const payload = generateSyncPayload();
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `OM_ENTERPRISES_BACKUP_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/75 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="p-5 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white flex items-center justify-between border-b border-indigo-800/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-500 flex items-center justify-center shadow-md">
              <Smartphone className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold tracking-tight">Android APK & Remote Mobile Access</h3>
                <span className="px-2 py-0.5 text-[10px] font-bold uppercase rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-indigo-200/80">
                Monitor live transactions, edit ledgers, and check daily profit remotely from your Android phone
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-indigo-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Navigation */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 p-1.5 gap-1.5">
          <button
            type="button"
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'qr'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>Scan & Open on Phone</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('apk')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'apk'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Android APK Package</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sync')}
            className={`flex-1 py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-2 transition-all ${
              activeTab === 'sync'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs border border-slate-200/80 dark:border-slate-700'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            <span>Remote Data Sync</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-800 dark:text-slate-200 text-sm">
          {/* TAB 1: Scan & Open on Phone */}
          {activeTab === 'qr' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                {/* QR Code Container */}
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-950/60 rounded-xl border border-slate-200 dark:border-slate-800">
                  <div className="p-2 bg-white rounded-xl shadow-md border border-slate-200">
                    {qrDataUrl ? (
                      <img
                        src={qrDataUrl}
                        alt="Scan with Android phone"
                        className="w-48 h-48 rounded-lg object-contain"
                      />
                    ) : (
                      <div className="w-48 h-48 flex items-center justify-center text-slate-400 text-xs">
                        Generating QR Code...
                      </div>
                    )}
                  </div>
                  <div className="mt-3 text-center">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5">
                      <QrCode className="w-3.5 h-3.5 text-indigo-500" />
                      Scan with any Android Camera or Google Lens
                    </span>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Works on Samsung, Xiaomi, Realme, Vivo, OnePlus, Oppo
                    </p>
                  </div>
                </div>

                {/* Direct Action Details */}
                <div className="space-y-4">
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-base">
                      Instant Mobile Access
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                      Open this URL on your Android phone to access the live dashboard with full permissions to view real-time revenue, add recharges, manage DMT, and verify distributor settlements.
                    </p>
                  </div>

                  {/* Copy Link Input */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Live Shop URL
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        readOnly
                        value={liveUrl}
                        className="w-full px-3 py-2 text-xs font-mono bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 focus:outline-hidden"
                      />
                      <button
                        type="button"
                        onClick={handleCopyLink}
                        className="px-3 py-2 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg flex items-center gap-1.5 shrink-0 transition-colors"
                      >
                        {copiedLink ? <CheckCircle className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                        {copiedLink ? 'Copied' : 'Copy'}
                      </button>
                    </div>
                  </div>

                  {/* In-App Direct Install Trigger (if browser allows) */}
                  {isInstallable && (
                    <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                            Ready for 1-Click Install
                          </p>
                          <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                            Install directly as a native Android app
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={install}
                          className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs transition-colors flex items-center gap-1.5"
                        >
                          <Download className="w-3.5 h-3.5" />
                          Install Now
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Share on WhatsApp */}
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`OM ENTERPRISES Live Shop Portal: ${liveUrl}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Send Link to My Android WhatsApp
                  </a>
                </div>
              </div>

              {/* Step by Step Android Install Instructions */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-800">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                  <Smartphone className="w-4 h-4 text-indigo-500" />
                  How to Install on Android in 10 Seconds
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
                      1
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white">Scan or Open URL</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Open Chrome or Samsung Internet on your phone.
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
                      2
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white">Tap "Install App"</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Click the prompt or Chrome menu (⋮) → "Add to Home screen".
                    </p>
                  </div>
                  <div className="p-3 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 font-bold inline-flex items-center justify-center text-[11px] mb-1.5">
                      3
                    </span>
                    <p className="font-semibold text-slate-900 dark:text-white">Native Android APK</p>
                    <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                      Android builds the native WebAPK in your app drawer!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Android APK Package (PWABuilder / Standalone APK) */}
          {activeTab === 'apk' && (
            <div className="space-y-6">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-800 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm">
                    Two Methods for Android APK
                  </h4>
                  <p className="text-xs text-indigo-700 dark:text-indigo-300 mt-1 leading-relaxed">
                    <strong>Method A (Instant WebAPK)</strong>: Open the URL in Android Chrome and tap "Install". Google Play Services automatically signs and installs a real native APK package on your phone.<br />
                    <strong>Method B (Standalone Signed .APK File)</strong>: Package into a distributable `.apk` file using PWABuilder (free, official Microsoft tool) for offline sideloading.
                  </p>
                </div>
              </div>

              {/* PWABuilder Flow */}
              <div className="p-5 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <h5 className="font-bold text-sm text-slate-900 dark:text-white">
                      Build Standalone Signed .APK File
                    </h5>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                    Free & No Coding Needed
                  </span>
                </div>

                <div className="space-y-3 text-xs text-slate-600 dark:text-slate-400">
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">1.</span>
                    <p>
                      Copy your shop URL: <code className="px-1.5 py-0.5 bg-slate-200 dark:bg-slate-700 rounded font-mono text-[11px] text-slate-800 dark:text-slate-200">{liveUrl}</code>
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">2.</span>
                    <p>
                      Go to <a href="https://www.pwabuilder.com" target="_blank" rel="noopener noreferrer" className="text-indigo-600 dark:text-indigo-400 underline font-semibold inline-flex items-center gap-1">PWABuilder.com <ExternalLink className="w-3 h-3" /></a> and paste the URL.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">3.</span>
                    <p>
                      Click <strong>Package for Android</strong>. PWABuilder will package the configured manifest, service worker, and 512x512 maskable icons into a signed <code>OM_ENTERPRISES.apk</code> file.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">4.</span>
                    <p>
                      Transfer the <code>.apk</code> to any Android phone and tap to install!
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 pt-2">
                  <a
                    href={`https://www.pwabuilder.com?url=${encodeURIComponent(liveUrl)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Open PWABuilder with Shop URL
                  </a>
                  <button
                    type="button"
                    onClick={handleExportBackupFile}
                    className="py-2.5 px-4 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-2 transition-colors"
                  >
                    <HardDriveDownload className="w-3.5 h-3.5" />
                    Download Backup JSON
                  </button>
                </div>
              </div>

              {/* Package Manifest Specifications */}
              <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <h6 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                  APK Manifest Configuration
                </h6>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  <div>Package Name: <span className="text-slate-900 dark:text-white font-semibold">com.omenterprises.cms</span></div>
                  <div>App Title: <span className="text-slate-900 dark:text-white font-semibold">OM ENTERPRISES</span></div>
                  <div>Short Name: <span className="text-slate-900 dark:text-white font-semibold">OM CMS</span></div>
                  <div>Display Mode: <span className="text-slate-900 dark:text-white font-semibold">Standalone (Native)</span></div>
                  <div>Theme Color: <span className="text-slate-900 dark:text-white font-semibold">#0F172A (Deep Slate)</span></div>
                  <div>Icons: <span className="text-slate-900 dark:text-white font-semibold">192x192, 512x512 Maskable</span></div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Remote Data Sync */}
          {activeTab === 'sync' && (
            <div className="space-y-6">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
                <Wifi className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-bold text-emerald-900 dark:text-emerald-200 text-sm">
                    Two-Way Remote Shop Sync
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1 leading-relaxed">
                    When you are outside the shop, you can review live transactions, change distributor payment statuses (e.g., mark Pending to Settled), and record new transactions. Sync tokens allow you to seamlessly transfer the exact database between your shop PC and your phone.
                  </p>
                </div>
              </div>

              {/* Status Message */}
              {syncStatusMsg && (
                <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 rounded-lg text-xs font-semibold text-indigo-900 dark:text-indigo-200 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{syncStatusMsg}</span>
                </div>
              )}

              {/* Generate Sync Code / Export */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    Step 1: Export Current Shop State
                  </h5>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    {transactions.length} txns • {distributorPayments.length} distributor records
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Generate a compact sync code containing your latest ledger, distributor payments, and daily master sheet.
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCopySyncPayload}
                    className="flex-1 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {copiedSyncCode ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    {copiedSyncCode ? 'Sync Code Copied to Clipboard!' : 'Copy Full Shop Sync Code'}
                  </button>
                  <button
                    type="button"
                    onClick={handleExportBackupFile}
                    title="Download JSON File"
                    className="py-2 px-3 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-lg flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download JSON</span>
                  </button>
                </div>
              </div>

              {/* Import Sync Code */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
                <h5 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Step 2: Import & Restore on Phone
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  Paste the sync code here to instantly load the shop's ledger on this phone or browser.
                </p>
                <div className="space-y-2">
                  <textarea
                    rows={3}
                    placeholder="Paste sync code or JSON here..."
                    value={syncCodeInput}
                    onChange={(e) => setSyncCodeInput(e.target.value)}
                    className="w-full p-2.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-slate-800 dark:text-slate-200"
                  />
                  <button
                    type="button"
                    onClick={handleApplySyncCode}
                    className="py-2 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    Import & Update Ledger
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>OM ENTERPRISES Mobile Gateway Online</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
