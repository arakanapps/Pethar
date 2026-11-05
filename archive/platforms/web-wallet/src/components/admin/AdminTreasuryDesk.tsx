import React from 'react'
import {
  Layers,
} from 'lucide-react'

interface AdminTreasuryDeskProps {
  isDarkMode: boolean
}

export const AdminTreasuryDesk: React.FC<AdminTreasuryDeskProps> = ({ isDarkMode }) => {
  const reserves = [
    {
      asset: 'USDT (Tron TRC20 / ERC20)',
      amountUsd: 7200000,
      share: 55.7,
      color: 'bg-emerald-500',
      contract: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
    },
    {
      asset: 'USDC (Polygon PoS / Native)',
      amountUsd: 3800000,
      share: 29.4,
      color: 'bg-blue-500',
      contract: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
    },
    {
      asset: 'Physical Vault Cash (USD Tier 1)',
      amountUsd: 1935550,
      share: 14.9,
      color: 'bg-amber-500',
      contract: 'Arakan Reserve Vault • Sittwe Hub',
    },
  ]

  const totalCollateral = 12935550
  const akdInCirculation = 12450000
  const reserveRatio = ((totalCollateral / akdInCirculation) * 100).toFixed(1)

  return (
    <div className="space-y-4">
      {/* 1:1 Peg Equivalence Hero Banner */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isDarkMode
            ? 'bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-white/10'
            : 'bg-gradient-to-r from-orange-50/50 via-white to-amber-50/40 border-slate-200'
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-2xl sm:text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                1.00 ₳ = 1.00 USD
              </span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-mono font-bold">
                1:1 VERIFIED
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono">
              Collateralized with liquid USD stablecoins & audited vault reserves.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div
              className={`px-4 py-2 rounded-xl border text-right font-mono ${
                isDarkMode ? 'bg-zinc-900/80 border-white/10' : 'bg-white border-slate-200'
              }`}
            >
              <div className="text-[10px] text-slate-400 font-bold uppercase">Reserve Ratio</div>
              <div className="text-lg font-black text-emerald-500">{reserveRatio}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Strip (BoardUI Style) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div
          className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="text-xs text-slate-400 font-mono font-bold uppercase">
            Total Collateral Reserves
          </div>
          <div className="text-2xl font-black font-mono text-emerald-500 mt-1">
            ${totalCollateral.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            +${(totalCollateral - akdInCirculation).toLocaleString()} Surplus Buffer
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="text-xs text-slate-400 font-mono font-bold uppercase">
            AKD in Total Circulation
          </div>
          <div className="text-2xl font-black font-mono text-slate-900 dark:text-white mt-1">
            ₳ {akdInCirculation.toLocaleString()}
          </div>
          <div className="text-[10px] text-slate-400 font-mono mt-0.5">
            100% Guaranteed 1:1 Redemption
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border ${
            isDarkMode ? 'bg-zinc-900/60 border-white/5' : 'bg-white border-slate-200/80'
          }`}
        >
          <div className="text-xs text-slate-400 font-mono font-bold uppercase">
            Daily Treasury Volume
          </div>
          <div className="text-2xl font-black font-mono text-[#FF6B00] mt-1">
            ₳ 842,190.00
          </div>
          <div className="text-[10px] text-emerald-500 font-mono mt-0.5">
            2,140 Settlements Processed
          </div>
        </div>
      </div>

      {/* Reserve Asset Allocations */}
      <div
        className={`p-5 rounded-2xl border space-y-4 ${
          isDarkMode ? 'bg-zinc-900/40 border-white/10' : 'bg-white border-slate-200'
        }`}
      >
        <div className="flex items-center justify-between">
          <h3 className="font-black text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Layers size={16} className="text-[#FF6B00]" />
            <span>Audited Collateral Composition</span>
          </h3>
          <span className="text-[10px] font-mono text-slate-400">
            Cryptographic Merkle Proof: 0x8a1c...f92d
          </span>
        </div>

        {/* Visual Multi-Asset Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-200 dark:bg-zinc-800">
          {reserves.map((res, i) => (
            <div
              key={i}
              style={{ width: `${res.share}%` }}
              className={`${res.color} h-full transition-all`}
              title={`${res.asset}: ${res.share}%`}
            />
          ))}
        </div>

        {/* Asset Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
          {reserves.map((res, i) => (
            <div
              key={i}
              className={`p-3.5 rounded-xl border space-y-1.5 ${
                isDarkMode ? 'bg-zinc-900/80 border-white/5' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs truncate">{res.asset.split(' ')[0]}</span>
                <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-zinc-800">
                  {res.share}%
                </span>
              </div>
              <div className="text-base font-black font-mono text-slate-900 dark:text-white">
                ${res.amountUsd.toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 font-mono truncate">
                {res.contract}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
