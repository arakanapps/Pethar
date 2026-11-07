import React, { useMemo } from 'react'
import {
  Landmark,
  Layers3,
  ArrowUpRight,
  Wallet,
  Users,
  TrendingUp,
  CircleDollarSign,
  ShieldCheck,
} from 'lucide-react'
import type { AdminApprovalRow, AdminTransactionRow, AdminUserRow } from '../../services/adminDatabase'
import {
  DeskHeader,
  EmptyState,
  Panel,
  StatCard,
  StatusPill,
  adminMuted,
  adminText,
} from './AdminUI'
import { cn } from '../../lib/utils'

interface AdminTreasuryDeskProps {
  users: AdminUserRow[]
  transactions: AdminTransactionRow[]
  approvals: AdminApprovalRow[]
  isDarkMode: boolean
  loading: boolean
}

const money = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

export const AdminTreasuryDesk: React.FC<AdminTreasuryDeskProps> = ({
  users,
  transactions,
  approvals,
  isDarkMode,
  loading,
}) => {
  const stats = useMemo(() => {
    const akd = users.reduce((sum, user) => sum + user.balance, 0)
    const usd = users.reduce((sum, user) => sum + user.usdBalance, 0)
    const volume = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const fees = transactions.reduce((sum, tx) => sum + tx.fee, 0)
    const pending = approvals.filter((approval) => approval.status === 'PENDING')
    const pendingAmount = pending.reduce((sum, approval) => sum + approval.amount, 0)

    const byCurrency = transactions.reduce<Record<string, number>>((acc, tx) => {
      acc[tx.currency] = (acc[tx.currency] || 0) + Math.abs(tx.amount)
      return acc
    }, {})
    const currencyRows = Object.entries(byCurrency)
      .sort((a, b) => b[1] - a[1])
      .map(([currency, amount]) => ({
        currency,
        amount,
        share: volume > 0 ? (amount / volume) * 100 : 0,
      }))

    return { akd, usd, volume, fees, pending, pendingAmount, currencyRows }
  }, [approvals, transactions, users])

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Platform · Treasury"
        title="Treasury"
        description="Aggregated customer balances, ledger throughput and pending value drawn from the database."
        isDarkMode={isDarkMode}
        actions={
          <StatusPill tone="emerald" dot>
            {loading ? 'Syncing…' : 'Live balances'}
          </StatusPill>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Customer AKD"
          value={`₳ ${stats.akd.toLocaleString()}`}
          hint="Sum of wallet balances"
          icon={<Wallet size={15} />}
          tone="indigo"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Customer USD"
          value={money(stats.usd)}
          hint="Sum of USD account balances"
          icon={<CircleDollarSign size={15} />}
          tone="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Ledger volume"
          value={money(stats.volume)}
          hint={`${transactions.length} transactions`}
          icon={<TrendingUp size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Pending value"
          value={money(stats.pendingAmount)}
          hint={`${stats.pending.length} approvals awaiting decision`}
          icon={<ShieldCheck size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel
          isDarkMode={isDarkMode}
          className="xl:col-span-7"
          title={
            <span className="flex items-center gap-2">
              <Layers3 size={14} className="text-indigo-300" />
              Ledger volume by currency
            </span>
          }
          description="Real transaction totals grouped by settlement currency."
          actions={
            <span className={cn('font-mono text-[10px]', adminMuted(isDarkMode))}>
              Fees {money(stats.fees)}
            </span>
          }
        >
          {stats.currencyRows.length === 0 ? (
            <EmptyState
              isDarkMode={isDarkMode}
              icon={<TrendingUp size={20} />}
              title="No ledger volume yet"
              description="Currency totals appear once transactions are recorded."
            />
          ) : (
            <div className="space-y-4">
              <div className="flex h-3 w-full overflow-hidden rounded-full bg-white/[0.05]">
                {stats.currencyRows.map((row, index) => (
                  <div
                    key={row.currency}
                    className={cn(
                      'h-full',
                      index === 0
                        ? 'bg-indigo-400'
                        : index === 1
                          ? 'bg-sky-400'
                          : index === 2
                            ? 'bg-emerald-400'
                            : 'bg-slate-500',
                    )}
                    style={{ width: `${Math.max(row.share, 1)}%` }}
                    title={`${row.currency}: ${row.share.toFixed(1)}%`}
                  />
                ))}
              </div>

              <div className="divide-y divide-white/[0.06]">
                {stats.currencyRows.map((row, index) => (
                  <div key={row.currency} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="flex items-center gap-3">
                      <span
                        className={cn(
                          'h-8 w-1.5 rounded-full',
                          index === 0
                            ? 'bg-indigo-400'
                            : index === 1
                              ? 'bg-sky-400'
                              : index === 2
                                ? 'bg-emerald-400'
                                : 'bg-slate-500',
                        )}
                      />
                      <div>
                        <div className={cn('text-xs font-bold', adminText(isDarkMode))}>{row.currency}</div>
                        <div className={cn('font-mono text-[10px]', adminMuted(isDarkMode))}>
                          {row.share.toFixed(1)}% of volume
                        </div>
                      </div>
                    </div>
                    <div className={cn('font-mono text-sm font-black', adminText(isDarkMode))}>{money(row.amount)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Panel>

        <Panel
          isDarkMode={isDarkMode}
          className="xl:col-span-5"
          title={
            <span className="flex items-center gap-2">
              <Users size={14} className="text-indigo-300" />
              Balance distribution
            </span>
          }
          description="Accounts ranked by total balance."
          actions={<StatusPill tone="slate">{users.length} users</StatusPill>}
        >
          {users.length === 0 ? (
            <EmptyState
              isDarkMode={isDarkMode}
              icon={<Users size={20} />}
              title="No customer accounts"
              description="Balances will appear when profiles are available."
            />
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {[...users]
                .sort((a, b) => b.balance + b.usdBalance - (a.balance + a.usdBalance))
                .slice(0, 6)
                .map((user) => (
                  <div key={user.id} className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                    <div className="min-w-0">
                      <div className={cn('truncate text-[11px] font-semibold', adminText(isDarkMode))}>{user.name}</div>
                      <div className={cn('truncate font-mono text-[9px]', adminMuted(isDarkMode))}>
                        {user.uid} · Tier {user.kycTier}
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={cn('font-mono text-[11px] font-bold', adminText(isDarkMode))}>
                        ₳ {user.balance.toLocaleString()}
                      </div>
                      <div className="font-mono text-[9px] text-slate-500">${user.usdBalance.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
          <div className={cn('mt-4 flex items-center justify-between border-t border-white/[0.06] pt-3 font-mono text-[10px]', adminMuted(isDarkMode))}>
            <span>Source · user_profiles</span>
            <span className="inline-flex items-center gap-1 text-indigo-300">
              Live
              <ArrowUpRight size={11} />
            </span>
          </div>
        </Panel>
      </div>
    </div>
  )
}
