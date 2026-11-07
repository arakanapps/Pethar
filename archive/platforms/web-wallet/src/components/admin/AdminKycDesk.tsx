import React, { useMemo, useState } from 'react'
import {
  Check,
  X,
  Search,
  Scan,
  Eye,
  BadgeCheck,
  Clock3,
  ShieldCheck,
  FileWarning,
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
  kycQueue: KycApplicant[]
  onApprove: (applicant: KycApplicant) => void
  onOpenRejectModal: (applicant: KycApplicant) => void
  isDarkMode: boolean
  lang: 'ak' | 'en'
}

type KycFilter = 'Pending' | 'Approved' | 'Rejected' | 'all'

const statusTone = (status: KycApplicant['status']): AdminTone => {
  if (status === 'Approved') return 'emerald'
  if (status === 'Rejected') return 'rose'
  if (status === 'Flagged') return 'blue'
  return 'amber'
}

const riskTone = (risk: KycApplicant['riskScore']): AdminTone => {
  if (risk === 'Low') return 'emerald'
  if (risk === 'Medium') return 'amber'
  return 'rose'
}

export const AdminKycDesk: React.FC<AdminKycDeskProps> = ({
  kycQueue,
  onApprove,
  onOpenRejectModal,
  isDarkMode,
}) => {
  const [filter, setFilter] = useState<KycFilter>('Pending')
  const [search, setSearch] = useState('')
  const [inspectingApplicant, setInspectingApplicant] = useState<KycApplicant | null>(null)

  const pendingCount = kycQueue.filter((item) => item.status === 'Pending').length
  const approvedCount = kycQueue.filter((item) => item.status === 'Approved').length
  const rejectedCount = kycQueue.filter((item) => item.status === 'Rejected').length
  const flaggedCount = kycQueue.filter((item) => item.status === 'Flagged').length

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return kycQueue.filter((item) => {
      const matchesFilter = filter === 'all' || item.status === filter
      const matchesSearch =
        !query ||
        item.name.toLowerCase().includes(query) ||
        item.nameMm.toLowerCase().includes(query) ||
        item.idCard.toLowerCase().includes(query) ||
        item.township.toLowerCase().includes(query) ||
        item.uid.toLowerCase().includes(query)
      return matchesFilter && matchesSearch
    })
  }, [filter, kycQueue, search])

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Operations · Identity"
        title="Identity Review Desk"
        description="Verify submitted identity documents, biometric confidence and sanctions checks before granting elevated account tiers."
        isDarkMode={isDarkMode}
        actions={
          <>
            <StatusPill tone="emerald" dot>
              Queue online
            </StatusPill>
            <div
              className={cn(
                'flex items-center gap-2 rounded-xl border px-3 py-2 font-mono text-[10px] font-bold',
                isDarkMode
                  ? 'border-white/[0.07] bg-white/[0.03] text-slate-400'
                  : 'border-slate-200 bg-white text-slate-500',
              )}
            >
              <Clock3 size={13} />
              SLA under 2 min
            </div>
          </>
        }
      />

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <StatCard
          label="Pending review"
          value={pendingCount}
          hint="Awaiting operator decision"
          icon={<Clock3 size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Approved"
          value={approvedCount}
          hint="Elevated to Tier 2 access"
          icon={<ShieldCheck size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Face match avg"
          value="97.8%"
          hint="High-confidence biometrics"
          icon={<Scan size={15} />}
          tone="blue"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Rejected / flagged"
          value={rejectedCount + flaggedCount}
          hint="Blurry, expired or mismatched"
          icon={<FileWarning size={15} />}
          tone="rose"
          isDarkMode={isDarkMode}
        />
      </div>

      <Panel
        isDarkMode={isDarkMode}
        bodyClassName="p-0"
        title={
          <span className="flex items-center gap-2">
            Review queue
            <span
              className={cn(
                'rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold',
                isDarkMode
                  ? 'border-white/10 bg-white/5 text-slate-400'
                  : 'border-slate-200 bg-slate-100 text-slate-500',
              )}
            >
              {filtered.length} records
            </span>
          </span>
        }
        description="Search, inspect and action identity verification requests."
        actions={
          <Segmented
            isDarkMode={isDarkMode}
            value={filter}
            onChange={setFilter}
            tone="amber"
            options={[
              { value: 'Pending', label: 'Pending' },
              { value: 'Approved', label: 'Approved' },
              { value: 'Rejected', label: 'Rejected' },
              { value: 'all', label: 'All' },
            ]}
          />
        }
      >
        <div
          className={cn(
            'flex flex-col gap-2 border-b px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-5',
            isDarkMode ? 'border-white/[0.06]' : 'border-slate-100',
          )}
        >
          <div className="relative w-full sm:max-w-sm">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by name, NRIC, township or UID…"
              className={cn(
                'w-full rounded-xl border py-2 pl-8 pr-3 text-[11px] font-medium outline-none transition',
                adminInput(isDarkMode),
              )}
            />
          </div>
          <div className={cn('flex items-center gap-2 font-mono text-[10px]', adminMuted(isDarkMode))}>
            <Fingerprint size={13} />
            Biometric and registry checks run automatically
          </div>
        </div>

        {/* Table header */}
        <div
          className={cn(
            'hidden grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_auto] gap-4 border-b px-5 py-2.5 font-mono text-[9px] font-bold uppercase tracking-[0.16em] lg:grid',
            isDarkMode
              ? 'border-white/[0.06] bg-white/[0.02] text-slate-500'
              : 'border-slate-100 bg-slate-50/70 text-slate-400',
          )}
        >
          <span>Applicant</span>
          <span>Identification</span>
          <span>Biometrics</span>
          <span className="text-right">Action</span>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            isDarkMode={isDarkMode}
            icon={<BadgeCheck size={20} />}
            title="No applicants in this view"
            description="Try a different status filter or clear the search query."
          />
        ) : (
          <div className={cn('divide-y', isDarkMode ? 'divide-white/[0.06]' : 'divide-slate-100')}>
            {filtered.map((item) => {
              const isSelected = inspectingApplicant?.id === item.id
              return (
                <div
                  key={item.id}
                  className={cn(
                    'grid gap-3 px-4 py-3.5 transition-colors sm:px-5 lg:grid-cols-[minmax(0,2.1fr)_minmax(0,1.1fr)_minmax(0,0.9fr)_auto] lg:items-center lg:gap-4',
                    isSelected
                      ? isDarkMode
                        ? 'bg-orange-500/[0.07]'
                        : 'bg-orange-50/70'
                      : isDarkMode
                        ? 'hover:bg-white/[0.025]'
                        : 'hover:bg-slate-50/80',
                  )}
                >
                  <div className="flex min-w-0 items-center gap-3">
                    <Avatar label={item.name.charAt(0)} tone={statusTone(item.status)} />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('truncate text-xs font-bold', adminText(isDarkMode))}>
                          {item.name}
                        </span>
                        <StatusPill tone={statusTone(item.status)} dot>
                          {item.status}
                        </StatusPill>
                      </div>
                      <div className={cn('mt-0.5 truncate font-mono text-[10px]', adminMuted(isDarkMode))}>
                        {item.nameMm} · UID {item.uid}
                      </div>
                    </div>
                  </div>

                  <div className="min-w-0">
                    <div className={cn('font-mono text-[11px] font-semibold', adminText(isDarkMode))}>
                      {item.idCard}
                    </div>
                    <div className={cn('mt-0.5 truncate text-[10px]', adminMuted(isDarkMode))}>
                      {item.township} · {item.dob}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 lg:flex-col lg:items-start lg:gap-1">
                    <span
                      className={cn(
                        'font-mono text-[11px] font-bold',
                        item.faceMatchScore >= 95
                          ? 'text-emerald-500'
                          : item.faceMatchScore >= 80
                            ? 'text-amber-500'
                            : 'text-rose-500',
                      )}
                    >
                      {item.faceMatchScore}% match
                    </span>
                    <StatusPill tone={riskTone(item.riskScore)}>Risk {item.riskScore}</StatusPill>
                  </div>

                  <div className="flex items-center gap-2 lg:justify-end">
                    <button
                      type="button"
                      onClick={() => setInspectingApplicant(item)}
                      className={cn(
                        'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-semibold transition',
                        isDarkMode
                          ? 'border-white/10 bg-white/[0.03] text-slate-300 hover:bg-white/[0.07] hover:text-white'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900',
                      )}
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
                          className={cn(
                            'inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-[11px] font-bold transition active:scale-95',
                            isDarkMode
                              ? 'border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                              : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
                          )}
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
        <div className="fixed inset-0 z-[60] flex justify-end overflow-hidden bg-slate-950/65 backdrop-blur-sm">
          <div
            className={cn(
              'flex h-full w-full max-w-md flex-col border-l shadow-2xl',
              isDarkMode
                ? 'border-white/10 bg-[#080E1A] text-white'
                : 'border-slate-200 bg-white text-slate-900',
            )}
          >
            <div
              className={cn(
                'flex items-center justify-between border-b px-5 py-4',
                isDarkMode
                  ? 'border-white/[0.06] bg-gradient-to-r from-orange-500/10 to-transparent'
                  : 'border-slate-100 bg-gradient-to-r from-orange-50 to-white',
              )}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className={cn(
                    'flex h-9 w-9 items-center justify-center rounded-xl border',
                    isDarkMode
                      ? 'border-orange-400/25 bg-orange-500/15 text-orange-300'
                      : 'border-orange-200 bg-orange-100 text-orange-600',
                  )}
                >
                  <BadgeCheck size={17} />
                </div>
                <div>
                  <h3 className="text-sm font-black">KYC inspector</h3>
                  <div className={cn('font-mono text-[10px]', adminMuted(isDarkMode))}>
                    {inspectingApplicant.id}
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectingApplicant(null)}
                className={cn(
                  'rounded-lg p-1.5 transition',
                  isDarkMode
                    ? 'text-slate-400 hover:bg-white/5 hover:text-white'
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900',
                )}
              >
                <X size={17} />
              </button>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto p-5">
              <div
                className={cn(
                  'rounded-2xl border p-4',
                  isDarkMode ? 'border-white/[0.07] bg-white/[0.03]' : 'border-slate-200 bg-slate-50',
                )}
              >
                <div className="flex items-center gap-3">
                  <Avatar
                    label={inspectingApplicant.name.charAt(0)}
                    tone={statusTone(inspectingApplicant.status)}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn('truncate text-sm font-black', adminText(isDarkMode))}>
                        {inspectingApplicant.name}
                      </span>
                      <StatusPill tone={statusTone(inspectingApplicant.status)} dot>
                        {inspectingApplicant.status}
                      </StatusPill>
                    </div>
                    <div className={cn('font-mono text-[11px]', adminMuted(isDarkMode))}>
                      {inspectingApplicant.nameMm}
                    </div>
                    <div className={cn('font-mono text-[10px]', adminMuted(isDarkMode))}>
                      UID {inspectingApplicant.uid}
                    </div>
                  </div>
                </div>
              </div>

              <div
                className={cn(
                  'flex items-center justify-between rounded-2xl border p-4',
                  isDarkMode
                    ? 'border-emerald-400/20 bg-emerald-400/10'
                    : 'border-emerald-200 bg-emerald-50',
                )}
              >
                <div>
                  <div className={cn('font-mono text-[9px] font-bold uppercase tracking-wider', adminMuted(isDarkMode))}>
                    Biometric confidence
                  </div>
                  <div className="mt-1 font-mono text-2xl font-black text-emerald-500">
                    {inspectingApplicant.faceMatchScore}%
                  </div>
                </div>
                <Scan size={26} className="text-emerald-500" />
              </div>

              <div className="space-y-2">
                <div className={cn('font-mono text-[9px] font-bold uppercase tracking-[0.18em]', adminMuted(isDarkMode))}>
                  Identity record
                </div>
                <div className={cn('divide-y rounded-2xl border px-4 py-2', adminInset(isDarkMode), isDarkMode ? 'divide-white/[0.06]' : 'divide-slate-200/80')}>
                  <KeyValue isDarkMode={isDarkMode} label="NRIC number" value={inspectingApplicant.idCard} />
                  <KeyValue isDarkMode={isDarkMode} label="Township" value={inspectingApplicant.township} />
                  <KeyValue isDarkMode={isDarkMode} label="Date of birth" value={inspectingApplicant.dob} />
                  <KeyValue isDarkMode={isDarkMode} label="Father name" value={inspectingApplicant.fatherName} />
                  <KeyValue isDarkMode={isDarkMode} label="Occupation" value={inspectingApplicant.occupation} />
                  <KeyValue isDarkMode={isDarkMode} label="Document quality" value={inspectingApplicant.docQuality} />
                </div>
              </div>

              <div className="space-y-2">
                <div className={cn('font-mono text-[9px] font-bold uppercase tracking-[0.18em]', adminMuted(isDarkMode))}>
                  Automated checks
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {['Liveness passed', 'NRIC verified', 'PEP clean', 'No duplicate UID'].map((check) => (
                    <div
                      key={check}
                      className={cn(
                        'flex items-center gap-1.5 rounded-xl border px-2.5 py-2 font-mono text-[10px] font-bold',
                        isDarkMode
                          ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                          : 'border-emerald-200 bg-emerald-50 text-emerald-600',
                      )}
                    >
                      <Check size={12} />
                      {check}
                    </div>
                  ))}
                </div>
              </div>

              <div
                className={cn(
                  'flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 font-mono text-[11px]',
                  isDarkMode
                    ? 'border-white/10 bg-white/[0.03] text-slate-300'
                    : 'border-slate-200 bg-white text-slate-600',
                )}
              >
                <span className="truncate">{inspectingApplicant.email}</span>
                <span className="text-slate-400">{inspectingApplicant.phone}</span>
              </div>
            </div>

            <div
              className={cn(
                'flex items-center gap-2 border-t p-4',
                isDarkMode ? 'border-white/[0.06]' : 'border-slate-100',
              )}
            >
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
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-rose-600 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-rose-500 active:scale-95"
                  >
                    <X size={14} />
                    Reject request
                  </button>
                </>
              ) : (
                <div className={cn('w-full py-1 text-center font-mono text-[11px]', adminMuted(isDarkMode))}>
                  Application already {inspectingApplicant.status.toLowerCase()}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
