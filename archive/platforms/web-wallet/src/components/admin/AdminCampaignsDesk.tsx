import React from 'react'
import { Sparkles, Plus } from 'lucide-react'
import type { PromoAdItem } from '../../pages/DashboardPage'

interface AdminCampaignsDeskProps {
  promoAds: PromoAdItem[]
  onToggleAd: (id: string) => void
  onOpenCreateModal: () => void
  isDarkMode: boolean
}

export const AdminCampaignsDesk: React.FC<AdminCampaignsDeskProps> = ({
  promoAds,
  onToggleAd,
  onOpenCreateModal,
  isDarkMode,
}) => {
  const activeCount = promoAds.filter((a) => a.active).length
  const totalImpressions = promoAds.reduce((acc, a) => acc + (a.impressions || 0), 0)
  const totalClicks = promoAds.reduce((acc, a) => acc + (a.clicks || 0), 0)
  const avgCtr =
    totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-4">
      {/* Top Banner & Metric Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-black tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles size={18} className="text-amber-500" />
            <span>Spotlight & Merchant Campaigns</span>
          </h2>
          <div className="text-[11px] text-slate-400 font-mono">
            Promotional banners broadcast to Android and Web Wallet citizens
          </div>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="px-3.5 py-2 rounded-xl bg-[#FF6B00] hover:bg-[#E05E00] text-white text-xs font-bold transition flex items-center gap-1.5 shadow-sm cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus size={14} />
          <span>New Campaign</span>
        </button>
      </div>

      {/* Metric Cards (BoardUI Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-3.5 rounded-2xl border ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="text-xs text-slate-400 font-mono font-bold uppercase">
            Active Campaigns
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            {activeCount} / {promoAds.length}
          </div>
          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">Live in Wallet Feed</div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="text-xs text-slate-400 font-mono font-bold uppercase">
            Total Impressions
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            {totalImpressions.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Verified Views</div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="text-xs text-slate-400 font-mono font-bold uppercase">Average CTR</div>
          <div className="text-2xl font-black font-mono tracking-tight text-emerald-500 mt-1">
            {avgCtr}%
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            {totalClicks.toLocaleString()} Interactions
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-xs divide-y transition-all ${
          isDarkMode
            ? 'bg-zinc-900/40 border-white/10 divide-white/5'
            : 'bg-white border-slate-200 divide-slate-100'
        }`}
      >
        {promoAds.map((ad) => (
          <div
            key={ad.id}
            className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50/80'
            }`}
          >
            <div className="space-y-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                  {ad.titleEn}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">({ad.titleAk})</span>
                <span
                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                    ad.active
                      ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                      : 'bg-slate-500/15 text-slate-500'
                  }`}
                >
                  {ad.active ? 'ACTIVE' : 'PAUSED'}
                </span>
              </div>
              <p className="text-xs text-slate-500 line-clamp-1">{ad.descEn}</p>
              <div className="text-[11px] text-slate-400 font-mono">
                {ad.impressions.toLocaleString()} views • {ad.clicks.toLocaleString()} clicks
              </div>
            </div>

            <button
              onClick={() => onToggleAd(ad.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer self-end sm:self-center ${
                ad.active
                  ? 'bg-amber-500/15 text-amber-500 hover:bg-amber-500/25 border border-amber-500/30'
                  : 'bg-emerald-500/15 text-emerald-500 hover:bg-emerald-500/25 border border-emerald-500/30'
              }`}
            >
              {ad.active ? 'Pause Campaign' : 'Activate Campaign'}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
