/**
 * Corporate Merchant Dashboard Layouts & Actions
 * Relocated from active codebase to archive-offline-features/merchant-ops/
 */

import React, { useState } from 'react';
import type { PosTerminalRecord } from './merchant_service';
import type { EnterpriseStoreProfile, VendorTransactionMatch } from './store_profile_model';

export function MerchantOpsDashboard() {
  const [terminals] = useState<PosTerminalRecord[]>([
    {
      id: 'term_01',
      terminalCode: 'POS-SIT-001',
      name: 'Sittwe Central Market Store #1',
      nameMm: 'စစ်တွေဗဟိုဈေး ဆိုင်ခွဲ ၁',
      township: 'Sittwe',
      limit: 100000.0,
      status: 'ACTIVE',
      merchantUserId: 'usr_merch_01',
    },
    {
      id: 'term_02',
      terminalCode: 'POS-KPU-002',
      name: 'Kyaukphyu Port Supply Depot',
      nameMm: 'ကျောက်ဖြူ ဆိပ်ကမ်း ကုန်မာဆိုင်',
      township: 'Kyaukphyu',
      limit: 75000.0,
      status: 'ACTIVE',
      merchantUserId: 'usr_merch_02',
    },
  ]);

  const [activeProfile] = useState<EnterpriseStoreProfile>({
    id: 'store_8820',
    merchantId: 'MERCH-ARAK-001',
    businessName: 'Arakan Wholesale Merchants Co., Ltd.',
    businessRegistrationNumber: 'BRN-2026-AKD-991',
    taxIdentifier: 'TAX-AK-99210',
    township: 'Sittwe',
    region: 'Rakhine',
    contactPerson: 'U Kyaw Zeya',
    phone: '+95 9 770 001 234',
    email: 'ops@arakanwholesale.com',
    settlementAccount: '202610190008',
    verifiedMerchantTier: 2,
    complianceStatus: 'VERIFIED',
    dailyVolumeCapAkd: 500000.0,
    cashbackProgramEnabled: true,
    cashbackRateBps: 200,
  });

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 bg-slate-900 text-white rounded-3xl">
      <div className="flex justify-between items-center border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-black">{activeProfile.businessName}</h1>
          <p className="text-xs text-slate-400">Enterprise Merchant Hub · ID: {activeProfile.merchantId}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
          Tier {activeProfile.verifiedMerchantTier} Verified Merchant
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
          <div className="text-xs text-slate-400">Daily Volume Cap</div>
          <div className="text-2xl font-mono font-bold">₳ {activeProfile.dailyVolumeCapAkd.toLocaleString()}</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
          <div className="text-xs text-slate-400">Cashback Program</div>
          <div className="text-2xl font-mono font-bold text-amber-400">{(activeProfile.cashbackRateBps / 100).toFixed(1)}% Active</div>
        </div>
        <div className="p-4 rounded-2xl bg-slate-800/80 border border-slate-700 space-y-1">
          <div className="text-xs text-slate-400">Active POS Registers</div>
          <div className="text-2xl font-mono font-bold text-cyan-400">{terminals.length} Terminals</div>
        </div>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-bold text-slate-300">Registered POS Terminals</h2>
        <div className="divide-y divide-slate-800 rounded-2xl bg-slate-800/50 border border-slate-700 overflow-hidden">
          {terminals.map((t) => (
            <div key={t.id} className="p-4 flex justify-between items-center">
              <div>
                <div className="font-bold text-sm">{t.name}</div>
                <div className="text-xs text-slate-400 font-mono">{t.terminalCode} · {t.township}</div>
              </div>
              <div className="text-right">
                <div className="text-xs font-mono">Daily Limit: ₳ {t.limit.toLocaleString()}</div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400">
                  {t.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default MerchantOpsDashboard;
