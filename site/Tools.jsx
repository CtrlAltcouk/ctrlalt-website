// Tools: actual utilities for 3D printing. Filament calculator is the main one.

function ToolsSection() {
  const [openTool, setOpenTool] = React.useState('filament');

  const tools = [
    { id: 'filament', name: 'Filament calculator',  desc: 'Work out how much filament a print will eat before you start it.',       icon: 'Scale' },
    { id: 'scale',    name: 'Resize & scale',        desc: 'Scale a model and see how filament, time, and strength change with it.', icon: 'Maximize2' },
    { id: 'cost',     name: 'Cost per print',        desc: 'What the thing actually costs — filament, electricity, wear.',           icon: 'PoundSterling' },
    { id: 'time',     name: 'Filament drying guide',    desc: 'Drying temps, times and storage tips for every filament type.',        icon: 'Droplets' },
  ];

  return (
    <section id="tools-section" className="mx-auto max-w-[1200px] px-6 lg:px-12 py-24" style={{ borderTop: '1px solid var(--line-1)' }}>
      <SectionHead
        eyebrow="Tools"
        title="Utilities for printing."
        subtitle="Small web tools I built because I got tired of opening a calculator. All free, all run in your browser, nothing gets uploaded."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Tool picker */}
        <div className="lg:col-span-4 flex flex-col gap-3">
          {tools.map(t => (
            <ToolPickerCard key={t.id} {...t} active={openTool === t.id} onClick={() => setOpenTool(t.id)} />
          ))}
        </div>

        {/* Active tool */}
        <div className="lg:col-span-8">
          <div style={{
            background: 'var(--bg-2)',
            border: '1px solid var(--line-1)',
            borderRadius: 'var(--radius-lg)',
            padding: 24,
            minHeight: 520,
          }}>
            {openTool === 'filament' && <FilamentCalculator />}
            {openTool === 'scale' &&    <ScaleTool />}
            {openTool === 'cost' &&     <CostCalculator />}
            {openTool === 'time' &&     <FilamentDryingGuide />}
          </div>
        </div>
      </div>
    </section>
  );
}

function ToolPickerCard({ name, desc, icon, active, onClick }) {
  const [hover, setHover] = React.useState(false);
  const bd = active ? 'var(--brand-pink)' : (hover ? 'var(--brand-pink-line)' : 'var(--line-1)');
  const bg = active ? 'var(--brand-pink-dim)' : (hover ? 'var(--bg-3)' : 'var(--bg-2)');
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        textAlign: 'left', display: 'flex', gap: 14, alignItems: 'flex-start',
        padding: 16, borderRadius: 'var(--radius-md)',
        border: `1px solid ${bd}`, background: bg, cursor: 'pointer',
        transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 8, flexShrink: 0,
        background: active ? 'var(--brand-pink)' : 'var(--bg-3)',
        color: active ? '#0a0a0b' : 'var(--brand-pink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LucideIcon name={icon} size={20} />
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
          {name}
          {active && <LucideIcon name="ArrowRight" size={14} style={{ color: 'var(--brand-pink)' }} />}
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.5 }}>{desc}</div>
      </div>
    </button>
  );
}

/* -------------------- Filament Calculator -------------------- */

function FilamentCalculator() {
  const [ftypes, setFtypes] = React.useState([
    { id: 1, name: 'PLA',  cost: 18.99, color: '#f7a4a2' },
    { id: 2, name: 'PETG', cost: 22.50, color: '#7ed6a5' },
    { id: 3, name: 'ABS',  cost: 20.00, color: '#f5c971' },
    { id: 4, name: 'TPU',  cost: 35.00, color: '#c98bff' },
  ]);
  const [prints, setPrints] = React.useState([
    { id: 1, name: '', weight: '', ftId: 1 },
  ]);
  const [nextFtId, setNextFtId] = React.useState(5);
  const [nextPlId, setNextPlId] = React.useState(2);
  const [spool750, setSpool750] = React.useState(false);

  const spoolG = spool750 ? 750 : 1000;

  const addFt = () => {
    const cols = ['#e91e63', '#9c27b0', '#00bcd4', '#8bc34a', '#ffc107', '#ff9800'];
    setFtypes(prev => [...prev, { id: nextFtId, name: '', cost: 20.00, color: cols[nextFtId % cols.length] }]);
    setNextFtId(n => n + 1);
  };
  const delFt = (id) => {
    if (ftypes.length <= 1) return;
    const fallback = ftypes.find(f => f.id !== id)?.id;
    setFtypes(prev => prev.filter(f => f.id !== id));
    setPrints(prev => prev.map(p => p.ftId === id ? { ...p, ftId: fallback } : p));
  };
  const setFt = (id, key, val) => setFtypes(prev => prev.map(f => f.id === id ? { ...f, [key]: val } : f));

  const addPl = () => {
    setPrints(prev => [...prev, { id: nextPlId, name: '', weight: '', ftId: ftypes[0]?.id || 1 }]);
    setNextPlId(n => n + 1);
  };
  const delPl = (id) => setPrints(prev => prev.filter(p => p.id !== id));
  const setPl = (id, key, val) => setPrints(prev => prev.map(p => p.id === id ? { ...p, [key]: val } : p));

  const summary = React.useMemo(() => {
    const map = {};
    ftypes.forEach(ft => { map[ft.id] = { ft, g: 0, cost: 0 }; });
    let totalG = 0, totalCost = 0;
    prints.forEach(p => {
      const w = parseFloat(p.weight) || 0;
      const ft = ftypes.find(f => f.id === p.ftId);
      if (ft && map[ft.id] !== undefined) {
        map[ft.id].g    += w;
        map[ft.id].cost += (w / 1000) * ft.cost;
        totalG    += w;
        totalCost += (w / 1000) * ft.cost;
      }
    });
    let totalSpools = 0;
    Object.values(map).forEach(t => { if (t.g > 0) totalSpools += Math.ceil(t.g / spoolG); });
    return { totalG, totalCost, totalSpools, byType: Object.values(map).filter(t => t.g > 0) };
  }, [ftypes, prints, spoolG]);

  const lineCost = (p) => {
    const w = parseFloat(p.weight) || 0;
    const ft = ftypes.find(f => f.id === p.ftId);
    if (!ft || w === 0) return '—';
    return '£' + ((w / 1000) * ft.cost).toFixed(2);
  };

  const panelStyle = { border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden', marginBottom: 14 };
  const panelHeadStyle = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '11px 16px', background: 'var(--bg-1)', borderBottom: '1px solid var(--line-1)',
  };
  const panelBodyStyle = { padding: 16, background: 'var(--bg-2)' };
  const monoLabel = { fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-3)', display: 'block', marginBottom: 5 };
  const inputBase = {
    background: 'var(--bg-3)', border: '1px solid var(--line-1)',
    color: 'var(--fg-1)', fontFamily: 'var(--font-mono)', fontSize: 13,
    padding: '7px 10px', borderRadius: 5, width: '100%', outline: 'none',
    transition: 'border-color 150ms',
  };
  const panelPill = {
    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.08em',
    color: 'var(--brand-pink)', border: '1px solid var(--brand-pink-line)',
    padding: '3px 8px', borderRadius: 999,
  };
  const panelTitle = { fontSize: 12, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--fg-1)' };

  return (
    <div>
      <ToolHeader name="Filament calculator" icon="Scale" tag="Live" />

      <div style={{ marginTop: 20 }}>

        {/* 01 — Filament Library */}
        <div style={panelStyle}>
          <div style={panelHeadStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={panelPill}>01</span>
              <span style={panelTitle}>Filament Library</span>
            </div>
            <button
              onClick={addFt}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 5,
                padding: '7px 14px', borderRadius: 5, fontSize: 12, fontWeight: 600,
                fontFamily: 'var(--font-body)',
                background: 'var(--brand-pink)', color: '#0a0a0b', border: 'none', cursor: 'pointer',
                transition: 'background 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-pink-hover)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand-pink)'; }}
            >+ Add Type</button>
          </div>
          <div style={{ ...panelBodyStyle, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {ftypes.map(ft => (
              <div key={ft.id} style={{
                display: 'grid', gridTemplateColumns: '1.6fr 1fr auto auto',
                gap: 10, alignItems: 'end',
                padding: 14, background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 7,
              }}>
                <div>
                  <span style={monoLabel}>Type Name</span>
                  <input type="text" value={ft.name} placeholder="e.g. PLA"
                    onChange={e => setFt(ft.id, 'name', e.target.value)}
                    style={inputBase}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-pink)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; }}
                  />
                </div>
                <div>
                  <span style={monoLabel}>Cost / kg (£)</span>
                  <input type="number" value={ft.cost} min="0" step="0.01" placeholder="0.00"
                    onChange={e => setFt(ft.id, 'cost', parseFloat(e.target.value) || 0)}
                    style={{ ...inputBase, textAlign: 'right' }}
                    onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-pink)'; }}
                    onBlur={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; }}
                  />
                </div>
                <div>
                  <span style={monoLabel}>Colour</span>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{ width: 34, height: 34, borderRadius: 6, background: ft.color, border: '2px solid var(--line-2)', cursor: 'pointer', transition: 'transform 150ms' }}
                      onClick={() => document.getElementById(`cp-${ft.id}`)?.click()}
                      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; }}
                      title="Pick colour"
                    />
                    <input type="color" id={`cp-${ft.id}`} value={ft.color}
                      onChange={e => setFt(ft.id, 'color', e.target.value)}
                      style={{ position: 'absolute', opacity: 0, width: 1, height: 1, pointerEvents: 'none' }}
                    />
                  </div>
                </div>
                <button
                  onClick={() => delFt(ft.id)}
                  disabled={ftypes.length <= 1}
                  style={{
                    background: 'transparent', color: 'var(--fg-4)', border: '1px solid transparent',
                    padding: '7px 9px', fontSize: 14, borderRadius: 4,
                    cursor: ftypes.length <= 1 ? 'not-allowed' : 'pointer', alignSelf: 'flex-end',
                    transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { if (ftypes.length > 1) { e.currentTarget.style.color = '#ff4060'; e.currentTarget.style.background = 'rgba(255,64,96,0.1)'; } }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-4)'; e.currentTarget.style.background = 'transparent'; }}
                >✕</button>
              </div>
            ))}
          </div>
        </div>

        {/* 02 — Print Queue */}
        <div style={panelStyle}>
          <div style={panelHeadStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={panelPill}>02</span>
              <span style={panelTitle}>Print Queue</span>
            </div>
          </div>
          <div style={panelBodyStyle}>
            <div style={{
              display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 80px 36px',
              gap: 8, padding: '4px 10px',
              fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em',
              textTransform: 'uppercase', color: 'var(--fg-4)', marginBottom: 6,
            }}>
              <span>STL Name</span>
              <span style={{ textAlign: 'right' }}>Weight (g)</span>
              <span>Filament</span>
              <span style={{ textAlign: 'right' }}>Cost</span>
              <span />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {prints.length === 0 ? (
                <div style={{ padding: 24, textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>
                  // no prints added yet
                </div>
              ) : prints.map(p => {
                const ft = ftypes.find(f => f.id === p.ftId) || ftypes[0];
                return (
                  <div key={p.id} style={{
                    display: 'grid', gridTemplateColumns: '2fr 1fr 1.4fr 80px 36px',
                    gap: 8, alignItems: 'center',
                    padding: '8px 10px', background: 'var(--bg-1)',
                    border: '1px solid var(--line-1)', borderRadius: 7,
                  }}>
                    <input type="text" value={p.name} placeholder="STL name…"
                      onChange={e => setPl(p.id, 'name', e.target.value)}
                      style={{ ...inputBase, padding: '6px 8px' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-pink)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; }}
                    />
                    <input type="number" value={p.weight} min="0" step="0.1" placeholder="0"
                      onChange={e => setPl(p.id, 'weight', e.target.value)}
                      style={{ ...inputBase, padding: '6px 8px', textAlign: 'right' }}
                      onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-pink)'; }}
                      onBlur={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; }}
                    />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
                      <span style={{ width: 9, height: 9, borderRadius: '50%', background: ft.color, flexShrink: 0 }} />
                      <div style={{ position: 'relative', flex: 1 }}>
                        <select value={p.ftId}
                          onChange={e => setPl(p.id, 'ftId', parseInt(e.target.value))}
                          style={{ ...inputBase, padding: '6px 22px 6px 8px', appearance: 'none', WebkitAppearance: 'none' }}
                          onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-pink)'; }}
                          onBlur={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; }}
                        >
                          {ftypes.map(f => (
                            <option key={f.id} value={f.id} style={{ background: 'var(--bg-2)' }}>
                              {f.name || 'Unnamed'}
                            </option>
                          ))}
                        </select>
                        <span style={{ position: 'absolute', right: 7, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', fontSize: 11, pointerEvents: 'none' }}>▾</span>
                      </div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#7ed6a5', textAlign: 'right' }}>
                      {lineCost(p)}
                    </span>
                    <button onClick={() => delPl(p.id)}
                      style={{ background: 'transparent', color: 'var(--fg-4)', border: '1px solid transparent', padding: '6px 8px', fontSize: 14, borderRadius: 4, cursor: 'pointer' }}
                      onMouseEnter={e => { e.currentTarget.style.color = '#ff4060'; e.currentTarget.style.background = 'rgba(255,64,96,0.1)'; }}
                      onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-4)'; e.currentTarget.style.background = 'transparent'; }}
                    >✕</button>
                  </div>
                );
              })}
            </div>

            <button onClick={addPl}
              style={{
                width: '100%', marginTop: 10, padding: 10, borderRadius: 6, fontSize: 13,
                fontWeight: 600, fontFamily: 'var(--font-body)',
                background: 'transparent', color: 'var(--brand-pink)',
                border: '1px dashed var(--brand-pink-line)', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                transition: 'background 150ms, border-color 150ms',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-pink-dim)'; e.currentTarget.style.borderColor = 'var(--brand-pink)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--brand-pink-line)'; }}
            >＋ Add Print</button>
          </div>
        </div>

        {/* 03 — Summary */}
        <div style={panelStyle}>
          <div style={panelHeadStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={panelPill}>03</span>
              <span style={panelTitle}>Project Summary</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: !spool750 ? 'var(--brand-pink)' : 'var(--fg-4)', transition: 'color 200ms' }}>1 KG</span>
              <button
                onClick={() => setSpool750(v => !v)}
                style={{
                  width: 40, height: 22, borderRadius: 999, position: 'relative', cursor: 'pointer', padding: 0,
                  background: spool750 ? 'var(--brand-pink-dim)' : 'var(--bg-3)',
                  border: `1px solid ${spool750 ? 'var(--brand-pink-line)' : 'var(--line-1)'}`,
                  transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
                }}
              >
                <span style={{
                  position: 'absolute', top: 2, left: spool750 ? 20 : 2,
                  width: 16, height: 16, borderRadius: 999, background: 'var(--brand-pink)',
                  transition: 'left 200ms cubic-bezier(0.16,1,0.3,1)',
                  boxShadow: '0 0 8px var(--brand-pink-dim)',
                }} />
              </button>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: spool750 ? 'var(--brand-pink)' : 'var(--fg-4)', transition: 'color 200ms' }}>750 G</span>
            </div>
          </div>
          <div style={panelBodyStyle}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 18 }}>
              <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 8, padding: 16 }}>
                <div style={{ ...monoLabel, marginBottom: 8, display: 'block' }}>Total Weight</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.03em', color: 'var(--fg-1)', lineHeight: 1 }}>
                  {summary.totalG.toFixed(0)} <span style={{ fontSize: 14, color: 'var(--fg-3)', fontFamily: 'var(--font-body)', fontWeight: 400 }}>g</span>
                </div>
              </div>
              <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 8, padding: 16 }}>
                <div style={{ ...monoLabel, marginBottom: 8, display: 'block' }}>Spools Needed</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.03em', color: 'var(--brand-pink)', lineHeight: 1 }}>
                  {summary.totalSpools}
                </div>
              </div>
              <div style={{ background: 'var(--brand-pink-dim)', border: '1px solid var(--brand-pink-line)', borderRadius: 8, padding: 16 }}>
                <div style={{ ...monoLabel, marginBottom: 8, display: 'block' }}>Total Cost</div>
                <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, letterSpacing: '-0.03em', color: 'var(--brand-pink)', lineHeight: 1 }}>
                  £{summary.totalCost.toFixed(2)}
                </div>
              </div>
            </div>

            {summary.byType.length === 0 ? (
              <div style={{ padding: '10px 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>
                // add prints to see breakdown
              </div>
            ) : (
              <div style={{ borderTop: '1px solid var(--line-1)', paddingTop: 16 }}>
                <div style={{ ...monoLabel, marginBottom: 12, display: 'block' }}>Per-Filament Breakdown</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      {['Filament', 'Weight', 'Spools', 'Cost'].map((h, i) => (
                        <th key={h} style={{
                          fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em',
                          textTransform: 'uppercase', color: 'var(--fg-4)',
                          textAlign: i === 0 ? 'left' : 'right',
                          padding: '0 10px 10px', borderBottom: '1px solid var(--line-1)', fontWeight: 600,
                        }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {summary.byType.map(t => {
                      const spools = Math.ceil(t.g / spoolG);
                      const rem = t.g % spoolG;
                      const lastLbl = rem === 0 ? 'full' : Math.round((rem / spoolG) * 100) + '%';
                      return (
                        <tr key={t.ft.id}>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-2)', padding: '10px 10px', borderBottom: '1px solid rgba(38,39,44,0.5)' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ width: 8, height: 8, borderRadius: '50%', background: t.ft.color, flexShrink: 0 }} />
                              {t.ft.name || 'Unnamed'}
                            </div>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-1)', padding: '10px 10px', textAlign: 'right', borderBottom: '1px solid rgba(38,39,44,0.5)' }}>
                            {t.g.toFixed(1)}g
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--fg-1)', padding: '10px 10px', textAlign: 'right', borderBottom: '1px solid rgba(38,39,44,0.5)' }}>
                            {spools} <span style={{ color: 'var(--fg-4)', fontSize: 11 }}>({lastLbl})</span>
                          </td>
                          <td style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--brand-pink)', padding: '10px 10px', textAlign: 'right', borderBottom: '1px solid rgba(38,39,44,0.5)' }}>
                            £{t.cost.toFixed(2)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', borderTop: '1px dashed var(--line-1)', paddingTop: 12, lineHeight: 1.6, marginTop: 16 }}>
              // cost based on actual weight per print — no slicer estimation.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

/* -------------------- Time Estimator -------------------- */

function TimeEstimator() {
  const [volume, setVolume] = React.useState(120); // cm³
  const [speed, setSpeed]   = React.useState(150); // mm/s
  const [layerH, setLayerH] = React.useState(0.2); // mm
  const [nozzleW, setNozzleW] = React.useState(0.4);

  // volumetric speed ~ speed * layerH * nozzleW  (mm³/s)
  const flow = speed * layerH * nozzleW; // mm³/s
  const secs = (volume * 1000) / flow;  // cm³→mm³ / mm³/s
  const totalH = secs / 3600;
  const h = Math.floor(totalH);
  const m = Math.round((totalH - h) * 60);

  return (
    <div>
      <ToolHeader name="Print-time estimator" icon="Clock" tag="Live" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col gap-5">
          <Field label={`Model volume · ${volume} cm³`}>
            <Slider value={volume} onChange={setVolume} min={1} max={500} step={1} />
          </Field>
          <Field label={`Print speed · ${speed} mm/s`}>
            <Slider value={speed} onChange={setSpeed} min={30} max={500} step={5} />
          </Field>
          <Field label={`Layer height · ${layerH.toFixed(2)} mm`}>
            <Slider value={layerH} onChange={setLayerH} min={0.08} max={0.32} step={0.02} />
          </Field>
          <Field label={`Nozzle width · ${nozzleW.toFixed(2)} mm`}>
            <Slider value={nozzleW} onChange={setNozzleW} min={0.2} max={0.8} step={0.1} />
          </Field>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', padding: 20, display: 'flex', flexDirection: 'column', gap: 18 }}>
          <BigResult label="Estimated print time" value={`${h}h ${m}m`} unit="" accent />
          <div style={{ height: 1, background: 'var(--line-1)' }} />
          <StatRow label="Volumetric flow" value={`${flow.toFixed(1)} mm³/s`} />
          <StatRow label="Total seconds" value={Math.round(secs).toLocaleString()} />
          <StatRow label="Layers" value={`~${Math.round(50 / layerH)} for 50mm`} />

          {flow > 25 && (
            <div style={{ background: 'rgba(245,201,113,0.10)', border: '1px solid rgba(245,201,113,0.3)', borderRadius: 8, padding: 12, fontSize: 12, color: 'var(--tag-medium)', display: 'flex', gap: 8 }}>
              <LucideIcon name="TriangleAlert" size={16} />
              <span>Flow exceeds most hotends. Consider a high-flow nozzle (CHT / Volcano).</span>
            </div>
          )}
          <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', borderTop: '1px dashed var(--line-1)', paddingTop: 12, lineHeight: 1.6 }}>
            // estimate assumes constant flow. Real print <br />
            // time adds travel, retraction, and seam moves.
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------- Cost Calculator -------------------- */

function CostCalculator() {
  const [weight, setWeight] = React.useState(85);
  const [pricePerKg, setPricePerKg] = React.useState(22);
  const [hours, setHours] = React.useState(6);
  const [watts, setWatts] = React.useState(120);
  const [pricePerKwh, setPricePerKwh] = React.useState(0.29);
  const [wear, setWear] = React.useState(0.15); // £/hr printer wear

  const filamentCost = (weight / 1000) * pricePerKg;
  const electricityCost = (watts / 1000) * hours * pricePerKwh;
  const wearCost = hours * wear;
  const total = filamentCost + electricityCost + wearCost;

  return (
    <div>
      <ToolHeader name="Cost per print" icon="PoundSterling" tag="Live" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col gap-5">
          <Field label={`Filament used · ${weight} g`}>
            <Slider value={weight} onChange={setWeight} min={1} max={1000} step={1} />
          </Field>
          <Field label={`Filament price (£/kg) · £${pricePerKg}`}>
            <Slider value={pricePerKg} onChange={setPricePerKg} min={10} max={80} step={1} />
          </Field>
          <Field label={`Print time · ${hours}h`}>
            <Slider value={hours} onChange={setHours} min={0.5} max={48} step={0.5} />
          </Field>
          <Field label={`Printer draw · ${watts} W`}>
            <Slider value={watts} onChange={setWatts} min={50} max={400} step={10} />
          </Field>
          <Field label={`Electricity · £${pricePerKwh.toFixed(2)}/kWh`}>
            <Slider value={pricePerKwh} onChange={setPricePerKwh} min={0.10} max={0.50} step={0.01} />
          </Field>
          <Field label={`Printer wear · £${wear.toFixed(2)}/hr`}>
            <Slider value={wear} onChange={setWear} min={0} max={1} step={0.05} />
          </Field>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BigResult label="Total cost" value={`£${total.toFixed(2)}`} unit="" accent />
          <div style={{ height: 1, background: 'var(--line-1)' }} />

          {/* cost bar */}
          <div style={{ display: 'flex', height: 28, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line-1)' }}>
            <div title="Filament" style={{ width: `${(filamentCost/total)*100}%`, background: 'var(--brand-pink)' }} />
            <div title="Electricity" style={{ width: `${(electricityCost/total)*100}%`, background: '#f5c971' }} />
            <div title="Wear" style={{ width: `${(wearCost/total)*100}%`, background: '#7ed6a5' }} />
          </div>
          <StatRow label={<span style={{ display:'inline-flex', alignItems:'center', gap:8 }}><Dot c="var(--brand-pink)"/>Filament</span>} value={`£${filamentCost.toFixed(2)}`} />
          <StatRow label={<span style={{ display:'inline-flex', alignItems:'center', gap:8 }}><Dot c="#f5c971"/>Electricity</span>} value={`£${electricityCost.toFixed(2)}`} />
          <StatRow label={<span style={{ display:'inline-flex', alignItems:'center', gap:8 }}><Dot c="#7ed6a5"/>Printer wear</span>} value={`£${wearCost.toFixed(2)}`} />
        </div>
      </div>
    </div>
  );
}

function Dot({ c }) {
  return <span style={{ width: 8, height: 8, borderRadius: 999, background: c, display: 'inline-block' }} />;
}

/* -------------------- Scale Tool -------------------- */

function ScaleTool() {
  const [mode, setMode] = React.useState('scale'); // 'scale' | 'size'

  // Mode 1: Find Scale %
  const [orig,   setOrig]   = React.useState({ x: '', y: '', z: '' });
  const [target, setTarget] = React.useState({ x: '', y: '', z: '' });

  // Mode 2: Find Target Size
  const [sOrig, setSOrig] = React.useState({ x: '', y: '', z: '' });
  const [pct,   setPct]   = React.useState('');

  const [copied, setCopied] = React.useState(false);

  const AX = { x: 'var(--brand-pink)', y: '#7ed6a5', z: '#8fb4ff' };

  const fmtPct = (n) => {
    let s = n.toFixed(4);
    while (s.length > s.indexOf('.') + 3 && s.endsWith('0')) s = s.slice(0, -1);
    return s + '%';
  };
  const fmtMm = (n) => {
    let s = n.toFixed(3);
    while (s.length > s.indexOf('.') + 2 && s.endsWith('0')) s = s.slice(0, -1);
    return s;
  };
  const scaleCls   = (p) => p > 100.0005 ? 'up' : p < 99.9995 ? 'down' : 'flat';
  const scaleLabel = (p) => p > 100.0005 ? 'Enlarging' : p < 99.9995 ? 'Shrinking' : 'No Change';
  const scaleColor = (cls) => cls === 'up' ? '#7ed6a5' : cls === 'down' ? 'var(--brand-pink)' : 'var(--fg-2)';

  const copyVal = (txt) => {
    navigator.clipboard.writeText(txt).catch(() => {
      const t = document.createElement('textarea');
      t.value = txt; document.body.appendChild(t); t.select();
      document.execCommand('copy'); t.remove();
    });
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const scaleResult = React.useMemo(() => {
    const ox = parseFloat(orig.x), oy = parseFloat(orig.y), oz = parseFloat(orig.z);
    const tx = parseFloat(target.x), ty = parseFloat(target.y), tz = parseFloat(target.z);
    if (!ox || !oy || !oz || !tx || !ty || !tz || ox <= 0 || oy <= 0 || oz <= 0 || tx <= 0 || ty <= 0 || tz <= 0) return null;
    const sx = (tx / ox) * 100, sy = (ty / oy) * 100, sz = (tz / oz) * 100;
    return { sx, sy, sz, isUniform: Math.abs(sx - sy) < 0.0005 && Math.abs(sy - sz) < 0.0005 };
  }, [orig, target]);

  const sizeResult = React.useMemo(() => {
    const ox = parseFloat(sOrig.x), oy = parseFloat(sOrig.y), oz = parseFloat(sOrig.z);
    const p = parseFloat(pct);
    if (!ox || !oy || !oz || !p || ox <= 0 || oy <= 0 || oz <= 0 || p <= 0) return null;
    const f = p / 100;
    return { nx: ox * f, ny: oy * f, nz: oz * f, pct: p };
  }, [sOrig, pct]);

  const hasResult = mode === 'scale' ? !!scaleResult : !!sizeResult;

  const inputStyle = {
    background: 'var(--bg-3)', border: '1px solid var(--line-1)',
    color: 'var(--fg-1)', fontFamily: 'var(--font-mono)', fontSize: 14,
    padding: '9px 10px', borderRadius: 6, width: '100%', outline: 'none',
    textAlign: 'right', transition: 'border-color 150ms, box-shadow 150ms',
    WebkitAppearance: 'none', appearance: 'none',
  };
  const onFocus = e => { e.currentTarget.style.borderColor = 'var(--brand-pink)'; e.currentTarget.style.boxShadow = '0 0 0 2px var(--brand-pink-dim)'; };
  const onBlur  = e => { e.currentTarget.style.borderColor = 'var(--line-1)';     e.currentTarget.style.boxShadow = 'none'; };

  const DimFields = ({ vals, onChange, placeholders = ['100', '100', '100'] }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {['x', 'y', 'z'].map((ax, i) => (
        <div key={ax} style={{ display: 'grid', gridTemplateColumns: '20px 1fr', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 700, color: AX[ax], textAlign: 'center', textTransform: 'uppercase' }}>{ax}</span>
          <input type="number" value={vals[ax]} min="0.001" step="any" placeholder={placeholders[i]}
            onChange={e => onChange(ax, e.target.value)}
            style={inputStyle} onFocus={onFocus} onBlur={onBlur}
          />
        </div>
      ))}
    </div>
  );

  const PanelHead = ({ label }) => (
    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 9, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'var(--fg-4)', marginBottom: 12 }}>
      {label}
    </div>
  );

  const ArrowDivider = () => (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 30 }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
        <div style={{ width: 1, height: 18, background: 'linear-gradient(var(--line-1), transparent)' }} />
        <span style={{ color: 'var(--fg-4)', fontSize: 16 }}>→</span>
        <div style={{ width: 1, height: 18, background: 'linear-gradient(transparent, var(--line-1))' }} />
      </div>
    </div>
  );

  return (
    <div>
      <ToolHeader name="Resize & scale" icon="Maximize2" tag="Live" />

      <div style={{ marginTop: 20 }}>
        {/* Tabs */}
        <div style={{
          display: 'flex', background: 'var(--bg-1)', border: '1px solid var(--line-1)',
          borderRadius: 'var(--radius-md)', padding: 4, marginBottom: 16, gap: 4,
        }}>
          {[['scale', 'Find Scale %'], ['size', 'Find Target Size']].map(([m, label]) => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '10px', textAlign: 'center', fontSize: 12, fontWeight: 700,
              letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: 'var(--font-body)',
              borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none',
              background: mode === m ? 'var(--bg-3)' : 'transparent',
              color: mode === m ? 'var(--brand-pink)' : 'var(--fg-4)',
              boxShadow: mode === m ? '0 0 0 1px var(--line-2), inset 0 0 12px var(--brand-pink-dim)' : 'none',
              transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
            }}>
              {label}
            </button>
          ))}
        </div>

        {/* Input card */}
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', padding: 20, marginBottom: 14 }}>

          {/* Mode: Find Scale % */}
          {mode === 'scale' && (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 8, alignItems: 'start', marginBottom: 16 }}>
                <div>
                  <PanelHead label="Original Size" />
                  <DimFields vals={orig} onChange={(ax, v) => setOrig(p => ({ ...p, [ax]: v }))} />
                </div>
                <ArrowDivider />
                <div>
                  <PanelHead label="Target Size" />
                  <DimFields vals={target} onChange={(ax, v) => setTarget(p => ({ ...p, [ax]: v }))} placeholders={['101', '101', '101']} />
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <button
                  onClick={() => { setOrig(target); setTarget(orig); }}
                  style={{
                    background: 'transparent', border: '1px solid var(--line-1)', color: 'var(--fg-4)',
                    fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                    padding: '5px 14px', borderRadius: 5, cursor: 'pointer', transition: 'all 150ms',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = 'var(--fg-2)'; e.currentTarget.style.borderColor = 'var(--line-2)'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-4)'; e.currentTarget.style.borderColor = 'var(--line-1)'; }}
                >⇄ Swap Original / Target</button>
              </div>
            </>
          )}

          {/* Mode: Find Target Size */}
          {mode === 'size' && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 40px 1fr', gap: 8, alignItems: 'start' }}>
              <div>
                <PanelHead label="Original Size" />
                <DimFields vals={sOrig} onChange={(ax, v) => setSOrig(p => ({ ...p, [ax]: v }))} />
              </div>
              <ArrowDivider />
              <div>
                <PanelHead label="Scale %" />
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input type="number" value={pct} min="0.001" step="any" placeholder="150"
                    onChange={e => setPct(e.target.value)}
                    style={{ ...inputStyle, fontSize: 18, padding: '11px 10px' }}
                    onFocus={onFocus} onBlur={onBlur}
                  />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 18, color: 'var(--fg-4)', flexShrink: 0 }}>%</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Result area */}
        <div style={{
          background: 'var(--bg-2)', border: `1px solid ${hasResult ? 'var(--brand-pink-line)' : 'var(--line-1)'}`,
          borderRadius: 'var(--radius-md)', padding: 24,
          minHeight: 110, textAlign: 'center',
          display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
          transition: 'border-color 300ms',
        }}>
          {!hasResult && (
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-4)', letterSpacing: '0.1em' }}>// enter dimensions above</span>
          )}

          {mode === 'scale' && scaleResult && (() => {
            const { sx, sy, sz, isUniform } = scaleResult;
            if (isUniform) {
              const cls = scaleCls(sx);
              return (
                <>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: 52, letterSpacing: '-0.03em', lineHeight: 1, color: scaleColor(cls), transition: 'color 300ms' }}>
                    {fmtPct(sx)}
                  </div>
                  <Pill tone={cls === 'up' ? 'easy' : cls === 'down' ? 'hard' : 'plain'}>{scaleLabel(sx)}</Pill>
                  <button
                    onClick={() => copyVal(fmtPct(sx))}
                    style={{
                      background: 'transparent', border: '1px solid var(--line-2)', color: 'var(--fg-4)',
                      fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase',
                      padding: '5px 14px', borderRadius: 5, cursor: 'pointer', transition: 'all 150ms', marginTop: 4,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.color = 'var(--brand-pink)'; e.currentTarget.style.borderColor = 'var(--brand-pink)'; }}
                    onMouseLeave={e => { e.currentTarget.style.color = 'var(--fg-4)'; e.currentTarget.style.borderColor = 'var(--line-2)'; }}
                  >{copied ? 'Copied!' : 'Copy Value'}</button>
                </>
              );
            }
            return (
              <>
                <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[['x', sx], ['y', sy], ['z', sz]].map(([ax, val]) => (
                    <div key={ax} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: AX[ax] }}>{ax.toUpperCase()} Axis</span>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '-0.02em', color: AX[ax] }}>{fmtPct(val)}</span>
                    </div>
                  ))}
                </div>
                <div style={{
                  background: 'rgba(245,201,113,0.10)', border: '1px solid rgba(245,201,113,0.3)',
                  borderRadius: 6, padding: '8px 14px',
                  fontFamily: 'var(--font-mono)', fontSize: 11, color: '#f5c971',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}>
                  <LucideIcon name="TriangleAlert" size={14} />
                  Non-uniform — set each axis separately in your slicer
                </div>
              </>
            );
          })()}

          {mode === 'size' && sizeResult && (() => {
            const { nx, ny, nz, pct: p } = sizeResult;
            const cls = scaleCls(p);
            return (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap', justifyContent: 'center' }}>
                  {[['x', nx], ['y', ny], ['z', nz]].map(([ax, val], i, arr) => (
                    <React.Fragment key={ax}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 9, letterSpacing: '0.15em', textTransform: 'uppercase', color: AX[ax] }}>{ax.toUpperCase()}</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 30, letterSpacing: '-0.02em', color: AX[ax] }}>
                          {fmtMm(val)}<span style={{ fontSize: 14, color: 'var(--fg-4)', fontFamily: 'var(--font-body)', fontWeight: 400 }}> mm</span>
                        </span>
                      </div>
                      {i < arr.length - 1 && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, color: 'var(--fg-4)' }}>×</span>}
                    </React.Fragment>
                  ))}
                </div>
                <Pill tone={cls === 'up' ? 'easy' : cls === 'down' ? 'hard' : 'plain'}>{scaleLabel(p)}</Pill>
              </>
            );
          })()}
        </div>

        <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', borderTop: '1px dashed var(--line-1)', paddingTop: 12, lineHeight: 1.6, marginTop: 14 }}>
          // dimensions in mm — values update live as you type.
        </div>
      </div>
    </div>
  );
}

/* -------------------- Filament Drying Guide -------------------- */

const DRYING_DATA = {
  PLA:   { color: '#4ade80',  tempC: '45–55°C',  tempF: '113–131°F', time: '4–6 hrs',  priority: 'Low',      priorityColor: '#4ade80',  hygroscopic: 'Low',        symptoms: ['Stringing', 'Popping/crackling sounds', 'Rough surface finish', 'Brittle prints'],                                      tips: ['PLA is less hygroscopic than most filaments but can still absorb moisture over time.', 'A food dehydrator set to ~50°C works perfectly — avoid exceeding 60°C or it may soften.', 'Store in an airtight container with silica gel desiccant after drying.', 'Dried PLA should be used within a few days if humidity is high.'],                                                                                           storage: 'Airtight bag/box + silica gel. Moderate urgency.' },
  PETG:  { color: '#60a5fa',  tempC: '65–70°C',  tempF: '149–158°F', time: '4–6 hrs',  priority: 'Medium',   priorityColor: '#f5c971',  hygroscopic: 'Medium',     symptoms: ['Stringing & oozing', 'Bubbling/foaming', 'Cloudy appearance', 'Poor layer adhesion', 'Crackling during print'],           tips: ['PETG is moderately hygroscopic and absorbs moisture faster than PLA in humid environments.', "Dry at 65–70°C. Some ovens can't go this low — a dedicated filament dryer is ideal.", 'Avoid exceeding 75°C as PETG can begin to soften and deform on the spool.', 'Wet PETG often shows heavy stringing even with dialled-in retraction settings.'],                  storage: 'Airtight sealed container. Desiccant essential in UK climates.' },
  ABS:   { color: '#f97316',  tempC: '70–80°C',  tempF: '158–176°F', time: '4–8 hrs',  priority: 'Medium',   priorityColor: '#f5c971',  hygroscopic: 'Medium',     symptoms: ['Warping worsens', 'Layer delamination', 'Rough texture', 'Popping sounds'],                                              tips: ['ABS absorbs moisture moderately but the symptoms can be severe during printing.', 'Dry at 70–80°C. Use an oven carefully — temperatures can fluctuate unexpectedly.', 'A dedicated filament dryer with accurate temp control is strongly recommended.', 'After drying, keep ABS in a sealed container — it re-absorbs moisture quickly.'],                          storage: 'Sealed container with desiccant. Re-absorbs moisture quickly once opened.' },
  ASA:   { color: '#a78bfa',  tempC: '70–80°C',  tempF: '158–176°F', time: '4–8 hrs',  priority: 'Medium',   priorityColor: '#f5c971',  hygroscopic: 'Medium',     symptoms: ['Increased stringing', 'Layer separation', 'Surface bubbling', 'Brittleness'],                                              tips: ['ASA behaves similarly to ABS when it comes to moisture — similar drying process applies.', 'Dry at 70–80°C for 4–8 hours. A dedicated filament dryer is preferred.', "ASA is UV-resistant and often used outdoors — ensure it's dry for best long-term results.", 'Store sealed between uses, especially if printing intermittently.'],                         storage: 'Sealed with desiccant. Treat same as ABS for storage.' },
  TPU:   { color: '#fb7185',  tempC: '50–60°C',  tempF: '122–140°F', time: '4–8 hrs',  priority: 'High',     priorityColor: '#f97316',  hygroscopic: 'High',       symptoms: ['Bubbling/foaming', 'Stringing', 'Loss of flexibility', 'Rough surface', 'Crackling'],                                    tips: ['TPU is highly hygroscopic and should be dried before almost every print session.', "Dry at 50–60°C — don't exceed 65°C as TPU can deform or fuse on the spool.", 'Even a few hours of exposure in a humid room can degrade print quality noticeably.', 'Consider printing directly from a sealed dry box with a PTFE tube feed.'],                               storage: 'Dry box printing recommended. Seal immediately after use.' },
  Nylon: { color: '#38bdf8',  tempC: '70–90°C',  tempF: '158–194°F', time: '8–12 hrs', priority: 'Critical', priorityColor: '#ef4444',  hygroscopic: 'Very High',  symptoms: ['Heavy bubbling/steaming', 'Very rough surface', 'Brittle prints', 'Poor strength', 'Constant crackling'],                  tips: ['Nylon is extremely hygroscopic — it can absorb enough moisture to ruin a print within hours.', "Dry thoroughly at 70–90°C for 8–12 hours before use. Don't rush this.", 'A dedicated filament dryer is almost mandatory for Nylon. Ovens are often inaccurate.', 'Print directly from the dryer if possible. Do not leave Nylon on the printer overnight.', 'Fresh, dry Nylon prints beautifully — moisture is the only real enemy.'], storage: 'Must be stored in a sealed dry box. Use desiccant and hygrometer inside.' },
  PC:    { color: '#c084fc',  tempC: '80–100°C', tempF: '176–212°F', time: '6–10 hrs', priority: 'Critical', priorityColor: '#ef4444',  hygroscopic: 'High',       symptoms: ['Bubbling & foaming', 'Cloudiness/haze', 'Poor layer bonding', 'Crackling sounds', 'Reduced strength'],                    tips: ['Polycarbonate is highly hygroscopic and requires a very high drying temperature.', 'Dry at 80–100°C for 6–10 hours. A standard food dehydrator may not reach this — use a proper filament dryer or lab oven.', 'Wet PC produces a noticeable haze in the final print, reducing its optical clarity.', 'Given the high print temps needed for PC, moisture causes more dramatic failures than with lower-temp materials.'],    storage: 'Sealed with aggressive desiccation. Hygrometer recommended in storage.' },
  PVA:   { color: '#34d399',  tempC: '45–55°C',  tempF: '113–131°F', time: '4–10 hrs', priority: 'Critical', priorityColor: '#ef4444',  hygroscopic: 'Extreme',    symptoms: ['Clogs and jams', 'Brittle/snapping filament', 'Poor support bonding', 'Stringing', 'Filament dissolves before use'],   tips: ['PVA is the most hygroscopic common filament — it can literally dissolve in high humidity.', "Dry at 45–55°C. Don't exceed 60°C as it can degrade rapidly.", 'Store PVA in an airtight container with heavy desiccant AT ALL TIMES — even between print sessions.', "If your PVA is snapping when you try to feed it, it's already significantly degraded from moisture.", 'Consider buying PVA in small quantities to ensure freshness.'],          storage: 'Sealed airtight at all times. Do not leave exposed. Replace desiccant frequently.' },
  HIPS:  { color: '#fbbf24',  tempC: '60–70°C',  tempF: '140–158°F', time: '4–6 hrs',  priority: 'Low',      priorityColor: '#4ade80',  hygroscopic: 'Low–Medium', symptoms: ['Stringing', 'Rough surface', 'Popping sounds', 'Poor adhesion to ABS'],                                                   tips: ['HIPS is relatively tolerant of humidity compared to other engineering filaments.', 'Dry at 60–70°C for 4–6 hours if you notice print quality issues.', 'HIPS is often used as a support material with ABS — ensure both are dry for best results.', 'Store in a sealed bag with silica gel when not in use.'],                                                              storage: 'Sealed bag with desiccant. Less urgent than engineering filaments.' },
};

const SYMPTOM_MAP = {
  'Crackling/popping during print':   ['PLA','PETG','ABS','ASA','TPU','Nylon','PC','HIPS'],
  'Heavy bubbling or foaming':        ['TPU','Nylon','PC','PVA'],
  'Excessive stringing':              ['PLA','PETG','TPU','HIPS','PVA'],
  'Rough or fuzzy surface':           ['PLA','PETG','ABS','ASA','Nylon','PC','HIPS'],
  'Brittle or snapping filament':     ['PLA','Nylon','PVA'],
  'Poor layer adhesion':              ['PETG','ABS','ASA','Nylon','PC','PVA'],
  'Cloudy or hazy appearance':        ['PC','PVA'],
  'Warping worse than usual':         ['ABS','ASA'],
  'Filament jamming/clogging':        ['PVA','Nylon'],
};

function FilamentDryingGuide() {
  const [mode, setMode] = React.useState('browse');
  const [selected, setSelected] = React.useState(null);
  const [selectedSymptoms, setSelectedSymptoms] = React.useState([]);

  const toggleSymptom = (s) =>
    setSelectedSymptoms(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const suspectedFilaments = selectedSymptoms.length === 0 ? [] :
    Object.keys(DRYING_DATA)
      .filter(f => selectedSymptoms.some(s => SYMPTOM_MAP[s]?.includes(f)))
      .sort((a, b) => {
        const scoreB = selectedSymptoms.filter(s => SYMPTOM_MAP[s]?.includes(b)).length;
        const scoreA = selectedSymptoms.filter(s => SYMPTOM_MAP[s]?.includes(a)).length;
        return scoreB - scoreA;
      });

  const detail = selected ? DRYING_DATA[selected] : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <ToolHeader name="Filament Drying Guide" icon="Droplets" tag="Reference" />

      {/* Mode toggle */}
      <div style={{ display: 'flex', gap: 8 }}>
        {[['browse', 'Browse by material'], ['symptoms', 'Symptom checker']].map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{
            padding: '7px 16px', borderRadius: 8, cursor: 'pointer',
            fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 600, letterSpacing: '0.05em',
            border: `1px solid ${mode === m ? 'var(--brand-pink)' : 'var(--line-1)'}`,
            background: mode === m ? 'var(--brand-pink)' : 'var(--bg-3)',
            color: mode === m ? '#0a0a0b' : 'var(--fg-3)',
            transition: 'all 150ms',
          }}>{label}</button>
        ))}
      </div>

      {/* BROWSE MODE */}
      {mode === 'browse' && (
        <div style={{ display: 'grid', gridTemplateColumns: detail ? '180px 1fr' : '1fr', gap: 12 }}>
          {/* Filament list */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: detail ? '1fr' : 'repeat(auto-fill, minmax(150px, 1fr))',
            gap: 6, alignContent: 'start',
          }}>
            {Object.keys(DRYING_DATA).map(name => {
              const f = DRYING_DATA[name];
              const isSelected = selected === name;
              return (
                <button key={name} onClick={() => setSelected(name)} style={{
                  textAlign: 'left', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '9px 12px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${isSelected ? f.color : 'var(--line-1)'}`,
                  background: isSelected ? `${f.color}18` : 'var(--bg-3)',
                  transition: 'all 150ms',
                }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 600, color: 'var(--fg-1)', flex: 1 }}>{name}</span>
                  {!detail && (
                    <span style={{
                      fontSize: 10, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap',
                      color: f.priorityColor, background: `${f.priorityColor}22`,
                      padding: '2px 7px', borderRadius: 999,
                    }}>{f.priority}</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
          {detail ? (
            <div style={{
              background: 'var(--bg-3)', border: `1px solid ${detail.color}44`,
              borderRadius: 10, padding: 20, display: 'flex', flexDirection: 'column', gap: 16,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: detail.color, flexShrink: 0 }} />
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 17, fontWeight: 700, color: 'var(--fg-1)' }}>{selected}</span>
                <span style={{
                  marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)',
                  color: detail.priorityColor, background: `${detail.priorityColor}22`,
                  padding: '3px 10px', borderRadius: 999,
                }}>{detail.priority} moisture risk</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                {[
                  { label: 'Dry Temp',     value: detail.tempC,       sub: detail.tempF },
                  { label: 'Dry Time',     value: detail.time,        sub: 'hours' },
                  { label: 'Hygroscopic',  value: detail.hygroscopic, sub: 'moisture absorption' },
                ].map(({ label, value, sub }) => (
                  <div key={label} style={{
                    background: 'var(--bg-2)', borderRadius: 8, padding: '12px 14px',
                    border: '1px solid var(--line-1)',
                  }}>
                    <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>{label}</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 700, color: detail.color }}>{value}</div>
                    <div style={{ fontSize: 10, color: 'var(--fg-4)', marginTop: 2 }}>{sub}</div>
                  </div>
                ))}
              </div>

              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Signs of wet filament</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {detail.symptoms.map(s => (
                    <span key={s} style={{
                      background: `${detail.color}18`, border: `1px solid ${detail.color}44`,
                      color: detail.color, borderRadius: 6, padding: '3px 9px', fontSize: 12,
                    }}>{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 8 }}>Drying tips</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {detail.tips.map((tip, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                      <div style={{
                        width: 18, height: 18, borderRadius: '50%', flexShrink: 0, marginTop: 2,
                        background: `${detail.color}22`, color: detail.color,
                        fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-mono)',
                      }}>{i + 1}</div>
                      <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>{tip}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-2)', border: '1px solid var(--line-1)',
                borderRadius: 8, padding: 12, display: 'flex', gap: 10, alignItems: 'flex-start',
              }}>
                <div style={{ color: 'var(--fg-3)', flexShrink: 0, marginTop: 1 }}>
                  <LucideIcon name="Package" size={15} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Storage advice</div>
                  <p style={{ margin: 0, fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.6 }}>{detail.storage}</p>
                </div>
              </div>
            </div>
          ) : (
            <div style={{
              border: '1px dashed var(--line-1)', borderRadius: 10, padding: 40,
              textAlign: 'center', color: 'var(--fg-4)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12,
            }}>
              <div style={{ opacity: 0.4 }}><LucideIcon name="Droplets" size={32} /></div>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, margin: 0 }}>// select a filament to see drying guide</p>
            </div>
          )}
        </div>
      )}

      {/* SYMPTOM CHECKER MODE */}
      {mode === 'symptoms' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--fg-3)' }}>
            Select all symptoms you're currently seeing during printing:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {Object.keys(SYMPTOM_MAP).map(s => {
              const active = selectedSymptoms.includes(s);
              return (
                <button key={s} onClick={() => toggleSymptom(s)} style={{
                  padding: '7px 13px', borderRadius: 8, cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--brand-pink)' : 'var(--line-1)'}`,
                  background: active ? 'var(--brand-pink-dim)' : 'var(--bg-3)',
                  color: active ? 'var(--brand-pink)' : 'var(--fg-3)',
                  fontFamily: 'var(--font-body)', fontSize: 13, transition: 'all 150ms',
                }}>{s}</button>
              );
            })}
          </div>

          {suspectedFilaments.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>
                Likely affected filaments — click to view drying guide
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {suspectedFilaments.map(name => {
                  const matchCount = selectedSymptoms.filter(s => SYMPTOM_MAP[s]?.includes(name)).length;
                  const f = DRYING_DATA[name];
                  return (
                    <button key={name} onClick={() => { setSelected(name); setMode('browse'); }}
                      style={{
                        textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
                        background: 'var(--bg-3)', border: '1px solid var(--line-1)',
                        borderRadius: 8, padding: '11px 14px', cursor: 'pointer',
                        transition: 'border-color 150ms',
                      }}
                      onMouseEnter={e => e.currentTarget.style.borderColor = f.color}
                      onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--line-1)'}
                    >
                      <div style={{ width: 9, height: 9, borderRadius: '50%', background: f.color, flexShrink: 0 }} />
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--fg-1)' }}>{name}</span>
                      <span style={{ fontSize: 12, color: 'var(--fg-3)' }}>{matchCount} matching symptom{matchCount > 1 ? 's' : ''}</span>
                      <span style={{ marginLeft: 'auto', fontSize: 11, fontFamily: 'var(--font-mono)', color: f.priorityColor }}>
                        {f.priority} risk · Dry {f.tempC} / {f.time}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {selectedSymptoms.length === 0 && (
            <div style={{
              border: '1px dashed var(--line-1)', borderRadius: 10, padding: 32,
              textAlign: 'center', color: 'var(--fg-4)',
            }}>
              <p style={{ fontFamily: 'var(--font-mono)', fontSize: 13, margin: 0 }}>// select symptoms above to identify suspected filament moisture issues</p>
            </div>
          )}
        </div>
      )}

      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)', borderTop: '1px dashed var(--line-1)', paddingTop: 12, lineHeight: 1.6 }}>
        // drying times and temperatures are guidelines — always check your filament manufacturer's datasheet.
      </div>
    </div>
  );
}

/* -------------------- WIP placeholder -------------------- */

function WipTool({ name, icon }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 420, gap: 20, textAlign: 'center' }}>
      <div style={{
        width: 56, height: 56, borderRadius: 'var(--radius-md)',
        background: 'var(--bg-3)', border: '1px solid var(--line-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--fg-4)',
      }}>
        <LucideIcon name={icon} size={26} />
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em', color: 'var(--fg-1)', marginBottom: 10 }}>
          {name}
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: '#f5c971',
          background: 'rgba(245,201,113,0.10)', border: '1px solid rgba(245,201,113,0.25)',
          padding: '6px 14px', borderRadius: 999,
        }}>
          <LucideIcon name="Construction" size={13} />
          Work in progress
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-4)', maxWidth: 300, lineHeight: 1.7 }}>
        // this tool is being built.<br />check back soon.
      </div>
    </div>
  );
}

/* -------------------- Shared tool UI primitives -------------------- */

function ToolHeader({ name, icon, tag }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <div style={{
        width: 36, height: 36, borderRadius: 8,
        background: 'var(--brand-pink)', color: '#0a0a0b',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <LucideIcon name={icon} size={18} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, letterSpacing: '-0.02em', color: 'var(--fg-1)', flex: 1 }}>
        {name}
      </div>
      <span style={{
        fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 600,
        textTransform: 'uppercase', letterSpacing: '0.08em',
        color: 'var(--brand-pink)',
        border: '1px solid var(--brand-pink-line)', padding: '3px 8px', borderRadius: 999,
        display: 'inline-flex', alignItems: 'center', gap: 6,
      }}>
        <span style={{ width: 6, height: 6, borderRadius: 999, background: 'var(--brand-pink)', animation: 'pulse 2s ease-in-out infinite' }} />
        {tag}
      </span>
      <style>{`@keyframes pulse { 0%, 100%{opacity:1} 50%{opacity:0.4} }`}</style>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      {children}
    </div>
  );
}

function NumInput({ value, onChange, min, max, suffix }) {
  return (
    <div style={{ position: 'relative' }}>
      <input type="number" value={value} min={min} max={max}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          width: '100%', background: 'var(--bg-3)', border: '1px solid var(--line-1)',
          color: 'var(--fg-1)', fontFamily: 'var(--font-mono)', fontSize: 14, fontWeight: 500,
          padding: '10px 28px 10px 12px', borderRadius: 6, outline: 'none',
        }}
        onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-pink)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--brand-pink-dim)'; }}
        onBlur={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; e.currentTarget.style.boxShadow = 'none'; }}
      />
      {suffix && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)' }}>{suffix}</span>}
    </div>
  );
}

function Slider({ value, onChange, min, max, step = 1 }) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ position: 'relative', height: 32 }}>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: '50%', transform: 'translateY(-50%)',
        height: 4, background: 'var(--bg-3)', borderRadius: 999, overflow: 'hidden',
      }}>
        <div style={{ width: `${pct}%`, height: '100%', background: 'var(--brand-pink)' }} />
      </div>
      <input type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{
          position: 'absolute', inset: 0, width: '100%', opacity: 0, cursor: 'pointer', margin: 0,
        }}
      />
      <div style={{
        position: 'absolute', left: `calc(${pct}% - 8px)`, top: '50%', transform: 'translateY(-50%)',
        width: 16, height: 16, borderRadius: 999, background: '#0a0a0b',
        border: '2px solid var(--brand-pink)', pointerEvents: 'none',
      }} />
    </div>
  );
}

function BigResult({ label, value, unit, accent }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 56, letterSpacing: '-0.03em', lineHeight: 1,
        color: accent ? 'var(--brand-pink)' : 'var(--fg-1)',
        display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
      }}>
        {value}
        {unit && <span style={{ fontSize: 24, color: 'var(--fg-2)', fontFamily: 'var(--font-display)' }}>{unit}</span>}
      </div>
    </div>
  );
}

function StatRow({ label, value, delta }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 14 }}>
      <span style={{ color: 'var(--fg-2)' }}>{label}</span>
      <span style={{ fontFamily: 'var(--font-mono)', color: 'var(--fg-1)', fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
        {value}
        {delta !== undefined && delta !== 0 && (
          <span style={{
            fontSize: 11, padding: '2px 6px', borderRadius: 4,
            background: delta > 0 ? 'rgba(247,164,162,0.14)' : 'rgba(126,214,165,0.14)',
            color: delta > 0 ? 'var(--brand-pink)' : '#7ed6a5',
          }}>
            {delta > 0 ? '+' : ''}{delta.toFixed(0)}%
          </span>
        )}
      </span>
    </div>
  );
}

window.ToolsSection = ToolsSection;
