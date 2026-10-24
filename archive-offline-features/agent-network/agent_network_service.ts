/**
 * Physical Agent Network & Cash Distribution Logistics Service
 * Relocated from active codebase to archive-offline-features/agent-network/
 * Handles physical location tracking assets, cash reserve floats,
 * and distribution calculations.
 */

export interface PhysicalAgentLocation {
  code: string;
  name: string;
  nameMm: string;
  township: string;
  townshipMm: string;
  latitude?: number;
  longitude?: number;
  distanceKm: number;
  distanceLabel: string;
  phone: string;
  floatStatus: 'High' | 'Medium' | 'Low';
  floatStatusMm: string;
  cashReserveAkd: number;
  isOpen: boolean;
  commissionBps: number; // e.g. 150 = 1.5%
}

/**
 * Calculate cash distribution float status from physical cash reserves
 */
export function evaluateAgentFloatStatus(cashReserveAkd: number): {
  floatStatus: 'High' | 'Medium' | 'Low';
  floatStatusMm: string;
} {
  if (cashReserveAkd >= 30000) {
    return { floatStatus: 'High', floatStatusMm: 'ငွေသားအလုံအလောက်ရှိ' };
  } else if (cashReserveAkd >= 10000) {
    return { floatStatus: 'Medium', floatStatusMm: 'ငွေသားသင့်တင့်စွာရှိ' };
  } else {
    return { floatStatus: 'Low', floatStatusMm: 'ငွေသားအနည်းငယ်သာရှိ' };
  }
}

/**
 * Calculate agent cash-out commission distribution
 */
export function calculateCashDistributionCommission(
  withdrawalAmount: number,
  commissionBps = 150
): {
  netDisbursement: number;
  agentFee: number;
  protocolFee: number;
  effectiveRatePercent: number;
} {
  const totalFee = (withdrawalAmount * commissionBps) / 10000;
  const agentFee = totalFee * 0.8; // 80% to physical counter agent
  const protocolFee = totalFee * 0.2; // 20% to treasury reserve
  const netDisbursement = withdrawalAmount - totalFee;

  return {
    netDisbursement,
    agentFee,
    protocolFee,
    effectiveRatePercent: commissionBps / 100,
  };
}

/**
 * Sort agents by physical location distance from user coordinates
 */
export function sortNearbyAgents(
  userLat: number,
  userLng: number,
  agents: Array<PhysicalAgentLocation & { latitude: number; longitude: number }>
): PhysicalAgentLocation[] {
  // Haversine formula for distance calculation in kilometers
  const toRad = (x: number) => (x * Math.PI) / 180;
  return [...agents].sort((a, b) => {
    const dLatA = toRad(a.latitude - userLat);
    const dLonA = toRad(a.longitude - userLng);
    const distA =
      Math.sin(dLatA / 2) ** 2 +
      Math.cos(toRad(userLat)) * Math.cos(toRad(a.latitude)) * Math.sin(dLonA / 2) ** 2;

    const dLatB = toRad(b.latitude - userLat);
    const dLonB = toRad(b.longitude - userLng);
    const distB =
      Math.sin(dLatB / 2) ** 2 +
      Math.cos(toRad(userLat)) * Math.cos(toRad(b.latitude)) * Math.sin(dLonB / 2) ** 2;

    return distA - distB;
  });
}

/**
 * Fetch physical agents directory directly from Supabase
 * (Archived from pethar-wallet/src/services/walletDatabase.ts)
 */
export async function fetchAgentsFromDb(supabaseClient?: any): Promise<PhysicalAgentLocation[]> {
  try {
    if (!supabaseClient) return [];
    const { data, error } = await supabaseClient
      .from('agents')
      .select('*')
      .order('agent_code', { ascending: true });

    if (error) {
      console.warn('Supabase fetch agents warning:', error.message);
      return [];
    }
    return (data || []).map((row: any) => {
      const reserve = parseFloat(row.cash_reserve_akd || 50000);
      const floatEval = evaluateAgentFloatStatus(reserve);
      return {
        code: row.agent_code,
        name: row.display_name,
        nameMm: row.display_name_mm || row.display_name,
        township: row.township,
        townshipMm: row.township_mm || row.township,
        distanceKm: parseFloat(row.distance || '1.0'),
        distanceLabel: `${row.distance || '1.0 km'}`,
        phone: row.phone,
        floatStatus: floatEval.floatStatus,
        floatStatusMm: floatEval.floatStatusMm,
        cashReserveAkd: reserve,
        isOpen: row.is_open ?? true,
        commissionBps: row.commission_bps || 150,
      };
    });
  } catch (err) {
    console.error('Error fetching agents from Supabase:', err);
    return [];
  }
}
