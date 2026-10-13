// 화면 구성 및 라우팅

const app = document.getElementById('app');
const PERIODS = [
  { key: '1M', label: '1개월', days: 22 },
  { key: '3M', label: '3개월', days: 66 },
  { key: '6M', label: '6개월', days: 130 },
  { key: '1Y', label: '1년', days: 250 },
];

const state = {
  code: '005930',
  period: '3M',
  showMA: true,
  watchlist: loadWatchlist(),
};

// ---- 유틸 ----

function loadWatchlist() {
  try { return JSON.parse(localStorage.getItem('watchlist')) || ['005930', 'NVDA']; } catch { return ['005930', 'NVDA']; }
}
function saveWatchlist() {
  try { localStorage.setItem('watchlist', JSON.stringify(state.watchlist)); } catch {}
}
function toggleWatch(code) {
  const i = state.watchlist.indexOf(code);
  if (i >= 0) state.watchlist.splice(i, 1); else state.watchlist.push(code);
  saveWatchlist();
}

function fmtPrice(v, currency) {
  if (currency === 'USD') return '$' + v.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  return Math.round(v).toLocaleString('ko-KR') + '원';
}
function fmtIndex(v) {
  return v.toLocaleString('ko-KR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmtPct(p) {
  return (p > 0 ? '+' : '') + p.toFixed(2) + '%';
}
function dirClass(v) {
  return v > 0 ? 'up' : v < 0 ? 'down' : 'flat';
}
function arrow(v) {
  return v > 0 ? '▲' : v < 0 ? '▼' : '–';
}
function dailyChange(series) {
  const last = series[series.length - 1].close;
  const prev = series[series.length - 2].close;
  return { last, diff: last - prev, pct: ((last - prev) / prev) * 100 };
}
function glossaryText(term) {
  const g = GLOSSARY.find((x) => x.term === term);
  return g ? `<b>${g.term}</b><br>${g.body}` : '';
}
function helpBtn(term) {
  return `<button class="help" data-term="${term}" aria-label="${term} 설명">?</button>`;
}

// ---- 홈 ----

function renderHome() {
  const indexCards = INDICES.map((idx) => {
    const s = getSeries(idx);
    const c = dailyChange(s);
    return `
      <div class="card index-card" title="${idx.desc}">
        <div class="name">${idx.name}</div>
        <div class="value">${fmtIndex(c.last)}</div>
        <div class="${dirClass(c.diff)}">${arrow(c.diff)} ${fmtIndex(Math.abs(c.diff))} (${fmtPct(c.pct)})</div>
        ${sparkline(s.slice(-22).map((p) => p.close))}
        <div class="mood muted">${idx.isFx ? (c.diff > 0 ? '달러가 비싸졌어요' : '달러가 싸졌어요') : marketMood(c.pct)}</div>
      </div>`;
  }).join('');

  const watched = STOCKS.filter((s) => state.watchlist.includes(s.code));

  app.innerHTML = `
    <section class="hero">
      <h1>오늘 시장, 한눈에 보기 👋</h1>
      <p>어려운 용어 없이 주식 시장의 흐름을 살펴보세요. 궁금한 단어 옆 <b>?</b> 버튼을 누르면 설명이 나와요.</p>
    </section>

    <section class="section">
      <div class="section-head"><h2>주요 지수</h2><span class="muted">최근 1개월 흐름</span></div>
      <div class="grid grid-5">${indexCards}</div>
    </section>

    <section class="section">
      <div class="section-head"><h2>⭐ 내 관심 종목</h2><span class="muted">별표를 눌러 추가·삭제</span></div>
      <div class="card">${watched.length ? stockTable(watched) : '<div class="empty">아직 관심 종목이 없어요. 아래 목록에서 ☆를 눌러 추가해 보세요.</div>'}</div>
    </section>

    <section class="section">
      <div class="section-head"><h2>인기 종목</h2><span class="muted">종목을 누르면 쉬운 분석을 볼 수 있어요</span></div>
      <div class="card">${stockTable(STOCKS)}</div>
    </section>`;
}

function stockTable(list) {
  const rows = list.map((s) => {
    const series = getSeries(s);
    const c = dailyChange(series);
    const on = state.watchlist.includes(s.code);
    return `
      <tr data-code="${s.code}">
        <td style="width:36px"><button class="star ${on ? 'on' : ''}" data-star="${s.code}" aria-label="관심 종목">${on ? '★' : '☆'}</button></td>
        <td><div class="stock-name">${s.name}</div><div class="stock-sub">${s.code} · ${s.market} · ${s.sector}</div></td>
        <td class="num">${fmtPrice(c.last, s.currency)}</td>
        <td class="num ${dirClass(c.diff)}">${arrow(c.diff)} ${fmtPct(c.pct)}</td>
        <td class="hide-sm">${sparkline(series.slice(-22).map((p) => p.close), 90, 28)}</td>
      </tr>`;
  }).join('');
  return `
    <div class="table-wrap"><table class="table">
      <thead><tr><th></th><th>종목</th><th class="num">현재가</th><th class="num">오늘 등락</th><th class="hide-sm">1개월</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>`;
}

// ---- 종목 분석 ----

function renderStock() {
  const s = findStock(state.code) || STOCKS[0];
  const series = getSeries(s);
  const closes = series.map((p) => p.close);
  const c = dailyChange(series);
  const a = analyzeStock(s, closes);
  const on = state.watchlist.includes(s.code);
  const fmt = (v) => fmtPrice(v, s.currency);

  const year = closes.slice(-250);
  const hi = Math.max(...year), lo = Math.min(...year);
  const pos = ((c.last - lo) / (hi - lo)) * 100;

  app.innerHTML = `
    <div class="stock-head">
      <div>
        <div><span class="tag">${s.market}</span><span class="tag">${s.sector}</span><span class="muted">${s.code}</span></div>
        <h1>${s.name} <button class="star ${on ? 'on' : ''}" data-star="${s.code}" aria-label="관심 종목">${on ? '★' : '☆'}</button></h1>
        <div><span class="price">${fmt(c.last)}</span><span class="change ${dirClass(c.diff)}">${arrow(c.diff)} ${fmt(Math.abs(c.diff))} (${fmtPct(c.pct)})</span></div>
      </div>
      <p class="muted" style="max-width:420px;margin:0">${s.desc}</p>
    </div>

    <div class="summary-box ${a.summary.level}">
      <div class="emoji">${a.summary.emoji}</div>
      <div><strong>${a.summary.title}</strong><span class="muted">${a.summary.text}</span></div>
    </div>

    <section class="section card">
      <div class="toolbar">
        <div class="seg" id="period-seg">
          ${PERIODS.map((p) => `<button data-period="${p.key}" class="${p.key === state.period ? 'active' : ''}">${p.label}</button>`).join('')}
        </div>
        <label class="check"><input type="checkbox" id="ma-toggle" ${state.showMA ? 'checked' : ''}>
          평균선 보기 <span class="legend-dot" style="background:#f59e0b"></span> 20일 <span class="legend-dot" style="background:#8b5cf6"></span> 60일 ${helpBtn('이동평균선')}</label>
      </div>
      <div class="chart" id="chart"></div>
    </section>

    <section class="section">
      <div class="section-head"><h2>🚦 쉬운 신호등</h2><span class="muted">초록 = 좋음 · 노랑 = 보통 · 빨강 = 주의</span></div>
      <div class="grid grid-4">
        ${a.signals.map((sg) => `
          <div class="signal ${sg.level}">
            <div class="label"><span>${sg.title} ${helpBtn(sg.term)}</span><span class="light"><i></i><i></i><i></i></span></div>
            <div class="verdict">${sg.verdict}</div>
            <p>${sg.text}</p>
          </div>`).join('')}
      </div>
    </section>

    <section class="section grid grid-2">
      <div class="card">
        <h2>1년 가격 범위 ${helpBtn('52주 최고가 / 최저가')}</h2>
        <p class="muted" style="margin:0">지금 가격은 1년 중 <b>${pos < 33 ? '낮은 편' : pos > 66 ? '높은 편' : '중간쯤'}</b>이에요.</p>
        <div class="range">
          <div class="range-bar"><span class="dot" style="left:${pos}%"></span></div>
          <div class="range-labels"><span>최저 ${fmt(lo)}</span><span>최고 ${fmt(hi)}</span></div>
        </div>
      </div>
      <div class="card">
        <h2>💰 만약 그때 샀다면?</h2>
        <div class="calc-row">
          <input id="calc-amount" type="number" min="0" step="10000" value="${s.currency === 'USD' ? 1000 : 1000000}">
          <span>${s.currency === 'USD' ? '달러를' : '원을'}</span>
          <select id="calc-period">${PERIODS.map((p) => `<option value="${p.days}" ${p.key === '1Y' ? 'selected' : ''}>${p.label} 전에</option>`).join('')}</select>
          <span>투자했다면</span>
        </div>
        <div class="calc-result" id="calc-result"></div>
      </div>
    </section>

    <section class="section">
      <h2>핵심 숫자</h2>
      <div class="grid grid-4">
        ${metric('시가총액', s.cap, '회사의 전체 몸값이에요.')}
        ${metric('PER (주가수익비율)', s.per + '배', `업종 평균 ${s.sectorPer}배`)}
        ${metric('PBR (주가순자산비율)', s.pbr + '배', s.pbr < 1 ? '회사 재산보다 싸게 거래 중' : '회사 재산보다 비싸게 거래 중')}
        ${metric('배당수익률', s.div + '%', s.div >= 3 ? '배당을 많이 주는 편' : s.div > 0 ? '배당이 조금 있어요' : '배당이 거의 없어요')}
      </div>
    </section>`;

  drawStockChart(s, series);
  updateCalc(s, closes);
}

function metric(term, val, hint) {
  return `<div class="card metric"><div class="label">${term.split(' (')[0]} ${helpBtn(term)}</div><div class="val">${val}</div><div class="hint">${hint}</div></div>`;
}

function drawStockChart(s, series) {
  const days = PERIODS.find((p) => p.key === state.period).days;
  const closes = series.map((p) => p.close);
  const ma20 = movingAverage(closes, 20).slice(-days);
  const ma60 = movingAverage(closes, 60).slice(-days);
  const extra = state.showMA ? [
    { values: ma20, color: '#f59e0b', label: '20일 평균' },
    { values: ma60, color: '#8b5cf6', label: '60일 평균' },
  ] : [];
  priceChart(document.getElementById('chart'), series.slice(-days), { extra, format: (v) => fmtPrice(v, s.currency) });
}

function updateCalc(s, closes) {
  const amount = Number(document.getElementById('calc-amount').value) || 0;
  const days = Number(document.getElementById('calc-period').value);
  const then = closes[closes.length - 1 - days];
  const now = closes[closes.length - 1];
  const result = amount * (now / then);
  const diff = result - amount;
  const pct = (now / then - 1) * 100;
  document.getElementById('calc-result').innerHTML = `
    지금은 <b class="${dirClass(diff)}">${fmtPrice(result, s.currency)}</b>이 되었을 거예요.<br>
    <span class="${dirClass(diff)}">${diff >= 0 ? '+' : '−'}${fmtPrice(Math.abs(diff), s.currency)} (${fmtPct(pct)})</span>
    <div class="muted" style="font-size:.82rem;margin-top:6px">수수료·세금·배당은 계산하지 않았어요.</div>`;
}

// ---- 용어 사전 ----

function renderGlossary(query = '') {
  const q = query.trim().toLowerCase();
  const list = GLOSSARY.filter((g) => !q || (g.term + g.body).toLowerCase().includes(q));
  const firstRender = !document.getElementById('glossary-input');
  if (firstRender) {
    app.innerHTML = `
      <section class="hero"><h1>📖 주식 용어 사전</h1><p>처음 보는 단어도 쉽게 풀어서 설명해 드려요.</p></section>
      <input id="glossary-input" class="glossary-search" type="search" placeholder="용어 검색 (예: PER, 배당)">
      <div class="grid grid-2" id="glossary-list"></div>`;
    document.getElementById('glossary-input').addEventListener('input', (e) => renderGlossary(e.target.value));
  }
  document.getElementById('glossary-list').innerHTML = list.length
    ? list.map((g) => `<div class="card term"><h3>${g.term}</h3><p>${g.body}</p>${g.ex ? `<div class="ex">💡 ${g.ex}</div>` : ''}</div>`).join('')
    : '<div class="empty">찾는 용어가 없어요.</div>';
}

// ---- 라우팅 ----

function route() {
  const [page, code] = location.hash.replace('#', '').split('/');
  if (code && findStock(code)) state.code = code;
  const current = page || 'home';
  document.querySelectorAll('[data-nav]').forEach((a) => a.classList.toggle('active', a.dataset.nav === current));
  if (current === 'stock') renderStock();
  else if (current === 'glossary') renderGlossary();
  else renderHome();
  window.scrollTo(0, 0);
}

function rerender() {
  const page = location.hash.replace('#', '').split('/')[0] || 'home';
  if (page === 'stock') renderStock(); else if (page === 'home') renderHome();
}

// ---- 이벤트 ----

app.addEventListener('click', (e) => {
  const star = e.target.closest('[data-star]');
  if (star) { e.stopPropagation(); toggleWatch(star.dataset.star); rerender(); return; }

  const row = e.target.closest('tr[data-code]');
  if (row) { location.hash = `stock/${row.dataset.code}`; return; }

  const period = e.target.closest('[data-period]');
  if (period) {
    state.period = period.dataset.period;
    document.querySelectorAll('[data-period]').forEach((b) => b.classList.toggle('active', b === period));
    const s = findStock(state.code);
    drawStockChart(s, getSeries(s));
  }
});

app.addEventListener('change', (e) => {
  if (e.target.id === 'ma-toggle') {
    state.showMA = e.target.checked;
    const s = findStock(state.code);
    drawStockChart(s, getSeries(s));
  }
  if (e.target.id === 'calc-period') {
    const s = findStock(state.code);
    updateCalc(s, getSeries(s).map((p) => p.close));
  }
});
app.addEventListener('input', (e) => {
  if (e.target.id === 'calc-amount') {
    const s = findStock(state.code);
    updateCalc(s, getSeries(s).map((p) => p.close));
  }
});

// 용어 툴팁 (? 버튼)
const tooltip = document.getElementById('tooltip');
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.help');
  if (!btn) { tooltip.hidden = true; return; }
  e.preventDefault();
  e.stopPropagation();
  tooltip.innerHTML = glossaryText(btn.dataset.term);
  tooltip.hidden = false;
  const r = btn.getBoundingClientRect();
  const left = Math.min(r.left, window.innerWidth - tooltip.offsetWidth - 12);
  tooltip.style.left = `${Math.max(12, left)}px`;
  tooltip.style.top = `${r.bottom + 8}px`;
});
window.addEventListener('scroll', () => { tooltip.hidden = true; });

// 검색
const searchInput = document.getElementById('search');
const searchResults = document.getElementById('search-results');
let searchSel = 0;

function searchMatches() {
  const q = searchInput.value.trim().toLowerCase();
  if (!q) return [];
  return STOCKS.filter((s) => s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q));
}
function renderSearch() {
  const matches = searchMatches();
  if (!searchInput.value.trim()) { searchResults.hidden = true; return; }
  searchResults.innerHTML = matches.length
    ? matches.map((s, i) => `<li data-code="${s.code}" class="${i === searchSel ? 'sel' : ''}"><span>${s.name}</span><span class="muted">${s.code}</span></li>`).join('')
    : '<li class="muted">검색 결과가 없어요</li>';
  searchResults.hidden = false;
}
function goSearch(code) {
  location.hash = `stock/${code}`;
  searchInput.value = '';
  searchResults.hidden = true;
  searchInput.blur();
}
searchInput.addEventListener('input', () => { searchSel = 0; renderSearch(); });
searchInput.addEventListener('keydown', (e) => {
  const matches = searchMatches();
  if (e.key === 'ArrowDown') { searchSel = Math.min(searchSel + 1, matches.length - 1); renderSearch(); e.preventDefault(); }
  if (e.key === 'ArrowUp') { searchSel = Math.max(searchSel - 1, 0); renderSearch(); e.preventDefault(); }
  if (e.key === 'Enter' && matches[searchSel]) goSearch(matches[searchSel].code);
  if (e.key === 'Escape') searchResults.hidden = true;
});
searchResults.addEventListener('mousedown', (e) => {
  const li = e.target.closest('li[data-code]');
  if (li) goSearch(li.dataset.code);
});
searchInput.addEventListener('blur', () => setTimeout(() => { searchResults.hidden = true; }, 150));

// 창 크기 바뀌면 차트 다시 그림
let resizeTimer;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if (document.getElementById('chart')) { const s = findStock(state.code); drawStockChart(s, getSeries(s)); }
  }, 150);
});

window.addEventListener('hashchange', route);
route();
