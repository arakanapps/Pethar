import React from 'react'
import {
  Users,
  MessageSquare,
  Activity,
  Coins,
  Terminal,
  Sparkles,
  Sun,
  Moon,
  ExternalLink,
  AlertTriangle,
  Search,
} from 'lucide-react'
import { ArakanEmblem } from '../ArakanEmblem'

export interface AdminNavTab {
  id: string
  label: string
  icon: React.ComponentType<{ size?: number; className?: string }>
  badge?: string | number
  badgeVariant?: 'red' | 'green' | 'amber' | 'slate'
}

interface AdminNavBarProps {
  currentTab: string
  onSelectTab: (tabId: string) => void
  isDevAdminMode: boolean
  onToggleAdminMode: () => void
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
}

export const AdminNavBar: React.FC<AdminNavBarProps> = ({
  currentTab,
  onSelectTab,
  isDevAdminMode,
  onToggleAdminMode,
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
}) => {
  const tabs: AdminNavTab[] = [
    {
      id: 'admin-kyc',
      label: 'KYC Desk',
      icon: Users,
      badge: kycPendingCount > 0 ? kycPendingCount : undefined,
      badgeVariant: 'amber',
    },
    {
      id: 'admin-chat',
      label: 'OpenDesk',
      icon: MessageSquare,
      badge: 'LIVE',
      badgeVariant: 'green',
    },
    {
      id: 'admin-users',
      label: 'Citizens',
      icon: Users,
    },
    {
      id: 'admin-fraud',
      label: 'Ledger & AML',
      icon: Activity,
      badge: 'AI',
      badgeVariant: 'slate',
    },
    {
      id: 'admin-treasury',
      label: 'Treasury',
      icon: Coins,
    },
    {
      id: 'admin-api',
      label: 'API Gateway',
      icon: Terminal,
    },
    {
      id: 'admin-ads',
      label: 'Campaigns',
      icon: Sparkles,
    },
  ]

  return (
    <header className="sticky top-0 z-40 w-full px-3 sm:px-6 pt-3 pb-2 transition-all">
      {/* Glisse Liquid-Glass Container */}
      <div
        className={`relative mx-auto max-w-7xl rounded-2xl px-3 sm:px-4 py-2 flex flex-col md:flex-row items-center justify-between gap-3 shadow-2xl transition-all duration-300 backdrop-blur-2xl ${
          isDarkMode
            ? 'bg-zinc-950/80 border border-white/10 text-white shadow-black/40 ring-1 ring-white/5'
            : 'bg-white/80 border border-slate-200/90 text-slate-900 shadow-slate-200/50 ring-1 ring-black/5'
        }`}
      >
        {/* Left Section: Brand & Status Pill */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex items-center justify-center p-1.5 rounded-xl bg-gradient-to-br from-[#FF6B00]/20 to-amber-500/10 border border-[#FF6B00]/30 shadow-inner">
              <ArakanEmblem size={24} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="font-black text-sm tracking-tight text-slate-950 dark:text-white">
                  Péthar
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#FF6B00] text-white font-bold tracking-wider">
                  ADMIN
                </span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-mono text-slate-400 font-semibold tracking-wide uppercase">
                  1 ₳ = $1.00 USD
                </span>
              </div>
            </div>
          </div>

          {/* Quick Search on mobile / small screens */}
          <div className="md:hidden flex items-center gap-1.5">
            <button
              onClick={onToggleAdminMode}
              className="text-[11px] font-bold px-2.5 py-1 rounded-xl bg-[#FF6B00]/10 text-[#FF6B00] border border-[#FF6B00]/20"
            >
              {isDevAdminMode ? 'Exit' : 'Admin'}
            </button>
            <button
              onClick={onToggleDarkMode}
              className="p-1.5 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              {isDarkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
        </div>

        {/* Center: Glisse Sliding Tab Bar */}
        <nav className="w-full md:w-auto overflow-x-auto no-scrollbar py-0.5">
          <div
            className={`flex items-center gap-1 p-1 rounded-xl border backdrop-blur-md ${
              isDarkMode
                ? 'bg-zinc-900/60 border-white/5'
                : 'bg-slate-100/80 border-slate-200/70'
            }`}
          >
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = currentTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => onSelectTab(tab.id)}
                  className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 whitespace-nowrap select-none cursor-pointer ${
                    isActive
                      ? isDarkMode
                        ? 'bg-gradient-to-b from-white/15 to-white/5 text-white shadow-sm shadow-black/50 border border-white/15 font-bold'
                        : 'bg-white text-slate-950 shadow-sm border border-slate-200/80 font-bold'
                      : isDarkMode
                      ? 'text-zinc-400 hover:text-white hover:bg-white/5'
                      : 'text-slate-600 hover:text-slate-950 hover:bg-slate-200/50'
                  }`}
                >
                  <Icon
                    size={14}
                    className={isActive ? 'text-[#FF6B00]' : 'opacity-70'}
                  />
                  <span>{tab.label}</span>

                  {tab.badge !== undefined && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full uppercase leading-normal tracking-wide ${
                        tab.badgeVariant === 'amber'
                          ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                          : tab.badgeVariant === 'green'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                          : 'bg-slate-500/20 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tab.badge}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </nav>

        {/* Right Section: Compact Filter, Kill-Switch, & Controls */}
        <div className="hidden md:flex items-center gap-2">
          {/* Quick Search Field */}
          <div className="relative">
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search..."
              className={`w-36 lg:w-44 pl-7 pr-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all focus:w-52 focus:outline-none focus:border-[#FF6B00] ${
                isDarkMode
                  ? 'bg-zinc-900/60 border-white/10 text-white placeholder-zinc-500'
                  : 'bg-slate-100/70 border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          {/* Emergency Kill-Switch Chip */}
          <button
            onClick={onOpenKillSwitch}
            title={circuitBreakerActive ? 'Settlement FROZEN' : 'Circuit Breaker Kill-Switch'}
            className={`px-2.5 py-1.5 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition cursor-pointer active:scale-95 border ${
              circuitBreakerActive
                ? 'bg-red-600 text-white border-red-500 animate-pulse shadow-lg shadow-red-600/40'
                : 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20 hover:bg-red-500/20'
            }`}
          >
            <AlertTriangle size={13} />
            <span className="hidden xl:inline">
              {circuitBreakerActive ? 'FROZEN' : 'Kill-Switch'}
            </span>
          </button>

          {/* Language Switch */}
          {onToggleLang && (
            <button
              onClick={onToggleLang}
              className={`px-2 py-1.5 rounded-xl text-xs font-mono font-bold border transition ${
                isDarkMode
                  ? 'bg-zinc-900/60 border-white/10 text-zinc-300 hover:text-white'
                  : 'bg-slate-100/70 border-slate-200 text-slate-700 hover:text-slate-900'
              }`}
            >
              {lang.toUpperCase()}
            </button>
          )}

          {/* Dark Mode Switch */}
          <button
            onClick={onToggleDarkMode}
            className={`p-1.5 rounded-xl border transition ${
              isDarkMode
                ? 'bg-zinc-900/60 border-white/10 text-amber-400 hover:bg-white/5'
                : 'bg-slate-100/70 border-slate-200 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {isDarkMode ? <Sun size={14} /> : <Moon size={14} />}
          </button>

          {/* Exit / Switch to Citizen Mode */}
          <button
            onClick={onToggleAdminMode}
            className="px-2.5 py-1.5 rounded-xl text-xs font-bold bg-[#FF6B00] text-white hover:bg-[#E05E00] transition active:scale-95 shadow-sm"
          >
            Citizen
          </button>

          {onExit && (
            <button
              onClick={onExit}
              title="Exit site"
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <ExternalLink size={14} />
            </button>
          )}
        </div>
      </div>
    </header>
  )
}
