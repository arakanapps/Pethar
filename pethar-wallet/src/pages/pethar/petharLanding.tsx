import { ArrowLeftRight, Bitcoin, Bell, Fingerprint, Globe, KeyRound, Landmark, Lock, PiggyBank, QrCode, Receipt, ScanLine, Send, ShieldCheck, Smartphone, Store, Wallet, Plus, pethar as petharIcon } from 'lucide-react'
import './pethar-landing.css'

// pethar landing page (design from the approved liquid-glass preview, copy from docs/pethar-landing-outline.md).
// Items marked "coming soon" need real, verified data (licence wording, rates, stats, contact details).
const Soon = ({ children = 'Coming soon' }: { children?: string }) => <span className="ph">{children}</span>

const ScreenHome = () => (
  <div className="phone">
    <div className="notch" />
    <div className="bal"><span className="muted">pethar balance</span><b>•••••• MMK</b></div>
    <div className="qa">
      {[['Scan', ScanLine], ['Pay', QrCode], ['Transfer', ArrowLeftRight], ['Top-up', Smartphone]].map(([t, I]) => {
        const Ic = I as typeof ScanLine
        return <div key={t as string}><i><Ic size={16} /></i>{t as string}</div>
      })}
    </div>
    <div className="ig">{Array.from({ length: 12 }).map((_, i) => <i key={i} />)}</div>
  </div>
)

export default function petharLanding() {
  const products = [
    { icon: Wallet, title: 'Wallet', line: 'Send money to anyone, instantly.', bullets: ['Send, receive, and pay with a QR code', 'Works even on slow connections', 'Pay to a phone number or $pethar handle'], cta: 'Send' },
    { icon: Landmark, title: 'Banking / iBanking', line: 'Bank without the queue.', bullets: ['Savings and current accounts', 'Transfers and bill payments', 'Statements any time'], cta: 'Open' },
    { icon: Bitcoin, title: 'Crypto', line: 'Buy, hold, and send digital assets.', bullets: ['Clear prices', 'Clear risk notes', 'Send to any pethar user'], cta: 'Buy' },
    { icon: Globe, title: 'Remittance', line: 'Send money home.', bullets: ['For workers abroad', 'Straight to a pethar wallet'], cta: 'Later', soon: true },
    { icon: Smartphone, title: 'Mobile top-up', line: 'Top up any phone.', bullets: ['All local operators', 'In a couple of taps'], cta: 'Later', soon: true },
  ]
  const minis: [string, typeof Wallet][] = [['Bill pay', Receipt], ['Phone top-up', Smartphone], ['Merchant pay', Store], ['Remittance', Globe], ['Savings', PiggyBank], ['Crypto', Bitcoin], ['Scan to Pay', ScanLine], ['Send', Send], ['iBanking', Landmark], ['Transfer', ArrowLeftRight]]

  return (
    <div className="fl">
      <div className="blob b1" /><div className="blob b2" /><div className="blob b3" />
      <nav className="glass nav z">
        <div className="logo"><petharIcon size={22} /> pethar</div>
        <div className="navl"><a href="#security">Security</a><a href="#privacy">Privacy</a><a href="#products">Products</a><a href="#app">App</a></div>
        <a className="pill sm" href="#get">Get pethar</a>
      </nav>

      <div className="wrap z">
        {/* 1. Hero */}
        <section id="get">
          <div className="glass hero">
            <div>
              <h1>Your money, finally in your hands.</h1>
              <p className="muted" style={{ margin: '12px 0 8px' }}><Soon>Burmese headline — translation coming soon</Soon></p>
              <p style={{ fontSize: 18, opacity: .85 }}>One trusted app for your wallet, your bank, and crypto, built for Rakhine.</p>
              <div style={{ margin: '28px 0 12px' }}><a className="pill" href="#app">Get pethar</a></div>
              <p className="small muted">Send money with just a phone number or a $pethar handle.</p>
              <div>
                <span className="glass chip"><ScanLine size={14} /> Scan to Pay</span>
                <span className="glass chip"><Send size={14} /> Send</span>
                <span className="glass chip"><Smartphone size={14} /> Top-up</span>
              </div>
              <div className="dots"><i /><i /><i /></div>
            </div>
            <div className="heroR">
              <ScreenHome />
              <div className="glass fx">
                <b>Today's rates</b>
                <div className="r"><span>USD / MMK</span><span>—</span></div>
                <div className="r"><span>THB / MMK</span><span>—</span></div>
                <div className="small muted">Live rates coming soon</div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. Security */}
        <section id="security">
          <div className="label">Security</div>
          <h2>Safe like a bank. Simple like an app.</h2>
          <div className="grid c4">
            {[[Fingerprint, 'Biometric login', 'And a PIN on every transfer.'], [KeyRound, 'Encryption', 'With keys kept on your device.'], [Bell, 'Instant alerts', 'For every transaction. Freeze your account anytime.'], [ShieldCheck, 'Fraud monitoring', 'Watching 24/7.']].map(([I, t, d]) => {
              const Ic = I as typeof Lock
              return <div className="glass card" key={t as string}><div className="icon"><Ic size={22} /></div><h3>{t as string}</h3><p className="muted small">{d as string}</p></div>
            })}
          </div>
          <div className="glass trust">
            <div><div className="stat">—</div><p className="muted small">System uptime <Soon /></p></div>
            <div><div className="stat">—</div><p className="muted small">Encryption standard <Soon /></p></div>
            <div><div className="stat">—</div><p className="muted small">Compliance <Soon /></p></div>
          </div>
          <div className="badges">
            {['Licensed', 'Encrypted', '24/7 Support', 'Verified ID'].map(b => <div className="glass badge" key={b}><ShieldCheck size={16} /> {b}</div>)}
          </div>
          <p className="small muted" style={{ marginTop: 10 }}>Badges shown for layout; confirm each claim before launch.</p>
        </section>

        {/* 3. Privacy & policy */}
        <section id="privacy">
          <div className="label">Privacy &amp; policy</div>
          <h2>Licensed, transparent, and on your side.</h2>
          <p className="muted" style={{ marginBottom: 24 }}>Who runs pethar, its licence, and where it's based: <Soon>verified wording coming soon</Soon></p>
          <div className="grid c3">
            {[['We never sell your data', 'Your information is used to run your account — nothing else.'], ['You control what you share', 'Choose what pethar can see, and change it any time.'], ['Terms in plain language', 'No fine-print surprises.']].map(([t, d]) => (
              <div className="glass card" key={t}><div className="icon" style={{ width: 36, height: 36 }}><Lock size={18} /></div><h3>{t}</h3><p className="muted small">{d}</p></div>
            ))}
          </div>
          <div className="badges">
            <a className="pill sm" href="#">Privacy Policy</a><a className="pill sm" href="#">Terms of Service</a><a className="pill sm" href="#">KYC/AML Compliance</a>
          </div>
        </section>

        {/* 4. Products */}
        <section id="products">
          <div className="label">Products</div>
          <h2>Everything money, in one place.</h2>
          <div className="row">
            {products.map(p => (
              <div className="glass card" key={p.title}>
                <div className="img" />
                <div className="icon"><p.icon size={22} /></div>
                <h3>{p.title} {p.soon && <Soon>Later</Soon>}</h3>
                <p style={{ fontWeight: 600 }}>{p.line}</p>
                <ul className="b">{p.bullets.map(b => <li key={b}>{b}</li>)}</ul>
                <div style={{ marginTop: 18, display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="pill sm">{p.cta}</span><a className="small muted" href="#">More detail →</a>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Mobile interface */}
        <section id="app">
          <div className="label" style={{ textAlign: 'center' }}>Mobile app</div>
          <h2 style={{ textAlign: 'center', marginBottom: 48 }}>Banking 24/7, right from your phone.</h2>
          <div className="phones">
            <div><ScreenHome /><div className="cap">Payment and Transfer</div></div>
            <div className="phone-wrap"><div className="phone"><div className="notch" /><div className="bal" style={{ minHeight: 60 }}><span className="muted">Scan to Pay</span></div><div style={{ flex: 1, display: 'flex', alignItems: 'center' }}><div className="scan">SCAN</div></div><div className="qa"><div><i><Send size={14} /></i>Send</div><div><i><QrCode size={14} /></i>My QR</div><div><i><Smartphone size={14} /></i>Top-up</div></div></div><div className="cap">Mobile Top-Up &amp; QR</div></div>
            <div><div className="phone"><div className="notch" /><b>Spending this month</b><div className="chart">{[40, 75, 55, 90, 35].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}</div><p className="muted">Food · Bills · Transport · Shopping · Other</p></div><div className="cap">View and Download Statements</div></div>
            <div><div className="phone"><div className="notch" /><div className="bal"><span className="muted">Crypto</span><b>•••• </b></div>{['Asset 1', 'Asset 2', 'Asset 3', 'Asset 4'].map(a => <div className="glass" key={a} style={{ height: 56, borderRadius: 14, padding: '0 12px', display: 'flex', alignItems: 'center' }}>{a}</div>)}</div><div className="cap">Crypto</div></div>
          </div>
          <div className="grid c3 steps">
            {[['Download', 'Get pethar from your app store or as an APK.'], ['Verify', 'Confirm your phone number and ID.'], ['Start sending', 'No branch visit needed.']].map(([t, d], i) => (
              <div className="glass card" key={t}><div className="num">{i + 1}</div><h3>{t}</h3><p className="muted small">{d}</p></div>
            ))}
          </div>
          <div className="stores"><span className="glass store">Google Play</span><span className="glass store">App Store</span><span className="glass store">APK download</span></div>
        </section>

        {/* 6. Super app */}
        <section>
          <div className="label">Super app</div>
          <h2 style={{ marginBottom: 10 }}>One app. Every part of your financial life.</h2>
          <p className="muted" style={{ marginBottom: 28 }}>Pay shops, top up your phone, send money home, and grow your savings, all in one place.</p>
          <div className="grid mini">
            {minis.map(([t, I]) => <div className="glass" key={t}><div className="icon"><I size={22} /></div>{t}</div>)}
            <div className="glass more"><div className="icon"><Plus size={22} /></div>More coming</div>
            <div className="glass more"><div className="icon"><Plus size={22} /></div>More coming</div>
          </div>
          <div className="grid c4" style={{ marginTop: 24 }}>
            {[['Points', 'Earn on every payment.'], ['Cashback', 'At partner merchants.'], ['Offers', 'Deals from local shops.'], ['Rewards', 'Redeem in the app.']].map(([t, d]) => (
              <div className="glass card deal" key={t}><b>{t}</b><p className="muted small">{d}</p></div>
            ))}
          </div>
          <div className="glass promo"><div><b>Current offer</b><p className="muted small">Campaign banner space</p></div><Soon /></div>
          <div className="center"><a className="pill" href="#get">Get pethar</a></div>
        </section>
      </div>

      {/* 7. Footer */}
      <footer className="z">
        <div className="wrap">
          <div className="glass">
            <div className="fcols">
              <div>
                <div className="logo" style={{ marginBottom: 14 }}><petharIcon size={20} /> pethar</div>
                <p className="muted">Support email: <Soon /></p>
                <p className="muted">Hotline: <Soon /></p>
                <p className="muted">Office: <Soon /></p>
              </div>
              <div><h4>Products</h4><a href="#">Wallet</a><a href="#">Banking</a><a href="#">Crypto</a></div>
              <div><h4>Company</h4><a href="#">About</a><a href="#">Careers</a></div>
              <div><h4>Support</h4><a href="#">Help Center</a><a href="#">Fees</a><a href="#">Exchange Rates</a></div>
            </div>
            <div className="badges">
              {['Licensed', 'Encrypted', '24/7 Support', 'Verified ID'].map(b => <div className="glass badge" key={b} style={{ height: 34, fontSize: 12 }}>{b}</div>)}
            </div>
            <div className="legal">
              {['Terms of Service', 'Privacy Policy', 'Cookie Policy', 'Crypto Risk Disclosure', 'Complaints', 'Licensing information'].map(l => <a key={l} href="#">{l}</a>)}
            </div>
            <div className="fb">
              <div className="glass lang"><Globe size={14} /> English · မြန်မာ · Rakhine</div>
              <div className="soc"><i /><i /><i /><i /></div>
              <span className="muted">© pethar</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
