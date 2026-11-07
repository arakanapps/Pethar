import React from 'react'
import { Sparkles, Plus, MousePointerClick, Eye, Power, TrendingUp } from 'lucide-react'
import type { PromoAdItem } from '../../pages/DashboardPage'
import {
  DeskHeader,
  Panel,
  StatCard,
  StatusPill,
  adminMuted,
  adminText,
} from './AdminUI'
import { cn } from '../../lib/utils'

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
  const activeCount = promoAds.filter((ad) => ad.active).length
  const totalImpressions = promoAds.reduce((acc, ad) => acc + (ad.impressions || 0), 0)
  const totalClicks = promoAds.reduce((acc, ad) => acc + (ad.clicks || 0), 0)
  const avgCtr = totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : '0.0'

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Platform · Growth"
        title="Campaigns & Spotlight"
        description="Promotional inventory broadcast to the Android app and web wallet. Control placement, monitor performance and pause live offers."
        isDarkMode={isDarkMode}
        actions={
          <button
            type="button"
            onClick={onOpenCreateModal}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-3.5 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-indigo-600 active:scale-95"
          >
            <Plus size={14} />
            New campaign
          </button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Active campaigns"
          value={`${activeCount} / ${promoAds.length}`}
          hint="Currently live in wallet feed"
          icon={<Power size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Total impressions"
          value={totalImpressions.toLocaleString()}
          hint="Verified client views"
          icon={<Eye size={15} />}
          tone="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Average CTR"
          value={`${avgCtr}%`}
          hint={`${totalClicks.toLocaleString()} interactions`}
          icon={<MousePointerClick size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
        />
      </div>

      <Panel
        isDarkMode={isDarkMode}
        bodyClassName="p-0"
        title={
          <span className="flex items-center gap-2">
            <Sparkles size={14} className="text-indigo-500" />
            Campaign inventory
          </span>
        }
        description="All promotional placements across client surfaces."
        actions={<StatusPill tone="slate">{promoAds.length} total</StatusPill>}
      >
        <div className={cn('divide-y', isDarkMode ? 'divide-white/[0.06]' : 'divide-slate-100')}>
          {promoAds.map((ad) => {
            const ctr = ad.impressions > 0 ? ((ad.clicks / ad.impressions) * 100).toFixed(1) : '0.0'
            return (
              <div
                key={ad.id}
                className={cn(
                  'flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5',
                  isDarkMode ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80',
                )}
              >
                <div className="flex min-w-0 items-start gap-3">
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border',
                      ad.active
                        ? 'border-indigo-500/25 bg-indigo-500/10 text-indigo-500'
                        : isDarkMode
                          ? 'border-white/[0.07] bg-white/[0.03] text-slate-500'
                          : 'border-slate-200 bg-slate-50 text-slate-400',
                    )}
                  >
                    <Sparkles size={16} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('truncate text-xs font-bold', adminText(isDarkMode))}>
                        {ad.titleEn}
                      </span>
                      <span className={cn('truncate font-mono text-[10px]', adminMuted(isDarkMode))}>
                        {ad.titleAk}
                      </span>
                      <StatusPill tone={ad.active ? 'emerald' : 'slate'} dot>
                        {ad.active ? 'Active' : 'Paused'}
                      </StatusPill>
                    </div>
                    <p className={cn('mt-0.5 line-clamp-1 text-[10px]', adminMuted(isDarkMode))}>
                      {ad.descEn}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-3 font-mono text-[9px]">
                      <span className={cn('flex items-center gap-1', adminMuted(isDarkMode))}>
                        <Eye size={10} />
                        {ad.impressions.toLocaleString()}
                      </span>
                      <span className={cn('flex items-center gap-1', adminMuted(isDarkMode))}>
                        <MousePointerClick size={10} />
                        {ad.clicks.toLocaleString()}
                      </span>
                      <span className="flex items-center gap-1 font-bold text-emerald-500">
                        <TrendingUp size={10} />
                        {ctr}% CTR
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onToggleAd(ad.id)}
                  className={cn(
                    'inline-flex shrink-0 items-center justify-center gap-1.5 self-end rounded-xl border px-3 py-2 text-[11px] font-bold transition active:scale-95 sm:self-center',
                    ad.active
                      ? isDarkMode
                        ? 'border-yellow-400/20 bg-yellow-400/10 text-yellow-300 hover:bg-yellow-400/15'
                        : 'border-yellow-200 bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                      : isDarkMode
                        ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300 hover:bg-emerald-400/15'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100',
                  )}
                >
                  <Power size={12} />
                  {ad.active ? 'Pause' : 'Activate'}
                </button>
              </div>
            )
          })}
        </div>
      </Panel>
    </div>
  )
}
