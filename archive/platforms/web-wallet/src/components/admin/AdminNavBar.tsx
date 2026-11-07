import React, { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  ChevronRight,
  CircleDot,
  Landmark,
  LogOut,
  Menu,
  MessageSquare,
  Moon,
  Search,
  ShieldCheck,
  Sparkles,
  Sun,
  Terminal,
  Users,
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
  badgeVariant?: 'red' | 'green' | 'amber' | 'slate'
}

interface AdminNavBarProps {
  currentTab: string
  onSelectTab: (tabId: string) => void
  isDarkMode: boolean
  onToggleDarkMode: () => void
  lang: 'ak' | 'en'
  onToggleLang?: () => void
  onExit?: () => void
  onOpenKillSwitch: () => void
  circuitBreakerActive: boolean
  kycPendingCount: number
  searchQuery: string
  onSearchChange: (q: string) => void
  children: React.ReactNode
}

export const AdminNavBar: React.FC<AdminNavBarProps> = ({
  currentTab,
  onSelectTab,
  isDarkMode,
  onToggleDarkMode,
  lang,
  onToggleLang,
  onExit,
  onOpenKillSwitch,
  circuitBreakerActive,
  kycPendingCount,
  searchQuery,
  onSearchChange,
  children,
}) => {
  const [mobileOpen, setMobileOpen] = useState(false)

  useEffect(() => {
    setMobileOpen(false)
  }, [currentTab])

  const operationsTabs: AdminNavTab[] = [
    {
      id: 'admin-kyc',
      label: 'Identity Review',
      description: 'KYC verification queue',
      icon: Users,
      badge: kycPendingCount > 0 ? kycPendingCount : undefined,
      badgeVariant: 'amber',
    },
    {
      id: 'admin-chat',
      label: 'Customer Desk',
      description: 'Live support dispatch',
      icon: MessageSquare,
      badge: 'LIVE',
      badgeVariant: 'green',
    },
    {
      id: 'admin-fraud',
      label: 'Risk & Ledger',
      description: 'Fraud, AML and audit trail',
      icon: ShieldCheck,
      badge: 'AI',
      badgeVariant: 'slate',
    },
  ]

  const platformTabs: AdminNavTab[] = [
    {
      id: 'admin-treasury',
      label: 'Treasury',
      description: 'Reserves and circulation',
      icon: Landmark,
    },
    {
      id: 'admin-api',
      label: 'API Gateway',
      description: 'Endpoints and execution',
      icon: Terminal,
    },
    {
      id: 'admin-ads',
      label: 'Campaigns',
      description: 'Spotlight and offers',
      icon: Sparkles,
    },
  ]

  const allTabs = useMemo(() => [...operationsTabs, ...platformTabs], [operationsTabs, platformTabs])
  const activeTab = allTabs.find((tab) => tab.id === currentTab) ?? allTabs[0]

  const renderBadge = (tab: AdminNavTab) => {
    if (tab.badge === undefined) return null
    return (
      <span
        className={cn(
          'rounded-md border px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wide',
          tab.badgeVariant === 'amber' &&
            'border-amber-400/30 bg-amber-400/15 text-amber-300',
          tab.badgeVariant === 'green' &&
            'border-emerald-400/30 bg-emerald-400/15 text-emerald-300',
          tab.badgeVariant === 'red' && 'border-rose-400/30 bg-rose-400/15 text-rose-300',
          (!tab.badgeVariant || tab.badgeVariant === 'slate') &&
            'border-white/10 bg-white/5 text-slate-400',
        )}
      >
        {tab.badge}
      </span>
    )
  }

  const renderNavGroup = (label: string, tabs: AdminNavTab[]) => (
    <div className="space-y-1">
      <div className="px-3 pb-1 pt-3 font-mono text-[9px] font-bold uppercase tracking-[0.22em] text-slate-500">
        {label}
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
              'group relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-all',
              isActive
                ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-950/40'
                : 'text-slate-400 hover:bg-white/[0.05] hover:text-white',
            )}
          >
            {isActive && (
              <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-white/80" />
            )}
            <span
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border transition',
                isActive
                  ? 'border-white/20 bg-white/15 text-white'
                  : 'border-white/[0.07] bg-white/[0.03] text-slate-400 group-hover:text-orange-300',
              )}
            >
              <Icon size={15} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-xs font-bold">{tab.label}</span>
              <span
                className={cn(
                  'block truncate text-[10px]',
                  isActive ? 'text-white/70' : 'text-slate-500',
                )}
              >
                {tab.description}
              </span>
            </span>
            {renderBadge(tab)}
            <ChevronRight
              size={13}
              className={cn(
                'shrink-0 transition',
                isActive ? 'text-white/60' : 'text-slate-600 group-hover:text-slate-400',
              )}
            />
          </button>
        )
      })}
    </div>
  )

  const sidebar = (
    <aside className="flex h-full w-[260px] flex-col bg-[#080E1A] text-white">
      <div className="flex items-center justify-between px-4 pb-4 pt-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-orange-400/30 bg-gradient-to-br from-orange-500/25 to-amber-400/10 shadow-inner">
            <ArakanEmblem size={24} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-black tracking-tight">Péthar</span>
              <span className="rounded-md bg-orange-500 px-1.5 py-0.5 font-mono text-[8px] font-bold tracking-widest">
                ADMIN
              </span>
            </div>
            <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-slate-500">
              Operations console
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

      <div className="mx-3 flex items-center justify-between rounded-xl border border-emerald-400/15 bg-emerald-400/[0.06] px-3 py-2">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
          </span>
          <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-emerald-300">
            All systems nominal
          </span>
        </div>
        <span className="font-mono text-[9px] text-slate-500">SYS-01</span>
      </div>

      <nav className="mt-1 flex-1 overflow-y-auto px-2 pb-3">
        {renderNavGroup('Operations', operationsTabs)}
        {renderNavGroup('Platform', platformTabs)}
      </nav>

      <div className="mx-3 mb-3 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
        <div className="flex items-center justify-between">
          <span className="font-mono text-[9px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Peg status
          </span>
          <span className="rounded-md bg-emerald-400/15 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-300">
            1:1
          </span>
        </div>
        <div className="mt-2 flex items-baseline gap-1">
          <span className="font-mono text-lg font-black tracking-tight">1.00 ₳</span>
          <span className="font-mono text-xs text-slate-500">= $1.00 USD</span>
        </div>
        <div className="mt-1 text-[10px] text-slate-500">100% stablecoin collateralized</div>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onOpenKillSwitch}
          className={cn(
            'flex w-full items-center justify-center gap-2 rounded-xl border px-3 py-2.5 font-mono text-[10px] font-bold uppercase tracking-wider transition active:scale-[0.98]',
            circuitBreakerActive
              ? 'animate-pulse border-rose-500 bg-rose-600 text-white'
              : 'border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20',
          )}
        >
          <AlertTriangle size={13} />
          {circuitBreakerActive ? 'Settlement frozen' : 'Emergency kill-switch'}
        </button>
      </div>

      <div className="border-t border-white/[0.06] p-3">
        <div className="flex items-center gap-2.5 rounded-xl px-2 py-1.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-orange-400/25 bg-orange-500/15 font-mono text-xs font-bold text-orange-300">
            R1
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-bold">Root Operator</div>
            <div className="font-mono text-[10px] text-slate-500">ROOT-01 · Full access</div>
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
    <div
      className={cn(
        'min-h-screen font-sans transition-colors duration-200',
        isDarkMode ? 'bg-[#060B14] text-slate-100' : 'bg-[#F3F5F9] text-slate-900',
      )}
    >
      {/* Mobile drawer backdrop */}
      <div
        className={cn(
          'fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-sm transition-opacity lg:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-50 transform shadow-2xl transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {sidebar}
      </div>

      <div className="flex min-h-screen flex-col lg:pl-[260px]">
        {/* Topbar */}
        <header
          className={cn(
            'sticky top-0 z-30 border-b backdrop-blur-xl',
            isDarkMode
              ? 'border-white/[0.06] bg-[#060B14]/85'
              : 'border-slate-200/80 bg-white/80',
          )}
        >
          <div className="flex items-center gap-3 px-3 py-3 sm:px-6">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className={cn(
                'rounded-xl border p-2 lg:hidden',
                isDarkMode
                  ? 'border-white/10 bg-white/[0.03] text-slate-300'
                  : 'border-slate-200 bg-white text-slate-600',
              )}
            >
              <Menu size={17} />
            </button>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-black tracking-tight">{activeTab.label}</span>
                <span className="hidden rounded-md border border-orange-500/20 bg-orange-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-orange-500 sm:inline">
                  Console
                </span>
              </div>
              <div
                className={cn(
                  'mt-0.5 hidden truncate font-mono text-[10px] sm:block',
                  isDarkMode ? 'text-slate-500' : 'text-slate-400',
                )}
              >
                Péthar operations · {activeTab.description}
              </div>
            </div>

            <div className="relative hidden md:block">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search records, refs, users…"
                className={cn(
                  'w-52 rounded-xl border py-2 pl-8 pr-3 text-[11px] font-medium outline-none transition focus:w-64 xl:w-60 xl:focus:w-72',
                  isDarkMode
                    ? 'border-white/10 bg-[#0A1120] text-slate-100 placeholder-slate-500 focus:border-orange-500/60'
                    : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-orange-500/60',
                )}
              />
            </div>

            <div className="flex items-center gap-1.5">
              <div
                className={cn(
                  'hidden items-center gap-1.5 rounded-xl border px-2.5 py-1.5 font-mono text-[10px] font-bold uppercase tracking-wider xl:flex',
                  isDarkMode
                    ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300'
                    : 'border-emerald-500/20 bg-emerald-50 text-emerald-600',
                )}
              >
                <CircleDot size={11} />
                Live
              </div>

              <button
                type="button"
                onClick={onOpenKillSwitch}
                title="Emergency kill-switch"
                className={cn(
                  'rounded-xl border p-2 transition',
                  circuitBreakerActive
                    ? 'animate-pulse border-rose-500 bg-rose-600 text-white'
                    : isDarkMode
                      ? 'border-rose-400/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/20'
                      : 'border-rose-200 bg-rose-50 text-rose-600 hover:bg-rose-100',
                )}
              >
                <AlertTriangle size={15} />
              </button>

              {onToggleLang && (
                <button
                  type="button"
                  onClick={onToggleLang}
                  className={cn(
                    'rounded-xl border px-2.5 py-2 font-mono text-[10px] font-bold uppercase transition',
                    isDarkMode
                      ? 'border-white/10 bg-white/[0.03] text-slate-300 hover:text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900',
                  )}
                >
                  {lang}
                </button>
              )}

              <button
                type="button"
                onClick={onToggleDarkMode}
                className={cn(
                  'rounded-xl border p-2 transition',
                  isDarkMode
                    ? 'border-white/10 bg-white/[0.03] text-amber-300 hover:bg-white/[0.07]'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50',
                )}
              >
                {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
              </button>
            </div>
          </div>

          {/* Mobile search */}
          <div
            className={cn(
              'border-t px-3 py-2 md:hidden',
              isDarkMode ? 'border-white/[0.06]' : 'border-slate-100',
            )}
          >
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="Search records, refs, users…"
                className={cn(
                  'w-full rounded-xl border py-2 pl-8 pr-3 text-[11px] font-medium outline-none',
                  isDarkMode
                    ? 'border-white/10 bg-[#0A1120] text-slate-100 placeholder-slate-500'
                    : 'border-slate-200 bg-white text-slate-900 placeholder-slate-400',
                )}
              />
            </div>
          </div>
        </header>

        <main className="flex-1 px-3 py-4 sm:px-6 sm:py-6">
          <div className="mx-auto w-full max-w-[1440px] space-y-5">{children}</div>
        </main>

        <footer
          className={cn(
            'border-t px-4 py-3 sm:px-6',
            isDarkMode ? 'border-white/[0.06]' : 'border-slate-200/70',
          )}
        >
          <div
            className={cn(
              'mx-auto flex max-w-[1440px] flex-col gap-1 font-mono text-[10px] sm:flex-row sm:items-center sm:justify-between',
              isDarkMode ? 'text-slate-500' : 'text-slate-400',
            )}
          >
            <span>Péthar Operations Console · Restricted access</span>
            <span>Security policy v4.2 · Session encrypted</span>
          </div>
        </footer>
      </div>
    </div>
  )
}
