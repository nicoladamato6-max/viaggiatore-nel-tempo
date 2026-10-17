import { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, useInView, type Variants } from 'framer-motion';
import { AuthModal } from '../components/AuthModal';
import './LandingPage.css';

// ── Stelle animate via canvas ─────────────────────────────────────────────────
function StarCanvas() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d')!;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    type Star = { x: number; y: number; r: number; speed: number; opacity: number; delta: number };
    const stars: Star[] = Array.from({ length: 200 }, () => ({
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * window.innerHeight,
      r:       Math.random() * 1.4 + 0.3,
      speed:   Math.random() * 0.15 + 0.05,
      opacity: Math.random(),
      delta:   (Math.random() - 0.5) * 0.008,
    }));

    let raf: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const s of stars) {
        s.opacity = Math.max(0.1, Math.min(1, s.opacity + s.delta));
        if (s.opacity <= 0.1 || s.opacity >= 1) s.delta *= -1;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(180, 220, 255, ${s.opacity})`;
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); };
  }, []);

  return <canvas ref={ref} className="lp-stars" />;
}

// ── Animazioni Framer Motion ──────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' as const } },
};
const stagger: Variants = { show: { transition: { staggerChildren: 0.15 } } };

function FadeSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref   = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.div
      ref={ref}
      variants={stagger}
      initial="hidden"
      animate={inView ? 'show' : 'hidden'}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Feature card ──────────────────────────────────────────────────────────────
function FeatureCard({ icon, title, desc }: { icon: string; title: string; desc: string }) {
  return (
    <motion.div variants={fadeUp} className="lp-feature-card">
      <div className="lp-feature-icon">{icon}</div>
      <h3 className="lp-feature-title">{title}</h3>
      <p className="lp-feature-desc">{desc}</p>
    </motion.div>
  );
}

// ── Step ──────────────────────────────────────────────────────────────────────
function Step({ n, title, desc }: { n: number; title: string; desc: string }) {
  return (
    <motion.div variants={fadeUp} className="lp-step">
      <div className="lp-step-n">{String(n).padStart(2, '0')}</div>
      <div>
        <div className="lp-step-title">{title}</div>
        <div className="lp-step-desc">{desc}</div>
      </div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export function LandingPage() {
  const navigate  = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [authOpen, setAuthOpen] = useState(searchParams.get('login') === 'true');
  const [tick, setTick] = useState(0);

  // Sblocca scroll per la landing page (index.css ha height:100% che blocca)
  useEffect(() => {
    const html = document.documentElement;
    const body = document.body;
    const prev = { htmlH: html.style.height, bodyH: body.style.height, bodyOv: body.style.overflowY };
    html.style.height = 'auto';
    body.style.height = 'auto';
    body.style.overflowY = 'auto';
    return () => {
      html.style.height = prev.htmlH;
      body.style.height = prev.bodyH;
      body.style.overflowY = prev.bodyOv;
    };
  }, []);

  function openAuth() {
    setSearchParams({ login: 'true' });
    setAuthOpen(true);
  }
  function closeAuth() {
    setSearchParams({});
    setAuthOpen(false);
  }

  // Titolo animato lettera per lettera
  const words = ['Esplora', 'la', 'Storia', 'del', 'Mondo'];
  useEffect(() => {
    const t = setInterval(() => setTick(v => v + 1), 80);
    return () => clearInterval(t);
  }, []);
  const charCount = Math.min(tick, words.join(' ').length);
  const heroTitle = words.join(' ').slice(0, charCount);

  return (
    <div className="lp-root">
      <StarCanvas />

      {/* ── Navbar ── */}
      <nav className="lp-nav">
        <div className="lp-nav-logo">
          <span className="lp-nav-dot">◉</span> Viaggiatore nel Tempo
        </div>
        <div className="lp-nav-links">
          <a href="#features" className="lp-nav-link" onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Feature</a>
          <a href="#how"      className="lp-nav-link" onClick={e => { e.preventDefault(); document.getElementById('how')?.scrollIntoView({ behavior: 'smooth' }); }}>Come funziona</a>
          <button className="lp-nav-btn" onClick={openAuth}>
            Accedi →
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="lp-hero">
        <motion.div
          className="lp-hero-content"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <motion.div
            className="lp-hero-badge"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            ✦ 8.700+ eventi storici geocodificati
          </motion.div>

          <h1 className="lp-hero-title">
            {heroTitle}
            <span className="lp-cursor">|</span>
          </h1>

          <motion.p
            className="lp-hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.2, duration: 0.8 }}
          >
            Un globo interattivo che porta battaglie, scoperte scientifiche e civiltà antiche
            direttamente sotto le tue dita. Dal Big Bang a oggi.
          </motion.p>

          <motion.div
            className="lp-hero-cta"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.6, duration: 0.7 }}
          >
            <button className="lp-btn-primary" onClick={openAuth}>
              ⚡ Inizia il viaggio
            </button>
            <a href="#features" className="lp-btn-ghost" onClick={e => { e.preventDefault(); document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }); }}>Scopri di più ↓</a>
          </motion.div>
        </motion.div>

        {/* Globo decorativo */}
        <div className="lp-hero-globe">
          <div className="lp-globe-ring lp-globe-ring--1" />
          <div className="lp-globe-ring lp-globe-ring--2" />
          <div className="lp-globe-ring lp-globe-ring--3" />
          <div className="lp-globe-core">🌍</div>
        </div>

        <div className="lp-hero-scroll">
          <span>scorri</span>
          <div className="lp-scroll-line" />
        </div>
      </section>

      {/* ── Numeri ── */}
      <FadeSection className="lp-stats">
        {[
          { n: '8.700+', label: 'eventi storici' },
          { n: '6',      label: 'categorie tematiche' },
          { n: '4.5 Ga', label: 'di storia coperta' },
          { n: '100%',   label: 'gratuito' },
        ].map(s => (
          <motion.div key={s.label} variants={fadeUp} className="lp-stat">
            <div className="lp-stat-n">{s.n}</div>
            <div className="lp-stat-l">{s.label}</div>
          </motion.div>
        ))}
      </FadeSection>

      {/* ── Feature ── */}
      <section id="features" className="lp-section">
        <FadeSection>
          <motion.div variants={fadeUp} className="lp-section-header">
            <div className="lp-section-tag">FUNZIONALITÀ</div>
            <h2 className="lp-section-title">Tutto quello che ti serve per<br />esplorare la storia</h2>
          </motion.div>

          {/* Card hero: Macchina del Tempo */}
          <motion.div variants={fadeUp} className="lp-feature-card lp-feature-card--hero">
            <div className="lp-feature-card-hero-inner">
              <div className="lp-feature-hero-left">
                <div className="lp-feature-icon lp-feature-icon--big">⚡</div>
                <h3 className="lp-feature-title lp-feature-title--big">Macchina del Tempo</h3>
                <p className="lp-feature-desc">
                  Scegli un'epoca e viaggia: la Macchina del Tempo ti porta direttamente tra gli eventi
                  più significativi di quel periodo, con una narrazione immersiva che contestualizza
                  battaglie, scoperte e civiltà. Il tuo portale personale nel passato.
                </p>
              </div>
              <div className="lp-feature-hero-right">
                <div className="lp-timemachine-preview">
                  <div className="lp-tm-badge">⚡ MACCHINA DEL TEMPO</div>
                  <div className="lp-tm-year">−753 a.C.</div>
                  <div className="lp-tm-era">Età Antica · Roma Arcaica</div>
                  <div className="lp-tm-dots">
                    <span/>
                    <span/>
                    <span/>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="lp-features-grid">
            <FeatureCard icon="🌐" title="Globo interattivo 3D"
              desc="Naviga il pianeta in tre dimensioni e posiziona ogni evento nel suo contesto geografico esatto." />
            <FeatureCard icon="⏳" title="Linea del tempo universale"
              desc="Dal Big Bang a oggi: scrolla tra ere geologiche, civiltà antiche e storia contemporanea." />
            <FeatureCard icon="🔬" title="6 categorie tematiche"
              desc="Storia, Arte, Scienza, Musica, Geologia, Cosmo. Filtra per ciò che ti appassiona di più." />
            <FeatureCard icon="📖" title="Schede Wikipedia integrate"
              desc="Ogni evento ha una scheda con immagini, descrizione e link all'articolo completo." />
            <FeatureCard icon="🗺️" title="Mappe storiche sovrapponibili"
              desc="Attiva mappe paleografiche per vedere la Terra com'era durante le ere glaciali o l'antichità." />
            <FeatureCard icon="🔍" title="Ricerca globale istantanea"
              desc="Cerca eventi, personaggi e luoghi su tutta la storia mondiale. Risultati in tempo reale." />
          </div>
        </FadeSection>
      </section>

      {/* ── Come funziona ── */}
      <section id="how" className="lp-section lp-section--dark">
        <FadeSection>
          <motion.div variants={fadeUp} className="lp-section-header">
            <div className="lp-section-tag">COME FUNZIONA</div>
            <h2 className="lp-section-title">Tre passi per viaggiare<br />nel tempo</h2>
          </motion.div>

          <div className="lp-steps">
            <Step n={1} title="Scegli l'epoca"
              desc="Usa la linea del tempo per selezionare qualsiasi momento della storia, dalla preistoria ai giorni nostri." />
            <Step n={2} title="Esplora il globo"
              desc="Gli eventi appaiono sul globo 3D nella loro posizione geografica esatta. Clicca per saperne di più." />
            <Step n={3} title="Approfondisci"
              desc="Leggi la scheda completa, ascolta la descrizione audio e collegati all'articolo Wikipedia." />
          </div>
        </FadeSection>
      </section>

      {/* ── CTA finale ── */}
      <section className="lp-section lp-cta-section">
        <FadeSection className="lp-cta-inner">
          <motion.div variants={fadeUp} className="lp-cta-glow" />
          <motion.div variants={fadeUp} className="lp-section-tag">INIZIA ORA</motion.div>
          <motion.h2 variants={fadeUp} className="lp-section-title">
            Il passato ti aspetta.
          </motion.h2>
          <motion.p variants={fadeUp} className="lp-cta-sub">
            Registrazione gratuita. Accedi e inizia il tuo viaggio attraverso la storia.
          </motion.p>
          <motion.div variants={fadeUp} className="lp-hero-cta">
            <button className="lp-btn-primary lp-btn-primary--large" onClick={openAuth}>
              ⚡ Registrati gratis
            </button>
          </motion.div>
        </FadeSection>
      </section>

      {authOpen && <AuthModal locale="it" onClose={closeAuth} onLoginSuccess={() => { closeAuth(); navigate('/app'); }} />}

      {/* ── Footer ── */}
      <footer className="lp-footer">
        <div className="lp-footer-logo">◉ Viaggiatore nel Tempo</div>
        <div className="lp-footer-links">
          <a href="/privacy" className="lp-footer-link">Privacy Policy</a>
          <span className="lp-footer-sep">·</span>
          <a href="/app"     className="lp-footer-link">Entra nell'app</a>
        </div>
        <div className="lp-footer-copy">© {new Date().getFullYear()} Viaggiatore nel Tempo</div>
      </footer>
    </div>
  );
}
