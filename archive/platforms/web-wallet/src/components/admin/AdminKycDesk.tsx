import React, { useMemo, useState } from 'react'
import {
  Check,
  X,
  Search,
  Eye,
  Clock3,
  ShieldCheck,
  FileWarning,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  Fingerprint,
} from 'lucide-react'
import type { KycApplicant } from '../../pages/DashboardPage'
import {
  Avatar,
  DeskHeader,
  EmptyState,
  KeyValue,
  Panel,
  Segmented,
  StatCard,
  StatusPill,
  adminInput,
  adminInset,
  adminMuted,
  adminText,
  type AdminTone,
} from './AdminUI'
import { cn } from '../../lib/utils'

interface AdminKycDeskProps {
  applicants: KycApplicant[]
  onApprove: (applicant: KycApplicant) => void
  onOpenRejectModal: (applicant: KycApplicant) => void
  isDarkMode: boolean
  loading?: boolean
}

type KycFilter = 'Pending' | 'Verified' | 'Rejected' | 'all'

const statusTone = (status: KycApplicant['status']): AdminTone => {
  if (status === 'Verified') return 'emerald'
  if (status === 'Rejected') return 'rose'
  if (status === 'Unverified') return 'slate'
  return 'amber'
}

function formatDate(value: string) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const AdminKycDesk: React.FC<AdminKycDeskProps> = ({
  applicants,
  onApprove,
  onOpenRejectModal,
  isDarkMode,
  loading,
}) => {
  const [filter, setFilter] = useState<KycFilter>('Pending')
  const [search, setSearch] = useState('')
  const [inspectingApplicant, setInspectingApplicant] = useState<KycApplicant | null>(null)

  const counts = useMemo(
    () => ({
      pending: applicants.filter((item) => item.status === 'Pending').length,
      verified: applicants.filter((item) => item.status === 'Verified').length,
      rejected: applicants.filter((item) => item.status === 'Rejected').length,
      unverified: applicants.filter((item) => item.status === 'Unverified').length,
    }),
    [applicants],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return applicants.filter((item) => {
      const matchesFilter = filter === 'all' || item.status === filter
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.email.toLowerCase().includes(query) ||
        item.uid.toLowerCase().includes(query) ||
        item.nationalIdNo.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [applicants, filter, search])

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Operations · Identity"
        title="KYC Review"
        description="Review real identity records from the database. Approving a request upgrades the account to Tier 2; rejecting keeps it at Tier 1."
        isDarkMode={isDarkMode}
        actions={
          <>
            <StatusPill tone="emerald" dot>
              Live data
            </StatusPill>
            <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2 font-mono text-[10px] font-bold text-slate-400 backdrop-blur-xl">
              <Fingerprint size={13} />
              {loading ? 'Reading database…' : `${applicants.length} records`}
            </div>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Pending review"
          value={counts.pending}
          hint="Awaiting operator decision"
          icon={<Clock3 size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Verified"
          value={counts.verified}
          hint="Tier 2 accounts"
          icon={<ShieldCheck size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Unverified"
          value={counts.unverified}
          hint="No identity document submitted"
          icon={<FileWarning size={15} />}
          tone="slate"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          hint="Applications declined"
          icon={<X size={15} />}
          tone="rose"
          isDarkMode={isDarkMode}
        />
      </div>

      <Panel
        isDarkMode={isDarkMode}
        bodyClassName="p-0"
        title={
          <span className="flex items-center gap-2">
            Identity queue
            <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-400">
              {filtered.length} records
            </span>
          </span>
        }
        description="Search and action identity verification records."
        actions={
          <Segmented
            isDarkMode={isDarkMode}
            value={filter}
            onChange={setFilter}
            tone="amber"
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Verified', label: 'Verified' },
              { value: 'Rejected', label: 'Rejected' },
              { value: 'all', label: 'All' },
            ]}
          />
        }
      >
        <div className="flex flex-col gap-2 border-b border-white/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, UID or national ID…"
              className={cn(
                'w-full rounded-xl border py-2 pl-8 pr-3 text-[11px] font-medium outline-none transition',
                adminInput(isDarkMode),
              )}
            />
          </div>
          <div className={cn('flex items-center gap-2 font-mono text-[10px]', adminMuted(isDarkMode))}>
            <ShieldCheck size={13} />
            Source · user_profiles
          </div>
        </div>

        <div className="hidden grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] gap-4 border-b border-white/[0.06] bg-white/[0.02] px-5 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-slate-500 lg:grid">
          <span>Account</span>
          <span>Identity</span>
          <span>KYC state</span>
          <span className="text-right">Action</span>
        </div>

        {loading && applicants.length === 0 ? (
          <EmptyState isDarkMode={isDarkMode} title="Loading identity records…" description="Reading from the database." />
        ) : filtered.length === 0 ? (
          <EmptyState
            isDarkMode={isDarkMode}
            icon={<ShieldCheck size={20} />}
            title="No identity records in this view"
            description="Try another status filter or clear the search query."
          />
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((item) => {
              const isSelected = inspectingApplicant?.id === item.id
              return (
                <div
                  key={item.id}
                  className={cn(
                    'grid gap-3 px-4 py-3.5 transition-colors sm:px-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)_minmax(0,0.9fr)_auto] lg:items-center lg:gap-4',
                    isSelected ? 'bg-indigo-500/[0.06]' : 'hover:bg-white/[0.025]',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar label={item.name.charAt(0).toUpperCase()} tone={statusTone(item.status)} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('truncate text-xs font-bold', adminText(isDarkMode))}>{item.name}</span>
                        <StatusPill tone={statusTone(item.status)} dot>
                          {item.status}
                        </StatusPill>
                      </div>
                      <div className={cn('mt-0.5 truncate font-mono text-[10px]', adminMuted(isDarkMode))}>
                        {item.email || 'No email'} · UID {item.uid}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className={cn('font-mono text-[11px] font-semibold', adminText(isDarkMode))}>
                      {item.nationalIdNo || 'Not submitted'}
                    </div>
                    <div className={cn('mt-0.5 truncate text-[10px]', adminMuted(isDarkMode))}>
                      {item.address || 'No address'}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-start lg:gap-1">
                    <span className={cn('font-mono text-[11px] font-bold', adminText(isDarkMode))}>
                      Tier {item.kycTier}
                    </span>
                    <span className={cn('font-mono text-[9px]', adminMuted(isDarkMode))}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => setInspectingApplicant(item)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-[11px] font-semibold text-slate-300 transition hover:bg-white/[0.07] hover:text-white"
                    >
                      <Eye size={13} />
                      Inspect
                    </button>
                    {item.status === 'Pending' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onApprove(item)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
                        >
                          <Check size={13} />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onOpenRejectModal(item)}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-rose-400/20 bg-rose-500/10 px-3 py-1.5 text-[11px] font-bold text-rose-300 transition hover:bg-rose-500/20 active:scale-95"
                        >
                          <X size={13} />
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Panel>

      {inspectingApplicant && (
        <div className="fixed inset-0 z-[60] flex justify-end overflow-hidden bg-[#03050A]/75 backdrop-blur-sm">
          <div className="flex h-full w-full max-w-md flex-col border-l border-white/[0.07] bg-[#070A12]/95 shadow-2xl backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.06] bg-white/[0.02] px-5 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-indigo-400/20 bg-indigo-400/10 text-indigo-300">
                  <ShieldCheck size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-black text-white">Identity record</h3>
                  <div className="font-mono text-[10px] text-slate-500">{inspectingApplicant.id}</div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingApplicant(null)}
                className="rounded-lg p-1.5 text-slate-400 transition hover:bg-white/5 hover:text-white"
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-4 backdrop-blur-xl">
                <div className="flex items-center gap-3">
                  <Avatar
                    label={inspectingApplicant.name.charAt(0).toUpperCase()}
                    tone={statusTone(inspectingApplicant.status)}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-black text-white">{inspectingApplicant.name}</span>
                      <StatusPill tone={statusTone(inspectingApplicant.status)} dot>
                        {inspectingApplicant.status}
                      </StatusPill>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400">
                      Tier {inspectingApplicant.kycTier} · {inspectingApplicant.uid}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
                  Identity details
                </div>
                <div className={cn('divide-y divide-white/[0.06] rounded-2xl border px-4 py-2', adminInset(isDarkMode))}>
                  <KeyValue isDarkMode label="National ID" value={inspectingApplicant.nationalIdNo || 'Not submitted'} />
                  <KeyValue isDarkMode label="Date of birth" value={inspectingApplicant.dob || '—'} />
                  <KeyValue isDarkMode label="Address" value={inspectingApplicant.address || '—'} />
                  <KeyValue isDarkMode label="Created" value={formatDate(inspectingApplicant.createdAt)} />
                  <KeyValue isDarkMode label="Balance" value={`₳ ${inspectingApplicant.balance.toLocaleString()}`} />
                  <KeyValue isDarkMode label="USD balance" value={`$${inspectingApplicant.usdBalance.toLocaleString()}`} />
                </div>
              </div>

              <div className="grid gap-2 sm:grid-cols-2">
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 font-mono text-[10px] text-slate-300">
                  <Mail size={13} className="text-slate-500" />
                  <span className="truncate">{inspectingApplicant.email || 'No email'}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 font-mono text-[10px] text-slate-300">
                  <Phone size={13} className="text-slate-500" />
                  <span className="truncate">{inspectingApplicant.phone || 'No phone'}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 font-mono text-[10px] text-slate-300 sm:col-span-2">
                  <MapPin size={13} className="text-slate-500" />
                  <span className="truncate">{inspectingApplicant.address || 'No address'}</span>
                </div>
                <div className="flex items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 font-mono text-[10px] text-slate-300 sm:col-span-2">
                  <CalendarDays size={13} className="text-slate-500" />
                  <span>Registered {formatDate(inspectingApplicant.createdAt)}</span>
                </div>
              </div>

              {inspectingApplicant.rejectionReason && (
                <div className="rounded-xl border border-rose-400/20 bg-rose-500/10 p-3 text-[11px] text-rose-300">
                  Rejection reason · {inspectingApplicant.rejectionReason}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 border-t border-white/[0.06] p-4">
              {inspectingApplicant.status === 'Pending' ? (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      onApprove(inspectingApplicant)
                      setInspectingApplicant(null)
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-emerald-500 active:scale-95"
                  >
                    <Check size={14} />
                    Approve Tier 2
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const applicant = inspectingApplicant
                      setInspectingApplicant(null)
                      onOpenRejectModal(applicant)
                    }}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-rose-400/20 bg-rose-500/10 py-2.5 text-xs font-bold text-rose-300 transition hover:bg-rose-500/20 active:scale-95"
                  >
                    <X size={14} />
                    Reject
                  </button>
                </>
              ) : (
                <div className={cn('w-full py-1 text-center font-mono text-[11px]', adminMuted(isDarkMode))}>
                  No action required · {inspectingApplicant.status}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
