export type TransactionCategory =
  | 'MONEY_TRANSFER'
  | 'RECHARGE'
  | 'ACCESSORIES'
  | 'BBPS_BILL'
  | 'REDEEM_CODE'
  | 'CMS_DEPOSIT' // Zomato / Swiggy Cash Deposit
  | 'AEPS' // Aadhaar Enabled Payment System
  | 'EXTERNAL_JAMA' // Inflow cash/UPI deposit
  | 'EXTERNAL_DEBIT'; // Outflow / shop expenses / distributor cash

export type DmtPortal = 'GO_PAYMENTS' | 'THE_SIMPLE_PAY' | 'VD_PAYS' | 'AIRTEL_CMS' | 'ONE_STOP' | 'AIRPAY';

export type TelecomOperator = 'AIRTEL' | 'JIO' | 'VI' | 'BSNL' | 'TATAPLAY' | 'AIRTEL_D2H';

export type PaymentMethod = 'CASH' | 'UPI' | 'SPLIT' | 'WALLET';

export type DenominationMap = {
  [key in '2000' | '500' | '200' | '100' | '50' | '20' | '10' | '5' | '2' | '1' | 'coins']: number;
};

export interface Transaction {
  id: string;
  timestamp: string; // ISO string e.g. 2026-10-25T11:45:00
  timeFormatted: string; // e.g. "11:45 AM"
  dateFormatted: string; // e.g. "25-10-2026"
  category: TransactionCategory;
  
  // Party / Reference
  customerPhone?: string;
  customerName?: string;
  referenceId: string; // RRN / Txn ID
  
  // Specific details
  portal?: DmtPortal;
  operator?: TelecomOperator;
  serviceDetail?: string; // e.g. "Zomato Rider ID: 498213", "Electricity Bill - MSEDCL", "Boat Type-C Cable"
  sourcePortal?: string; // e.g. "Go Payments API", "Jio POS", "Airtel Mitra"
  
  // Financial amounts
  amount: number; // Face value of transaction
  customerFee: number; // Surcharge charged to customer
  totalCollected: number; // amount + customerFee
  distributorCost: number; // What the portal deducted from retailer
  distributorCommission: number; // Direct cash back / incentive
  netProfit: number; // Calculated profit on this specific transaction!
  
  // Payment & Cash handling
  paymentMethod: PaymentMethod;
  cashAccepted?: number;
  cashGivenBack?: number;
  upiAccepted?: number;
  cashDenominationsAccepted?: Partial<DenominationMap>;
  cashDenominationsGiven?: Partial<DenominationMap>;
  
  status: 'SUCCESS' | 'PENDING' | 'FAILED' | 'RECONCILED';
  notes?: string;
}

// Dedicated Distributor Payment Tracking (Money Transfer vs Retail Accessories)
export type DistributorCategoryType = 'MONEY_TRANSFER' | 'RETAIL_ACCESSORIES';
export type DistributorPaymentStatus = 'Pending' | 'Settled' | 'Failed';

export interface DistributorPaymentItem {
  id: string;
  date: string; // e.g. "2026-10-25"
  distributorCategory: DistributorCategoryType;
  distributorName: string;
  amount: number;
  purpose: string; // e.g. "Wallet Top-up for DMT rush", "Purchase of 50 Fast Chargers Inv #89"
  paymentMode: 'CASH_HANDOVER' | 'BANK_NEFT_IMPS' | 'UPI' | 'CHEQUE';
  status: DistributorPaymentStatus;
  referenceNumber: string; // UTR / Voucher No
  timestamp: string;
  settledAt?: string;
  notes?: string;
}

// Master Daily Ledger Sheet (matches Image 1: image_b0c15e54.png)
export interface DailyMasterRow {
  date: string; // e.g. "25-10-2026"
  oppCash: number; // Opening Cash in drawer
  moneySales: number; // DMT Sales
  shreeDemo: number; // Shree Demo Recharge Sales
  sanjayDemo: number; // Sanjay Demo Recharge Sales
  accessories: number; // Accessories Sales
  redeem: number; // Google Play / Redeem code sales
  vibhaJama: number; // Vibha Jama
  otherJama: number; // Other deposits
  totalBusiness: number; // Total Inflow / Business
  moneyPay: number; // Cash given to DMT distributors
  airtelPay: number; // Airtel payments
  debitOther: number; // External Debits
  demoPay: number; // Cash given to recharge distributors
  otherPay: number; // Other expenses
  rohitCms: number; // Rohit CMS handover
  closingCash: number; // Physical Closing Cash
  profitOrLoss: number; // Net Profit or Loss for the day
  reconciled: boolean;
}

// DMT Portals Sheet (matches Image 2: image_64212559.png)
export interface DmtPortalDailyRow {
  date: string;
  oneStopOpp: number;
  airtelOpp: number;
  otherOpp: number;
  goOpp: number;
  airpayOpp: number;
  oneStopAdd: number;
  airtelAdd: number;
  tspAdd: number;
  goAdd: number;
  airpayAdd: number;
  vdAdd: number;
  closingOneStop: number;
  closingAirtel: number;
  closingTsp: number;
  closingGo: number;
  closingAirpay: number;
  closingVd: number;
  oneStopSales: number;
  airtelSales: number;
  tspSales: number;
  goSales: number;
  airpaySales: number;
  vdSales: number;
  totalSales: number;
}

// LAPU Recharges Sheet (matches Image 3 & 4: image_014ea637.png & image_a6e26a45.png)
export interface LapuOperatorRow {
  date: string;
  demoAccount: 'SHREE_DEMO' | 'SANJAY_DEMO';
  jioOpp: number;
  airtelOpp: number;
  viOpp: number;
  bsnlOpp: number;
  d2hOpp: number;
  tataOpp: number;
  jioAdd: number;
  airtelAdd: number;
  viAdd: number;
  bsnlAdd: number;
  d2hAdd: number;
  tataAdd: number;
  jioClosing: number;
  airtelClosing: number;
  viClosing: number;
  bsnlClosing: number;
  d2hClosing: number;
  tataClosing: number;
  jioSales: number;
  airtelSales: number;
  viSales: number;
  bsnlSales: number;
  d2hSales: number;
  tataSales: number;
  totalSales: number;
}

// Portal & LAPU API Credential Configuration
export interface PortalApiCredential {
  portalId: string;
  name: string;
  category: 'DMT' | 'TELECOM_LAPU';
  loginId: string;
  apiKey: string;
  secretOrPin: string;
  terminalCode?: string;
  isConnected: boolean;
  autoSync: boolean;
  lastSyncTime?: string;
  balance?: number;
}
