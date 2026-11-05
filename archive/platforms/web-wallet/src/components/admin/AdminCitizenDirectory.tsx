import React, { useState } from 'react'
import {
  Users,
  Search,
  Download,
  Eye,
  Lock,
  Unlock,
  X,
} from 'lucide-react'
import type { AdminUserRecord } from '../../pages/DashboardPage'

interface AdminCitizenDirectoryProps {
  usersList: AdminUserRecord[]
  onToggleUserStatus: (uid: string, currentStatus: string) => Promise<void>
  isDarkMode: boolean
}

export const AdminCitizenDirectory: React.FC<AdminCitizenDirectoryProps> = ({
  usersList,
  onToggleUserStatus,
  isDarkMode,
}) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'ACTIVE' | 'FROZEN'>('all')
  const [inspectingUser, setInspectingUser] = useState<AdminUserRecord | null>(null)

  const activeCount = usersList.filter((u) => u.status === 'ACTIVE').length
  const frozenCount = usersList.filter((u) => u.status === 'FROZEN').length
  const tier2Count = usersList.filter((u) => u.kycTier === 2).length
  const totalAkdCirculation = usersList.reduce((acc, u) => acc + (u.akdBalance || 0), 0)

  const filteredUsers = usersList.filter((user) => {
    const matchFilter = statusFilter === 'all' || user.status === statusFilter
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      user.name.toLowerCase().includes(q) ||
      user.uid.toLowerCase().includes(q) ||
      (user.phone && user.phone.includes(q)) ||
      user.username.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  const exportCsv = () => {
    const csvContent =
      'UID,Name,Username,Phone,AKD_Balance,USD_Balance,KYC_Tier,Status,Township\n' +
      usersList
        .map(
          (u) =>
            `${u.uid},"${u.name}",${u.username},"${u.phone || ''}",${u.akdBalance},${
              u.usdBalance
            },Tier ${u.kycTier},${u.status},"${u.township || 'Arakan'}"`
        )
        .join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `pethar-citizens-${new Date().toISOString().slice(0, 10)}.csv`
    link.click()
  }

  return (
    <div className="space-y-4">
      {/* Top Metric Strip (BoardUI Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="text-xs text-slate-400 font-mono font-bold uppercase">Total Registered</div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            {usersList.length}
          </div>
          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">
            {activeCount} Active Accounts
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="text-xs text-[#FF6B00] font-mono font-bold uppercase">Tier 2 Verified</div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            {tier2Count}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">
            {Math.round((tier2Count / (usersList.length || 1)) * 100)}% of total
          </div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="text-xs text-amber-500 font-mono font-bold uppercase">Citizen Balances</div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            ₳ {totalAkdCirculation.toLocaleString('en-US', { minimumFractionDigits: 0 })}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">1:1 Peg Equivalence</div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="text-xs text-rose-500 font-mono font-bold uppercase">Frozen Accounts</div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            {frozenCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Security Holds</div>
        </div>
      </div>

      {/* Filter and CSV Export Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search citizen name, UID, username..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border transition focus:outline-none focus:border-[#FF6B00] ${
              isDarkMode
                ? 'bg-zinc-900/70 border-white/10 text-white placeholder-zinc-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div className="flex items-center gap-2">
          {/* Status Filter */}
          <div
            className={`flex items-center p-1 rounded-xl border text-xs font-mono font-semibold ${
              isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-slate-100 border-slate-200/80'
            }`}
          >
            {(['all', 'ACTIVE', 'FROZEN'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                  statusFilter === st
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {st === 'all' ? 'All' : st.toLowerCase()}
              </button>
            ))}
          </div>

          {/* Export CSV */}
          <button
            onClick={exportCsv}
            className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 border transition cursor-pointer active:scale-95 ${
              isDarkMode
                ? 'bg-zinc-900 border-white/10 text-zinc-200 hover:bg-zinc-800'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100 shadow-xs'
            }`}
          >
            <Download size={13} />
            <span>CSV</span>
          </button>
        </div>
      </div>

      {/* Directory Table */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-xs divide-y transition-all ${
          isDarkMode
            ? 'bg-zinc-900/40 border-white/10 divide-white/5'
            : 'bg-white border-slate-200 divide-slate-100'
        }`}
      >
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            No citizen records matching your filter.
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.uid}
              className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                inspectingUser?.uid === user.uid
                  ? isDarkMode
                    ? 'bg-zinc-800/80 ring-1 ring-inset ring-[#FF6B00]/40'
                    : 'bg-orange-50/70 ring-1 ring-inset ring-[#FF6B00]/40'
                  : isDarkMode
                  ? 'hover:bg-zinc-800/40'
                  : 'hover:bg-slate-50/80'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-200 dark:bg-zinc-800 flex items-center justify-center font-bold text-xs text-slate-700 dark:text-zinc-300 shrink-0">
                  {user.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                      {user.name}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {user.username}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        user.kycTier === 2
                          ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                          : 'bg-slate-500/15 text-slate-500'
                      }`}
                    >
                      Tier {user.kycTier}
                    </span>
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                        user.status === 'ACTIVE'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-rose-500/15 text-rose-500'
                      }`}
                    >
                      {user.status}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                    <span>UID: {user.uid}</span>
                    <span>•</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      ₳ {user.akdBalance.toFixed(2)}
                    </span>
                    <span>•</span>
                    <span>{user.township || 'Sittwe'}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                <button
                  onClick={() => setInspectingUser(user)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 border transition cursor-pointer ${
                    isDarkMode
                      ? 'bg-zinc-800 text-zinc-200 border-white/10 hover:bg-zinc-700'
                      : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  <Eye size={13} />
                  <span>Inspect</span>
                </button>

                <button
                  onClick={() => onToggleUserStatus(user.uid, user.status)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95 ${
                    user.status === 'FROZEN'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                      : 'bg-rose-600/15 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-500/30'
                  }`}
                >
                  {user.status === 'FROZEN' ? (
                    <>
                      <Unlock size={12} />
                      <span>Unfreeze</span>
                    </>
                  ) : (
                    <>
                      <Lock size={12} />
                      <span>Freeze</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── PANELUI INSPECTOR DRAWER FOR CITIZEN ── */}
      {inspectingUser && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l transition-all duration-300 animate-in slide-in-from-right ${
              isDarkMode
                ? 'bg-zinc-950 border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Header */}
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-white/10 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <Users size={18} className="text-[#FF6B00]" />
                <h3 className="font-black text-sm">Citizen Dossier</h3>
              </div>
              <button
                onClick={() => setInspectingUser(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              <div
                className={`p-3.5 rounded-xl border space-y-2 ${
                  isDarkMode ? 'bg-zinc-900/80 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="font-extrabold text-base">{inspectingUser.name}</div>
                <div className="text-slate-400 font-mono text-[11px]">
                  {inspectingUser.username} • UID: {inspectingUser.uid}
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-inherit font-mono">
                  <span className="text-slate-400">Péthar AKD Balance</span>
                  <span className="font-black text-sm text-[#FF6B00]">
                    ₳ {inspectingUser.akdBalance.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Account Meta */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Account Parameters
                </span>
                <div
                  className={`p-3 rounded-xl border divide-y font-mono ${
                    isDarkMode
                      ? 'bg-zinc-900/40 border-white/10 divide-white/5'
                      : 'bg-white border-slate-200 divide-slate-100'
                  }`}
                >
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">KYC Status</span>
                    <span className="font-bold text-emerald-500">Tier {inspectingUser.kycTier}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Account State</span>
                    <span className="font-bold">{inspectingUser.status}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Phone</span>
                    <span>{inspectingUser.phone || 'N/A'}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Wallet Hash</span>
                    <span className="truncate max-w-[180px]">{inspectingUser.walletAddress}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Township</span>
                    <span>{inspectingUser.township || 'Arakan State'}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Daily Transfer Limit</span>
                    <span>₳ {inspectingUser.dailyLimit?.toLocaleString() || '10,000.00'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div
              className={`p-4 border-t flex items-center gap-2 ${
                isDarkMode ? 'border-white/10 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <button
                onClick={async () => {
                  const target = inspectingUser
                  await onToggleUserStatus(target.uid, target.status)
                  setInspectingUser((prev) =>
                    prev ? { ...prev, status: prev.status === 'FROZEN' ? 'ACTIVE' : 'FROZEN' } : null
                  )
                }}
                className={`w-full py-2.5 rounded-xl font-bold transition flex items-center justify-center gap-2 shadow-md cursor-pointer active:scale-95 ${
                  inspectingUser.status === 'FROZEN'
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                    : 'bg-rose-600 hover:bg-rose-500 text-white'
                }`}
              >
                {inspectingUser.status === 'FROZEN' ? (
                  <>
                    <Unlock size={14} />
                    <span>Restore Account Privileges</span>
                  </>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Freeze Citizen Account</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
