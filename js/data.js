// 예시(모의) 데이터. 나중에 실제 시세 API로 교체할 때 이 파일의 getSeries / STOCKS만 바꾸면 된다.

const STOCKS = [
  { code: '005930', name: '삼성전자', market: 'KOSPI', sector: '반도체', currency: 'KRW', base: 71000, drift: 0.0004, vol: 0.018, per: 14.2, pbr: 1.3, div: 2.0, cap: '약 420조 원', sectorPer: 18,
    desc: '스마트폰, 메모리 반도체, TV·가전을 만드는 한국 대표 기업이에요. 코스피에서 차지하는 비중이 가장 커요.' },
  { code: '000660', name: 'SK하이닉스', market: 'KOSPI', sector: '반도체', currency: 'KRW', base: 175000, drift: 0.0009, vol: 0.026, per: 11.5, pbr: 2.1, div: 0.6, cap: '약 130조 원', sectorPer: 18,
    desc: '메모리 반도체(D램, 낸드)를 주로 만드는 회사예요. AI 서버용 고성능 메모리로 주목받고 있어요.' },
  { code: '005380', name: '현대차', market: 'KOSPI', sector: '자동차', currency: 'KRW', base: 235000, drift: 0.0002, vol: 0.017, per: 5.1, pbr: 0.6, div: 4.8, cap: '약 50조 원', sectorPer: 7,
    desc: '승용차, SUV, 전기차를 만드는 국내 1위 자동차 회사예요. 배당을 비교적 많이 주는 편이에요.' },
  { code: '035420', name: 'NAVER', market: 'KOSPI', sector: '인터넷', currency: 'KRW', base: 190000, drift: -0.0002, vol: 0.021, per: 21.0, pbr: 1.4, div: 0.6, cap: '약 30조 원', sectorPer: 25,
    desc: '국내 1위 검색 포털을 운영하고, 쇼핑·웹툰·클라우드 사업도 하는 인터넷 기업이에요.' },
  { code: '035720', name: '카카오', market: 'KOSPI', sector: '인터넷', currency: 'KRW', base: 42000, drift: -0.0006, vol: 0.024, per: 48.0, pbr: 2.0, div: 0.1, cap: '약 19조 원', sectorPer: 25,
    desc: '카카오톡을 중심으로 결제, 은행, 게임, 콘텐츠 사업을 하는 플랫폼 기업이에요.' },
  { code: '247540', name: '에코프로비엠', market: 'KOSDAQ', sector: '2차전지', currency: 'KRW', base: 180000, drift: -0.0008, vol: 0.035, per: 95.0, pbr: 6.5, div: 0.0, cap: '약 17조 원', sectorPer: 40,
    desc: '전기차 배터리에 들어가는 양극재를 만드는 회사예요. 주가 움직임이 큰 편이에요.' },
  { code: 'AAPL', name: '애플', market: 'NASDAQ', sector: '하드웨어', currency: 'USD', base: 190, drift: 0.0006, vol: 0.015, per: 30.0, pbr: 45.0, div: 0.5, cap: '약 3.5조 달러', sectorPer: 28,
    desc: '아이폰, 맥, 에어팟을 만드는 미국 기업이에요. 세계에서 시가총액이 가장 큰 회사 중 하나예요.' },
  { code: 'NVDA', name: '엔비디아', market: 'NASDAQ', sector: '반도체', currency: 'USD', base: 110, drift: 0.0014, vol: 0.03, per: 55.0, pbr: 40.0, div: 0.03, cap: '약 3조 달러', sectorPer: 30,
    desc: 'AI 학습에 쓰이는 GPU(그래픽 칩)를 만드는 회사예요. AI 붐의 대표 수혜 기업으로 꼽혀요.' },
  { code: 'TSLA', name: '테슬라', market: 'NASDAQ', sector: '자동차', currency: 'USD', base: 210, drift: 0.0003, vol: 0.036, per: 70.0, pbr: 11.0, div: 0.0, cap: '약 7천억 달러', sectorPer: 15,
    desc: '전기차와 에너지 저장장치를 만드는 회사예요. 주가 변동이 매우 큰 종목으로 유명해요.' },
  { code: 'MSFT', name: '마이크로소프트', market: 'NASDAQ', sector: '소프트웨어', currency: 'USD', base: 410, drift: 0.0005, vol: 0.014, per: 34.0, pbr: 11.5, div: 0.7, cap: '약 3.1조 달러', sectorPer: 32,
    desc: '윈도우, 오피스, 클라우드(Azure)를 서비스하는 소프트웨어 기업이에요.' },
];

const INDICES = [
  { code: 'KOSPI', name: '코스피', base: 2600, drift: 0.0002, vol: 0.009, desc: '한국 유가증권시장 대표 지수' },
  { code: 'KOSDAQ', name: '코스닥', base: 760, drift: -0.0001, vol: 0.012, desc: '한국 중소·벤처 기업 중심 지수' },
  { code: 'SPX', name: 'S&P 500', base: 5400, drift: 0.0004, vol: 0.009, desc: '미국 대형주 500개 지수' },
  { code: 'IXIC', name: '나스닥', base: 17000, drift: 0.0005, vol: 0.012, desc: '미국 기술주 중심 지수' },
  { code: 'USDKRW', name: '원/달러 환율', base: 1360, drift: 0.0001, vol: 0.004, desc: '1달러를 사는 데 필요한 원화', isFx: true },
];

const GLOSSARY = [
  { term: '주가', body: '주식 1주의 가격이에요. 사려는 사람이 많으면 오르고, 팔려는 사람이 많으면 내려요.', ex: '삼성전자 주가 70,000원 → 1주를 사려면 7만 원이 필요해요.' },
  { term: '시가총액', body: '회사의 주식 전체를 지금 가격으로 모두 샀을 때의 금액이에요. 회사의 "덩치"를 나타내요.', ex: '주가 1만 원 × 주식 수 1억 주 = 시가총액 1조 원' },
  { term: 'PER (주가수익비율)', body: '주가가 1주당 순이익의 몇 배인지 나타내요. 낮을수록 이익에 비해 싸다는 뜻이지만, 성장 기대가 큰 회사는 높게 나오기도 해요.', ex: 'PER 10 → 지금 이익이 유지되면 10년 동안 번 돈이 주가와 같아요.' },
  { term: 'PBR (주가순자산비율)', body: '주가가 회사가 가진 순자산(재산 − 빚)의 몇 배인지 나타내요. 1보다 낮으면 장부상 재산보다 싸게 거래된다는 뜻이에요.', ex: 'PBR 0.6 → 회사 재산 가치의 60% 가격에 거래 중' },
  { term: '배당수익률', body: '주가 대비 1년 동안 받는 배당금의 비율이에요. 은행 이자와 비슷하게 생각하면 쉬워요.', ex: '주가 10만 원, 배당금 3천 원 → 배당수익률 3%' },
  { term: '이동평균선', body: '최근 며칠 동안의 평균 가격을 이어 그린 선이에요. 주가의 큰 흐름(추세)을 보는 데 써요.', ex: '20일선 = 최근 20거래일(약 1달) 평균 가격' },
  { term: 'RSI (상대강도지수)', body: '최근 오른 힘과 내린 힘을 비교한 0~100 사이 숫자예요. 70 이상이면 단기 과열, 30 이하면 많이 떨어진 상태로 봐요.', ex: 'RSI 80 → 짧은 기간에 너무 빨리 올랐을 수 있어요.' },
  { term: '변동성', body: '가격이 얼마나 크게 출렁이는지를 나타내요. 변동성이 크면 수익도 손실도 커질 수 있어요.', ex: '하루에 ±1% 움직이는 종목 vs ±5% 움직이는 종목' },
  { term: '52주 최고가 / 최저가', body: '최근 1년(52주) 동안 가장 높았던 가격과 가장 낮았던 가격이에요. 지금 가격이 1년 범위에서 어디쯤인지 알 수 있어요.', ex: '' },
  { term: '코스피 / 코스닥', body: '코스피는 대기업 중심의 유가증권시장, 코스닥은 중소·기술 기업 중심 시장이에요. 각 시장 전체 흐름을 지수로 나타내요.', ex: '' },
  { term: '거래량', body: '하루 동안 사고팔린 주식의 수예요. 거래량이 갑자기 늘면 관심이 몰렸다는 신호일 수 있어요.', ex: '' },
  { term: '분산투자', body: '한 종목에 모든 돈을 넣지 않고 여러 종목·자산에 나눠 투자하는 방법이에요. 한 곳이 크게 떨어져도 피해를 줄일 수 있어요.', ex: '"계란을 한 바구니에 담지 마라"' },
  { term: '손절', body: '손실을 감수하고 주식을 파는 것이에요. 더 큰 손실을 막기 위해 미리 기준을 정해두는 것이 좋아요.', ex: '산 가격보다 10% 떨어지면 판다 → 손절 기준 -10%' },
];

// ---- 모의 시계열 생성 ----

function seededRandom(seedStr) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function gaussian(rand) {
  const u = 1 - rand(), v = rand();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
}

function tradingDays(count) {
  const days = [];
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  while (days.length < count) {
    const wd = d.getDay();
    if (wd !== 0 && wd !== 6) days.unshift(new Date(d));
    d.setDate(d.getDate() - 1);
  }
  return days;
}

const seriesCache = {};
const SERIES_LENGTH = 260; // 약 1년치 거래일

// [{ date, close, volume }] 반환
function getSeries(item) {
  if (seriesCache[item.code]) return seriesCache[item.code];
  const rand = seededRandom(item.code);
  const dates = tradingDays(SERIES_LENGTH);
  let price = item.base;
  const out = dates.map((date) => {
    price = price * Math.exp(item.drift + item.vol * gaussian(rand));
    const volume = Math.round((0.6 + rand() * 0.8) * 1_000_000);
    return { date, close: price, volume };
  });
  seriesCache[item.code] = out;
  return out;
}

function findStock(code) {
  return STOCKS.find((s) => s.code === code);
}
