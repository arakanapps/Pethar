import { ArakanEmblem } from './ArakanEmblem'

/** Deterministic pseudo-QR pattern with Arakan QR center emblem */
export function FakeQR({
  seed,
  value,
  size = 180,
}: {
  seed?: string
  value?: string
  size?: number
}) {
  const actualSeed = value || seed || 'pethar:arakan:akd'
  const n = 21
  let h = 2166136261
  const hash = (s: string) => {
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i)
      h = Math.imul(h, 16777619)
    }
    return h >>> 0
  }
  const cell = (r: number, c: number) => hash(`${actualSeed}:${r}:${c}`) % 3 === 0
  const finder = (r: number, c: number) =>
    (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)

  // Center mask for Arakan Royal Emblem
  const isCenter = (r: number, c: number) => r >= 8 && r <= 12 && c >= 8 && c <= 12

  return (
    <div
      className="relative rounded-2xl bg-white p-3 shadow-inner flex items-center justify-center"
      style={{ width: size + 24, height: size + 24 }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${n} ${n}`}>
        {Array.from({ length: n * n }).map((_, i) => {
          const r = Math.floor(i / n)
          const c = i % n
          if (isCenter(r, c)) return null

          if (finder(r, c)) {
            const fr = r < 7 ? r : r - (n - 7)
            const fc = c < 7 ? c : c - (n - 7)
            const on =
              fr === 0 ||
              fr === 6 ||
              fc === 0 ||
              fc === 6 ||
              (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4)
            return on ? (
              <rect key={i} x={c} y={r} width={1} height={1} fill="#090D14" />
            ) : null
          }
          return cell(r, c) ? (
            <rect key={i} x={c} y={r} width={1} height={1} fill="#090D14" />
          ) : null
        })}
      </svg>

      {/* Center Arakan Royal Seal */}
      <div
        className="absolute rounded-md overflow-hidden bg-white p-0.5 shadow"
        style={{ width: size * 0.24, height: size * 0.24 }}
      >
        <ArakanEmblem size={size * 0.22} variant="badge" />
      </div>
    </div>
  )
}
