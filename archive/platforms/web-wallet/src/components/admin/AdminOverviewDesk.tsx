import React, { useMemo } from 'react'
import {
  Activity,
  ArrowRight,
  Landmark,
  ShieldCheck,
  UserCheck,
  Users,
  Wallet,
  CircleAlert,
} from 'lucide-react'
import type { AdminApprovalRow, AdminTransactionRow, AdminUserRow } from '../../services/adminDatabase'
import {
  Avatar,
  DeskHeader,
  EmptyState,
  Panel,
  StatCard,
  StatusPill,
  adminMuted,
  adminText,
} from './AdminUI'
import { cn } from '../../lib/utils'

interface AdminOverviewDeskProps {
  users: AdminUserRow[]
  transactions: AdminTransactionRow[]
  approvals: AdminApprovalRow[]
  isDarkMode: boolean
  loading: boolean
  error: string
  onNavigate: (tab: string) => void
}

const money = (value: number) =>
  `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const dateLabel = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const AdminOverviewDesk: React.FC<AdminOverviewDeskProps> = ({
  users,
  transactions,
  approvals,
  isDarkMode,
  loading,
  error,
  onNavigate,
}) => {
  const stats = useMemo(() => {
    const pendingKyc = users.filter((user) => user.kycStatus === 'pending_review').length
    const pendingApprovals = approvals.filter((approval) => approval.status === 'PENDING').length
    const totalBalance = users.reduce((sum, user) => sum + user.balance + user.usdBalance, 0)
    const volume = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const fees = transactions.reduce((sum, tx) => sum + tx.fee, 0)
    const flagged = transactions.filter((tx) => tx.risk !== 'Low').length
    return { pendingKyc, pendingApprovals, totalBalance, volume, fees, flagged }
  }, [approvals, transactions, users])

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Workspace · Overview"
        title="Platform overview"
        description="A live snapshot of users, identity reviews, approvals and ledger activity pulled directly from the database."
        isDarkMode={isDarkMode}
        actions={
          <>
            <StatusPill tone="emerald" dot>
              Live database
            </StatusPill>
            {loading && <StatusPill tone="slate">Syncing…</StatusPill>}
          </>
        }
      />

      {error && (
        <div className="flex items-start gap-3 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-[11px] text-rose-300 backdrop-blur-xl">
          <CircleAlert size={15} className="mt-0.5 shrink-0" />
          <div>
            <div className="font-bold">Database read failed</div>
            <div className="mt-0.5 text-rose-300/80">{error}</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Total users"
          value={users.length}
          hint="Profiles in the database"
          icon={<Users size={15} />}
          tone="indigo"
          isDarkMode={isDarkMode}
          onClick={() => onNavigate('admin-kyc')}
        />
        <StatCard
          label="Pending KYC"
          value={stats.pendingKyc}
          hint="Awaiting identity decision"
          icon={<UserCheck size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
          onClick={() => onNavigate('admin-kyc')}
        />
        <StatCard
          label="Pending approvals"
          value={stats.pendingApprovals}
          hint="Ledger actions awaiting review"
          icon={<ShieldCheck size={15} />}
          tone="rose"
          isDarkMode={isDarkMode}
          onClick={() => onNavigate('admin-approvals')}
        />
        <StatCard
          label="Customer balances"
          value={money(stats.totalBalance)}
          hint={`${stats.flagged} transactions need review`}
          icon={<Wallet size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
          onClick={() => onNavigate('admin-treasury')}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-12">
        <Panel
          isDarkMode={isDarkMode}
          className="xl:col-span-8"
          bodyClassName="p-0"
          title="Recent ledger activity"
          description="Latest transactions from the database."
          actions={
            <button
              type="button"
              onClick={() => onNavigate('admin-fraud')}
              className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 transition hover:text-indigo-300"
            >
              View all
              <ArrowRight size={11} />
            </button>
          }
        >
          {transactions.length === 0 ? (
            <EmptyState
              isDarkMode={isDarkMode}
              icon={<Activity size={20} />}
              title="No transactions yet"
              description="Ledger transactions will appear here when they are written to the database."
            />
          ) : (
            <div className="divide-y divide-white/[0.06]">
              {transactions.slice(0, 7).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3 sm:px-5">
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar
                      label={tx.risk === 'High' ? '!' : tx.risk === 'Medium' ? '?' : '✓'}
                      tone={tx.risk === 'High' ? 'rose' : tx.risk === 'Medium' ? 'amber' : 'emerald'}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <div className={cn('truncate text-xs font-semibold', adminText(isDarkMode))}>{tx.title}</div>
                      <div className={cn('truncate font-mono text-[10px]', adminMuted(isDarkMode))}>
                        {tx.refId} · {dateLabel(tx.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={cn(
                        'font-mono text-xs font-bold',
                        tx.amount < 0 ? 'text-rose-300' : 'text-emerald-300',
                      )}
                    >
                      {tx.amount < 0 ? '-' : '+'}
                      {Math.abs(tx.amount).toLocaleString()} {tx.currency}
                    </div>
                    <StatusPill tone={tx.risk === 'High' ? 'rose' : tx.risk === 'Medium' ? 'amber' : 'emerald'}>
                      {tx.risk}
                    </StatusPill>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Panel>

        <div className="space-y-4 xl:col-span-4">
          <Panel
            isDarkMode={isDarkMode}
            bodyClassName="p-0"
            title="Pending approvals"
            description="Decisions waiting on an operator."
            actions={
              <button
                type="button"
                onClick={() => onNavigate('admin-approvals')}
                className="inline-flex items-center gap-1 font-mono text-[10px] text-slate-400 transition hover:text-indigo-300"
              >
                Open
                <ArrowRight size={11} />
              </button>
            }
          >
            {approvals.filter((approval) => approval.status === 'PENDING').length === 0 ? (
              <EmptyState
                isDarkMode={isDarkMode}
                icon={<ShieldCheck size={20} />}
                title="No pending approvals"
                description="All approval requests are resolved."
              />
            ) : (
              <div className="divide-y divide-white/[0.06]">
                {approvals
                  .filter((approval) => approval.status === 'PENDING')
                  .slice(0, 5)
                  .map((approval) => (
                    <div key={approval.id} className="flex items-center justify-between gap-3 px-4 py-3">
                      <div className="min-w-0">
                        <div className={cn('truncate text-[11px] font-semibold', adminText(isDarkMode))}>
                          {approval.type.replaceAll('_', ' ')}
                        </div>
                        <div className={cn('truncate font-mono text-[9px]', adminMuted(isDarkMode))}>
                          {dateLabel(approval.requestedAt)}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={cn('font-mono text-[11px] font-bold', adminText(isDarkMode))}>
                          {approval.amount ? `${approval.amount.toLocaleString()} ${approval.currency}` : '—'}
                        </div>
                        <StatusPill tone="amber">Pending</StatusPill>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </Panel>

          <Panel
            isDarkMode={isDarkMode}
            title="Ledger totals"
            description="Current live aggregates."
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className={cn('text-[11px]', adminMuted(isDarkMode))}>Volume</span>
                <span className={cn('font-mono text-xs font-bold', adminText(isDarkMode))}>{money(stats.volume)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-[11px]', adminMuted(isDarkMode))}>Fees collected</span>
                <span className="font-mono text-xs font-bold text-emerald-300">{money(stats.fees)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-[11px]', adminMuted(isDarkMode))}>Transactions</span>
                <span className={cn('font-mono text-xs font-bold', adminText(isDarkMode))}>{transactions.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={cn('text-[11px]', adminMuted(isDarkMode))}>Treasury</span>
                <button
                  type="button"
                  onClick={() => onNavigate('admin-treasury')}
                  className="inline-flex items-center gap-1 font-mono text-[10px] text-indigo-300 hover:text-indigo-200"
                >
                  <Landmark size={11} />
                  Open
                </button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
  )
}
