// Files: searchable gallery of 7 models, grid or list layout.

// Real models hosted on Creality Cloud. Download buttons link out.
const FILES = [
  {
    name: 'Temperature Sensor Mount for Server Racks v2',
    file: 'temp_sensor_mount_v2.3mf',
    diff: 'easy',
    category: 'Workspace',
    nozzle: '0.4mm', layer: '0.2mm', infill: '15% grid', material: 'PLA', supports: 'No',
    blurb: 'Snap-in mount for a temp/humidity sensor in a standard 19" rack. Designed around the sensors I run in the homelab.',
    thumb: 'https://pic2-cdn.creality.com/comp/model/ddf0e010af6debb682f553edfcd67fe5.webp?x-oss-process=image/resize,w_700/ignore-error,1',
    url: 'https://www.crealitycloud.com/model-detail/temperature-sensor-mount-server-racks-v2?source=22&profileId=6942f1fb0d2930e2fbba1eb9',
  },
  {
    name: 'Power Button Mount with USB',
    file: 'power_button_usb_mount.3mf',
    diff: 'easy',
    category: 'Desk',
    nozzle: '0.4mm', layer: '0.2mm', infill: '20% grid', material: 'PLA', supports: 'No',
    blurb: 'Under-desk housing for a momentary power button and a USB charging port. Clean run, no dangling cables.',
    thumb: 'https://pic2-cdn.creality.com/comp/model/143b9909b0d63f2a4c8b0cf651230c5b.webp?x-oss-process=image/resize,w_700/ignore-error,1',
    url: 'https://www.crealitycloud.com/model-detail/power-button-mount-with-usb?source=22&profileId=6941bc21ef6b66edb7f18e8d',
  },
  {
    name: 'Modular Monitor Arm Cable Tidy',
    file: 'monitor_arm_cable_tidy.3mf',
    diff: 'easy',
    category: 'Desk',
    nozzle: '0.4mm', layer: '0.2mm', infill: '15% grid', material: 'PLA', supports: 'No',
    blurb: 'Print as many links as you need and clip them onto any monitor arm. Hides the cable run from base to head.',
    thumb: 'https://pic2-cdn.creality.com/comp/model/0adc5b3d88a068ce448fd3c7afae2d67.webp?x-oss-process=image/resize,w_700/ignore-error,1',
    url: 'https://www.crealitycloud.com/model-detail/modular-monitor-arm-cable-tidy?source=22&profileId=693c3b49637bce4854e1e20f',
  },
  {
    name: 'TRMNL Stand for E-Ink Dashboard',
    file: 'trmnl_eink_stand.3mf',
    diff: 'medium',
    category: 'Electronics',
    nozzle: '0.4mm', layer: '0.2mm', infill: '20% grid', material: 'PLA', supports: 'Yes',
    blurb: 'Desk stand for a TRMNL e-ink dashboard. Holds the panel at a sensible reading angle and tucks the cable behind.',
    thumb: 'https://pic2-cdn.creality.com/crealityCloud/upload/0726e3bd87249928c716d4670f30eeab.jpeg?x-oss-process=image/resize,w_700/format,webp/ignore-error,1',
    url: 'https://www.crealitycloud.com/model-detail/trmnl-e-ink-dashboard?source=22&profileId=6831f0dcaef686d178dfcde6',
  },
  {
    name: 'Addams Family Thing Pen Pot',
    file: 'thing_pen_pot.3mf',
    diff: 'medium',
    category: 'Decor',
    nozzle: '0.4mm', layer: '0.2mm', infill: '15% grid', material: 'PLA', supports: 'Yes',
    blurb: 'Wednesday’s Thing reimagined as a desk pen pot. A bit silly, surprisingly useful. Remix of a Printables original.',
    thumb: 'https://pic2-cdn.creality.com/crealityCloud/upload/0bfad5d4687b8b4922bb04bf94b44023.jpeg?x-oss-process=image/resize,w_700/format,webp/ignore-error,1',
    url: 'https://www.crealitycloud.com/model-detail/addams-family-thing-pen-pot?source=22&profileId=6831f16057cdba8ba6171eda',
  },
  {
    name: 'Classic Ford RS Wireframe Wall Art',
    file: 'ford_rs_wireframe.3mf',
    diff: 'easy',
    category: 'Decor',
    nozzle: '0.4mm', layer: '0.2mm', infill: '10% grid', material: 'PLA', supports: 'No',
    blurb: 'Single-line wireframe of a classic Ford RS, designed to print flat and hang on a wall. Looks great in a contrasting colour.',
    thumb: 'https://pic2-cdn.creality.com/comp/model/58b94665ecccf173e6daf220ba8c2df1.webp?x-oss-process=image/resize,w_700/ignore-error,1',
    url: 'https://www.crealitycloud.com/model-detail/classic-ford-rs-wireframe-wall-art?source=22&profileId=69332fd41d09900e7ddd9fea',
  },
];

function FilesSection({ layout = 'grid' }) {
  const [query, setQuery] = React.useState('');
  const [diffFilter, setDiffFilter] = React.useState('all');
  const [view, setView] = React.useState(layout); // grid | list

  React.useEffect(() => { setView(layout); }, [layout]);

  const filtered = FILES.filter(f => {
    const matchQ = !query || (f.name + ' ' + f.material + ' ' + f.diff + ' ' + f.category + ' ' + f.blurb).toLowerCase().includes(query.toLowerCase());
    const matchD = diffFilter === 'all' || f.diff === diffFilter;
    return matchQ && matchD;
  });

  const difficulties = ['all', 'easy', 'medium', 'hard', 'expert'];

  return (
    <section id="files-section" className="mx-auto max-w-[1200px] px-6 lg:px-12 py-24" style={{ borderTop: '1px solid var(--line-1)' }}>
      <SectionHead
        eyebrow="Files"
        title="Models you can download."
        subtitle={<>All free, all tested, all printed on the gear in the About section. Files are hosted on <a href="https://www.crealitycloud.com/user/5670334343" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-pink)' }}>Creality Cloud</a>.</>}
        action={
          <div className="hidden md:flex items-center gap-2" style={{ background: 'var(--bg-2)', border: '1px solid var(--line-1)', borderRadius: 8, padding: 3 }}>
            <ViewToggleButton icon="LayoutGrid" label="Grid" active={view === 'grid'} onClick={() => setView('grid')} />
            <ViewToggleButton icon="Rows3" label="List"     active={view === 'list'} onClick={() => setView('list')} />
          </div>
        }
      />

      <div className="flex flex-col sm:flex-row gap-3 mb-8">
        <div style={{ position: 'relative', flex: 1 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--fg-3)', display: 'inline-flex' }}>
            <LucideIcon name="Search" size={16} />
          </span>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search files by name, difficulty, or material…"
            style={{
              width: '100%', background: 'var(--bg-2)', border: '1px solid var(--line-1)',
              color: 'var(--fg-1)', fontFamily: 'var(--font-body)', fontSize: 14,
              padding: '12px 14px 12px 40px', borderRadius: 6, outline: 'none',
            }}
            onFocus={e => { e.currentTarget.style.borderColor = 'var(--brand-pink)'; e.currentTarget.style.boxShadow = '0 0 0 4px var(--brand-pink-dim)'; }}
            onBlur={e => { e.currentTarget.style.borderColor = 'var(--line-1)'; e.currentTarget.style.boxShadow = 'none'; }}
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {difficulties.map(d => (
            <button
              key={d}
              onClick={() => setDiffFilter(d)}
              style={{
                padding: '8px 14px', borderRadius: 999, fontSize: 13, fontWeight: 600,
                background: diffFilter === d ? 'var(--brand-pink)' : 'var(--bg-2)',
                color: diffFilter === d ? '#0a0a0b' : 'var(--fg-2)',
                border: `1px solid ${diffFilter === d ? 'var(--brand-pink)' : 'var(--line-1)'}`,
                cursor: 'pointer', textTransform: 'capitalize',
                transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
              }}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--fg-3)', fontSize: 15 }}>
          No files matching "{query}". Try clearing the filter.
        </div>
      ) : view === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((f, i) => <FileCard key={i} {...f} />)}
        </div>
      ) : (
        <div style={{ border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', overflow: 'hidden', background: 'var(--bg-2)' }}>
          {filtered.map((f, i) => <FileRow key={i} {...f} last={i === filtered.length - 1} />)}
        </div>
      )}
    </section>
  );
}

function ViewToggleButton({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} style={{
      padding: '6px 12px', borderRadius: 6, fontSize: 13, fontWeight: 600,
      background: active ? 'var(--bg-3)' : 'transparent',
      color: active ? 'var(--fg-1)' : 'var(--fg-3)',
      border: `1px solid ${active ? 'var(--line-1)' : 'transparent'}`,
      display: 'inline-flex', alignItems: 'center', gap: 6, cursor: 'pointer',
    }}>
      <LucideIcon name={icon} size={14} />
      {label}
    </button>
  );
}

function FileCard({ name, file, diff, category, nozzle, layer, infill, material, supports, blurb, thumb, url }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--bg-3)' : 'var(--bg-2)',
        border: `1px solid ${hover ? 'var(--brand-pink-line)' : 'var(--line-1)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 16,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
        display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{
        aspectRatio: '4 / 3', borderRadius: 8,
        background: thumb ? '#0a0a0b' : 'linear-gradient(135deg, #1a1b1f 0%, #222327 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--fg-4)', fontSize: 12, fontFamily: 'var(--font-mono)',
        marginBottom: 14, position: 'relative', overflow: 'hidden',
      }}>
        {thumb ? (
          <img src={thumb} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <LucideIcon name="Box" size={48} style={{ color: 'var(--fg-4)' }} />
        )}
        <span style={{ position: 'absolute', top: 10, right: 10, display: 'flex', gap: 6 }}>
          <Pill tone={diff}>{diff[0].toUpperCase()+diff.slice(1)}</Pill>
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 4 }}>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: 16, fontWeight: 600, color: 'var(--fg-1)', lineHeight: 1.3 }}>
          {name}
        </div>
      </div>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {category} · {file}
      </div>
      <div style={{ fontSize: 13, color: 'var(--fg-2)', lineHeight: 1.55, marginBottom: 12 }}>
        {blurb}
      </div>

      <div style={{ border: '1px solid var(--line-1)', borderRadius: 8, padding: 10, marginBottom: 14, background: 'rgba(0,0,0,0.2)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', rowGap: 4, fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-2)' }}>
          <span><span style={{ color: 'var(--fg-3)' }}>Nozzle:</span> {nozzle}</span>
          <span><span style={{ color: 'var(--fg-3)' }}>Layer:</span> {layer}</span>
          <span><span style={{ color: 'var(--fg-3)' }}>Infill:</span> {infill}</span>
          <span><span style={{ color: 'var(--fg-3)' }}>Material:</span> {material}</span>
          <span style={{ gridColumn: '1 / -1' }}><span style={{ color: 'var(--fg-3)' }}>Supports:</span> {supports}</span>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, marginTop: 'auto' }}>
        <span style={{ fontSize: 11, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          Creality Cloud
        </span>
        <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
          <Button size="sm" icon="Download">Download</Button>
        </a>
      </div>
    </div>
  );
}

function FileRow({ name, file, diff, category, nozzle, layer, infill, material, supports, thumb, url, last }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 20, padding: '18px 20px',
        borderBottom: last ? 'none' : '1px solid var(--line-1)',
        background: hover ? 'var(--bg-3)' : 'transparent',
        transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{
        width: 64, height: 64, borderRadius: 8, flexShrink: 0,
        background: thumb ? '#0a0a0b' : 'linear-gradient(135deg, #1a1b1f 0%, #222327 100%)',
        border: '1px solid var(--line-1)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--fg-3)', overflow: 'hidden',
      }}>
        {thumb ? (
          <img src={thumb} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <LucideIcon name="Box" size={24} />
        )}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, fontWeight: 600, color: 'var(--fg-1)' }}>{name}</span>
          <Pill tone={diff}>{diff[0].toUpperCase()+diff.slice(1)}</Pill>
        </div>
        <div style={{ fontSize: 13, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>
          {category} · {material} · {nozzle} nozzle · {layer} layer · {infill} · {supports === 'Yes' ? 'supports' : 'no supports'}
        </div>
      </div>
      <div className="hidden lg:block" style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)', minWidth: 130, textAlign: 'right', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {file}
      </div>
      <a href={url} target="_blank" rel="noreferrer" style={{ textDecoration: 'none' }}>
        <Button size="sm" icon="Download">Download</Button>
      </a>
    </div>
  );
}

window.FilesSection = FilesSection;
