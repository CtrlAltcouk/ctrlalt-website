// Reusable primitives: LucideIcon (wraps lucide global), Button, Pill, SectionHead.

function LucideIcon({ name, size = 20, strokeWidth = 1.75, className = '', style }) {
  const ref = React.useRef(null);
  // Lucide CDN expects kebab-case: "ArrowRight" -> "arrow-right"
  const kebab = String(name).replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/([A-Z])([A-Z][a-z])/g, '$1-$2').toLowerCase();
  React.useEffect(() => {
    if (window.lucide && ref.current) {
      ref.current.innerHTML = '';
      const el = document.createElement('i');
      el.setAttribute('data-lucide', kebab);
      ref.current.appendChild(el);
      window.lucide.createIcons({ attrs: { 'stroke-width': strokeWidth, width: size, height: size } });
    }
  }, [kebab, size, strokeWidth]);
  return (
    <span
      ref={ref}
      className={className}
      style={{ display: 'inline-flex', width: size, height: size, ...style }}
    />
  );
}

function Button({ variant = 'primary', size = 'md', icon, iconRight, children, onClick, href, external, className = '', style = {}, disabled }) {
  const base = {
    fontFamily: 'var(--font-body)',
    fontWeight: 600,
    borderRadius: 'var(--radius-sm)',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    border: '1px solid transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.4 : 1,
    transition: 'all 200ms cubic-bezier(0.16, 1, 0.3, 1)',
    textDecoration: 'none',
    whiteSpace: 'nowrap',
  };
  const sizes = {
    sm: { fontSize: 13, padding: '8px 12px' },
    md: { fontSize: 14, padding: '10px 18px' },
    lg: { fontSize: 15, padding: '12px 22px' },
  };
  const variants = {
    primary:   { background: '#000000', color: 'var(--brand-pink)', borderColor: 'var(--line-1)' },
    secondary: { background: 'var(--bg-2)', color: 'var(--fg-1)', borderColor: 'var(--line-1)' },
    ghost:     { background: 'transparent', color: 'var(--fg-2)' },
    text:      { background: 'transparent', color: 'var(--brand-pink)', padding: '10px 4px' },
  };
  const onEnter = (e) => {
    if (disabled) return;
    if (variant === 'primary')   { e.currentTarget.style.background = '#000000'; e.currentTarget.style.borderColor = 'var(--brand-pink)'; }
    if (variant === 'secondary') { e.currentTarget.style.background = 'var(--bg-3)'; e.currentTarget.style.borderColor = 'var(--brand-pink-line)'; }
    if (variant === 'ghost')     { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.color = 'var(--fg-1)'; }
  };
  const onLeave = (e) => {
    if (disabled) return;
    if (variant === 'primary')   { e.currentTarget.style.background = '#000000'; e.currentTarget.style.borderColor = 'var(--line-1)'; }
    if (variant === 'secondary') { e.currentTarget.style.background = 'var(--bg-2)'; e.currentTarget.style.borderColor = 'var(--line-1)'; }
    if (variant === 'ghost')     { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--fg-2)'; }
  };

  const props = {
    className,
    onClick,
    onMouseEnter: onEnter,
    onMouseLeave: onLeave,
    style: { ...base, ...sizes[size], ...variants[variant], ...style },
  };

  const content = (
    <>
      {icon && <LucideIcon name={icon} size={size === 'sm' ? 14 : 16} />}
      {children}
      {iconRight && <LucideIcon name={iconRight} size={size === 'sm' ? 14 : 16} />}
    </>
  );

  if (href) {
    return (
      <a href={href} target={external ? '_blank' : undefined} rel={external ? 'noopener noreferrer' : undefined} {...props}>
        {content}
      </a>
    );
  }
  return <button {...props} disabled={disabled}>{content}</button>;
}

function Pill({ tone = 'plain', mono, children, className = '' }) {
  const tones = {
    easy:    { bg: 'rgba(126,214,165,0.14)', color: '#7ed6a5', bd: 'rgba(126,214,165,0.3)' },
    medium:  { bg: 'rgba(245,201,113,0.14)', color: '#f5c971', bd: 'rgba(245,201,113,0.3)' },
    hard:    { bg: 'rgba(247,164,162,0.16)', color: '#f7a4a2', bd: 'rgba(247,164,162,0.3)' },
    expert:  { bg: 'rgba(201,139,255,0.14)', color: '#c98bff', bd: 'rgba(201,139,255,0.3)' },
    plain:   { bg: 'var(--bg-2)',            color: 'var(--fg-2)', bd: 'var(--line-1)' },
    new:     { bg: 'var(--brand-pink)',      color: '#0a0a0b',  bd: 'var(--brand-pink)' },
  };
  const t = tones[tone] || tones.plain;
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center', padding: '3px 10px',
        borderRadius: 999, fontSize: 12, fontWeight: 600,
        background: t.bg, color: t.color, border: `1px solid ${t.bd}`,
        fontFamily: mono ? 'var(--font-mono)' : 'var(--font-body)',
      }}
    >
      {tone === 'easy' || tone === 'medium' || tone === 'hard' || tone === 'expert' ? <span style={{marginRight:6}}>●</span> : null}
      {children}
    </span>
  );
}

function SectionHead({ eyebrow, title, subtitle, action }) {
  return (
    <div className="flex items-end justify-between gap-6 mb-8">
      <div className="max-w-2xl">
        {eyebrow && (
          <div style={{ color: 'var(--brand-pink)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 12 }}>
            {eyebrow}
          </div>
        )}
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(32px, 5vw, 48px)',
            lineHeight: 1.05,
            letterSpacing: '-0.02em',
            color: 'var(--fg-1)',
            margin: 0,
          }}
        >
          {title}
        </h2>
        {subtitle && (
          <p style={{ color: 'var(--fg-2)', marginTop: 14, fontSize: 17, lineHeight: 1.6 }}>
            {subtitle}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}

Object.assign(window, { LucideIcon, Button, Pill, SectionHead });
