import React from 'react'
import {
  Landmark,
  Layers3,
  ArrowUpRight,
  ShieldCheck,
  Vault,
  TrendingUp,
  CircleDollarSign,
} from 'lucide-react'
import {
  DeskHeader,
  Panel,
  StatCard,
  StatusPill,
  adminMuted,
  adminText,
} from './AdminUI'
import { cn } from '../../lib/utils'

interface AdminTreasuryDeskProps {
  isDarkMode: boolean
}

export const AdminTreasuryDesk: React.FC<AdminTreasuryDeskProps> = ({ isDarkMode }) => {
  const reserves = [
    {
      asset: 'USDT',
      network: 'Tron TRC20 / ERC20',
      amountUsd: 7200000,
      share: 55.7,
      color: 'bg-emerald-500',
      contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    },
    {
      asset: 'USDC',
      network: 'Polygon PoS / Native',
      amountUsd: 3800000,
      share: 29.4,
      color: 'bg-sky-500',
      contract: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    },
    {
      asset: 'Vault cash',
      network: 'USD Tier 1 · Sittwe hub',
      amountUsd: 1935550,
      share: 14.9,
      color: 'bg-amber-500',
      contract: 'Arakan Reserve Vault',
    },
  ]

  const totalCollateral = 12935550
  const akdInCirculation = 12450000
  const reserveRatio = ((totalCollateral / akdInCirculation) * 100).toFixed(1)
  const surplus = totalCollateral - akdInCirculation

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Platform · Treasury"
        title="Treasury & Reserves"
        description="Audited collateral composition backing every circulating Arakan Dollar. All figures reconcile to the 1:1 USD hard peg."
        isDarkMode={isDarkMode}
        actions={
          <>
            <StatusPill tone="emerald" dot>
              Audit verified
            </StatusPill>
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[10px] font-bold',
                isDarkMode
                  ? 'border-white/[0.07] bg-white/[0.03] text-slate-400'
                  : 'border-slate-200 bg-white text-slate-500',
              )}
            >
              <ShieldCheck size={13} />
              Merkle 0x8a1c…f92d
            </div>
          </>
        }
      />

      <div
        className={cn(
          'relative overflow-hidden rounded-2xl border p-5 sm:p-6',
          isDarkMode
            ? 'border-white/[0.08] bg-gradient-to-br from-[#101A30] via-[#0B1424] to-[#080E1A]'
            : 'border-orange-200/70 bg-gradient-to-br from-orange-50 via-white to-amber-50',
        )}
      >
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Landmark size={16} className="text-orange-500" />
              <span className={cn('font-mono text-[10px] font-bold uppercase tracking-[0.2em]', adminMuted(isDarkMode))}>
                Hard peg
              </span>
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className={cn('font-mono text-3xl font-black tracking-tight sm:text-4xl', adminText(isDarkMode))}>
                1.00 ₳
              </span>
              <span className={cn('font-mono text-lg font-bold', adminMuted(isDarkMode))}>= $1.00 USD</span>
            </div>
            <p className={cn('mt-1 max-w-xl text-[11px]', adminMuted(isDarkMode))}>
              Collateralized with liquid USD stablecoins and audited physical vault reserves.
            </p>
          </div>
          <div className="flex gap-2">
            <div
              className={cn(
                'rounded-xl border px-4 py-2.5 text-right',
                isDarkMode ? 'border-white/[0.08] bg-white/[0.03]' : 'border-slate-200 bg-white',
              )}
            >
              <div className={cn('font-mono text-[9px] font-bold uppercase tracking-wider', adminMuted(isDarkMode))}>
                Reserve ratio
              </div>
              <div className="mt-1 font-mono text-xl font-black text-emerald-500">{reserveRatio}%</div>
            </div>
            <div
              className={cn(
                'hidden rounded-xl border px-4 py-2.5 text-right sm:block',
                isDarkMode ? 'border-white/[0.08] bg-white/[0.03]' : 'border-slate-200 bg-white',
              )}
            >
              <div className={cn('font-mono text-[9px] font-bold uppercase tracking-wider', adminMuted(isDarkMode))}>
                Surplus buffer
              </div>
              <div className="mt-1 font-mono text-xl font-black text-orange-500">
                ${surplus.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard
          label="Total collateral"
          value={`$${totalCollateral.toLocaleString()}`}
          hint="Across stablecoins and vault cash"
          icon={<Vault size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="AKD in circulation"
          value={`₳ ${akdInCirculation.toLocaleString()}`}
          hint="100% guaranteed 1:1 redemption"
          icon={<CircleDollarSign size={15} />}
          tone="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Daily volume"
          value="₳ 842,190.00"
          hint="2,140 settlements processed today"
          icon={<TrendingUp size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
        />
      </div>

      <Panel
        isDarkMode={isDarkMode}
        title={
          <span className="flex items-center gap-2">
            <Layers3 size={14} className="text-orange-500" />
            Collateral composition
          </span>
        }
        description="Audited reserve allocation by asset class."
        actions={
          <button
            type="button"
            className={cn(
              'inline-flex items-center gap-1 font-mono text-[10px] transition',
              adminMuted(isDarkMode),
              'hover:text-orange-500',
            )}
          >
            View audit
            <ArrowUpRight size={11} />
          </button>
        }
      >
        <div className="space-y-5">
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/[0.06]">
            {reserves.map((reserve) => (
              <div
                key={reserve.asset}
                className={cn(reserve.color, 'h-full transition-all')}
                style={{ width: `${reserve.share}%` }}
                title={`${reserve.asset}: ${reserve.share}%`}
              />
            ))}
          </div>

          <div className={cn('divide-y', isDarkMode ? 'divide-white/[0.06]' : 'divide-slate-100')}>
            {reserves.map((reserve) => (
              <div key={reserve.asset} className="flex flex-col gap-2 py-3.5 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className={cn('h-8 w-1.5 rounded-full', reserve.color)} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={cn('text-xs font-bold', adminText(isDarkMode))}>{reserve.asset}</span>
                      <StatusPill tone="slate">{reserve.share}%</StatusPill>
                    </div>
                    <div className={cn('mt-0.5 font-mono text-[10px]', adminMuted(isDarkMode))}>
                      {reserve.network}
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-6 sm:justify-end">
                  <div className={cn('max-w-[210px] truncate font-mono text-[10px]', adminMuted(isDarkMode))}>
                    {reserve.contract}
                  </div>
                  <div className={cn('font-mono text-sm font-black', adminText(isDarkMode))}>
                    ${reserve.amountUsd.toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </Panel>
    </div>
  )
}
