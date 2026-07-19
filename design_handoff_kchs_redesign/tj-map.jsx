// TjMap — интерактивная SVG-карта регионов Таджикистана (d3-geo + Highcharts TopoJSON, WGS84).
// Требует d3 и topojson-client, загруженных на странице (pinned-теги в helmet).
const REGION_KEYS = [
  { key: 'dushanbe', match: ['dushanbe'], short: 'Душанбе' },
  { key: 'sughd', match: ['sugh'], short: 'Согдийская обл.' },
  { key: 'khatlon', match: ['khatlon'], short: 'Хатлонская обл.' },
  { key: 'gbao', match: ['badakh', 'gorno'], short: 'ГБАО' },
  { key: 'rrp', match: [], short: 'РРП' },
];
function regionKeyOf(name) {
  const n = (name || '').toLowerCase();
  for (const r of REGION_KEYS) if (r.match.some((m) => n.includes(m))) return r.key;
  return 'rrp';
}
const LEVEL_FILL = {
  none: 'color-mix(in srgb, var(--color-accent) 10%, transparent)',
  info: 'color-mix(in srgb, var(--hz-info) 30%, transparent)',
  warning: 'color-mix(in srgb, var(--hz-warning) 45%, transparent)',
  danger: 'color-mix(in srgb, var(--hz-danger) 55%, transparent)',
  critical: 'color-mix(in srgb, var(--hz-critical) 60%, transparent)',
};

function TjMap({ regions = [], height = 480, showLabels = true }) {
  const [features, setFeatures] = React.useState(null);
  const [error, setError] = React.useState(false);
  const [hover, setHover] = React.useState(null);
  const W = 960, H = Math.round((height / 480) * 560);

  React.useEffect(() => {
    let dead = false;
    fetch('https://cdn.jsdelivr.net/npm/@highcharts/map-collection@2.3.0/countries/tj/tj-all.topo.json')
      .then((r) => { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then((topo) => {
        if (dead) return;
        const objName = Object.keys(topo.objects)[0];
        const fc = topojson.feature(topo, topo.objects[objName]);
        setFeatures(fc);
      })
      .catch(() => { if (!dead) setError(true); });
    return () => { dead = true; };
  }, []);

  if (error) {
    return React.createElement('div', { role: 'note', style: { padding: '32px', textAlign: 'center', fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 60%, transparent)' } },
      'Не удалось загрузить карту. Сведения по регионам доступны в списке ниже.');
  }
  if (!features) {
    return React.createElement('div', { 'aria-busy': 'true', style: { height, display: 'grid', placeItems: 'center', fontSize: 13, color: 'color-mix(in srgb, var(--color-text) 50%, transparent)' } },
      'Загрузка карты…');
  }

  const projection = d3.geoMercator().fitExtent([[16, 16], [W - 16, H - 16]], features);
  const path = d3.geoPath(projection);
  const byKey = {};
  regions.forEach((r) => { byKey[r.key] = r; });

  // Aggregate features per region key (RRP is several districts in some files).
  const shapes = features.features.map((f, i) => {
    const key = regionKeyOf(f.properties && (f.properties.name || f.properties['hc-key']));
    return { f, key, i };
  });

  const labels = {};
  shapes.forEach((s) => {
    const c = path.centroid(s.f);
    const a = path.area(s.f);
    if (!labels[s.key] || a > labels[s.key].area) labels[s.key] = { c, area: a };
  });

  return React.createElement('div', { style: { position: 'relative' } },
    React.createElement('svg', {
      viewBox: `0 0 ${W} ${H}`,
      role: 'img',
      'aria-label': 'Карта Республики Таджикистан с уровнями опасности по регионам',
      style: { width: '100%', height: 'auto', display: 'block' },
    },
      shapes.map((s) => {
        const data = byKey[s.key];
        const level = (data && data.level) || 'none';
        const isHover = hover === s.key;
        return React.createElement('path', {
          key: s.i,
          d: path(s.f),
          fill: LEVEL_FILL[level] || LEVEL_FILL.none,
          stroke: isHover ? 'var(--color-accent-700)' : 'color-mix(in srgb, var(--color-text) 40%, transparent)',
          strokeWidth: isHover ? 1.8 : 0.8,
          style: { cursor: 'pointer', transition: 'stroke .15s' },
          onMouseEnter: () => setHover(s.key),
          onMouseLeave: () => setHover(null),
        }, React.createElement('title', null, (data && `${data.name}: ${data.statusText}`) || s.key));
      }),
      showLabels && Object.entries(labels).map(([key, l]) => {
        const meta = REGION_KEYS.find((r) => r.key === key);
        const data = byKey[key];
        return React.createElement('g', { key, style: { pointerEvents: 'none' } },
          React.createElement('text', {
            x: l.c[0], y: l.c[1],
            textAnchor: 'middle',
            style: { fontFamily: 'var(--font-heading)', fontSize: 17, fontWeight: 600, fill: 'var(--color-text)', letterSpacing: '.02em' },
          }, meta ? meta.short : key),
          data && data.count > 0 && React.createElement('text', {
            x: l.c[0], y: l.c[1] + 20,
            textAnchor: 'middle',
            style: { fontFamily: 'var(--font-body)', fontSize: 12.5, fill: 'color-mix(in srgb, var(--color-text) 65%, transparent)' },
          }, `${data.count} ${data.countLabel || 'событий'}`)
        );
      })
    ),
    hover && byKey[hover] && React.createElement('div', {
      style: {
        position: 'absolute', left: 12, bottom: 12, padding: '8px 12px',
        background: 'var(--color-bg)', border: '1px solid var(--color-divider)',
        fontSize: 12.5, boxShadow: 'var(--shadow-sm)', pointerEvents: 'none', maxWidth: 280,
      },
    },
      React.createElement('strong', { style: { fontFamily: 'var(--font-heading)', fontSize: 14, display: 'block' } }, byKey[hover].name),
      React.createElement('span', null, byKey[hover].statusText)
    )
  );
}
module.exports = { TjMap };
