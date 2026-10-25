import { DenominationMap, Transaction, TransactionCategory, DmtPortal, TelecomOperator, IndoNepalTransferType } from '../types';

export const DENOMINATION_VALUES: { [key in keyof DenominationMap]: number } = {
  '2000': 2000,
  '500': 500,
  '200': 200,
  '100': 100,
  '50': 50,
  '20': 20,
  '10': 10,
  '5': 5,
  '2': 2,
  '1': 1,
  'coins': 1,
};

export const DENOMINATION_KEYS: (keyof DenominationMap)[] = [
  '2000',
  '500',
  '200',
  '100',
  '50',
  '20',
  '10',
  '5',
  '2',
  '1',
  'coins',
];

export function calculateDenominationTotal(counts: Partial<DenominationMap> = {}): number {
  let total = 0;
  for (const [key, val] of Object.entries(counts)) {
    const multiplier = DENOMINATION_VALUES[key as keyof DenominationMap] || 0;
    total += (val || 0) * multiplier;
  }
  return total;
}

export function formatIndianCurrency(amount: number): string {
  if (isNaN(amount)) return '₹0';
  const isNegative = amount < 0;
  const absAmount = Math.abs(amount);
  
  // Format with Indian numbering system (lakhs, crores)
  const formatted = absAmount.toLocaleString('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  });
  
  return `${isNegative ? '-' : ''}₹${formatted}`;
}

// Indo-Nepal Peg: 1 INR = 1.60 NPR (Fixed official exchange rate)
export const INR_TO_NPR_RATE = 1.60;

export function calculateNprEquivalent(inrAmount: number): number {
  return Number((inrAmount * INR_TO_NPR_RATE).toFixed(2));
}

export function formatNprCurrency(amount: number): string {
  if (isNaN(amount)) return 'NPR 0';
  return `NPR ${amount.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

export interface DefaultProfitEstimate {
  customerFee: number;
  distributorCost: number;
  distributorCommission: number;
  netProfit: number;
}

export function estimateTransactionProfit(
  category: TransactionCategory,
  amount: number,
  portal?: DmtPortal,
  operator?: TelecomOperator,
  indoNepalType: IndoNepalTransferType = 'ACCOUNT_DEPOSIT'
): DefaultProfitEstimate {
  if (amount <= 0 && category !== 'INDO_NEPAL') {
    return { customerFee: 0, distributorCost: 0, distributorCommission: 0, netProfit: 0 };
  }

  switch (category) {
    case 'INDO_NEPAL': {
      // Indo-Nepal Remittance:
      // Customer Fee: Flat ₹300 for every transaction
      // Account Deposit: Retailer gets ₹150 profit / commission
      // Cash Payout: Retailer gets ₹100 profit / commission
      const customerFee = 300;
      const isAccountDeposit = indoNepalType === 'ACCOUNT_DEPOSIT';
      const netProfit = isAccountDeposit ? 150 : 100;
      const distributorCommission = netProfit;
      const distributorCost = customerFee - netProfit; // ₹150 for deposit, ₹200 for cash payout
      return { customerFee, distributorCost, distributorCommission, netProfit };
    }

    case 'MONEY_TRANSFER': {
      // Standard Retail DMT: 1% charged to customer (min ₹10)
      const customerFee = Math.max(10, Math.round(amount * 0.01));
      // Portal cost: 0.45% (Go Payments / TSP / VD Pays typical distributor cost)
      const distributorCost = Number((amount * 0.0045).toFixed(2));
      const distributorCommission = 0;
      const netProfit = Number((customerFee - distributorCost).toFixed(2));
      return { customerFee, distributorCost, distributorCommission, netProfit };
    }

    case 'RECHARGE': {
      // Standard LAPU margin: ~3.0% on prepaid recharges
      const marginRate = operator === 'JIO' ? 0.03 : operator === 'AIRTEL' ? 0.032 : 0.035;
      const distributorCost = Number((amount * (1 - marginRate)).toFixed(2));
      const distributorCommission = Number((amount * marginRate).toFixed(2));
      const customerFee = 0; // standard face value
      const netProfit = distributorCommission;
      return { customerFee, distributorCost, distributorCommission, netProfit };
    }

    case 'ACCESSORIES': {
      // Accessories have 45% - 55% profit margin
      const costPrice = Math.round(amount * 0.48);
      const netProfit = amount - costPrice;
      return { customerFee: 0, distributorCost: costPrice, distributorCommission: 0, netProfit };
    }

    case 'BBPS_BILL': {
      // BBPS bill pay: Customer convenience fee ₹10-₹20 + BBPS commission ~₹2.5
      const customerFee = amount > 2000 ? 20 : 10;
      const distributorCommission = 2.5;
      const distributorCost = 0;
      const netProfit = customerFee + distributorCommission;
      return { customerFee, distributorCost, distributorCommission, netProfit };
    }

    case 'REDEEM_CODE': {
      // Google play redeem codes: 2.8% margin
      const distributorCost = Number((amount * 0.972).toFixed(2));
      const netProfit = Number((amount * 0.028).toFixed(2));
      return { customerFee: 0, distributorCost, distributorCommission: 0, netProfit };
    }

    case 'CMS_DEPOSIT': {
      // Zomato / Swiggy CMS Cash Deposit payout to retailer: ₹8 to ₹20 flat or 0.20%
      const payout = Math.max(8, Math.round(amount * 0.002));
      return { customerFee: 0, distributorCost: 0, distributorCommission: payout, netProfit: payout };
    }

    case 'AEPS': {
      // Aadhaar cash withdrawal commission: ~0.25% (capped around ₹10)
      const commission = Math.min(12, Math.max(3, Math.round(amount * 0.0025)));
      return { customerFee: 0, distributorCost: 0, distributorCommission: commission, netProfit: commission };
    }

    case 'EXTERNAL_JAMA':
    case 'EXTERNAL_DEBIT':
    default:
      return { customerFee: 0, distributorCost: 0, distributorCommission: 0, netProfit: 0 };
  }
}

export function exportToCsv(filename: string, headers: string[], rows: (string | number)[][]): void {
  const csvContent =
    'data:text/csv;charset=utf-8,' +
    [headers.join(','), ...rows.map((row) => row.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
  
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `${filename}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
