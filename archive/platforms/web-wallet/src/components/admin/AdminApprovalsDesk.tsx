import React, { useMemo, useState } from 'react'
import { Check, X, Search, ShieldCheck, Clock3, User, FileText } from 'lucide-react'
import type { AdminApprovalRow, AdminUserRow } from '../../services/adminDatabase'
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

interface AdminApprovalsDeskProps {
  approvals: AdminApprovalRow[]
  users: AdminUserRow[]
  isDarkMode: boolean
  loading: boolean
  onReview: (approval: AdminApprovalRow, status: 'APPROVED' | 'REJECTED') => void
}

type ApprovalFilter = 'PENDING' | 'APPROVED' | 'REJECTED' | 'all'

const dateLabel = (value: string) => {
  if (!value) return '—'
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : date.toLocaleString('en-GB', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

export const AdminApprovalsDesk: React.FC<AdminApprovalsDeskProps> = ({
  approvals,
  users,
  isDarkMode,
  loading,
  onReview,
}) => {
  const [filter, setFilter] = useState<ApprovalFilter>('PENDING')
  const [search, setSearch] = useState('')

  const usersById = useMemo(() => {
    const map = new Map<string, AdminUserRow>()
    users.forEach((user) => {
      map.set(user.id, user)
      if (user.userId) map.set(user.userId, user)
    })
    return map
  }, [users])

  const counts = useMemo(
    () => ({
      pending: approvals.filter((approval) => approval.status === 'PENDING').length,
      approved: approvals.filter((approval) => approval.status === 'APPROVED').length,
      rejected: approvals.filter((approval) => approval.status === 'REJECTED').length,
    }),
    [approvals],
  )

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return approvals.filter((approval) => {
      const matchesFilter = filter === 'all' || approval.status === filter
      const user = usersById.get(approval.userId)
      const haystack = `${approval.id} ${approval.type} ${approval.currency} ${user?.name || ''} ${user?.email || ''} ${user?.uid || ''}`.toLowerCase()
      return matchesFilter && (!query || haystack.includes(query))
    })
  }, [approvals, filter, search, usersById])

  return (
    <div className="space-y-5">
      <DeskHeader
        eyebrow="Operations · Approvals"
        title="Pending approvals"
        description="Review real approval requests from the pending_approvals table. Decisions are written back to the database immediately."
        isDarkMode={isDarkMode}
        actions={
          <StatusPill tone="emerald" dot>
            Live data
          </StatusPill>
        }
      />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard
          label="Pending"
          value={counts.pending}
          hint="Awaiting operator decision"
          icon={<Clock3 size={15} />}
          tone="amber"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Approved"
          value={counts.approved}
          hint="Resolved and posted"
          icon={<Check size={15} />}
          tone="emerald"
          isDarkMode={isDarkMode}
        />
        <StatCard
          label="Rejected"
          value={counts.rejected}
          hint="Declined by operator"
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
            Approval queue
            <span className="rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] font-bold text-slate-400">
              {filtered.length} records
            </span>
          </span>
        }
        description="Search by user, UID or approval type."
        actions={
          <Segmented
            isDarkMode={isDarkMode}
            value={filter}
            onChange={setFilter}
            tone="amber"
            options={[
              { value: 'PENDING', label: 'Pending' },
              { value: 'APPROVED', label: 'Approved' },
              { value: 'REJECTED', label: 'Rejected' },
              { value: 'all', label: 'All' },
            ]}
          />
        }
      >
        <div className="border-b border-white/[0.06] px-4 py-3 sm:px-5">
          <div className="relative w-full sm:max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search approvals…"
              className={cn(
                'w-full rounded-xl border py-2 pl-8 pr-3 text-[11px] font-medium outline-none transition',
                adminInput(isDarkMode),
              )}
            />
          </div>
        </div>

        {loading && approvals.length === 0 ? (
          <EmptyState isDarkMode={isDarkMode} title="Loading approvals…" description="Reading from the database." />
        ) : filtered.length === 0 ? (
          <EmptyState
            isDarkMode={isDarkMode}
            icon={<ShieldCheck size={20} />}
            title="No approvals in this view"
            description="Try another status filter or clear the search query."
          />
        ) : (
          <div className="divide-y divide-white/[0.06]">
            {filtered.map((approval) => {
              const user = usersById.get(approval.userId)
              return (
                <div
                  key={approval.id}
                  className="flex flex-col gap-3 px-4 py-4 transition-colors hover:bg-white/[0.025] sm:flex-row sm:items-center sm:justify-between sm:px-5"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <Avatar
                      label={approval.type === 'KYC_UPGRADE' ? 'K' : approval.type === 'WITHDRAWAL' ? 'W' : 'A'}
                      tone={approval.status === 'PENDING' ? 'amber' : approval.status === 'APPROVED' ? 'emerald' : 'rose'}
                    />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn('text-xs font-bold', adminText(isDarkMode))}>
                          {approval.type.replaceAll('_', ' ')}
                        </span>
                        <StatusPill
                          tone={approval.status === 'PENDING' ? 'amber' : approval.status === 'APPROVED' ? 'emerald' : 'rose'}
                          dot
                        >
                          {approval.status}
                        </StatusPill>
                      </div>
                      <div className={cn('mt-1 flex flex-wrap items-center gap-2 font-mono text-[10px]', adminMuted(isDarkMode))}>
                        <span className="inline-flex items-center gap-1">
                          <User size={10} />
                          {user?.name || approval.userId.slice(0, 8) || 'Unknown user'}
                        </span>
                        <span className="text-slate-700">/</span>
                        <span>{user?.email || 'No email'}</span>
                        <span className="text-slate-700">/</span>
                        <span>{dateLabel(approval.requestedAt)}</span>
                      </div>
                      {approval.adminNotes && (
                        <div className={cn('mt-1 flex items-center gap-1 text-[10px]', adminMuted(isDarkMode))}>
                          <FileText size={10} />
                          {approval.adminNotes}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2 self-end sm:self-center">
                    <div className="mr-2 text-right">
                      <div className={cn('font-mono text-xs font-bold', adminText(isDarkMode))}>
                        {approval.amount ? `${approval.amount.toLocaleString()} ${approval.currency}` : '—'}
                      </div>
                      <div className="font-mono text-[9px] text-slate-500">{approval.id.slice(0, 8)}</div>
                    </div>
                    {approval.status === 'PENDING' && (
                      <>
                        <button
                          type="button"
                          onClick={() => onReview(approval, 'APPROVED')}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-[11px] font-bold text-white shadow-sm transition hover:bg-emerald-500 active:scale-95"
                        >
                          <Check size={13} />
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => onReview(approval, 'REJECTED')}
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
    </div>
  )
}
