import React from 'react'
import {
  ShieldCheck,
  AlertTriangle,
  FileText,
  Activity,
  Lock,
  History,
} from 'lucide-react'
import type { SystemAuditLog } from '../../pages/DashboardPage'

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
  return (
    <div className="space-y-4">
      {/* Top Metric Strip (BoardUI Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="text-xs text-emerald-500 font-mono font-bold uppercase">
            Clean Transactions
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            99.2%
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Automated Heuristic</div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="text-xs text-amber-500 font-mono font-bold uppercase">Velocity Alerts</div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            2
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">High Frequency Shifts</div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="text-xs text-rose-500 font-mono font-bold uppercase">High Risk Flags</div>
          <div className="text-2xl font-black font-mono tracking-tight text-rose-500 mt-1">1</div>
          <div className="text-[10px] text-rose-400 font-medium mt-0.5">Security Hold Applied</div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
            circuitBreakerActive
              ? 'bg-rose-950/80 border-rose-500'
              : isDarkMode
              ? 'bg-zinc-900/60 border-white/5'
              : 'bg-white border-slate-200/80 shadow-xs'
          }`}
          onClick={onOpenKillSwitch}
        >
          <div className="text-xs text-slate-400 font-mono font-bold uppercase">Circuit Breaker</div>
          <div
            className={`text-sm font-black font-mono mt-1 ${
              circuitBreakerActive ? 'text-rose-400 animate-pulse' : 'text-emerald-500'
            }`}
          >
            {circuitBreakerActive ? 'SETTLEMENT FROZEN' : 'ARMED / ONLINE'}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Click to toggle</div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <Activity size={16} className="text-[#FF6B00]" />
          <span>Real-Time Heuristic Transactions</span>
        </h3>

        <div
          className={`flex items-center p-1 rounded-xl border text-xs font-mono font-semibold ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-slate-100 border-slate-200/80'
          }`}
        >
          {(['all', 'flagged', 'clean'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFraudFilter(f)}
              className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                fraudFilter === f
                  ? 'bg-rose-600 text-white font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {f === 'all' ? 'All' : f}
            </button>
          ))}
        </div>
      </div>

      {/* Fraud Transactions List */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-xs divide-y transition-all ${
          isDarkMode
            ? 'bg-zinc-900/40 border-white/10 divide-white/5'
            : 'bg-white border-slate-200 divide-slate-100'
        }`}
      >
        {filteredFraudTxs.map((tx) => (
          <div
            key={tx.id}
            className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
              isDarkMode ? 'hover:bg-zinc-800/40' : 'hover:bg-slate-50/80'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                  tx.risk === 'High'
                    ? 'bg-rose-500/15 text-rose-500'
                    : tx.risk === 'Medium'
                    ? 'bg-amber-500/15 text-amber-500'
                    : 'bg-emerald-500/15 text-emerald-500'
                }`}
              >
                {tx.risk === 'High' ? <AlertTriangle size={16} /> : <ShieldCheck size={16} />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                    {tx.title}
                  </span>
                  <span
                    className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                      tx.risk === 'High'
                        ? 'bg-rose-500/20 text-rose-500 font-mono animate-pulse'
                        : tx.risk === 'Medium'
                        ? 'bg-amber-500/20 text-amber-500 font-mono'
                        : 'bg-emerald-500/15 text-emerald-500 font-mono'
                    }`}
                  >
                    Risk: {tx.risk}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                  <span>Ref: {tx.refId}</span>
                  <span>•</span>
                  <span>Target: {tx.counterparty}</span>
                  <span>•</span>
                  <span className="font-bold text-slate-900 dark:text-white">{tx.amount} ₳</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                  Trigger: {tx.flagReason}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              {tx.risk === 'High' && (
                <button
                  onClick={() => onFreezeAccount(tx.counterparty)}
                  className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                >
                  <Lock size={12} />
                  <span>Freeze Account</span>
                </button>
              )}
              <button
                onClick={() => onInspectSlip(tx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition cursor-pointer ${
                  isDarkMode
                    ? 'bg-zinc-800 text-zinc-200 border-white/10 hover:bg-zinc-700'
                    : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                }`}
              >
                <FileText size={12} />
                <span>Inspect Slip</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Operator Audit Log Stream */}
      <div
        className={`p-4 rounded-2xl border space-y-3 ${
          isDarkMode ? 'bg-zinc-900/40 border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
            <History size={14} className="text-slate-400" />
            <span>Real-Time Administrative Audit Trail</span>
          </h4>
          <span className="text-[10px] font-mono text-slate-400">
            {auditLogs.length} events logged
          </span>
        </div>

        <div className="space-y-1.5 max-h-48 overflow-y-auto">
          {auditLogs.map((log) => (
            <div
              key={log.id}
              className={`p-2.5 rounded-xl flex items-center justify-between text-[11px] font-mono ${
                isDarkMode ? 'bg-zinc-900/80' : 'bg-slate-50'
              }`}
            >
              <div className="truncate pr-2">
                <span className="text-slate-400">[{log.timestamp}]</span>{' '}
                <span className="font-bold text-slate-700 dark:text-zinc-300">{log.action}:</span>{' '}
                <span className="text-slate-500">{log.details}</span>
              </div>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                  log.status === 'SUCCESS'
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-amber-500/10 text-amber-500'
                }`}
              >
                {log.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
