// Tools: actual utilities for 3D printing. Filament calculator is the main one.

function ToolsSection() {
  const [openTool, setOpenTool] = React.useState('filament');

  const tools = [
    { id: 'filament',   name: 'Filament calculator', desc: 'Work out how much filament a print will eat before you start it.',       icon: 'Scale' },
    { id: 'time',       name: 'Print-time estimator', desc: 'Rough print time from volume, speed, and layer height.',                 icon: 'Clock' },
    { id: 'cost',       name: 'Cost per print',       desc: 'What the thing actually costs — filament, electricity, wear.',           icon: 'PoundSterling' },
    { id: 'scale',      name: 'Resize & scale',       desc: 'Scale a model and see how filament, time, and strength change with it.', icon: 'Maximize2' },
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
            {openTool === 'time' &&     <TimeEstimator />}
            {openTool === 'cost' &&     <CostCalculator />}
            {openTool === 'scale' &&    <ScaleTool />}
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

const MATERIALS = {
  PLA:   { density: 1.24, price: 22, color: '#f7a4a2' },
  PETG:  { density: 1.27, price: 26, color: '#7ed6a5' },
  ABS:   { density: 1.04, price: 28, color: '#f5c971' },
  ASA:   { density: 1.07, price: 34, color: '#c98bff' },
  TPU:   { density: 1.21, price: 38, color: '#8fb4ff' },
  Nylon: { density: 1.08, price: 48, color: '#ffb57a' },
};

function FilamentCalculator() {
  const [dim, setDim] = React.useState({ w: 80, h: 60, d: 40 });
  const [infill, setInfill] = React.useState(20);
  const [walls, setWalls] = React.useState(3);
  const [material, setMaterial] = React.useState('PLA');
  const [diameter, setDiameter] = React.useState(1.75);

  // rough model: shell takes ~12% of bbox for small parts; infill takes (1-shell)%
  // volume estimation in cm³
  const bboxVol = (dim.w * dim.h * dim.d) / 1000; // mm³ → cm³
  const shellFraction = Math.min(0.35, 0.05 + walls * 0.025);
  const effectiveFill = shellFraction + (1 - shellFraction) * (infill / 100);
  const modelVol = bboxVol * effectiveFill; // cm³
  const mat = MATERIALS[material];
  const weightG = modelVol * mat.density;
  const filamentArea = Math.PI * (diameter / 2) ** 2; // mm²
  const filamentLenM = (modelVol * 1000) / filamentArea / 1000; // cm³→mm³ / mm² = mm, /1000 = m
  const costGBP = (weightG / 1000) * mat.price;
  const spoolPct = (weightG / 1000) * 100; // % of a 1kg spool

  return (
    <div>
      <ToolHeader name="Filament calculator" icon="Scale" tag="Live" />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        {/* INPUTS */}
        <div className="flex flex-col gap-5">
          <Field label="Bounding box (mm)">
            <div className="grid grid-cols-3 gap-2">
              <NumInput suffix="W" value={dim.w} onChange={v => setDim({...dim, w: v})} min={1} max={500} />
              <NumInput suffix="H" value={dim.h} onChange={v => setDim({...dim, h: v})} min={1} max={500} />
              <NumInput suffix="D" value={dim.d} onChange={v => setDim({...dim, d: v})} min={1} max={500} />
            </div>
          </Field>

          <Field label={`Infill · ${infill}%`}>
            <Slider value={infill} onChange={setInfill} min={0} max={100} step={5} />
          </Field>

          <Field label={`Wall count · ${walls}`}>
            <Slider value={walls} onChange={setWalls} min={1} max={8} step={1} />
          </Field>

          <Field label="Material">
            <div className="grid grid-cols-3 gap-2">
              {Object.keys(MATERIALS).map(m => (
                <button key={m} onClick={() => setMaterial(m)} style={{
                  padding: '10px 0', borderRadius: 6,
                  fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)',
                  background: material === m ? 'var(--brand-pink)' : 'var(--bg-3)',
                  color: material === m ? '#0a0a0b' : 'var(--fg-1)',
                  border: `1px solid ${material === m ? 'var(--brand-pink)' : 'var(--line-1)'}`,
                  cursor: 'pointer',
                }}>{m}</button>
              ))}
            </div>
          </Field>

          <Field label="Filament diameter">
            <div className="flex gap-2">
              {[1.75, 2.85].map(d => (
                <button key={d} onClick={() => setDiameter(d)} style={{
                  padding: '8px 16px', borderRadius: 6, fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-mono)',
                  background: diameter === d ? 'var(--bg-4)' : 'var(--bg-3)',
                  color: 'var(--fg-1)', border: `1px solid ${diameter === d ? 'var(--brand-pink)' : 'var(--line-1)'}`,
                  cursor: 'pointer',
                }}>{d}mm</button>
              ))}
            </div>
          </Field>
        </div>

        {/* OUTPUTS */}
        <div style={{
          background: 'var(--bg-1)', border: '1px solid var(--line-1)',
          borderRadius: 'var(--radius-md)', padding: 20,
          display: 'flex', flexDirection: 'column', gap: 18,
        }}>
          <BigResult label="Filament needed" value={weightG.toFixed(1)} unit="g" accent />
          <div style={{ height: 1, background: 'var(--line-1)' }} />
          <StatRow label="Length" value={`${filamentLenM.toFixed(2)} m`} />
          <StatRow label="Model volume" value={`${modelVol.toFixed(1)} cm³`} />
          <StatRow label="Estimated cost" value={`£${costGBP.toFixed(2)}`} />
          <StatRow label="% of 1kg spool" value={`${spoolPct.toFixed(1)}%`} />

          {/* Spool visualization */}
          <div>
            <div style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>
              Spool usage
            </div>
            <div style={{ height: 10, borderRadius: 999, background: 'var(--bg-3)', overflow: 'hidden', border: '1px solid var(--line-1)' }}>
              <div style={{
                width: `${Math.min(100, spoolPct)}%`, height: '100%',
                background: mat.color,
                transition: 'width 200ms cubic-bezier(0.16,1,0.3,1)',
              }} />
            </div>
          </div>

          <div style={{
            fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-4)',
            borderTop: '1px dashed var(--line-1)', paddingTop: 12, lineHeight: 1.6,
          }}>
            // rough estimate — real values depend on slicer, <br />
            // support material, and infill pattern.
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
  const [scale, setScale] = React.useState(100);
  const base = { w: 60, h: 40, d: 30, weight: 45, time: 4 };
  const f = scale / 100;
  const scaled = {
    w: base.w * f, h: base.h * f, d: base.d * f,
    weight: base.weight * f ** 3,
    time: base.time * f ** 3,
    strength: f < 1 ? Math.pow(f, 2) * 100 : Math.min(400, 100 + (f - 1) * 120),
  };

  return (
    <div>
      <ToolHeader name="Resize & scale" icon="Maximize2" tag="Live" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div className="flex flex-col gap-5">
          <Field label={`Scale · ${scale}%`}>
            <Slider value={scale} onChange={setScale} min={25} max={300} step={5} />
          </Field>
          <div style={{ fontSize: 13, color: 'var(--fg-3)', lineHeight: 1.6 }}>
            Base model: 60×40×30mm, 45g, ~4h print.
            Scaling doesn't just change size — volume (and so weight + time) scales with the cube. Strength scales roughly with area.
          </div>
          <div style={{
            padding: 16, borderRadius: 8, background: 'var(--bg-1)', border: '1px solid var(--line-1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 180,
          }}>
            <div style={{
              width: scaled.w * 1.8, height: scaled.h * 1.8,
              border: '1.5px solid var(--brand-pink)', borderRadius: 6,
              background: 'var(--brand-pink-dim)',
              transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
              maxWidth: 280, maxHeight: 180,
            }} />
          </div>
        </div>
        <div style={{ background: 'var(--bg-1)', border: '1px solid var(--line-1)', borderRadius: 'var(--radius-md)', padding: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <BigResult label="New dimensions" value={`${scaled.w.toFixed(0)}×${scaled.h.toFixed(0)}×${scaled.d.toFixed(0)}`} unit="mm" accent />
          <div style={{ height: 1, background: 'var(--line-1)' }} />
          <StatRow label="New weight" value={`${scaled.weight.toFixed(1)} g`} delta={f**3 * 100 - 100} />
          <StatRow label="New print time" value={`~${scaled.time.toFixed(1)}h`} delta={f**3 * 100 - 100} />
          <StatRow label="Relative strength" value={`${scaled.strength.toFixed(0)}%`} />
        </div>
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
