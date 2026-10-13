// 의존성 없는 SVG 차트

const SVG_NS = 'http://www.w3.org/2000/svg';

function svgEl(tag, attrs = {}) {
  const el = document.createElementNS(SVG_NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// 작은 추세선 (카드, 표용)
function sparkline(values, width = 100, height = 30) {
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => `${(i / (values.length - 1)) * width},${height - 2 - ((v - min) / span) * (height - 4)}`);
  const color = values[values.length - 1] >= values[0] ? cssVar('--up') : cssVar('--down');
  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none"><polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="1.6" vector-effect="non-scaling-stroke"/></svg>`;
}

// 메인 가격 차트
// points: [{date, close}], extra: [{values, color, label}]
function priceChart(container, points, { extra = [], format }) {
  container.innerHTML = '';
  const W = container.clientWidth;
  const H = container.clientHeight;
  const pad = { top: 12, right: 12, bottom: 26, left: 64 };
  const iw = W - pad.left - pad.right;
  const ih = H - pad.top - pad.bottom;

  const closes = points.map((p) => p.close);
  const all = closes.concat(...extra.map((e) => e.values.filter((v) => v != null)));
  let min = Math.min(...all), max = Math.max(...all);
  const m = (max - min) * 0.08 || 1;
  min -= m; max += m;

  const x = (i) => pad.left + (i / (points.length - 1)) * iw;
  const y = (v) => pad.top + (1 - (v - min) / (max - min)) * ih;

  const up = closes[closes.length - 1] >= closes[0];
  const color = up ? cssVar('--up') : cssVar('--down');

  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}` });

  // 그라디언트
  const defs = svgEl('defs');
  const grad = svgEl('linearGradient', { id: 'area-grad', x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.append(svgEl('stop', { offset: '0%', 'stop-color': color, 'stop-opacity': 0.22 }));
  grad.append(svgEl('stop', { offset: '100%', 'stop-color': color, 'stop-opacity': 0 }));
  defs.append(grad);
  svg.append(defs);

  // 가로 격자 + y축 라벨
  for (let i = 0; i <= 4; i++) {
    const v = min + ((max - min) * i) / 4;
    const yy = y(v);
    svg.append(svgEl('line', { x1: pad.left, x2: W - pad.right, y1: yy, y2: yy, class: 'grid-line' }));
    const t = svgEl('text', { x: pad.left - 8, y: yy + 4, 'text-anchor': 'end', class: 'axis-label' });
    t.textContent = format(v);
    svg.append(t);
  }

  // x축 날짜 라벨
  const ticks = W < 500 ? 3 : 5;
  for (let i = 0; i < ticks; i++) {
    const idx = Math.round((i / (ticks - 1)) * (points.length - 1));
    const d = points[idx].date;
    const t = svgEl('text', { x: x(idx), y: H - 6, 'text-anchor': i === 0 ? 'start' : i === ticks - 1 ? 'end' : 'middle', class: 'axis-label' });
    t.textContent = `${d.getMonth() + 1}/${d.getDate()}`;
    svg.append(t);
  }

  const line = closes.map((v, i) => `${i ? 'L' : 'M'}${x(i)},${y(v)}`).join('');
  svg.append(svgEl('path', { d: `${line}L${x(closes.length - 1)},${pad.top + ih}L${x(0)},${pad.top + ih}Z`, fill: 'url(#area-grad)' }));

  extra.forEach((e) => {
    let d = '';
    e.values.forEach((v, i) => { if (v != null) d += `${d ? 'L' : 'M'}${x(i)},${y(v)}`; });
    svg.append(svgEl('path', { d, fill: 'none', stroke: e.color, 'stroke-width': 1.5, 'stroke-dasharray': '4 3' }));
  });

  svg.append(svgEl('path', { d: line, fill: 'none', stroke: color, 'stroke-width': 2, 'stroke-linejoin': 'round' }));

  // 호버
  const cross = svgEl('line', { y1: pad.top, y2: pad.top + ih, stroke: cssVar('--muted'), 'stroke-dasharray': '3 3', visibility: 'hidden' });
  const dot = svgEl('circle', { r: 4.5, fill: color, stroke: cssVar('--card'), 'stroke-width': 2, visibility: 'hidden' });
  svg.append(cross, dot);
  const tip = document.createElement('div');
  tip.className = 'chart-tip';
  tip.hidden = true;

  const overlay = svgEl('rect', { x: pad.left, y: pad.top, width: iw, height: ih, fill: 'transparent' });
  svg.append(overlay);

  function move(clientX) {
    const rect = svg.getBoundingClientRect();
    const px = ((clientX - rect.left) / rect.width) * W;
    const i = Math.max(0, Math.min(points.length - 1, Math.round(((px - pad.left) / iw) * (points.length - 1))));
    const p = points[i];
    const cx = x(i), cy = y(p.close);
    cross.setAttribute('x1', cx); cross.setAttribute('x2', cx);
    dot.setAttribute('cx', cx); dot.setAttribute('cy', cy);
    cross.setAttribute('visibility', 'visible'); dot.setAttribute('visibility', 'visible');
    const d = p.date;
    let html = `<div class="muted">${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()}</div><b>${format(p.close)}</b>`;
    extra.forEach((e) => { if (e.values[i] != null) html += `<div><span class="legend-dot" style="background:${e.color}"></span> ${e.label} ${format(e.values[i])}</div>`; });
    tip.innerHTML = html;
    tip.hidden = false;
    tip.style.left = `${Math.min(Math.max((cx / W) * rect.width, 70), rect.width - 70)}px`;
    tip.style.top = `${(cy / H) * rect.height}px`;
  }
  function leave() {
    cross.setAttribute('visibility', 'hidden'); dot.setAttribute('visibility', 'hidden');
    tip.hidden = true;
  }
  overlay.addEventListener('mousemove', (e) => move(e.clientX));
  overlay.addEventListener('touchmove', (e) => { move(e.touches[0].clientX); e.preventDefault(); }, { passive: false });
  overlay.addEventListener('mouseleave', leave);
  overlay.addEventListener('touchend', leave);

  container.append(svg, tip);
}
