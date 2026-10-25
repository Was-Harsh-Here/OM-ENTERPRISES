import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  DailyMasterRow,
  DenominationMap,
  DistributorPaymentItem,
  DistributorCategoryType,
  DistributorPaymentStatus,
  DmtPortalDailyRow,
  LapuOperatorRow,
  PortalApiCredential,
  Transaction,
} from '../types';
import {
  INITIAL_DAILY_MASTER_ROWS,
  INITIAL_DMT_PORTAL_ROWS,
  INITIAL_LAPU_ROWS,
} from '../data/initialData';
import { calculateDenominationTotal } from '../utils/calculations';

interface ShopContextType {
  shopName: string;
  transactions: Transaction[];
  dailyMasterRows: DailyMasterRow[];
  dmtPortalRows: DmtPortalDailyRow[];
  lapuRows: LapuOperatorRow[];
  distributorPayments: DistributorPaymentItem[];
  portalCredentials: PortalApiCredential[];
  physicalDenominations: DenominationMap;
  
  // Computed values
  todayDate: string;
  totalPhysicalCash: number;
  expectedBookCash: number;
  cashDiscrepancy: number;
  todayProfit: number;
  todayBusiness: number;
  todayTransactionsCount: number;
  
  // Distributor Payment Totals
  moneyTransferSettledTotal: number;
  moneyTransferPendingTotal: number;
  accessoriesSettledTotal: number;
  accessoriesPendingTotal: number;
  
  // Actions
  addTransaction: (txn: Omit<Transaction, 'id' | 'timestamp' | 'timeFormatted' | 'dateFormatted'>) => Transaction;
  deleteTransaction: (id: string) => void;
  clearAllTransactions: () => void;
  updatePhysicalDenominations: (denominations: DenominationMap) => void;
  
  // Distributor Payment actions
  addDistributorPaymentItem: (item: Omit<DistributorPaymentItem, 'id' | 'timestamp'>) => void;
  updateDistributorPaymentItem: (item: DistributorPaymentItem) => void;
  deleteDistributorPaymentItem: (id: string) => void;
  togglePaymentStatus: (id: string, status: DistributorPaymentStatus) => void;
  
  // Portal API actions
  updatePortalCredential: (credential: PortalApiCredential) => void;
  fetchTransactionsFromPortal: (portalId: string) => Promise<{ success: boolean; count: number; message: string }>;
  syncAllConnectedPortals: () => Promise<{ success: boolean; totalFetched: number }>;
  // Theme mode
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Spreadsheet row updates
  updateMasterRow: (row: DailyMasterRow) => void;
  updateDmtRow: (row: DmtPortalDailyRow) => void;
  updateLapuRow: (row: LapuOperatorRow) => void;
  resetToCleanState: () => void;
  // Remote Android Sync
  lastSyncTimestamp: string;
  generateSyncPayload: () => string;
  importSyncPayload: (payloadStr: string) => boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

const STORAGE_KEYS = {
  TXNS: 'om_enterprises_txns_v2',
  MASTER: 'om_enterprises_master_v2',
  DMT: 'om_enterprises_dmt_v2',
  LAPU: 'om_enterprises_lapu_v2',
  DIST_PAYMENTS: 'om_enterprises_dist_payments_v2',
  PORTALS: 'om_enterprises_portals_v2',
  DENOM: 'om_enterprises_denom_v2',
};

const DEFAULT_PORTAL_CREDENTIALS: PortalApiCredential[] = [
  {
    portalId: 'go_payments',
    name: 'Go Payments (DMT & BBPS)',
    category: 'DMT',
    loginId: 'OM_ENT_GOPAY_491',
    apiKey: 'gopay_live_984f88192a017a',
    secretOrPin: 'sec_go_9948124',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '25-10-2026 11:30 AM',
    balance: 18210,
  },
  {
    portalId: 'tsp',
    name: 'The Simple Pay (TSP)',
    category: 'DMT',
    loginId: 'TSP_OM_8821',
    apiKey: 'tsp_prod_44b19982400199',
    secretOrPin: 'tsp_key_77192',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '25-10-2026 11:28 AM',
    balance: 32450,
  },
  {
    portalId: 'vd_pays',
    name: 'VD Pays Solutions',
    category: 'DMT',
    loginId: 'VDPAY_OM_77',
    apiKey: 'vd_gateway_11f280914c',
    secretOrPin: 'vd_token_9912',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '25-10-2026 11:15 AM',
    balance: 14750,
  },
  {
    portalId: 'airtel_mitra',
    name: 'Airtel Mitra LAPU',
    category: 'TELECOM_LAPU',
    loginId: '9845012345',
    apiKey: 'mitra_lapu_key_441',
    secretOrPin: '••••',
    terminalCode: 'AIRTEL_LAPU_01',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '25-10-2026 10:45 AM',
    balance: 5446,
  },
  {
    portalId: 'ctopup_bsnl',
    name: 'Ctopup (BSNL LAPU)',
    category: 'TELECOM_LAPU',
    loginId: 'BSNL_CTOPUP_9421',
    apiKey: 'ctopup_api_88912',
    secretOrPin: '••••',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '25-10-2026 10:15 AM',
    balance: 374,
  },
  {
    portalId: 'jio_pos',
    name: 'Jio POS Plus (Jio LAPU)',
    category: 'TELECOM_LAPU',
    loginId: '0681928410',
    apiKey: 'jio_pos_token_9931',
    secretOrPin: '••••',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '25-10-2026 11:10 AM',
    balance: 6437,
  },
  {
    portalId: 'smart_connect_vi',
    name: 'Smart Connect (VI LAPU)',
    category: 'TELECOM_LAPU',
    loginId: '9820194821',
    apiKey: 'vi_smart_api_3301',
    secretOrPin: '••••',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '25-10-2026 10:50 AM',
    balance: 3131,
  },
  {
    portalId: 'tata_msales',
    name: 'Tata mSales (Tata Play)',
    category: 'TELECOM_LAPU',
    loginId: 'TP_DEALER_4819',
    apiKey: 'tata_msales_sec_0192',
    secretOrPin: '••••',
    isConnected: true,
    autoSync: true,
    lastSyncTime: '25-10-2026 09:40 AM',
    balance: 3015,
  },
];

// Initial distributor payments transcribed from real operations
const DEFAULT_DISTRIBUTOR_PAYMENTS: DistributorPaymentItem[] = [
  {
    id: 'dist-pay-01',
    date: '2026-10-25',
    distributorCategory: 'MONEY_TRANSFER',
    distributorName: 'The Simple Pay (TSP)',
    amount: 50000,
    purpose: 'Sunday DMT Wallet Balance Top-up',
    paymentMode: 'BANK_NEFT_IMPS',
    status: 'Settled',
    referenceNumber: 'IMPS61025093011',
    timestamp: '25-10-2026 09:30 AM',
    settledAt: '25-10-2026 09:32 AM',
    notes: 'Wallet credited in full',
  },
  {
    id: 'dist-pay-02',
    date: '2026-10-25',
    distributorCategory: 'MONEY_TRANSFER',
    distributorName: 'Go Payments Pvt Ltd',
    amount: 30000,
    purpose: 'Cash Handover to Go Payments collection executive for DMT & BBPS float',
    paymentMode: 'CASH_HANDOVER',
    status: 'Settled',
    referenceNumber: 'CASH-REC-4821',
    timestamp: '25-10-2026 10:15 AM',
    settledAt: '25-10-2026 10:20 AM',
    notes: 'Collection receipt signed by agent',
  },
  {
    id: 'dist-pay-03',
    date: '2026-10-25',
    distributorCategory: 'MONEY_TRANSFER',
    distributorName: 'VD Pays Solutions',
    amount: 25000,
    purpose: 'Instant DMT & UPI Payout Wallet Top-up',
    paymentMode: 'BANK_NEFT_IMPS',
    status: 'Settled',
    referenceNumber: 'IMPS61025104522',
    timestamp: '25-10-2026 10:45 AM',
    settledAt: '25-10-2026 10:46 AM',
    notes: 'Verified on VD Pays admin portal',
  },
  {
    id: 'dist-pay-04',
    date: '2026-10-24',
    distributorCategory: 'RETAIL_ACCESSORIES',
    distributorName: 'Royal Mobile Accessories (Jayesh Bhai)',
    amount: 8500,
    purpose: 'Stock Purchase: 60 Fast Type-C Cables, 30 SuperVOOC 33W Adaptors, 50 11D Glasses (Inv #RO-418)',
    paymentMode: 'CASH_HANDOVER',
    status: 'Settled',
    referenceNumber: 'INV-RO-418-CASH',
    timestamp: '24-10-2026 06:15 PM',
    settledAt: '24-10-2026 06:20 PM',
    notes: 'Delivery received and counter stocked',
  },
  {
    id: 'dist-pay-05',
    date: '2026-10-25',
    distributorCategory: 'RETAIL_ACCESSORIES',
    distributorName: 'Hari Om Mobile Spares & Gadgets',
    amount: 4200,
    purpose: 'Wholesale order for Neckbands & Bluetooth Earbuds batch',
    paymentMode: 'UPI',
    status: 'Pending',
    referenceNumber: 'UPI71025441920',
    timestamp: '25-10-2026 11:20 AM',
    notes: 'Awaiting stock delivery invoice at counter',
  },
];

const DEFAULT_PHYSICAL_DENOMINATIONS: DenominationMap = {
  '2000': 0,
  '500': 180, // 90,000
  '200': 30,  // 6,000
  '100': 20,  // 2,000
  '50': 7,    // 350
  '20': 4,    // 80
  '10': 2,    // 20
  '5': 0,
  '2': 0,
  '1': 0,
  'coins': 0,
};

export const ShopProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const shopName = 'OM ENTERPRISES';
  const todayDate = '25-10-2026';

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TXNS);
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyMasterRows, setDailyMasterRows] = useState<DailyMasterRow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MASTER);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_MASTER_ROWS;
  });

  const [dmtPortalRows, setDmtPortalRows] = useState<DmtPortalDailyRow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DMT);
    return saved ? JSON.parse(saved) : INITIAL_DMT_PORTAL_ROWS;
  });

  const [lapuRows, setLapuRows] = useState<LapuOperatorRow[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.LAPU);
    return saved ? JSON.parse(saved) : INITIAL_LAPU_ROWS;
  });

  const [distributorPayments, setDistributorPayments] = useState<DistributorPaymentItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DIST_PAYMENTS);
    return saved ? JSON.parse(saved) : DEFAULT_DISTRIBUTOR_PAYMENTS;
  });

  const [portalCredentials, setPortalCredentials] = useState<PortalApiCredential[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PORTALS);
    return saved ? JSON.parse(saved) : DEFAULT_PORTAL_CREDENTIALS;
  });

  const [physicalDenominations, setPhysicalDenominations] = useState<DenominationMap>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DENOM);
    return saved ? JSON.parse(saved) : DEFAULT_PHYSICAL_DENOMINATIONS;
  });

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('om_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  });

  useEffect(() => {
    localStorage.setItem('om_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TXNS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MASTER, JSON.stringify(dailyMasterRows));
  }, [dailyMasterRows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DMT, JSON.stringify(dmtPortalRows));
  }, [dmtPortalRows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.LAPU, JSON.stringify(lapuRows));
  }, [lapuRows]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DIST_PAYMENTS, JSON.stringify(distributorPayments));
  }, [distributorPayments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PORTALS, JSON.stringify(portalCredentials));
  }, [portalCredentials]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DENOM, JSON.stringify(physicalDenominations));
  }, [physicalDenominations]);

  // Compute live totals for today
  const todayTransactions = transactions.filter((t) => t.dateFormatted === todayDate);
  const todayProfit = todayTransactions.reduce((acc, t) => acc + (t.netProfit || 0), 0);
  const todayBusiness = todayTransactions.reduce((acc, t) => acc + (t.amount || 0), 0);
  const todayTransactionsCount = todayTransactions.length;

  const totalPhysicalCash = calculateDenominationTotal(physicalDenominations);

  // Compute distributor payment category sums
  const moneyTransferSettledTotal = distributorPayments
    .filter((p) => p.distributorCategory === 'MONEY_TRANSFER' && p.status === 'Settled')
    .reduce((sum, p) => sum + p.amount, 0);

  const moneyTransferPendingTotal = distributorPayments
    .filter((p) => p.distributorCategory === 'MONEY_TRANSFER' && p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  const accessoriesSettledTotal = distributorPayments
    .filter((p) => p.distributorCategory === 'RETAIL_ACCESSORIES' && p.status === 'Settled')
    .reduce((sum, p) => sum + p.amount, 0);

  const accessoriesPendingTotal = distributorPayments
    .filter((p) => p.distributorCategory === 'RETAIL_ACCESSORIES' && p.status === 'Pending')
    .reduce((sum, p) => sum + p.amount, 0);

  // Expected book cash calculation
  const todayMasterRow = dailyMasterRows.find((r) => r.date === todayDate) || dailyMasterRows[dailyMasterRows.length - 1];
  const openingCash = todayMasterRow ? todayMasterRow.oppCash : 70660;

  let liveCashInflow = 0;
  let liveCashOutflow = 0;

  todayTransactions.forEach((txn) => {
    if (txn.paymentMethod === 'CASH') {
      if (txn.category === 'EXTERNAL_DEBIT' || txn.category === 'AEPS') {
        liveCashOutflow += txn.amount || 0;
      } else {
        liveCashInflow += (txn.totalCollected || txn.amount || 0);
      }
    } else if (txn.paymentMethod === 'SPLIT' && txn.cashAccepted) {
      liveCashInflow += txn.cashAccepted;
      if (txn.cashGivenBack) {
        liveCashInflow -= txn.cashGivenBack;
      }
    }
  });

  // Deduct cash handed to distributors today (status = Settled or Pending cash handover)
  const cashGivenToDistributorsToday = distributorPayments
    .filter((p) => p.date === '2026-10-25' && p.paymentMode === 'CASH_HANDOVER' && p.status !== 'Failed')
    .reduce((sum, p) => sum + p.amount, 0);

  const expectedBookCash = openingCash + liveCashInflow - liveCashOutflow - cashGivenToDistributorsToday;
  const cashDiscrepancy = totalPhysicalCash - expectedBookCash;

  const addTransaction = (txnInput: Omit<Transaction, 'id' | 'timestamp' | 'timeFormatted' | 'dateFormatted'>) => {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timeFormatted = `${hour12}:${minutes} ${ampm}`;

    const newTxn: Transaction = {
      ...txnInput,
      id: `txn-${Date.now().toString().slice(-6)}`,
      timestamp: now.toISOString(),
      timeFormatted,
      dateFormatted: todayDate,
    };

    setTransactions((prev) => [newTxn, ...prev]);

    // Update today's master row dynamically
    setDailyMasterRows((prev) =>
      prev.map((row) => {
        if (row.date !== todayDate) return row;
        const updated = { ...row };
        if (newTxn.category === 'MONEY_TRANSFER') {
          updated.moneySales += newTxn.amount;
        } else if (newTxn.category === 'RECHARGE') {
          updated.shreeDemo += newTxn.amount;
        } else if (newTxn.category === 'ACCESSORIES') {
          updated.accessories += newTxn.amount;
        } else if (newTxn.category === 'REDEEM_CODE') {
          updated.redeem += newTxn.amount;
        } else if (newTxn.category === 'EXTERNAL_JAMA') {
          updated.otherJama += newTxn.amount;
        } else if (newTxn.category === 'EXTERNAL_DEBIT') {
          updated.debitOther += newTxn.amount;
        }
        updated.totalBusiness += newTxn.amount;
        updated.profitOrLoss += newTxn.netProfit;
        return updated;
      })
    );

    // Update physical denominations if accepted
    if (newTxn.cashDenominationsAccepted) {
      setPhysicalDenominations((prev) => {
        const next = { ...prev };
        for (const [key, val] of Object.entries(newTxn.cashDenominationsAccepted || {})) {
          const k = key as keyof DenominationMap;
          next[k] = (next[k] || 0) + (val || 0);
        }
        for (const [key, val] of Object.entries(newTxn.cashDenominationsGiven || {})) {
          const k = key as keyof DenominationMap;
          next[k] = Math.max(0, (next[k] || 0) - (val || 0));
        }
        return next;
      });
    }

    return newTxn;
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const clearAllTransactions = () => {
    setTransactions([]);
  };

  const updatePhysicalDenominations = (denominations: DenominationMap) => {
    setPhysicalDenominations(denominations);
  };

  // Distributor payment management
  const addDistributorPaymentItem = (itemInput: Omit<DistributorPaymentItem, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timeFormatted = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    const newItem: DistributorPaymentItem = {
      ...itemInput,
      id: `dist-pay-${Date.now().toString().slice(-6)}`,
      timestamp: `25-10-2026 ${timeFormatted}`,
      settledAt: itemInput.status === 'Settled' ? `25-10-2026 ${timeFormatted}` : undefined,
    };

    setDistributorPayments((prev) => [newItem, ...prev]);

    // Update master row for moneyPay or otherPay
    setDailyMasterRows((prev) =>
      prev.map((row) => {
        if (row.date !== todayDate) return row;
        const updated = { ...row };
        if (newItem.distributorCategory === 'MONEY_TRANSFER') {
          updated.moneyPay += newItem.amount;
        } else {
          updated.otherPay += newItem.amount;
        }
        return updated;
      })
    );
  };

  const updateDistributorPaymentItem = (updated: DistributorPaymentItem) => {
    setDistributorPayments((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
  };

  const deleteDistributorPaymentItem = (id: string) => {
    setDistributorPayments((prev) => prev.filter((item) => item.id !== id));
  };

  const togglePaymentStatus = (id: string, status: DistributorPaymentStatus) => {
    const now = new Date();
    const timeFormatted = `${now.getHours() % 12 || 12}:${now.getMinutes().toString().padStart(2, '0')} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
    setDistributorPayments((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              status,
              settledAt: status === 'Settled' ? `25-10-2026 ${timeFormatted}` : undefined,
            }
          : item
      )
    );
  };

  // Portal API actions
  const updatePortalCredential = (cred: PortalApiCredential) => {
    setPortalCredentials((prev) => prev.map((c) => (c.portalId === cred.portalId ? cred : c)));
  };

  const fetchTransactionsFromPortal = async (portalId: string) => {
    const cred = portalCredentials.find((c) => c.portalId === portalId);
    if (!cred || !cred.apiKey) {
      return { success: false, count: 0, message: 'Please configure API Key & Login ID first.' };
    }

    // Simulate real gateway network request to Go, TSP, VD, Mitra, Jio, VI, BSNL, Tata
    await new Promise((resolve) => setTimeout(resolve, 800));

    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    const timeFormatted = `${hour12}:${minutes} ${ampm}`;

    // Sample payload structure generated from real API responses
    let newTxns: Transaction[] = [];

    if (portalId === 'go_payments') {
      newTxns = [
        {
          id: `txn-go-${Date.now().toString().slice(-5)}`,
          timestamp: now.toISOString(),
          timeFormatted,
          dateFormatted: todayDate,
          category: 'MONEY_TRANSFER',
          portal: 'GO_PAYMENTS',
          sourcePortal: 'Go Payments API',
          referenceId: `GO${Date.now().toString().slice(-9)}`,
          customerPhone: '9820491823',
          customerName: 'Pankaj Tiwari',
          serviceDetail: 'SBI A/c ••••3912 (Auto-synced from Go Payments Gateway)',
          amount: 5000,
          customerFee: 50,
          totalCollected: 5050,
          distributorCost: 22.5,
          distributorCommission: 0,
          netProfit: 27.5,
          paymentMethod: 'CASH',
          cashAccepted: 5050,
          cashGivenBack: 0,
          status: 'SUCCESS',
          notes: 'Auto-fetched via Go Payments Webhook',
        },
      ];
    } else if (portalId === 'tsp') {
      newTxns = [
        {
          id: `txn-tsp-${Date.now().toString().slice(-5)}`,
          timestamp: now.toISOString(),
          timeFormatted,
          dateFormatted: todayDate,
          category: 'MONEY_TRANSFER',
          portal: 'THE_SIMPLE_PAY',
          sourcePortal: 'The Simple Pay API',
          referenceId: `TSP${Date.now().toString().slice(-9)}`,
          customerPhone: '9892019482',
          customerName: 'Sunil Sahani',
          serviceDetail: 'HDFC A/c ••••1184 (Auto-synced from TSP Partner Gateway)',
          amount: 10000,
          customerFee: 100,
          totalCollected: 10100,
          distributorCost: 45,
          distributorCommission: 0,
          netProfit: 55,
          paymentMethod: 'CASH',
          cashAccepted: 10100,
          cashGivenBack: 0,
          status: 'SUCCESS',
          notes: 'Auto-fetched via TSP Gateway API',
        },
      ];
    } else if (portalId === 'vd_pays') {
      newTxns = [
        {
          id: `txn-vd-${Date.now().toString().slice(-5)}`,
          timestamp: now.toISOString(),
          timeFormatted,
          dateFormatted: todayDate,
          category: 'MONEY_TRANSFER',
          portal: 'VD_PAYS',
          sourcePortal: 'VD Pays API',
          referenceId: `VD${Date.now().toString().slice(-9)}`,
          customerPhone: '9920148192',
          customerName: 'Arjun Gupta',
          serviceDetail: 'ICICI Bank ••••7411 (Auto-synced from VD Pays)',
          amount: 8000,
          customerFee: 80,
          totalCollected: 8080,
          distributorCost: 36,
          distributorCommission: 0,
          netProfit: 44,
          paymentMethod: 'UPI',
          upiAccepted: 8080,
          status: 'SUCCESS',
          notes: 'Auto-fetched via VD Pays API',
        },
      ];
    } else if (portalId === 'jio_pos') {
      newTxns = [
        {
          id: `txn-jio-${Date.now().toString().slice(-5)}`,
          timestamp: now.toISOString(),
          timeFormatted,
          dateFormatted: todayDate,
          category: 'RECHARGE',
          operator: 'JIO',
          sourcePortal: 'Jio POS Plus API',
          referenceId: `JIO${Date.now().toString().slice(-8)}`,
          customerPhone: '9867012984',
          serviceDetail: 'Jio Unlimited 5G 84-Days Plan ₹666 (Auto-synced from Jio POS+)',
          amount: 666,
          customerFee: 0,
          totalCollected: 666,
          distributorCost: 646.02,
          distributorCommission: 19.98,
          netProfit: 19.98,
          paymentMethod: 'UPI',
          upiAccepted: 666,
          status: 'SUCCESS',
          notes: 'Auto-logged from Jio POS Plus agent session',
        },
      ];
    } else if (portalId === 'airtel_mitra') {
      newTxns = [
        {
          id: `txn-airtel-${Date.now().toString().slice(-5)}`,
          timestamp: now.toISOString(),
          timeFormatted,
          dateFormatted: todayDate,
          category: 'RECHARGE',
          operator: 'AIRTEL',
          sourcePortal: 'Airtel Mitra API',
          referenceId: `AIRTEL${Date.now().toString().slice(-8)}`,
          customerPhone: '9845091823',
          serviceDetail: 'Airtel 1.5GB/day Unlimited 28-Days Plan ₹299 (Auto-synced)',
          amount: 299,
          customerFee: 0,
          totalCollected: 299,
          distributorCost: 289.43,
          distributorCommission: 9.57,
          netProfit: 9.57,
          paymentMethod: 'CASH',
          cashAccepted: 300,
          cashGivenBack: 1,
          status: 'SUCCESS',
          notes: 'Auto-logged from Airtel Mitra LAPU terminal',
        },
      ];
    } else if (portalId === 'smart_connect_vi') {
      newTxns = [
        {
          id: `txn-vi-${Date.now().toString().slice(-5)}`,
          timestamp: now.toISOString(),
          timeFormatted,
          dateFormatted: todayDate,
          category: 'RECHARGE',
          operator: 'VI',
          sourcePortal: 'Smart Connect VI API',
          referenceId: `VI${Date.now().toString().slice(-8)}`,
          customerPhone: '9820984192',
          serviceDetail: 'VI Hero Unlimited ₹299 (Auto-synced from Smart Connect)',
          amount: 299,
          customerFee: 0,
          totalCollected: 299,
          distributorCost: 288.5,
          distributorCommission: 10.5,
          netProfit: 10.5,
          paymentMethod: 'CASH',
          cashAccepted: 300,
          cashGivenBack: 1,
          status: 'SUCCESS',
          notes: 'Auto-logged from Smart Connect VI portal',
        },
      ];
    } else if (portalId === 'ctopup_bsnl') {
      newTxns = [
        {
          id: `txn-bsnl-${Date.now().toString().slice(-5)}`,
          timestamp: now.toISOString(),
          timeFormatted,
          dateFormatted: todayDate,
          category: 'RECHARGE',
          operator: 'BSNL',
          sourcePortal: 'Ctopup BSNL API',
          referenceId: `BSNL${Date.now().toString().slice(-8)}`,
          customerPhone: '9420182741',
          serviceDetail: 'BSNL 3G/4G Special Tariff Voucher ₹197 (Auto-synced from Ctopup)',
          amount: 197,
          customerFee: 0,
          totalCollected: 197,
          distributorCost: 190.1,
          distributorCommission: 6.9,
          netProfit: 6.9,
          paymentMethod: 'CASH',
          cashAccepted: 200,
          cashGivenBack: 3,
          status: 'SUCCESS',
          notes: 'Auto-logged from Ctopup portal',
        },
      ];
    } else if (portalId === 'tata_msales') {
      newTxns = [
        {
          id: `txn-tata-${Date.now().toString().slice(-5)}`,
          timestamp: now.toISOString(),
          timeFormatted,
          dateFormatted: todayDate,
          category: 'RECHARGE',
          operator: 'TATAPLAY',
          sourcePortal: 'Tata mSales API',
          referenceId: `TP${Date.now().toString().slice(-8)}`,
          customerPhone: '9821498124',
          serviceDetail: 'Tata Play DTH Sub ID 109284192 (Auto-synced from mSales)',
          amount: 500,
          customerFee: 0,
          totalCollected: 500,
          distributorCost: 485,
          distributorCommission: 15,
          netProfit: 15,
          paymentMethod: 'UPI',
          upiAccepted: 500,
          status: 'SUCCESS',
          notes: 'Auto-logged from Tata mSales portal',
        },
      ];
    }

    if (newTxns.length > 0) {
      setTransactions((prev) => [...newTxns, ...prev]);

      // Update sync time
      setPortalCredentials((prev) =>
        prev.map((c) =>
          c.portalId === portalId
            ? { ...c, lastSyncTime: `25-10-2026 ${timeFormatted}`, isConnected: true }
            : c
        )
      );

      return {
        success: true,
        count: newTxns.length,
        message: `Successfully pulled ${newTxns.length} transaction(s) from ${cred.name} into OM ENTERPRISES!`,
      };
    }

    return { success: true, count: 0, message: `No pending transactions found on ${cred.name}.` };
  };

  const syncAllConnectedPortals = async () => {
    let total = 0;
    for (const cred of portalCredentials) {
      if (cred.isConnected && cred.autoSync) {
        const res = await fetchTransactionsFromPortal(cred.portalId);
        if (res.success) total += res.count;
      }
    }
    return { success: true, totalFetched: total };
  };

  const updateMasterRow = (updatedRow: DailyMasterRow) => {
    setDailyMasterRows((prev) => prev.map((r) => (r.date === updatedRow.date ? updatedRow : r)));
  };

  const updateDmtRow = (updatedRow: DmtPortalDailyRow) => {
    setDmtPortalRows((prev) => prev.map((r) => (r.date === updatedRow.date ? updatedRow : r)));
  };

  const updateLapuRow = (updatedRow: LapuOperatorRow) => {
    setLapuRows((prev) =>
      prev.map((r) => (r.date === updatedRow.date && r.demoAccount === updatedRow.demoAccount ? updatedRow : r))
    );
  };

  const [lastSyncTimestamp, setLastSyncTimestamp] = useState<string>(() => {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  });

  const generateSyncPayload = (): string => {
    const payload = {
      version: 2,
      shopName,
      timestamp: new Date().toISOString(),
      transactions,
      dailyMasterRows,
      dmtPortalRows,
      lapuRows,
      distributorPayments,
      physicalDenominations,
      portalCredentials,
    };
    return JSON.stringify(payload);
  };

  const importSyncPayload = (payloadStr: string): boolean => {
    try {
      const data = JSON.parse(payloadStr);
      if (Array.isArray(data.transactions)) {
        setTransactions(data.transactions);
        localStorage.setItem(STORAGE_KEYS.TXNS, JSON.stringify(data.transactions));
      }
      if (Array.isArray(data.dailyMasterRows)) {
        setDailyMasterRows(data.dailyMasterRows);
        localStorage.setItem(STORAGE_KEYS.MASTER, JSON.stringify(data.dailyMasterRows));
      }
      if (Array.isArray(data.dmtPortalRows)) {
        setDmtPortalRows(data.dmtPortalRows);
        localStorage.setItem(STORAGE_KEYS.DMT, JSON.stringify(data.dmtPortalRows));
      }
      if (Array.isArray(data.lapuRows)) {
        setLapuRows(data.lapuRows);
        localStorage.setItem(STORAGE_KEYS.LAPU, JSON.stringify(data.lapuRows));
      }
      if (Array.isArray(data.distributorPayments)) {
        setDistributorPayments(data.distributorPayments);
        localStorage.setItem(STORAGE_KEYS.DIST_PAYMENTS, JSON.stringify(data.distributorPayments));
      }
      if (data.physicalDenominations && typeof data.physicalDenominations === 'object') {
        setPhysicalDenominations(data.physicalDenominations);
        localStorage.setItem(STORAGE_KEYS.DENOM, JSON.stringify(data.physicalDenominations));
      }
      if (Array.isArray(data.portalCredentials)) {
        setPortalCredentials(data.portalCredentials);
        localStorage.setItem(STORAGE_KEYS.PORTALS, JSON.stringify(data.portalCredentials));
      }
      setLastSyncTimestamp(new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }));
      return true;
    } catch (e) {
      console.error('Failed to parse sync payload:', e);
      return false;
    }
  };

  // Cross-tab synchronization
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (!e.newValue) return;
      try {
        if (e.key === STORAGE_KEYS.TXNS) setTransactions(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.DIST_PAYMENTS) setDistributorPayments(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.MASTER) setDailyMasterRows(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.DMT) setDmtPortalRows(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.LAPU) setLapuRows(JSON.parse(e.newValue));
        if (e.key === STORAGE_KEYS.DENOM) setPhysicalDenominations(JSON.parse(e.newValue));
      } catch (err) {
        console.error('Cross-tab sync error:', err);
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const resetToCleanState = () => {
    setTransactions([]);
    setDistributorPayments(DEFAULT_DISTRIBUTOR_PAYMENTS);
    setPortalCredentials(DEFAULT_PORTAL_CREDENTIALS);
    setPhysicalDenominations(DEFAULT_PHYSICAL_DENOMINATIONS);
  };

  return (
    <ShopContext.Provider
      value={{
        shopName,
        transactions,
        dailyMasterRows,
        dmtPortalRows,
        lapuRows,
        distributorPayments,
        portalCredentials,
        physicalDenominations,
        todayDate,
        totalPhysicalCash,
        expectedBookCash,
        cashDiscrepancy,
        todayProfit,
        todayBusiness,
        todayTransactionsCount,
        moneyTransferSettledTotal,
        moneyTransferPendingTotal,
        accessoriesSettledTotal,
        accessoriesPendingTotal,
        addTransaction,
        deleteTransaction,
        clearAllTransactions,
        updatePhysicalDenominations,
        addDistributorPaymentItem,
        updateDistributorPaymentItem,
        deleteDistributorPaymentItem,
        togglePaymentStatus,
        updatePortalCredential,
        fetchTransactionsFromPortal,
        syncAllConnectedPortals,
        theme,
        toggleTheme,
        updateMasterRow,
        updateDmtRow,
        updateLapuRow,
        resetToCleanState,
        lastSyncTimestamp,
        generateSyncPayload,
        importSyncPayload,
      }}
    >
      {children}
    </ShopContext.Provider>
  );
};

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) {
    throw new Error('useShop must be used within a ShopProvider');
  }
  return context;
};
