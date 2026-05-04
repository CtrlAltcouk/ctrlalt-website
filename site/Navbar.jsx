// Sticky navbar — desktop pill nav + mobile hamburger with side drawer.
function Navbar({ active, onNavigate, buttonBlack = true }) {
  const [scrolled,  setScrolled]  = React.useState(false);
  const [menuOpen,  setMenuOpen]  = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Lock body scroll while drawer is open
  React.useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const items = [
    { id: 'home',  label: 'Home',  icon: 'Home' },
    { id: 'tools', label: 'Tools', icon: 'Wrench' },
    { id: 'files', label: 'Files', icon: 'Box' },
    { id: 'about', label: 'About', icon: 'User' },
  ];

  const go = (id) => { onNavigate(id); setMenuOpen(false); };

  const logoPill = (onClick, style = {}) => (
    <button
      onClick={onClick}
      aria-label="CtrlAlt home"
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        height: 44, padding: '0 14px 0 8px',
        background: 'var(--bg-2)', border: '1px solid var(--line-1)',
        borderRadius: 999, cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-pink-line)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; }}
    >
      <img src="assets/ChrisLogo.png" alt="" style={{ width: 28, height: 28, borderRadius: 999 }} />
      <span style={{
        fontFamily: 'var(--font-display)', fontSize: 18,
        lineHeight: 1, letterSpacing: '-0.02em', userSelect: 'none', whiteSpace: 'nowrap',
      }}>
        <span style={{ color: 'var(--fg-1)' }}>Ctrl</span>
        <span style={{ color: 'var(--brand-pink)' }}>Alt</span>
      </span>
    </button>
  );

  const ctaBtn = (fullWidth = false) => (
    <button
      onClick={() => go('files')}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        height: 44, padding: '0 18px', width: fullWidth ? '100%' : undefined,
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
      {fullWidth && <span>Latest file</span>}
      {!fullWidth && <span className="hidden sm:inline">Latest file</span>}
    </button>
  );

  return (
    <>
      <header
        className="sticky top-0 z-50"
        style={{
          backgroundColor: scrolled ? 'rgba(10,10,11,0.72)' : 'rgba(10,10,11,0)',
          backdropFilter:       scrolled ? 'blur(14px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(14px)' : 'none',
          borderBottom: '1px solid transparent',
          transition: 'background-color 300ms, backdrop-filter 300ms',
        }}
      >
        <div
          className="mx-auto max-w-[1200px] px-6 lg:px-12 h-20 flex items-center"
          style={{ position: 'relative', gap: 16 }}
        >
          {/* ── Mobile: hamburger (left) ── */}
          <button
            className="flex md:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Open menu"
            style={{
              width: 44, height: 44, alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-2)', border: '1px solid var(--line-1)',
              borderRadius: 999, cursor: 'pointer', flexShrink: 0,
              transition: 'border-color 200ms',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-pink-line)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; }}
          >
            <LucideIcon name="Menu" size={18} />
          </button>

          {/* ── Desktop: logo (left) ── */}
          <div className="hidden md:block">
            {logoPill(() => onNavigate('home'))}
          </div>

          {/* ── Mobile: logo absolutely centred ── */}
          <div
            className="md:hidden"
            style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)', pointerEvents: 'auto' }}
          >
            {logoPill(() => go('home'))}
          </div>

          {/* ── Desktop: centre segmented nav pill ── */}
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

          {/* Spacer (desktop only — mobile spacer is the absolute-positioned logo) */}
          <div className="hidden md:block flex-1" />

          {/* ── CTA — desktop only ── */}
          <div className="hidden md:block">
            {ctaBtn(false)}
          </div>
        </div>
      </header>

      {/* ── Mobile side drawer ── */}
      {menuOpen && (
        <>
          {/* Backdrop */}
          <div
            className="md:hidden"
            onClick={() => setMenuOpen(false)}
            style={{
              position: 'fixed', inset: 0, zIndex: 200,
              background: 'rgba(0,0,0,0.65)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
            }}
          />

          {/* Drawer panel */}
          <div
            className="md:hidden"
            style={{
              position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 201,
              width: 288,
              background: 'var(--bg-2)',
              borderRight: '1px solid var(--line-1)',
              display: 'flex', flexDirection: 'column',
              padding: '28px 20px 32px',
            }}
          >
            {/* Drawer header: logo + close */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 36 }}>
              {logoPill(() => go('home'), { background: 'transparent', border: '1px solid var(--line-1)' })}
              <button
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
                style={{
                  width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'var(--bg-3)', border: '1px solid var(--line-1)',
                  borderRadius: 999, cursor: 'pointer', color: 'var(--fg-2)',
                  transition: 'border-color 200ms',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand-pink-line)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; }}
              >
                <LucideIcon name="X" size={16} />
              </button>
            </div>

            {/* Nav items */}
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {items.map(it => {
                const isActive = active === it.id;
                return (
                  <button
                    key={it.id}
                    onClick={() => go(it.id)}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '13px 16px', borderRadius: 10, textAlign: 'left',
                      fontSize: 16, fontWeight: 600, fontFamily: 'var(--font-body)',
                      background: isActive ? 'var(--brand-pink)' : 'transparent',
                      color:      isActive ? '#0a0a0b'           : 'var(--fg-2)',
                      border: `1px solid ${isActive ? 'var(--brand-pink)' : 'transparent'}`,
                      cursor: 'pointer',
                      transition: 'all 150ms',
                      width: '100%',
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.color = 'var(--fg-1)'; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-2)'; } }}
                  >
                    <LucideIcon name={it.icon} size={18} />
                    {it.label}
                  </button>
                );
              })}
            </nav>

            {/* Bottom CTA */}
            <div style={{ marginTop: 'auto', paddingTop: 24, borderTop: '1px solid var(--line-1)' }}>
              {ctaBtn(true)}
            </div>
          </div>
        </>
      )}
    </>
  );
}

window.Navbar = Navbar;
