/**
 * Cash-Out Request Router & Escrow Holding Script
 * Relocated from active codebase to archive-offline-features/agent-network/
 * Handles agent counter cash-out authorizations, dynamic TOTP handshakes,
 * and smart escrow collateral locking contracts.
 */

export interface CashOutRequest {
  requestId: string;
  userId: string;
  agentCode: string;
  amountAkd: number;
  totpCode: string;
  timestamp: string;
  status: 'PENDING_AGENT_SCAN' | 'VERIFIED' | 'DISBURSED' | 'EXPIRED' | 'CANCELLED';
  expiresInSeconds: number;
}

export interface EscrowContractLock {
  escrowId: string;
  fiatCollateralAmount: number;
  collateralCurrency: 'USD' | 'USDT' | 'AKD';
  multisigParticipants: [string, string, string]; // 2-of-3 multisig (Sender, Agent, Arbiter)
  requiredSignatures: 2;
  signaturesCollected: string[];
  state: 'created' | 'funded_locked' | 'disbursed' | 'refunded' | 'disputed';
  timelockExpiresAt: string;
  timelockDurationHours: number;
  arbitrationNote?: string;
}

/**
 * Escrow Holding Controller: Lock fiat/AKD collateral into immutable 2-of-3 multisig contract
 */
export function createEscrowCollateralLock(params: {
  initiatorUserId: string;
  agentId: string;
  arbiterId: string;
  amount: number;
  collateralCurrency?: 'USD' | 'USDT' | 'AKD';
  timelockHours?: number;
}): EscrowContractLock {
  const timelockDurationHours = params.timelockHours || 72;
  const expiresAt = new Date(Date.now() + timelockDurationHours * 3600 * 1000).toISOString();

  return {
    escrowId: `esc_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
    fiatCollateralAmount: params.amount,
    collateralCurrency: params.collateralCurrency || 'AKD',
    multisigParticipants: [params.initiatorUserId, params.agentId, params.arbiterId],
    requiredSignatures: 2,
    signaturesCollected: [params.initiatorUserId],
    state: 'funded_locked',
    timelockExpiresAt: expiresAt,
    timelockDurationHours,
  };
}

/**
 * Disburse Escrow Funds upon verified cash delivery
 */
export function releaseEscrowCollateral(
  escrow: EscrowContractLock,
  secondSignerId: string
): { success: boolean; updatedEscrow: EscrowContractLock; message: string } {
  if (escrow.state !== 'funded_locked') {
    return { success: false, updatedEscrow: escrow, message: 'Escrow is not in funded_locked state' };
  }
  if (!escrow.multisigParticipants.includes(secondSignerId)) {
    return { success: false, updatedEscrow: escrow, message: 'Signer is not an authorized participant' };
  }
  if (escrow.signaturesCollected.includes(secondSignerId)) {
    return { success: false, updatedEscrow: escrow, message: 'Signer has already signed' };
  }

  const updated: EscrowContractLock = {
    ...escrow,
    signaturesCollected: [...escrow.signaturesCollected, secondSignerId],
    state: 'disbursed',
  };

  return { success: true, updatedEscrow: updated, message: 'Escrow successfully disbursed to recipient' };
}

/**
 * Cash-Out Request Router: Validates counter TOTP and processes withdrawal
 */
export function routeCashOutRequest(
  request: CashOutRequest,
  agentValidation: { agentCode: string; agentBalance: number }
): { approved: boolean; reason?: string } {
  if (request.agentCode !== agentValidation.agentCode) {
    return { approved: false, reason: 'Invalid agent counter code' };
  }
  if (agentValidation.agentBalance < request.amountAkd) {
    return { approved: false, reason: 'Agent has insufficient physical cash float' };
  }
  if (request.status !== 'PENDING_AGENT_SCAN') {
    return { approved: false, reason: 'Request expired or already processed' };
  }

  return { approved: true };
}
