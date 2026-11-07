import React, { useMemo } from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  Lock,
  Gauge,
  Search,
} from 'lucide-react'
import type { AdminTransactionRow } from '../../services/adminDatabase'
import {
  Avatar,
  DeskHeader,
  EmptyState,
  Panel,
  Segmented,
  StatCard,
  StatusPill,
  adminInput,
  adminMuted,
  adminText,
} from './AdminUI'
import { cn } from '../../lib/utils'

interface AdminSecurityAmlProps {
  transactions: AdminTransactionRow[]
  fraudFilter: 'all' | 'flagged' | 'clean'
  setFraudFilter: (f: 'all' | 'flagged' | 'clean') => void
  onFreezeAccount: (tx: AdminTransactionRow) => void
  onInspectSlip: (tx: AdminTransactionRow) => void
  isDarkMode: boolean
  loading: boolean
  searchQuery: string
}

const riskTone = (risk: string) => {
  if (risk === 'High') return 'rose' as const
  if (risk === 'Medium') return 'amber' as const
  return 'emerald' as const
}

const dateLabel = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const AdminSecurityAml: React.FC<AdminSecurityAmlProps> = ({
  transactions,
  fraudFilter,
  setFraudFilter,
  onFreezeAccount,
  onInspectSlip,
  isDarkMode,
  loading,
  searchQuery,
}) => {
  const [localSearch, setLocalSearch] = React.useState('')
  const query = (searchQuery || localSearch).trim().toLowerCase()

  const stats = useMemo(() => {
    const highRisk = transactions.filter((tx) => tx.risk === 'High').length
    const mediumRisk = transactions.filter((tx) => tx.risk === 'Medium').length
    const volume = transactions.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)
    const fees = transactions.reduce((sum, tx) => sum + tx.fee, 0)
    return { highRisk, mediumRisk, volume, fees }
  }, [transactions])

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesFilter =
        fraudFilter === 'all' ||
        (fraudFilter === 'flagged' && tx.risk !== 'Low') ||
        (fraudFilter === 'clean' && tx.risk === 'Low')
      const matchesSearch =
        !query ||
        tx.title.toLowerCase().includes(query) ||
        tx.refId.toLowerCase().includes(query) ||
        tx.counterparty.toLowerCase().includes(query) ||
        tx.status.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [fraudFilter, query, transactions])

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Operations · Ledger"
        title="Transactions"
        description="Monitor real ledger activity, inspect suspicious movements and freeze the linked account when required."
        isDarkMode={isDarkMode}
        actions={
          <StatusPill tone="emerald" dot>
            {loading ? 'Syncing…' : `${transactions.length} transactions`}
          </StatusPill>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Total volume"
          value={`$${stats.volume.toLocaleString('en-US', { maximumFractionDigits: 0 })}`}
          hint="Across selected records"
          icon={<Activity size={15} />}
          tone="indigo"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Fees collected"
          value={`$${stats.fees.toLocaleString('en-US', { maximumFractionDigits: 2 })}`}
          hint="Ledger fees"
          icon={<Gauge size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Medium risk"
          value={stats.mediumRisk}
          hint="Above review threshold"
          icon={<AlertTriangle size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="High risk"
          value={stats.highRisk}
          hint="Failed or flagged movements"
          icon={<ShieldCheck size={15} />}
          tone="rose"
          isDarkMode={isDarkMode}
        />
      </div>

      <Panel
        isDarkMode={isDarkMode}
        bodyClassName="p-0"
        title="Transaction monitor"
        description="Risk is derived from real status, amount and metadata fields."
        actions={
          <Segmented
            isDarkMode={isDarkMode}
            value={fraudFilter}
            onChange={setFraudFilter}
            tone="rose"
            options={[
              { value: 'all', label: 'All' },
              { value: 'flagged', label: 'Flagged' },
              { value: 'clean', label: 'Clean' },
            ]}
          />
        }
      >
        <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={localSearch}
              onChange={(event) => setLocalSearch(event.target.value)}
              placeholder="Search title, reference or counterparty…"
              className={cn(
                'w-full rounded-xl border py-2 pl-8 pr-3 text-[11px] font-medium outline-none transition',
                adminInput(isDarkMode),
              )}
            />
          </div>
        </div>

        {loading && transactions.length === 0 ? (
          <EmptyState isDarkMode={isDarkMode} title="Loading transactions…" description="Reading from the database." />
        ) : filtered.length === 0 ? (
          <EmptyState
            isDarkMode={isDarkMode}
            icon={<ShieldCheck size={20} />}
            title="No transactions in this view"
            description="Try a different risk filter or clear the search."
          />
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.slice(0, 100).map((tx) => (
              <div
                key={tx.id}
                className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-5"
              >
                <div className="flex min-w-0 items-start gap-3">
                  <Avatar
                    label={tx.risk === 'High' ? '!' : tx.risk === 'Medium' ? '?' : '✓'}
                    tone={riskTone(tx.risk)}
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={cn('text-xs font-bold', adminText(isDarkMode))}>{tx.title}</span>
                      <StatusPill tone={riskTone(tx.risk)} dot>
                        Risk {tx.risk}
                      </StatusPill>
                      <StatusPill tone="slate">{tx.status}</StatusPill>
                    </div>
                    <div className={cn('mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px]', adminMuted(isDarkMode))}>
                      <span>Ref {tx.refId}</span>
                      <span className="text-slate-700">/</span>
                      <span>{tx.counterparty || 'No counterparty'}</span>
                      <span className="text-slate-700">/</span>
                      <span>{dateLabel(tx.createdAt)}</span>
                    </div>
                    <div className={cn('mt-0.5 font-mono text-[10px]', adminMuted(isDarkMode))}>
                      {tx.flagReason}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  <div className="mr-2 text-right">
                    <div
                      className={cn(
                        'font-mono text-xs font-bold',
                        tx.amount < 0 ? 'text-rose-300' : 'text-emerald-300',
                      )}
                    >
                      {tx.amount < 0 ? '-' : '+'}
                      {Math.abs(tx.amount).toLocaleString()} {tx.currency}
                    </div>
                    <div className="font-mono text-[9px] text-slate-500">Fee {tx.fee}</div>
                  </div>
                  {tx.risk === 'High' && (
                    <button
                      type="button"
                      onClick={() => onFreezeAccount(tx)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-rose-500 active:scale-95"
                    >
                      <Lock size={12} />
                      Freeze
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onInspectSlip(tx)}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-2 text-[11px] font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                  >
                    <FileText size={12} />
                    Inspect
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </Panel>
    </div>
  )
}
