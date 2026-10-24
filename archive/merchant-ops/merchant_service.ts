/**
 * Merchant Operations & POS Terminal Service
 * Relocated from active codebase to archive-offline-features/merchant-ops/
 * Contains verified merchant management wrappers, POS terminal querying,
 * and enterprise store operational status toggles.
 */

export interface PosTerminalRecord {
  id: string;
  terminalCode: string;
  name: string;
  nameMm?: string;
  township: string;
  limit: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'DECOMMISSIONED';
  merchantUserId?: string;
}

/**
 * Fetch POS merchant terminals directly from Supabase
 * (Archived from pethar-wallet/src/services/walletDatabase.ts)
 */
export async function fetchPosTerminalsFromDb(supabaseClient?: any): Promise<PosTerminalRecord[]> {
  try {
    if (!supabaseClient) {
      console.warn('Supabase client not provided for archived POS terminal fetch');
      return [];
    }
    const { data, error } = await supabaseClient
      .from('pos_terminals')
      .select('*')
      .order('terminal_code', { ascending: true });

    if (error) {
      console.warn('Supabase fetch POS terminals warning:', error.message);
      return [];
    }
    return (data || []).map((row: any) => ({
      id: row.id,
      terminalCode: row.terminal_code,
      name: row.store_name,
      nameMm: row.store_name_mm || row.store_name,
      township: row.township,
      limit: parseFloat(row.daily_sales_limit || 50000),
      status: row.status,
      merchantUserId: row.merchant_user_id,
    }));
  } catch (err) {
    console.error('Error fetching POS terminals from Supabase:', err);
    return [];
  }
}

/**
 * Register a verified enterprise merchant terminal
 */
export async function registerMerchantTerminal(
  supabaseClient: any,
  params: {
    terminalCode: string;
    merchantUserId: string;
    storeName: string;
    storeNameMm?: string;
    township: string;
    dailySalesLimit?: number;
  }
): Promise<{ success: boolean; terminal?: PosTerminalRecord; error?: string }> {
  try {
    const { data, error } = await supabaseClient
      .from('pos_terminals')
      .insert({
        terminal_code: params.terminalCode,
        merchant_user_id: params.merchantUserId,
        store_name: params.storeName,
        store_name_mm: params.storeNameMm || params.storeName,
        township: params.township,
        daily_sales_limit: params.dailySalesLimit || 50000.0,
        status: 'ACTIVE',
      })
      .select()
      .single();

    if (error) throw error;
    return {
      success: true,
      terminal: {
        id: data.id,
        terminalCode: data.terminal_code,
        name: data.store_name,
        nameMm: data.store_name_mm,
        township: data.township,
        limit: parseFloat(data.daily_sales_limit),
        status: data.status,
        merchantUserId: data.merchant_user_id,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Update merchant terminal operational status
 */
export async function updateMerchantStatus(
  supabaseClient: any,
  terminalId: string,
  status: 'ACTIVE' | 'SUSPENDED' | 'DECOMMISSIONED'
): Promise<boolean> {
  try {
    const { error } = await supabaseClient
      .from('pos_terminals')
      .update({ status, updated_at: new Date() })
      .eq('id', terminalId);
    return !error;
  } catch {
    return false;
  }
}
