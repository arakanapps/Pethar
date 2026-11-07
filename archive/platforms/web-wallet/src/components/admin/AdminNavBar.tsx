import React, { useEffect, useState } from 'react'
import {
  Activity,
  ChevronRight,
  CircleDot,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  RefreshCw,
  Search,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react'
import { ArakanEmblem } from '../ArakanEmblem'
import { cn } from '../../lib/utils'

export interface AdminNavTab {
  id: string
  label: string
  description: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: string | number
}

interface AdminNavBarProps {
  currentTab: string
  onSelectTab: (tabId: string) => void
  searchQuery: string
  onSearchChange: (q: string) => void
  pendingKycCount: number
  pendingApprovalsCount: number
  onRefresh: () => void
  refreshing: boolean
  onExit?: () => void
  children: React.ReactNode
}

export const AdminNavBar: React.FC<AdminNavBarProps> = ({
  currentTab,
  onSelectTab,
  searchQuery,
  onSearchChange,
  pendingKycCount,
  pendingApprovalsCount,
  onRefresh,
  refreshing,
  onExit,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [currentTab])

  const tabs: AdminNavTab[] = [
    {
      id: 'admin-overview',
      label: 'Overview',
      description: 'Live platform snapshot',
      icon: LayoutDashboard,
    },
    {
      id: 'admin-kyc',
      label: 'KYC Review',
      description: 'Identity verification queue',
      icon: UserCheck,
      badge: pendingKycCount > 0 ? pendingKycCount : undefined,
    },
    {
      id: 'admin-approvals',
      label: 'Approvals',
      description: 'Pending ledger decisions',
      icon: ShieldCheck,
      badge: pendingApprovalsCount > 0 ? pendingApprovalsCount : undefined,
    },
    {
      id: 'admin-fraud',
      label: 'Transactions',
      description: 'Ledger monitoring',
      icon: Activity,
    },
    {
      id: 'admin-treasury',
      label: 'Treasury',
      description: 'Balances and volume',
      icon: Landmark,
    },
  ]

  const activeTab = tabs.find((tab) => tab.id === currentTab) ?? tabs[0]

  const sidebar = (
    <aside className="flex h-full w-[260px] flex-col border-r border-white/[0.06] bg-[#070A12]/95 backdrop-blur-2xl">
      <div className="flex items-center justify-between px-4 pb-4 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-indigo-400/20 bg-white/[0.04] shadow-inner">
            <ArakanEmblem size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight text-white">Péthar</span>
              <span className="rounded-md border border-indigo-400/20 bg-indigo-400/10 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest text-indigo-300">
                ADMIN
              </span>
            </div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
              Operations
            </div>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setMobileOpen(false)}
          className="rounded-lg p-1.5 text-slate-500 hover:bg-white/5 hover:text-white lg:hidden"
        >
          <X size={16} />
        </button>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-2 pb-3 pt-1">
        <div className="px-3 pb-1 pt-3 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-600">
          Workspace
        </div>
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = currentTab === tab.id
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={cn(
                'group relative flex w-full items-center gap-3 rounded-xl border px-3 py-2.5 text-left transition-all',
                isActive
                  ? 'border-indigo-400/20 bg-white/[0.07] text-white shadow-[0_0_30px_-14px_rgba(99,102,241,0.7)] backdrop-blur-xl'
                  : 'border-transparent text-slate-400 hover:bg-white/[0.04] hover:text-white',
              )}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-indigo-400" />
              )}
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition',
                  isActive
                    ? 'border-indigo-400/25 bg-indigo-400/10 text-indigo-300'
                    : 'border-white/[0.06] bg-white/[0.025] text-slate-500 group-hover:text-indigo-300',
                )}
              >
                <Icon size={15} />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold">{tab.label}</span>
                <span
                  className={cn(
                    'block truncate text-[10px]',
                    isActive ? 'text-slate-400' : 'text-slate-600',
                  )}
                >
                  {tab.description}
                </span>
              </span>
              {tab.badge !== undefined && (
                <span className="rounded-md border border-indigo-400/20 bg-indigo-400/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-indigo-300">
                  {tab.badge}
                </span>
              )}
              <ChevronRight size={13} className="shrink-0 text-slate-600" />
            </button>
          )
        })}
      </nav>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] font-mono text-xs font-bold text-indigo-300">
            OP
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold text-white">Administrator</div>
            <div className="font-mono text-[10px] text-slate-500">Restricted console</div>
          </div>
          {onExit && (
            <button
              type="button"
              onClick={onExit}
              title="Exit console"
              className="rounded-lg p-1.5 text-slate-500 transition hover:bg-white/5 hover:text-white"
            >
              <LogOut size={15} />
            </button>
          )}
        </div>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen bg-[#05070D] font-sans text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-32 -top-32 h-[420px] w-[420px] rounded-full bg-indigo-500/[0.08] blur-[120px]" />
        <div className="absolute right-0 top-1/3 h-[380px] w-[380px] rounded-full bg-sky-500/[0.05] blur-[120px]" />
      </div>

      <div
        className={cn(
          'fixed inset-0 z-40 bg-[#05070D]/80 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileOpen(false)}
      />

      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform shadow-2xl transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebar}
      </div>

      <div className="relative flex min-h-screen flex-col lg:pl-[260px]">
        <header className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#05070D]/70 backdrop-blur-2xl">
          <div className="flex items-center gap-3 px-3 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-2 text-slate-300 lg:hidden"
            >
              <Menu size={17} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-black tracking-tight text-white">
                  {activeTab.label}
                </span>
                <span className="hidden rounded-md border border-white/[0.08] bg-white/[0.03] px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-slate-400 sm:inline">
                  Console
                </span>
              </div>
              <div className="mt-0.5 hidden truncate font-mono text-[10px] text-slate-500 sm:block">
                Péthar operations · {activeTab.description}
              </div>
            </div>

            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search records, refs, users…"
                className="w-52 rounded-xl border border-white/[0.07] bg-white/[0.03] py-2 pl-8 pr-3 text-[11px] font-medium text-slate-100 placeholder-slate-600 outline-none backdrop-blur-xl transition focus:w-64 focus:border-indigo-400/40 xl:w-60 xl:focus:w-72"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <div className="hidden items-center gap-1.5 rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300 xl:flex">
                <CircleDot size={11} />
                Live
              </div>
              <button
                type="button"
                onClick={onRefresh}
                disabled={refreshing}
                title="Refresh live data"
                className="rounded-xl border border-white/[0.07] bg-white/[0.03] p-2 text-slate-400 transition hover:text-white disabled:opacity-50"
              >
                <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
              </button>
            </div>
          </div>

          <div className="border-t border-white/[0.06] px-3 py-2 md:hidden">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search records, refs, users…"
                className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] py-2 pl-8 pr-3 text-[11px] font-medium text-slate-100 placeholder-slate-600 outline-none backdrop-blur-xl"
              />
            </div>
          </div>
        </header>

        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-[1440px] space-y-5">{children}</div>
        </main>

        <footer className="border-t border-white/[0.06] px-4 py-3 sm:px-6">
          <div className="mx-auto flex max-w-[1440px] flex-col gap-1 font-mono text-[10px] text-slate-600 sm:flex-row sm:items-center sm:justify-between">
            <span>Péthar Operations Console</span>
            <span>Restricted access · Live database</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
