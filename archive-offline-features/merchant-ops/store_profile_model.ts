/**
 * Custom Enterprise Store Profiles & Vendor Transaction Matching Models
 * Relocated from active codebase to archive-offline-features/merchant-ops/
 */

export interface EnterpriseStoreProfile {
  id: string;
  merchantId: string;
  businessName: string;
  businessRegistrationNumber: string;
  taxIdentifier: string;
  township: string;
  region: string;
  contactPerson: string;
  phone: string;
  email: string;
  settlementAccount: string;
  verifiedMerchantTier: 1 | 2 | 3;
  complianceStatus: 'VERIFIED' | 'UNDER_REVIEW' | 'REVOKED';
  dailyVolumeCapAkd: number;
  cashbackProgramEnabled: boolean;
  cashbackRateBps: number;
}

export interface VendorInvoice {
  invoiceNumber: string;
  vendorId: string;
  merchantId: string;
  amountAkd: number;
  items: Array<{
    sku: string;
    description: string;
    quantity: number;
    unitPriceAkd: number;
  }>;
  dueDate: string;
  settlementStatus: 'PENDING' | 'MATCHED' | 'DISPUTED' | 'SETTLED';
}

export interface VendorTransactionMatch {
  matchId: string;
  invoiceNumber: string;
  transactionReference: string;
  ledgerTxId: string;
  matchedAmount: number;
  variance: number;
  matchTimestamp: string;
  confidenceScore: number;
  status: 'AUTO_RECONCILED' | 'MANUAL_REVIEW_REQUIRED' | 'REJECTED';
}

/**
 * Vendor transaction matching algorithm
 * Matches counterparty ledger settlements with store vendor invoices
 */
export function matchVendorTransaction(
  invoice: VendorInvoice,
  ledgerTx: { id: string; amount: number; reference: string; timestamp: string }
): VendorTransactionMatch {
  const variance = Math.abs(invoice.amountAkd - ledgerTx.amount);
  const refMatches = ledgerTx.reference.includes(invoice.invoiceNumber);

  let confidence = 0.5;
  if (variance === 0) confidence += 0.3;
  if (refMatches) confidence += 0.2;

  return {
    matchId: `match_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    invoiceNumber: invoice.invoiceNumber,
    transactionReference: ledgerTx.reference,
    ledgerTxId: ledgerTx.id,
    matchedAmount: ledgerTx.amount,
    variance,
    matchTimestamp: new Date().toISOString(),
    confidenceScore: confidence,
    status: confidence >= 0.9 ? 'AUTO_RECONCILED' : 'MANUAL_REVIEW_REQUIRED',
  };
}
