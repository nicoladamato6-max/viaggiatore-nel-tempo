import { useEffect, useRef, useCallback } from 'react';
import * as Cesium from 'cesium';
import { type HistoricalEvent, type FlyTarget, CATEGORY_COLORS } from '../types';
import { PLANETS, getMoonPosition, getPlanetPosition, toPlanetCard } from '../utils/celestialMechanics';

Cesium.Ion.defaultAccessToken = import.meta.env.VITE_CESIUM_TOKEN;

const SUN_RADIUS = 696_000_000;
const SUN_DIST   = 149_600_000_000;

// Card per clic diretto su Luna e Sole (ID diverso da 'luna'/'sole' per non innescare flyTo da App)
const MOON_CARD: HistoricalEvent = {
  id: 'luna-body', title: 'La Luna', year: -4_500_000_000,
  category: 'cosmo', isCosmic: true,
  description: 'Il satellite naturale della Terra a ~384.400 km. Formatasi ~4,5 miliardi di anni fa dall\'impatto di Theia. L\'Apollo 11 vi allunò il 20 luglio 1969. L\'Apollo 17 portò l\'ultimo essere umano nel 1972.',
  wikipediaSlug: 'Moon',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/FullMoon2010.jpg/240px-FullMoon2010.jpg',
};
const SUN_CARD: HistoricalEvent = {
  id: 'sole-body', title: 'Il Sole', year: -4_600_000_000,
  category: 'cosmo', isCosmic: true,
  description: 'La stella al centro del Sistema Solare, distante 149,6 milioni di km dalla Terra (1 UA). La luce impiega 8 minuti a raggiungerci. Contiene il 99,8% della massa del Sistema Solare.',
  wikipediaSlug: 'Sun',
  imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/b/b4/The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg/240px-The_Sun_by_the_Atmospheric_Imaging_Assembly_of_NASA%27s_Solar_Dynamics_Observatory_-_20100819.jpg',
};


interface Props {
  events: HistoricalEvent[];
  isCosmicView: boolean;
  flyTo: FlyTarget | null;
  onEventClick: (event: HistoricalEvent) => void;
}

export function GlobeView({ events, isCosmicView, flyTo, onEventClick }: Props) {
  const containerRef  = useRef<HTMLDivElement>(null);
  const viewerRef     = useRef<Cesium.Viewer | null>(null);
  // PointPrimitiveCollection per i pin degli eventi storici — molto più veloce delle Entity
  const pinsRef       = useRef<Cesium.PointPrimitiveCollection | null>(null);
  const eventsRef  = useRef(events);
  const onClickRef = useRef(onEventClick);

  eventsRef.current  = events;
  onClickRef.current = onEventClick;

  // ── Inizializzazione viewer (una volta sola) ──────────────────────────────
  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return;

    const viewer = new Cesium.Viewer(containerRef.current, {
      animation: false, timeline: false, geocoder: false, homeButton: false,
      sceneModePicker: false, baseLayerPicker: false, navigationHelpButton: false,
      infoBox: false, selectionIndicator: false, fullscreenButton: false,
    });

    (viewer.cesiumWidget.creditContainer as HTMLElement).style.display = 'none';

    // Zoom illimitato: permette di allontanarsi fino al Sistema Solare e oltre
    viewer.scene.screenSpaceCameraController.maximumZoomDistance = 1e14;

    // Illuminazione sempre uniforme — disabilita il ciclo giorno/notte realistico
    // che renderebbe la Terra nera sul lato notturno all'avvio
    viewer.scene.globe.enableLighting = false;

    // PointPrimitiveCollection per i pin degli eventi storici
    // — removeAll() è O(1) rispetto a N chiamate a removeById() su Entity
    const pins = new Cesium.PointPrimitiveCollection();
    viewer.scene.primitives.add(pins);
    pinsRef.current = pins;

    // Terreno 3D mondiale
    Cesium.createWorldTerrainAsync().then(t => {
      if (!viewer.isDestroyed()) {
        viewer.scene.terrainProvider = t;
        // il terrain load può innescare animazioni interne — le cancelliamo
        viewer.camera.cancelFlight();
      }
    });

    // Posiziona la camera al primo frame renderizzato da Cesium.
    // Usare postRender (anziché setView nel useEffect) garantisce che qualsiasi
    // animazione interna di Cesium sia già finita prima che noi la sovrascriviamo.
    const removePostRender = viewer.scene.postRender.addEventListener(() => {
      removePostRender(); // one-shot: rimuove se stesso dopo il primo frame
      if (viewer.isDestroyed()) return;
      viewer.camera.cancelFlight();
      viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(10, 20, 12_000_000),
        orientation: {
          heading: 0.0,
          pitch: -Cesium.Math.PI_OVER_TWO,
          roll: 0.0,
        },
      });
    });

    // Tessellazione ridotta per i corpi celesti (default è 64×64 = ~8K tri; qui 16×16 = ~512 tri)
    const LOW_TESS = { stackPartitions: 16, slicePartitions: 16 };

    // ── Luna (posizione reale da Chapront) ───────────────────────────────
    const moonPos = new Cesium.Cartesian3(...getMoonPosition());
    viewer.entities.add(new Cesium.Entity({
      id: 'luna', position: moonPos,
      ellipsoid: new Cesium.EllipsoidGraphics({
        radii: new Cesium.Cartesian3(1_737_400, 1_737_400, 1_737_400),
        material: new Cesium.ColorMaterialProperty(new Cesium.Color(0.72, 0.72, 0.72, 1)),
        ...LOW_TESS,
      }),
      label: new Cesium.LabelGraphics({
        text: '🌕 Luna', font: '13px system-ui', fillColor: Cesium.Color.WHITE,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE, outlineWidth: 2, outlineColor: Cesium.Color.BLACK,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(2_000_000, 1_500_000_000),
      }),
    }));

    // ── Sole ─────────────────────────────────────────────────────────────
    const sunPos = new Cesium.Cartesian3(SUN_DIST * 0.940, SUN_DIST * 0.342, 0);
    viewer.entities.add(new Cesium.Entity({
      id: 'sole', position: sunPos,
      ellipsoid: new Cesium.EllipsoidGraphics({
        radii: new Cesium.Cartesian3(SUN_RADIUS, SUN_RADIUS, SUN_RADIUS),
        material: new Cesium.ColorMaterialProperty(new Cesium.Color(1.0, 0.85, 0.10, 1.0)),
        ...LOW_TESS,
      }),
      label: new Cesium.LabelGraphics({
        text: '☀️ Sole', font: '14px system-ui', fillColor: Cesium.Color.YELLOW,
        style: Cesium.LabelStyle.FILL_AND_OUTLINE, outlineWidth: 2, outlineColor: Cesium.Color.BLACK,
        verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
        distanceDisplayCondition: new Cesium.DistanceDisplayCondition(10_000_000, 4e11),
      }),
    }));

    // ── Pianeti (posizioni Kepleriane reali) ─────────────────────────────
    for (const planet of PLANETS) {
      const [px, py, pz] = getPlanetPosition(planet);
      const pos  = new Cesium.Cartesian3(px, py, pz);
      const dist = Math.sqrt(px*px + py*py + pz*pz);

      viewer.entities.add(new Cesium.Entity({
        id: `planet-${planet.id}`, position: pos,
        ellipsoid: new Cesium.EllipsoidGraphics({
          radii: new Cesium.Cartesian3(planet.radius, planet.radius, planet.radius),
          material: new Cesium.ColorMaterialProperty(Cesium.Color.fromCssColorString(planet.color)),
          ...LOW_TESS,
        }),
        label: new Cesium.LabelGraphics({
          text: planet.name, font: '13px system-ui', fillColor: Cesium.Color.WHITE,
          style: Cesium.LabelStyle.FILL_AND_OUTLINE, outlineWidth: 2, outlineColor: Cesium.Color.BLACK,
          verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
          distanceDisplayCondition: new Cesium.DistanceDisplayCondition(
            Math.max(10_000_000, planet.radius * 50),
            dist * 5,
          ),
        }),
      }));
    }

    // ── Click handler ────────────────────────────────────────────────────
    const handler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    handler.setInputAction((click: { position: Cesium.Cartesian2 }) => {
      const picked = viewer.scene.pick(click.position);
      if (!Cesium.defined(picked)) return;

      // Entità CesiumJS (Luna, Sole, pianeti)
      if (picked.id instanceof Cesium.Entity) {
        const entityId = picked.id.id as string;
        const entity   = picked.id as Cesium.Entity;

        if (entityId === 'luna') {
          viewer.flyTo(entity, { duration: 3, offset: new Cesium.HeadingPitchRange(0, -Math.PI / 6, 1_737_400 * 6) });
          onClickRef.current(MOON_CARD);
          return;
        }
        if (entityId === 'sole') {
          viewer.flyTo(entity, { duration: 6, offset: new Cesium.HeadingPitchRange(0, -Math.PI / 6, SUN_RADIUS * 3) });
          onClickRef.current(SUN_CARD);
          return;
        }
        if (entityId.startsWith('planet-')) {
          const planet = PLANETS.find(p => `planet-${p.id}` === entityId);
          if (planet) {
            viewer.flyTo(entity, { duration: 4, offset: new Cesium.HeadingPitchRange(0, -Math.PI / 6, planet.radius * 5) });
            onClickRef.current(toPlanetCard(planet));
          }
          return;
        }
      }

      // PointPrimitive (eventi storici) — picked.id è la stringa dell'evento
      if (typeof picked.id === 'string') {
        const event = eventsRef.current.find(e => e.id === picked.id);
        if (event) onClickRef.current(event);
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    viewerRef.current = viewer;

    return () => {
      handler.destroy();
      viewer.destroy();
      viewerRef.current = null;
      pinsRef.current   = null;
    };
  }, []);

  // ── Aggiorna pin eventi storici ──────────────────────────────────────────
  // removeAll() su PointPrimitiveCollection è molto più veloce di N × removeById() su Entity
  useEffect(() => {
    const viewer = viewerRef.current;
    const pins   = pinsRef.current;
    if (!viewer || viewer.isDestroyed() || !pins || pins.isDestroyed()) return;

    pins.removeAll();
    if (isCosmicView) return;

    for (const event of events) {
      if (event.lat == null || event.lng == null) continue;
      pins.add({
        id: event.id,
        position: Cesium.Cartesian3.fromDegrees(event.lng, event.lat),
        color: Cesium.Color.fromCssColorString(CATEGORY_COLORS[event.category]),
        outlineColor: Cesium.Color.WHITE,
        outlineWidth: 2,
        pixelSize: 11,
        scaleByDistance:        new Cesium.NearFarScalar(500_000, 2.0, 20_000_000, 0.6),
        translucencyByDistance: new Cesium.NearFarScalar(15_000_000, 1.0, 25_000_000, 0.0),
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
      });
    }
  }, [events, isCosmicView]);

  // ── FlyTo da ricerca o selezione ─────────────────────────────────────────
  useEffect(() => {
    const viewer = viewerRef.current;
    if (!flyTo || !viewer || viewer.isDestroyed()) return;

    if (flyTo.kind === 'cosmic') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(0, 0, 8_000_000_000),
        duration: 3,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      });
      return;
    }

    if (flyTo.kind === 'earth') {
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(10, 20, 12_000_000),
        orientation: { heading: 0, pitch: -Cesium.Math.PI_OVER_TWO, roll: 0 },
        duration: 2.5,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      });
      return;
    }

    if (flyTo.kind === 'geo') {
      if (isCosmicView) return;
      viewer.camera.flyTo({
        destination: Cesium.Cartesian3.fromDegrees(flyTo.lng, flyTo.lat, 2_500_000),
        duration: 2,
        easingFunction: Cesium.EasingFunction.CUBIC_IN_OUT,
      });
      return;
    }

    // Corpo celeste: viewer.flyTo() inquadra automaticamente il raggio dell'entità
    const entity = viewer.entities.getById(flyTo.entityId);
    if (!entity) return;

    let radius = 10_000_000;
    if      (flyTo.entityId === 'luna') radius = 1_737_400;
    else if (flyTo.entityId === 'sole') radius = SUN_RADIUS;
    else {
      const p = PLANETS.find(pl => `planet-${pl.id}` === flyTo.entityId);
      if (p) radius = p.radius;
    }
    viewer.flyTo(entity, { duration: 4, offset: new Cesium.HeadingPitchRange(0, -Math.PI / 6, radius * 5) });
  }, [flyTo, isCosmicView]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
      {isCosmicView && <CosmicOverlay events={events} onEventClick={onEventClick} />}
    </div>
  );
}

// ── Overlay eventi cosmici pre-terrestri ────────────────────────────────────

function CosmicOverlay({ events, onEventClick }: { events: HistoricalEvent[]; onEventClick: (e: HistoricalEvent) => void }) {
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(to right, rgba(0,0,10,0.7) 0%, transparent 45%)',
      pointerEvents: 'none',
    }}>
      <div style={{
        position: 'absolute', left: 16, top: 16, bottom: 16,
        display: 'flex', flexDirection: 'column', gap: 8,
        overflowY: 'auto', maxWidth: 280, pointerEvents: 'all',
      }}>
        <p style={{ color: '#1abc9c99', fontSize: '0.65rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>
          🌌 Universo primordiale
        </p>
        {events.length === 0
          ? <p style={{ color: '#555577', fontSize: '0.75rem' }}>Sposta lo slider verso sinistra per esplorare l'universo primordiale</p>
          : events.map(e => <CosmicEventButton key={e.id} event={e} onClick={onEventClick} />)
        }
      </div>
    </div>
  );
}

function CosmicEventButton({ event, onClick }: { event: HistoricalEvent; onClick: (e: HistoricalEvent) => void }) {
  const color       = CATEGORY_COLORS[event.category];
  const handleClick = useCallback(() => onClick(event), [event, onClick]);

  function fmt(y: number): string {
    if (Math.abs(y) >= 1_000_000_000) return `${(Math.abs(y) / 1_000_000_000).toFixed(1)} mld a.C.`;
    if (Math.abs(y) >= 1_000_000)     return `${(Math.abs(y) / 1_000_000).toFixed(0)} mln a.C.`;
    return `${Math.abs(y)} a.C.`;
  }

  return (
    <button onClick={handleClick}
      style={{ background: `${color}18`, border: `1px solid ${color}55`, borderRadius: 10, padding: '8px 12px', color: '#e8e8f0', cursor: 'pointer', fontSize: '0.78rem', textAlign: 'left', transition: 'background 0.2s', lineHeight: 1.35 }}
      onMouseEnter={ev => (ev.currentTarget.style.background = `${color}35`)}
      onMouseLeave={ev => (ev.currentTarget.style.background = `${color}18`)}
    >
      <div style={{ color, fontWeight: 600, marginBottom: 2 }}>{event.title}</div>
      <div style={{ color: '#ffd16699', fontSize: '0.65rem' }}>{fmt(event.year)}</div>
    </button>
  );
}
