// Tweaks panel — floating bottom-right when edit mode is on.

function TweaksPanel({ tweaks, onChange }) {
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 100,
      width: collapsed ? 'auto' : 320,
      background: 'var(--bg-1)', border: '1px solid var(--brand-pink-line)',
      borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lg)',
      fontFamily: 'var(--font-body)',
    }}>
      <div
        onClick={() => setCollapsed(c => !c)}
        style={{
          padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10,
          cursor: 'pointer', borderBottom: collapsed ? 'none' : '1px solid var(--line-1)',
        }}
      >
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--brand-pink)' }} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', flex: 1 }}>Tweaks</span>
        <LucideIcon name={collapsed ? 'ChevronUp' : 'ChevronDown'} size={14} style={{ color: 'var(--fg-3)' }} />
      </div>

      {!collapsed && (
        <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 18, maxHeight: '60vh', overflowY: 'auto' }}>
          <TweakGroup label="Hero showpiece">
            <TweakChoice value={tweaks.heroVariant} onChange={v => onChange('heroVariant', v)}
              options={[
                { value: 'wireframe', label: 'Wireframe' },
                { value: 'stack',     label: 'Layer stack' },
                { value: 'marquee',   label: 'Print marquee' },
              ]} />
          </TweakGroup>

          <TweakGroup label="Hero headline">
            <TweakChoice value={tweaks.headline} onChange={v => onChange('headline', v)}
              options={[
                { value: 'default',  label: 'Default' },
                { value: 'direct',   label: 'Direct' },
                { value: 'personal', label: 'Personal' },
              ]} />
          </TweakGroup>

          <TweakGroup label="Files layout">
            <TweakChoice value={tweaks.filesLayout} onChange={v => onChange('filesLayout', v)}
              options={[
                { value: 'grid', label: 'Grid' },
                { value: 'list', label: 'List' },
              ]} />
          </TweakGroup>

          <TweakToggle
            label="Nav button — black bg"
            value={tweaks.navButtonBlack}
            onChange={v => onChange('navButtonBlack', v)}
          />
        </div>
      )}
    </div>
  );
}

function TweakGroup({ label, children }) {
  return (
    <div>
      <div style={{
        fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)',
        textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8,
      }}>{label}</div>
      {children}
    </div>
  );
}

function TweakChoice({ value, onChange, options }) {
  return (
    <div style={{ display: 'flex', gap: 4, background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 6, padding: 3 }}>
      {options.map(o => (
        <button key={o.value} onClick={() => onChange(o.value)} style={{
          flex: 1, padding: '7px 6px', fontSize: 12, fontWeight: 600,
          borderRadius: 4, cursor: 'pointer',
          background: value === o.value ? 'var(--brand-pink)' : 'transparent',
          color:      value === o.value ? '#0a0a0b' : 'var(--fg-2)',
          border: 'none',
        }}>{o.label}</button>
      ))}
    </div>
  );
}

function TweakToggle({ label, value, onChange }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10 }}>
      <span style={{ fontSize: 13, color: 'var(--fg-2)' }}>{label}</span>
      <button onClick={() => onChange(!value)} style={{
        width: 40, height: 22, borderRadius: 999,
        background: value ? 'var(--brand-pink)' : 'var(--bg-3)',
        border: `1px solid ${value ? 'var(--brand-pink)' : 'var(--line-1)'}`,
        position: 'relative', cursor: 'pointer', padding: 0,
        transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
      }}>
        <span style={{
          position: 'absolute', top: 2, left: value ? 20 : 2,
          width: 16, height: 16, borderRadius: 999,
          background: value ? '#0a0a0b' : 'var(--fg-2)',
          transition: 'left 200ms cubic-bezier(0.16,1,0.3,1)',
        }} />
      </button>
    </div>
  );
}

window.TweaksPanel = TweaksPanel;
