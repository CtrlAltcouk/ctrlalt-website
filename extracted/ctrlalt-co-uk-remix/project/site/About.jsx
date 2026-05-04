// About: bio + profile + detailed printer cards (K2 Plus + K1) with specs & mods + socials footer.

const PRINTERS = [
  {
    name: 'Creality K2 Plus',
    role: 'Daily driver',
    since: '2025',
    hours: '620h',
    specs: [
      { label: 'Type',      value: 'CoreXY, enclosed' },
      { label: 'Build',     value: '350 × 350 × 350 mm' },
      { label: 'Max speed', value: '600 mm/s' },
      { label: 'Hotend',    value: 'Direct drive, 300°C' },
      { label: 'Nozzle',    value: '0.4mm (stock) · swap-in' },
      { label: 'Chamber',   value: 'Heated, actively cooled' },
    ],
    mods: [
      'Creality CFS — multi-material unit, four spools loaded',
    ],
  },
  {
    name: 'Creality K1',
    role: 'Overnight & prototyping',
    since: '2024',
    hours: '1,380h',
    specs: [
      { label: 'Type',      value: 'CoreXY, enclosed' },
      { label: 'Build',     value: '220 × 220 × 250 mm' },
      { label: 'Max speed', value: '600 mm/s' },
      { label: 'Hotend',    value: 'Creality Unicorn (upgraded)' },
      { label: 'Extruder',  value: 'Creality DXC direct drive (upgraded)' },
      { label: 'Display',   value: 'Knomi (upgraded)' },
    ],
    mods: [
      'Creality Unicorn hotend — swapped from stock',
      'Creality DXC direct-drive extruder',
      'Knomi screen for live print status',
    ],
  },
];

function AboutSection() {
  return (
    <section id="about-section" style={{ borderTop: '1px solid var(--line-1)' }}>
      {/* mascot hero strip */}
      <div style={{
        position: 'relative',
        background: `#f7a4a2 url(assets/Background.png) left center / contain no-repeat`,
        height: 280,
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(180deg, transparent 0%, transparent 55%, var(--bg-0) 100%)',
        }} />
      </div>

      <div className="mx-auto max-w-[1200px] px-6 lg:px-12 pt-10 pb-24 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-5" style={{ marginTop: -80, position: 'relative' }}>
          <img
            src="assets/ChrisLogo.png"
            alt="Chris — avatar"
            style={{
              width: 128, height: 128, borderRadius: 999,
              border: '4px solid var(--bg-0)',
              background: 'var(--bg-0)',
              marginBottom: 24,
            }}
          />
          <div style={{ color: 'var(--brand-pink)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            About me
          </div>
          <h2 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(32px, 5vw, 48px)',
            lineHeight: 1.05, letterSpacing: '-0.02em', color: 'var(--fg-1)', margin: 0,
          }}>
            Hi, I'm Chris.
          </h2>
          <div style={{ fontSize: 17, lineHeight: 1.7, color: 'var(--fg-2)', marginTop: 18 }}>
            <p style={{ margin: '0 0 16px' }}>
              I make tools and design files for 3D printing — all free, all tested on the printers below. No affiliates, no ads, no sign-up wall.
            </p>
            <p style={{ margin: '0 0 16px' }}>
              The tools live in your browser and run offline. The files come out of my own print queue — I won't post one that hasn't already worked on my bed at least twice.
            </p>
            <p style={{ margin: 0 }}>
              If you print something, send me a photo. The dog up there is Albie, he likes the attention.
            </p>
          </div>
          <div className="flex flex-wrap gap-3 mt-8">
            <Button icon="Mail" href="mailto:chris@ctrlalt.co.uk">Email me</Button>
            <Button variant="secondary" icon="Code" href="https://github.com" external iconRight="ExternalLink">GitHub</Button>
          </div>
        </div>

        <div className="lg:col-span-7">
          <div style={{ fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--fg-3)', marginBottom: 16 }}>
            My printers
          </div>
          <div className="flex flex-col gap-5">
            {PRINTERS.map((p, i) => <PrinterCard key={i} {...p} featured={i === 0} />)}
          </div>

          <div style={{
            marginTop: 24, border: '1px solid var(--brand-pink-line)',
            background: 'var(--brand-pink-dim)', borderRadius: 'var(--radius-md)', padding: 18,
          }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 6 }}>Got a request?</div>
            <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55, marginBottom: 12 }}>
              If there's a file you wish existed, or a tool you'd like me to build, let me know. No promises, but I've got a backlog I'm always reshuffling.
            </div>
            <Button variant="text" size="sm" iconRight="ArrowRight" href="mailto:chris@ctrlalt.co.uk">Send me a request</Button>
          </div>
        </div>
      </div>

      <SiteFooter />
    </section>
  );
}

function PrinterCard({ name, role, since, hours, specs, mods, featured }) {
  const [expanded, setExpanded] = React.useState(featured);
  return (
    <div style={{
      background: 'var(--bg-2)', border: `1px solid ${featured ? 'var(--brand-pink-line)' : 'var(--line-1)'}`,
      borderRadius: 'var(--radius-md)', overflow: 'hidden',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 10,
          background: featured ? 'var(--brand-pink)' : 'var(--bg-3)',
          color: featured ? '#0a0a0b' : 'var(--brand-pink)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <LucideIcon name="Printer" size={22} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--fg-1)' }}>{name}</span>
            {featured && <Pill tone="new">Primary</Pill>}
          </div>
          <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
            {role} · since {since}
          </div>
        </div>
        <button
          onClick={() => setExpanded(e => !e)}
          style={{
            background: 'transparent', border: '1px solid var(--line-1)',
            color: 'var(--fg-2)', borderRadius: 6, padding: '6px 10px',
            display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, cursor: 'pointer',
          }}
        >
          {expanded ? 'Hide' : 'Specs'}
          <LucideIcon name={expanded ? 'ChevronUp' : 'ChevronDown'} size={14} />
        </button>
      </div>

      {expanded && (
        <div style={{ borderTop: '1px solid var(--line-1)', padding: 20, display: 'grid', gridTemplateColumns: '1fr', gap: 20 }} className="md:grid-cols-2">
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              Specs
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 6 }}>
              {specs.map((s, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, fontSize: 13, fontFamily: 'var(--font-mono)', color: 'var(--fg-2)' }}>
                  <span style={{ color: 'var(--fg-3)' }}>{s.label}</span>
                  <span style={{ color: 'var(--fg-1)', textAlign: 'right' }}>{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
              My mods
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {mods.map((m, i) => (
                <li key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55 }}>
                  <span style={{ color: 'var(--brand-pink)', marginTop: 4, flexShrink: 0 }}>
                    <LucideIcon name="Wrench" size={13} />
                  </span>
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer style={{ borderTop: '1px solid var(--line-1)' }}>
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12 py-14">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 items-start">
          <div className="md:col-span-5">
            <div className="flex items-center gap-3 mb-4">
              <img src="assets/ChrisLogo.png" style={{ width: 36, height: 36, borderRadius: 999 }} />
              <object data="assets/CtrlAltText.svg" type="image/svg+xml" style={{ height: 24, pointerEvents: 'none' }} aria-label="Ctrl+Alt" />
            </div>
            <div style={{ fontSize: 14, color: 'var(--fg-3)', lineHeight: 1.6, maxWidth: 360 }}>
              Hobby 3D printing site by Chris. Tools, files, and gear logs — all free, all tested.
            </div>
          </div>

          <div className="md:col-span-4">
            <FooterHead>Follow along</FooterHead>
            <div className="flex flex-col gap-3">
              <SocialLink name="Instagram" handle="@ctrlalt.prints" brand="instagram" href="https://instagram.com" />
              <SocialLink name="YouTube"   handle="@ctrlaltprints"  brand="youtube"   href="https://youtube.com" />
              <SocialLink name="Printables" handle="chris-ctrlalt"  brand="printables" href="https://printables.com" />
            </div>
          </div>

          <div className="md:col-span-3">
            <FooterHead>Site</FooterHead>
            <div className="flex flex-col gap-2">
              <FooterLink onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })}>Tools</FooterLink>
              <FooterLink onClick={() => document.getElementById('files-section')?.scrollIntoView({ behavior: 'smooth' })}>Files</FooterLink>
              <FooterLink onClick={() => document.getElementById('about-section')?.scrollIntoView({ behavior: 'smooth' })}>About</FooterLink>
              <FooterLink href="mailto:chris@ctrlalt.co.uk">Email</FooterLink>
            </div>
          </div>
        </div>

        <div style={{ marginTop: 40, paddingTop: 20, borderTop: '1px solid var(--line-1)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
          <span>© 2026 ctrlalt.co.uk</span>
          <span>Printed in the UK · No affiliates, no ads</span>
        </div>
      </div>
    </footer>
  );
}

function FooterHead({ children }) {
  return (
    <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14 }}>
      {children}
    </div>
  );
}

function BrandIcon({ brand, size = 18 }) {
  const common = { width: size, height: size, viewBox: '0 0 24 24', fill: 'currentColor' };
  if (brand === 'instagram') {
    return (
      <svg {...common}>
        <path d="M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.7 3.7 0 0 1-1.38-.9 3.7 3.7 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.17 15.58 2.16 15.2 2.16 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.17 8.8 2.16 12 2.16M12 0C8.74 0 8.33.01 7.05.07 5.78.13 4.9.33 4.14.63a5.86 5.86 0 0 0-2.13 1.38A5.86 5.86 0 0 0 .63 4.14C.33 4.9.13 5.78.07 7.05.01 8.33 0 8.74 0 12s.01 3.67.07 4.95c.06 1.27.26 2.15.56 2.91.31.79.73 1.46 1.38 2.13a5.86 5.86 0 0 0 2.13 1.38c.76.3 1.64.5 2.91.56C8.33 23.99 8.74 24 12 24s3.67-.01 4.95-.07c1.27-.06 2.15-.26 2.91-.56a5.86 5.86 0 0 0 2.13-1.38 5.86 5.86 0 0 0 1.38-2.13c.3-.76.5-1.64.56-2.91.06-1.28.07-1.69.07-4.95s-.01-3.67-.07-4.95c-.06-1.27-.26-2.15-.56-2.91a5.86 5.86 0 0 0-1.38-2.13A5.86 5.86 0 0 0 19.86.63C19.1.33 18.22.13 16.95.07 15.67.01 15.26 0 12 0zm0 5.84a6.16 6.16 0 1 0 0 12.32 6.16 6.16 0 0 0 0-12.32zm0 10.16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.4-11.85a1.44 1.44 0 1 0 0 2.88 1.44 1.44 0 0 0 0-2.88z"/>
      </svg>
    );
  }
  if (brand === 'youtube') {
    return (
      <svg {...common}>
        <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.6 12 3.6 12 3.6s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4l6.2 3.6-6.2 3.6z"/>
      </svg>
    );
  }
  if (brand === 'printables') {
    // Stylized cube
    return (
      <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z"/>
        <path d="M3 7l9 5 9-5"/>
        <path d="M12 12v10"/>
      </svg>
    );
  }
  return null;
}

function SocialLink({ name, handle, brand, href }) {
  const [hover, setHover] = React.useState(false);
  return (
    <a href={href} target="_blank" rel="noopener noreferrer"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
        borderRadius: 8, border: `1px solid ${hover ? 'var(--brand-pink-line)' : 'var(--line-1)'}`,
        background: hover ? 'var(--bg-3)' : 'var(--bg-2)',
        textDecoration: 'none', transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <span style={{ color: hover ? 'var(--brand-pink)' : 'var(--fg-2)', display: 'inline-flex' }}>
        <BrandIcon brand={brand} size={18} />
      </span>
      <span style={{ flex: 1, minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: 14, color: 'var(--fg-1)', fontWeight: 500 }}>{name}</span>
        <span style={{ display: 'block', fontSize: 12, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>{handle}</span>
      </span>
      <LucideIcon name="ExternalLink" size={14} style={{ color: 'var(--fg-3)' }} />
    </a>
  );
}

function FooterLink({ children, href, onClick }) {
  const [hover, setHover] = React.useState(false);
  const style = {
    fontSize: 14, color: hover ? 'var(--brand-pink)' : 'var(--fg-2)',
    textDecoration: 'none', background: 'transparent', border: 0, padding: 0, textAlign: 'left', cursor: 'pointer',
    transition: 'color 200ms cubic-bezier(0.16,1,0.3,1)',
  };
  if (href) return <a href={href} style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>{children}</a>;
  return <button onClick={onClick} style={style} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>{children}</button>;
}

window.AboutSection = AboutSection;
