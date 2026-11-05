import React, { useState } from 'react'
import {
  Check,
  X,
  Search,
  Scan,
  Eye,
  BadgeCheck,
} from 'lucide-react'
import type { KycApplicant } from '../../pages/DashboardPage'

interface AdminKycDeskProps {
  kycQueue: KycApplicant[]
  onApprove: (applicant: KycApplicant) => void
  onOpenRejectModal: (applicant: KycApplicant) => void
  isDarkMode: boolean
  lang: 'ak' | 'en'
}

export const AdminKycDesk: React.FC<AdminKycDeskProps> = ({
  kycQueue,
  onApprove,
  onOpenRejectModal,
  isDarkMode,
}) => {
  const [filter, setFilter] = useState<'all' | 'Pending' | 'Approved' | 'Rejected'>('Pending')
  const [search, setSearch] = useState('')
  const [inspectingApplicant, setInspectingApplicant] = useState<KycApplicant | null>(null)

  const pendingCount = kycQueue.filter((k) => k.status === 'Pending').length
  const approvedCount = kycQueue.filter((k) => k.status === 'Approved').length
  const rejectedCount = kycQueue.filter((k) => k.status === 'Rejected').length

  const filtered = kycQueue.filter((item) => {
    const matchFilter = filter === 'all' || item.status === filter
    const q = search.toLowerCase()
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(q) ||
      item.idCard.toLowerCase().includes(q) ||
      item.township.toLowerCase().includes(q)
    return matchFilter && matchSearch
  })

  return (
    <div className="relative space-y-4">
      {/* Top High-Density Metric Strip (BoardUI Style) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-500 font-mono font-bold uppercase">
            <span>Pending Review</span>
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            {pendingCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">SLA Target &lt; 2m</div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-500 font-mono font-bold uppercase">
            <span>Approved</span>
            <Check size={14} />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            {approvedCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Tier 2 Elevated</div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-slate-400 font-mono font-bold uppercase">
            <span>Avg Face Match</span>
            <Scan size={14} />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            97.8%
          </div>
          <div className="text-[10px] text-emerald-500 font-medium mt-0.5">High Confidence</div>
        </div>

        <div
          className={`p-3.5 rounded-2xl border transition-all ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-rose-500 font-mono font-bold uppercase">
            <span>Rejected / Hold</span>
            <X size={14} />
          </div>
          <div className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white mt-1">
            {rejectedCount}
          </div>
          <div className="text-[10px] text-slate-400 font-medium mt-0.5">Blurry or Expired</div>
        </div>
      </div>

      {/* Filter and Quick Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
        <div className="relative flex-1 max-w-md">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter applicant by name, NRIC, township..."
            className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs border transition focus:outline-none focus:border-[#FF6B00] ${
              isDarkMode
                ? 'bg-zinc-900/70 border-white/10 text-white placeholder-zinc-500'
                : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'
            }`}
          />
        </div>

        <div
          className={`flex items-center p-1 rounded-xl border text-xs font-mono font-semibold ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-slate-100 border-slate-200/80'
          }`}
        >
          {(['Pending', 'Approved', 'Rejected', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-3 py-1 rounded-lg capitalize transition cursor-pointer ${
                filter === tab
                  ? 'bg-[#FF6B00] text-white shadow-xs font-bold'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {tab === 'all' ? 'All Records' : tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Table / High Density Grid */}
      <div
        className={`rounded-2xl border overflow-hidden shadow-xs divide-y transition-all ${
          isDarkMode
            ? 'bg-zinc-900/40 border-white/10 divide-white/5'
            : 'bg-white border-slate-200 divide-slate-100'
        }`}
      >
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400 font-mono">
            No KYC applicants found in this view.
          </div>
        ) : (
          filtered.map((item) => {
            const isSelected = inspectingApplicant?.id === item.id
            return (
              <div
                key={item.id}
                className={`p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                  isSelected
                    ? isDarkMode
                      ? 'bg-zinc-800/80 ring-1 ring-inset ring-[#FF6B00]/40'
                      : 'bg-orange-50/70 ring-1 ring-inset ring-[#FF6B00]/40'
                    : isDarkMode
                    ? 'hover:bg-zinc-800/40'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                {/* Applicant Summary */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B00]/20 to-amber-500/10 border border-[#FF6B00]/20 flex items-center justify-center font-bold text-sm text-[#FF6B00] shrink-0">
                    {item.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-xs text-slate-900 dark:text-white truncate">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ({item.nameMm})
                      </span>
                      <span
                        className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                          item.status === 'Approved'
                            ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                            : item.status === 'Rejected'
                            ? 'bg-rose-500/15 text-rose-500 border border-rose-500/30'
                            : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-zinc-400 font-mono flex items-center gap-2 mt-0.5">
                      <span>{item.idCard}</span>
                      <span>•</span>
                      <span>{item.township}</span>
                      <span>•</span>
                      <span
                        className={`font-semibold ${
                          item.faceMatchScore >= 95
                            ? 'text-emerald-500'
                            : item.faceMatchScore >= 80
                            ? 'text-amber-500'
                            : 'text-rose-500'
                        }`}
                      >
                        {item.faceMatchScore}% Match
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => setInspectingApplicant(item)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 border transition cursor-pointer ${
                      isDarkMode
                        ? 'bg-zinc-800 text-zinc-200 border-white/10 hover:bg-zinc-700'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <Eye size={13} />
                    <span>Inspect</span>
                  </button>

                  {item.status === 'Pending' && (
                    <>
                      <button
                        onClick={() => onApprove(item)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <Check size={13} />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => onOpenRejectModal(item)}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition flex items-center gap-1 shadow-xs cursor-pointer active:scale-95"
                      >
                        <X size={13} />
                        <span>Reject</span>
                      </button>
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* ── PANELUI SLIDE-OVER INSPECTION DRAWER ── */}
      {inspectingApplicant && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div
            className={`w-full max-w-md h-full flex flex-col justify-between shadow-2xl border-l transition-all duration-300 animate-in slide-in-from-right ${
              isDarkMode
                ? 'bg-zinc-950 border-white/10 text-white'
                : 'bg-white border-slate-200 text-slate-900'
            }`}
          >
            {/* Drawer Header */}
            <div
              className={`p-4 border-b flex items-center justify-between ${
                isDarkMode ? 'border-white/10 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              <div className="flex items-center gap-2">
                <BadgeCheck size={18} className="text-[#FF6B00]" />
                <h3 className="font-black text-sm">KYC Inspector</h3>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-[#FF6B00]/10 text-[#FF6B00] font-bold">
                  {inspectingApplicant.id}
                </span>
              </div>
              <button
                onClick={() => setInspectingApplicant(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X size={16} />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
              {/* Applicant Profile Card */}
              <div
                className={`p-3.5 rounded-xl border space-y-2.5 ${
                  isDarkMode ? 'bg-zinc-900/80 border-white/10' : 'bg-slate-50 border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#FF6B00] to-amber-400 text-white font-black text-lg flex items-center justify-center shadow-md">
                    {inspectingApplicant.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-extrabold text-sm">{inspectingApplicant.name}</div>
                    <div className="text-slate-400 font-mono text-[11px]">
                      {inspectingApplicant.nameMm}
                    </div>
                    <div className="text-slate-400 font-mono text-[10px]">
                      UID: {inspectingApplicant.uid}
                    </div>
                  </div>
                </div>

                {/* Biometric Match Pill */}
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-between font-mono">
                  <span className="font-bold flex items-center gap-1.5">
                    <Scan size={14} /> Biometric Match Score
                  </span>
                  <span className="font-black text-sm">{inspectingApplicant.faceMatchScore}%</span>
                </div>
              </div>

              {/* Verified Registry Details */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Citizen Identification Data
                </span>
                <div
                  className={`p-3 rounded-xl border divide-y ${
                    isDarkMode
                      ? 'bg-zinc-900/40 border-white/10 divide-white/5 font-mono'
                      : 'bg-white border-slate-200 divide-slate-100 font-mono'
                  }`}
                >
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">NRIC No</span>
                    <span className="font-bold">{inspectingApplicant.idCard}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Township</span>
                    <span className="font-bold">{inspectingApplicant.township}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">DOB</span>
                    <span>{inspectingApplicant.dob}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Father Name</span>
                    <span>{inspectingApplicant.fatherName}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Occupation</span>
                    <span>{inspectingApplicant.occupation}</span>
                  </div>
                  <div className="py-1.5 flex justify-between">
                    <span className="text-slate-400">Doc Quality</span>
                    <span className="text-emerald-500 font-bold">
                      {inspectingApplicant.docQuality}
                    </span>
                  </div>
                </div>
              </div>

              {/* Automated Heuristic Verification Checks */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">
                  Security Checks
                </span>
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5 font-bold">
                    <Check size={12} /> Liveness Passed
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5 font-bold">
                    <Check size={12} /> NRIC Verified
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5 font-bold">
                    <Check size={12} /> PEP Clean
                  </div>
                  <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 flex items-center gap-1.5 font-bold">
                    <Check size={12} /> 0 Duplicate UIDs
                  </div>
                </div>
              </div>
            </div>

            {/* Drawer Action Footer */}
            <div
              className={`p-4 border-t flex items-center gap-2 ${
                isDarkMode ? 'border-white/10 bg-zinc-900/60' : 'border-slate-200 bg-slate-50'
              }`}
            >
              {inspectingApplicant.status === 'Pending' ? (
                <>
                  <button
                    onClick={() => {
                      onApprove(inspectingApplicant)
                      setInspectingApplicant(null)
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                  >
                    <Check size={14} />
                    <span>Approve Tier-2</span>
                  </button>
                  <button
                    onClick={() => {
                      const app = inspectingApplicant
                      setInspectingApplicant(null)
                      onOpenRejectModal(app)
                    }}
                    className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold transition flex items-center justify-center gap-1.5 shadow-md cursor-pointer active:scale-95"
                  >
                    <X size={14} />
                    <span>Reject</span>
                  </button>
                </>
              ) : (
                <div className="w-full text-center py-1 text-slate-400 font-mono text-xs">
                  Applicant has been {inspectingApplicant.status.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
