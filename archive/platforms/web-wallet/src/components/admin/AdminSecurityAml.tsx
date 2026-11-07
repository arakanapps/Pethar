import React from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  Lock,
  History,
  Gauge,
  Radar,
  ArrowUpRight,
} from 'lucide-react'
import type { SystemAuditLog } from '../../pages/DashboardPage'
import {
  Avatar,
  DeskHeader,
  EmptyState,
  Panel,
  Segmented,
  StatCard,
  StatusPill,
  adminMuted,
  adminText,
} from './AdminUI'
import { cn } from '../../lib/utils'

interface AdminSecurityAmlProps {
  filteredFraudTxs: any[]
  fraudFilter: 'all' | 'flagged' | 'clean'
  setFraudFilter: (f: 'all' | 'flagged' | 'clean') => void
  onFreezeAccount: (counterparty: string) => Promise<void>
  onInspectSlip: (tx: any) => void
  auditLogs: SystemAuditLog[]
  circuitBreakerActive: boolean
  onOpenKillSwitch: () => void
  isDarkMode: boolean
}

const riskTone = (risk: string) => {
  if (risk === 'High') return 'rose' as const
  if (risk === 'Medium') return 'amber' as const
  return 'emerald' as const
}

export const AdminSecurityAml: React.FC<AdminSecurityAmlProps> = ({
  filteredFraudTxs,
  fraudFilter,
  setFraudFilter,
  onFreezeAccount,
  onInspectSlip,
  auditLogs,
  circuitBreakerActive,
  onOpenKillSwitch,
  isDarkMode,
}) => {
  const highRiskCount = filteredFraudTxs.filter((tx) => tx.risk === 'High').length
  const flaggedCount = filteredFraudTxs.filter((tx) => tx.risk !== 'Low').length

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Operations · Risk"
        title="Risk & Ledger"
        description="Monitor live settlement heuristics, freeze high-risk accounts and review the immutable operator audit trail."
        isDarkMode={isDarkMode}
        actions={
          <>
            <StatusPill tone="emerald" dot>
              Heuristics active
            </StatusPill>
            <button
              type="button"
              onClick={onOpenKillSwitch}
              className={cn(
                'inline-flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[10px] font-bold uppercase tracking-wider transition active:scale-95',
                circuitBreakerActive
                  ? 'animate-pulse border-rose-500 bg-rose-600 text-white'
                  : isDarkMode
                    ? 'border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                    : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
              )}
            >
              <AlertTriangle size={13} />
              {circuitBreakerActive ? 'Settlement frozen' : 'Kill-switch'}
            </button>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Clean transactions"
          value="99.2%"
          hint="Automated heuristic pass rate"
          icon={<ShieldCheck size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Velocity alerts"
          value="2"
          hint="High-frequency shifts detected"
          icon={<Gauge size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="High-risk flags"
          value={highRiskCount}
          hint={`${flaggedCount} transactions under review`}
          icon={<AlertTriangle size={15} />}
          tone="rose"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Circuit breaker"
          value={circuitBreakerActive ? 'Frozen' : 'Armed'}
          hint="Click to manage settlement state"
          icon={<Radar size={15} />}
          tone={circuitBreakerActive ? 'rose' : 'emerald'}
          isDarkMode={isDarkMode}
          onClick={onOpenKillSwitch}
        />
      </div>

      <Panel
        isDarkMode={isDarkMode}
        bodyClassName="p-0"
        title={
          <span className="flex items-center gap-2">
            <Activity size={14} className="text-orange-500" />
            Live transaction monitor
          </span>
        }
        description="Heuristic risk evaluation applied to every ledger movement."
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
        {filteredFraudTxs.length === 0 ? (
          <EmptyState
            isDarkMode={isDarkMode}
            icon={<ShieldCheck size={20} />}
            title="No transactions in this view"
            description="Change the risk filter to inspect the wider ledger stream."
          />
        ) : (
          <div className={cn('divide-y', isDarkMode ? 'divide-white/[0.06]' : 'divide-slate-100')}>
            {filteredFraudTxs.map((tx) => (
              <div
                key={tx.id}
                className={cn(
                  'flex flex-col gap-3 px-4 py-4 transition-colors sm:flex-row sm:items-center sm:justify-between sm:px-5',
                  isDarkMode ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80',
                )}
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
                    </div>
                    <div className={cn('mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px]', adminMuted(isDarkMode))}>
                      <span>Ref {tx.refId}</span>
                      <span className="text-slate-300 dark:text-slate-700">/</span>
                      <span>Target {tx.counterparty}</span>
                      <span className="text-slate-300 dark:text-slate-700">/</span>
                      <span className={cn('font-bold', adminText(isDarkMode))}>{tx.amount} ₳</span>
                    </div>
                    <div className={cn('mt-0.5 font-mono text-[10px]', adminMuted(isDarkMode))}>
                      Trigger · {tx.flagReason}
                    </div>
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                  {tx.risk === 'High' && (
                    <button
                      type="button"
                      onClick={() => void onFreezeAccount(tx.counterparty)}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-rose-600 px-3 py-2 text-[11px] font-bold text-white shadow-sm transition hover:bg-rose-500 active:scale-95"
                    >
                      <Lock size={12} />
                      Freeze
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => onInspectSlip(tx)}
                    className={cn(
                      'inline-flex items-center gap-1.5 rounded-xl border px-3 py-2 text-[11px] font-semibold transition',
                      isDarkMode
                        ? 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] hover:text-white'
                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                    )}
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

      <Panel
        isDarkMode={isDarkMode}
        bodyClassName="p-0"
        title={
          <span className="flex items-center gap-2">
            <History size={14} className="text-slate-400" />
            Administrative audit trail
          </span>
        }
        description="Append-only record of sensitive operator actions."
        actions={
          <span className={cn('font-mono text-[10px]', adminMuted(isDarkMode))}>
            {auditLogs.length} events
          </span>
        }
      >
        <div className={cn('max-h-64 divide-y overflow-y-auto', isDarkMode ? 'divide-white/[0.06]' : 'divide-slate-100')}>
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className={cn(
                'flex items-start justify-between gap-3 px-4 py-2.5 font-mono text-[10px] sm:px-5',
                isDarkMode ? 'hover:bg-white/[0.025]' : 'hover:bg-slate-50/80',
              )}
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={cn('text-[9px]', adminMuted(isDarkMode))}>[{log.timestamp}]</span>
                  <span className={cn('font-bold', adminText(isDarkMode))}>{log.action}</span>
                  <span className="text-slate-400">· {log.operator}</span>
                </div>
                <div className={cn('mt-0.5 truncate', adminMuted(isDarkMode))}>{log.details}</div>
              </div>
              <StatusPill tone={log.status === 'SUCCESS' ? 'emerald' : log.status === 'CRITICAL' ? 'rose' : 'amber'}>
                {log.status}
              </StatusPill>
            </div>
          ))}
        </div>
      </Panel>

      <div className="flex items-center justify-between px-1">
        <span className={cn('font-mono text-[10px]', adminMuted(isDarkMode))}>
          Policy engine v4.2 · Zero-knowledge attestations
        </span>
        <button
          type="button"
          className={cn('inline-flex items-center gap-1 font-mono text-[10px] transition', adminMuted(isDarkMode), 'hover:text-orange-500')}
        >
          Open compliance report
          <ArrowUpRight size={11} />
        </button>
      </div>
    </div>
  )
}
