// Landing: Hero with variant-aware showpiece + Featured Prints carousel.

function HeroSection({ heroVariant = 'wireframe', headline = 'default' }) {
  const headlines = {
    default: (
      <>
        Things I print.<br />
        Tools I made.<br />
        <span style={{ color: 'var(--brand-pink)' }}>Files you can steal.</span>
      </>
    ),
    direct: (
      <>
        3D printing,<br />
        <span style={{ color: 'var(--brand-pink)' }}>done properly.</span>
      </>
    ),
    personal: (
      <>
        Hi, I'm Chris.<br />
        I make <span style={{ color: 'var(--brand-pink)' }}>tools</span><br />
        and <span style={{ color: 'var(--brand-pink)' }}>design files</span>.
      </>
    ),
  };

  return (
    <section className="mx-auto max-w-[1200px] px-6 lg:px-12 pt-16 lg:pt-24 pb-16 lg:pb-24 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-center">
      <div className="lg:col-span-7">
        <div style={{ color: 'var(--brand-pink)', fontSize: 12, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: 999, background: 'var(--brand-pink)' }} />
          CtrlAlt.co.uk · hobbyist print lab
        </div>
        <h1
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(44px, 7vw, 84px)',
            lineHeight: 1.02,
            letterSpacing: '-0.03em',
            color: 'var(--fg-1)',
            margin: 0,
          }}
        >
          {headlines[headline] || headlines.default}
        </h1>
        <p style={{ color: 'var(--fg-2)', marginTop: 28, fontSize: 18, lineHeight: 1.65, maxWidth: 540 }}>
          I make tools and design files for people who print their own stuff. Free downloads, no sign-up, no ads.
        </p>
        <div className="flex flex-wrap gap-3 mt-8">
          <Button icon="Download" onClick={() => document.getElementById('files-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Browse files
          </Button>
          <Button variant="secondary" icon="Calculator" onClick={() => document.getElementById('tools-section')?.scrollIntoView({ behavior: 'smooth' })}>
            Open a tool
          </Button>
        </div>

        {/* Quick stats */}
        <div style={{ marginTop: 44, display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0,1fr))', gap: 20, maxWidth: 460 }}>
          <QuickStat n="6" label="free files" />
          <QuickStat n="2" label="printers running" />
          <QuickStat n="100%" label="tested live" />
        </div>
      </div>

      <div className="lg:col-span-5">
        {heroVariant === 'wireframe' && <ModelPlaceholder />}
        {heroVariant === 'stack' && <PrinterStack />}
        {heroVariant === 'marquee' && <PrintMarquee />}
      </div>
    </section>
  );
}

function QuickStat({ n, label }) {
  return (
    <div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 32, letterSpacing: '-0.02em', color: 'var(--fg-1)', lineHeight: 1 }}>{n}</div>
      <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: 'var(--fg-3)', marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.08em' }}>{label}</div>
    </div>
  );
}

function ModelPlaceholder() {
  const mountRef = React.useRef(null);
  const [status, setStatus] = React.useState('loading');

  React.useEffect(() => {
    let cancelled = false;
    let renderer, scene, camera, controls, model, raf, ro;

    const init = () => {
      if (cancelled) return;
      const THREE = window.THREE;
      const OrbitControls = window.OrbitControls;
      const ThreeMFLoader = window.ThreeMFLoader;
      if (!THREE || !OrbitControls || !ThreeMFLoader) {
        // Three not ready yet — wait for it.
        const onReady = () => { window.removeEventListener('three-ready', onReady); init(); };
        window.addEventListener('three-ready', onReady);
        return;
      }

      const container = mountRef.current;
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(w, h, false);
      renderer.domElement.style.display = 'block';
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      container.appendChild(renderer.domElement);

      scene = new THREE.Scene();
      camera = new THREE.PerspectiveCamera(35, w / h, 0.1, 5000);
      camera.position.set(180, 140, 220);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.08;
      controls.enablePan = false;
      controls.enableZoom = false;
      controls.autoRotate = true;
      controls.autoRotateSpeed = 0.6;

      // soft fill so faceted edges read well
      scene.add(new THREE.AmbientLight(0xffffff, 0.6));
      const key = new THREE.DirectionalLight(0xffffff, 0.4);
      key.position.set(1, 1, 1);
      scene.add(key);

      const loader = new ThreeMFLoader();
      loader.load(
        'site/models/TRMNL_Housing.3mf',
        (object) => {
          if (cancelled) return;
          model = object;

          // Replace materials with wireframe — pink edges + faint pink fill.
          const lineMat = new THREE.LineBasicMaterial({ color: 0xf7a4a2, transparent: true, opacity: 0.95 });
          const fillMat = new THREE.MeshBasicMaterial({
            color: 0x1a1b1f, transparent: true, opacity: 0.6,
            polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1,
          });

          const meshes = [];
          object.traverse(child => {
            if (child.isMesh) meshes.push(child);
          });
          meshes.forEach(mesh => {
            mesh.material = fillMat;
            const edges = new THREE.EdgesGeometry(mesh.geometry, 18);
            const lines = new THREE.LineSegments(edges, lineMat);
            mesh.add(lines);
          });

          // Center & size to fit the canvas
          const box = new THREE.Box3().setFromObject(object);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          object.position.sub(center);
          // 3MF often comes in with Z up — rotate to Y up so it sits naturally
          object.rotation.x = -Math.PI / 2;

          const maxDim = Math.max(size.x, size.y, size.z);
          const dist = maxDim * 2.2;
          camera.position.set(dist * 0.7, dist * 0.55, dist * 0.85);
          camera.near = maxDim * 0.05;
          camera.far  = maxDim * 20;
          camera.updateProjectionMatrix();
          controls.target.set(0, 0, 0);
          controls.update();

          scene.add(object);
          if (!cancelled) setStatus('ready');
        },
        undefined,
        (err) => {
          console.warn('3MF load failed', err);
          if (!cancelled) setStatus('error');
        }
      );

      // Resize observer
      ro = new ResizeObserver(() => {
        if (!container) return;
        const W = container.clientWidth, H = container.clientHeight;
        renderer.setSize(W, H, false);
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
      });
      ro.observe(container);

      const tick = () => {
        controls.update();
        renderer.render(scene, camera);
        raf = requestAnimationFrame(tick);
      };
      tick();

      // Pause auto-rotate while user is dragging
      const onDown = () => { controls.autoRotate = false; };
      const onUp   = () => { controls.autoRotate = true; };
      renderer.domElement.addEventListener('pointerdown', onDown);
      window.addEventListener('pointerup', onUp);
      renderer.domElement._cleanup = () => {
        renderer.domElement.removeEventListener('pointerdown', onDown);
        window.removeEventListener('pointerup', onUp);
      };
    };

    init();

    return () => {
      cancelled = true;
      if (raf) cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      if (renderer) {
        if (renderer.domElement._cleanup) renderer.domElement._cleanup();
        renderer.dispose();
        if (renderer.domElement.parentNode) renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      style={{
        position: 'relative',
        aspectRatio: '1 / 1',
        borderRadius: 'var(--radius-xl)',
        background: 'radial-gradient(circle at 50% 55%, rgba(247,164,162,0.10), transparent 55%), var(--bg-1)',
        border: '1px solid var(--line-1)',
        overflow: 'hidden',
        cursor: 'grab',
      }}
      onMouseDown={e => { e.currentTarget.style.cursor = 'grabbing'; }}
      onMouseUp={e   => { e.currentTarget.style.cursor = 'grab'; }}
      onMouseLeave={e=> { e.currentTarget.style.cursor = 'grab'; }}
    >
      {/* subtle grid behind the canvas */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--line-1) 1px, transparent 1px), linear-gradient(90deg, var(--line-1) 1px, transparent 1px)',
        backgroundSize: '40px 40px',
        opacity: 0.25,
        pointerEvents: 'none',
      }} />

      {/* Three canvas mount */}
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {/* Loading overlay */}
      {status !== 'ready' && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--fg-3)',
          pointerEvents: 'none',
        }}>
          {status === 'loading' ? 'loading model…' : 'failed to load model'}
        </div>
      )}

      {/* HUD */}
      <div style={{
        position: 'absolute', top: 16, left: 16,
        display: 'flex', alignItems: 'center', gap: 8,
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        pointerEvents: 'none',
      }}>
        <span style={{ width: 8, height: 8, borderRadius: 999, background: 'var(--brand-pink)', boxShadow: '0 0 12px var(--brand-pink)' }} />
        wireframe view
      </div>
      <div style={{
        position: 'absolute', top: 16, right: 16,
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        pointerEvents: 'none', textAlign: 'right',
      }}>
        drag to rotate
      </div>
      <div style={{
        position: 'absolute', bottom: 16, left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
        pointerEvents: 'none',
      }}>
        <span>TRMNL_Housing.3mf</span>
        <span>[ live · 3MF ]</span>
      </div>
    </div>
  );
}


// Variant 2: stacked "build plate" illustration
function PrinterStack() {
  return (
    <div style={{
      position: 'relative', aspectRatio: '1 / 1', borderRadius: 'var(--radius-xl)',
      background: 'var(--bg-1)', border: '1px solid var(--line-1)',
      overflow: 'hidden', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', padding: 40,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'linear-gradient(var(--line-1) 1px, transparent 1px)',
        backgroundSize: '100% 24px',
        opacity: 0.35,
      }} />
      {/* build plate */}
      <div style={{
        position: 'absolute', bottom: '20%', left: '15%', right: '15%',
        height: 8, background: 'var(--brand-pink)', borderRadius: 2, boxShadow: '0 0 30px var(--brand-pink-dim)',
      }} />
      {/* stacked layers */}
      <div style={{ position: 'relative', display: 'flex', flexDirection: 'column-reverse', gap: 2, alignItems: 'center' }}>
        {Array.from({ length: 22 }).map((_, i) => {
          const w = 60 + Math.abs(Math.sin(i * 0.4)) * 90 + (i < 4 ? 40 : 0);
          return (
            <div key={i} style={{
              width: w, height: 6,
              background: i < 2 ? 'var(--brand-pink)' : 'var(--fg-2)',
              opacity: i < 2 ? 0.95 : 0.35 - i * 0.01,
              borderRadius: 1,
              animation: `layerBuild 10s ease-out ${i * 0.12}s infinite`,
            }} />
          );
        })}
      </div>
      <div style={{
        position: 'absolute', top: 16, left: 16, right: 16,
        display: 'flex', justifyContent: 'space-between',
        fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--fg-3)',
      }}>
        <span>layer_view.gcode</span>
        <span>Z: 4.40mm · 22%</span>
      </div>
      <style>{`
        @keyframes layerBuild {
          0%, 100% { opacity: 0; transform: translateY(4px); }
          10%, 90% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// Variant 3: scrolling print marquee
function PrintMarquee() {
  const items = ['dragon_v3', 'cable_clip', 'gridfinity_2x1', 'desk_organizer', 'lens_cap_55mm', 'planter_hex'];
  return (
    <div style={{
      position: 'relative', aspectRatio: '1 / 1', borderRadius: 'var(--radius-xl)',
      background: 'var(--bg-1)', border: '1px solid var(--line-1)', overflow: 'hidden',
      padding: 18, display: 'flex', flexDirection: 'column', gap: 12,
    }}>
      {[0, 1, 2].map(row => (
        <div key={row} style={{ display: 'flex', gap: 12, flex: 1,
          animation: `marquee${row % 2 === 0 ? 'L' : 'R'} ${20 + row * 4}s linear infinite`,
          width: 'max-content',
        }}>
          {[...items, ...items].map((n, i) => (
            <div key={i} style={{
              width: 140, aspectRatio: '4/3', flexShrink: 0,
              borderRadius: 8, border: '1px solid var(--line-1)',
              background: 'linear-gradient(135deg, #1a1b1f, #222327)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-4)',
            }}>{n}.stl</div>
          ))}
        </div>
      ))}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(90deg, var(--bg-1), transparent 10%, transparent 90%, var(--bg-1))', pointerEvents: 'none' }} />
      <style>{`
        @keyframes marqueeL { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        @keyframes marqueeR { from{transform:translateX(-50%)} to{transform:translateX(0)} }
      `}</style>
    </div>
  );
}

const FEATURED = [
  { name: 'Articulated dragon v3', diff: 'medium', time: '14h', material: 'PLA' },
  { name: 'Low-poly fox bust',     diff: 'easy',   time: '6h',  material: 'PLA' },
  { name: 'Desk cable organizer',  diff: 'easy',   time: '3h',  material: 'PETG' },
  { name: 'Planetary gearbox kit', diff: 'expert', time: '22h', material: 'PETG' },
  { name: 'Samoyed keycap',        diff: 'hard',   time: '2h',  material: 'Resin' },
];

function FeaturedCarousel() {
  const scrollerRef = React.useRef(null);
  const scrollBy = (dx) => scrollerRef.current?.scrollBy({ left: dx, behavior: 'smooth' });

  return (
    <section className="mx-auto max-w-[1200px] px-6 lg:px-12 pb-24">
      <SectionHead
        eyebrow="Featured prints"
        title="Stuff that actually worked."
        subtitle="A rolling list of prints I'm most pleased with this month. Every one has a file further down."
        action={
          <div className="hidden md:flex gap-2">
            <button onClick={() => scrollBy(-360)} className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--bg-2)', border: '1px solid var(--line-1)', color: 'var(--fg-2)' }}>
              <LucideIcon name="ChevronLeft" size={18} />
            </button>
            <button onClick={() => scrollBy(360)} className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: 'var(--bg-2)', border: '1px solid var(--line-1)', color: 'var(--fg-2)' }}>
              <LucideIcon name="ChevronRight" size={18} />
            </button>
          </div>
        }
      />
      <div
        ref={scrollerRef}
        className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 -mx-6 px-6 lg:-mx-12 lg:px-12"
        style={{ scrollbarWidth: 'none' }}
      >
        <style>{`.no-sb::-webkit-scrollbar{display:none}`}</style>
        {FEATURED.map((p, i) => <FeaturedCard key={i} {...p} />)}
      </div>
    </section>
  );
}

function FeaturedCard({ name, diff, time, material }) {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      className="snap-start shrink-0 w-[320px]"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        background: hover ? 'var(--bg-3)' : 'var(--bg-2)',
        border: `1px solid ${hover ? 'var(--brand-pink-line)' : 'var(--line-1)'}`,
        borderRadius: 'var(--radius-md)',
        padding: 14,
        transform: hover ? 'translateY(-2px)' : 'none',
        transition: 'all 200ms cubic-bezier(0.16,1,0.3,1)',
      }}
    >
      <div style={{
        aspectRatio: '4 / 3', borderRadius: 8,
        background: 'linear-gradient(135deg, #1a1b1f 0%, #222327 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'var(--fg-4)', fontSize: 12, fontFamily: 'var(--font-mono)',
        marginBottom: 12,
      }}>
        [ {name.toLowerCase().replace(/[^a-z0-9]+/g,'_')}.jpg ]
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
        <Pill tone={diff}>{diff[0].toUpperCase()+diff.slice(1)}</Pill>
        <Pill tone="plain" mono>{material}</Pill>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fg-1)', marginBottom: 4 }}>{name}</div>
      <div style={{ fontSize: 13, color: 'var(--fg-3)', fontFamily: 'var(--font-mono)' }}>~{time} print time</div>
    </div>
  );
}

Object.assign(window, { HeroSection, FeaturedCarousel });
