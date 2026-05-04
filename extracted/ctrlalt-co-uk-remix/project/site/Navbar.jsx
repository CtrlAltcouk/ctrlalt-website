// Sticky navbar — unified pill design with consistent treatment across logo, nav links, and CTA.
function Navbar({ active, onNavigate, buttonBlack = true }) {
  const [scrolled, setScrolled] = React.useState(false);
  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const items = [
    { id: 'home',  label: 'Home',  icon: 'Home' },
    { id: 'tools', label: 'Tools', icon: 'Wrench' },
    { id: 'files', label: 'Files', icon: 'Box' },
    { id: 'about', label: 'About', icon: 'User' },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-all"
      style={{
        backgroundColor: scrolled ? 'rgba(10,10,11,0.72)' : 'rgba(10,10,11,0)',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
        borderBottom: '1px solid transparent',
      }}
    >
      <div className="mx-auto max-w-[1200px] px-6 lg:px-12 h-20 flex items-center gap-4">
        {/* Logo block */}
        <button
          onClick={() => onNavigate('home')}
          aria-label="CtrlAlt home"
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 10,
            height: 44, padding: '0 14px 0 8px',
            background: 'var(--bg-2)', border: '1px solid var(--line-1)',
            borderRadius: 999, cursor: 'pointer',
            transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-pink-line)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; }}
        >
          <img src="assets/ChrisLogo.png" alt="" style={{ width: 28, height: 28, borderRadius: 999 }} />
          <span
            aria-label="Ctrl+Alt"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 18,
              lineHeight: 1,
              letterSpacing: '-0.02em',
              userSelect: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <span style={{ color: 'var(--fg-1)' }}>Ctrl</span>
            <span style={{ color: 'var(--brand-pink)' }}>Alt</span>
          </span>
        </button>

        {/* Center segmented nav pill */}
        <nav className="hidden md:flex" style={{
          height: 44, alignItems: 'center', gap: 2, padding: 4,
          background: 'var(--bg-2)', border: '1px solid var(--line-1)',
          borderRadius: 999,
        }}>
          {items.map(it => {
            const isActive = active === it.id;
            return (
              <button
                key={it.id}
                onClick={() => onNavigate(it.id)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  height: 34, padding: '0 14px',
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
                  background: isActive ? 'var(--brand-pink)' : 'transparent',
                  color:      isActive ? '#0a0a0b'           : 'var(--fg-2)',
                  border: 'none', borderRadius: 999, cursor: 'pointer',
                  transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
                }}
                onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--fg-1)'; } }}
                onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-2)'; } }}
              >
                <LucideIcon name={it.icon} size={14} />
                {it.label}
              </button>
            );
          })}
        </nav>

        <div className="flex-1" />

        {/* CTA */}
        <button
          onClick={() => onNavigate('files')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            height: 44, padding: '0 18px',
            fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-body)',
            background: buttonBlack ? '#000000' : 'var(--brand-pink)',
            color:      buttonBlack ? 'var(--brand-pink)' : '#0a0a0b',
            border: `1px solid ${buttonBlack ? 'var(--line-1)' : 'var(--brand-pink)'}`,
            borderRadius: 999, cursor: 'pointer',
            transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.borderColor = 'var(--brand-pink)';
            if (buttonBlack) e.currentTarget.style.background = '#0a0a0b';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.borderColor = buttonBlack ? 'var(--line-1)' : 'var(--brand-pink)';
            if (buttonBlack) e.currentTarget.style.background = '#000000';
          }}
        >
          <LucideIcon name="Download" size={15} />
          <span className="hidden sm:inline">Latest file</span>
        </button>
      </div>
    </header>
  );
}

window.Navbar = Navbar;
