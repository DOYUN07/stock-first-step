// 초보자용 쉬운 분석 지표

function average(arr) {
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}

function movingAverage(closes, n) {
  return closes.map((_, i) => (i + 1 < n ? null : average(closes.slice(i + 1 - n, i + 1))));
}

function rsi(closes, n = 14) {
  let gain = 0, loss = 0;
  for (let i = closes.length - n; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff > 0) gain += diff; else loss -= diff;
  }
  if (loss === 0) return 100;
  return 100 - 100 / (1 + gain / loss);
}

function annualVolatility(closes, n = 60) {
  const slice = closes.slice(-n - 1);
  const rets = slice.slice(1).map((c, i) => Math.log(c / slice[i]));
  const mean = average(rets);
  const variance = average(rets.map((r) => (r - mean) ** 2));
  return Math.sqrt(variance) * Math.sqrt(250) * 100;
}

// 각 신호: level = 'good' | 'neutral' | 'bad'
function analyzeStock(stock, closes) {
  const last = closes[closes.length - 1];
  const ma20 = average(closes.slice(-20));
  const ma60 = average(closes.slice(-60));
  const r = rsi(closes);
  const vol = annualVolatility(closes);
  const perRatio = stock.per / stock.sectorPer;

  const signals = [];

  if (last > ma20 && ma20 > ma60) {
    signals.push({ key: 'trend', title: '주가 흐름', level: 'good', verdict: '상승 흐름', text: '최근 가격이 1개월·3개월 평균보다 높아요. 오르는 방향으로 움직이고 있어요.', term: '이동평균선' });
  } else if (last < ma20 && ma20 < ma60) {
    signals.push({ key: 'trend', title: '주가 흐름', level: 'bad', verdict: '하락 흐름', text: '최근 가격이 1개월·3개월 평균보다 낮아요. 내리는 방향으로 움직이고 있어요.', term: '이동평균선' });
  } else {
    signals.push({ key: 'trend', title: '주가 흐름', level: 'neutral', verdict: '방향 탐색 중', text: '오르지도 내리지도 않고 뚜렷한 방향을 찾는 중이에요.', term: '이동평균선' });
  }

  if (r >= 70) {
    signals.push({ key: 'rsi', title: '단기 과열도', level: 'bad', verdict: `과열 (${r.toFixed(0)})`, text: '짧은 기간에 많이 올랐어요. 잠시 쉬어갈 수 있으니 서두르지 마세요.', term: 'RSI (상대강도지수)' });
  } else if (r <= 30) {
    signals.push({ key: 'rsi', title: '단기 과열도', level: 'neutral', verdict: `많이 하락 (${r.toFixed(0)})`, text: '짧은 기간에 많이 떨어졌어요. 반등할 수도, 더 떨어질 수도 있어요.', term: 'RSI (상대강도지수)' });
  } else {
    signals.push({ key: 'rsi', title: '단기 과열도', level: 'good', verdict: `적당함 (${r.toFixed(0)})`, text: '너무 뜨겁지도 차갑지도 않은 보통 상태예요.', term: 'RSI (상대강도지수)' });
  }

  if (vol < 25) {
    signals.push({ key: 'vol', title: '가격 출렁임', level: 'good', verdict: '안정적', text: `1년 기준 변동성 약 ${vol.toFixed(0)}%. 가격이 비교적 차분하게 움직여요.`, term: '변동성' });
  } else if (vol < 45) {
    signals.push({ key: 'vol', title: '가격 출렁임', level: 'neutral', verdict: '보통', text: `1년 기준 변동성 약 ${vol.toFixed(0)}%. 평범한 수준으로 오르내려요.`, term: '변동성' });
  } else {
    signals.push({ key: 'vol', title: '가격 출렁임', level: 'bad', verdict: '출렁임 큼', text: `1년 기준 변동성 약 ${vol.toFixed(0)}%. 하루에도 크게 오르내릴 수 있어 주의가 필요해요.`, term: '변동성' });
  }

  if (perRatio < 0.8) {
    signals.push({ key: 'value', title: '가격 수준(PER)', level: 'good', verdict: '업종 대비 저렴', text: `PER ${stock.per}배로 같은 업종 평균(${stock.sectorPer}배)보다 낮아요.`, term: 'PER (주가수익비율)' });
  } else if (perRatio > 1.2) {
    signals.push({ key: 'value', title: '가격 수준(PER)', level: 'bad', verdict: '업종 대비 비쌈', text: `PER ${stock.per}배로 같은 업종 평균(${stock.sectorPer}배)보다 높아요. 성장 기대가 반영됐을 수 있어요.`, term: 'PER (주가수익비율)' });
  } else {
    signals.push({ key: 'value', title: '가격 수준(PER)', level: 'neutral', verdict: '업종 평균 수준', text: `PER ${stock.per}배로 같은 업종 평균(${stock.sectorPer}배)과 비슷해요.`, term: 'PER (주가수익비율)' });
  }

  const score = signals.reduce((s, x) => s + (x.level === 'good' ? 1 : x.level === 'bad' ? -1 : 0), 0);
  let summary;
  if (score >= 2) summary = { level: 'good', emoji: '🙂', title: '전반적으로 양호한 상태예요', text: '흐름과 지표가 대체로 긍정적이에요. 그래도 한 번에 사기보다 나눠서 접근하는 게 안전해요.' };
  else if (score <= -2) summary = { level: 'bad', emoji: '🧐', title: '조심해서 볼 필요가 있어요', text: '부정적인 신호가 여러 개 보여요. 왜 그런지 뉴스와 실적을 먼저 확인해 보세요.' };
  else summary = { level: 'neutral', emoji: '🤔', title: '좋은 점과 아쉬운 점이 섞여 있어요', text: '아래 신호등을 하나씩 보면서 어떤 점이 좋고 나쁜지 확인해 보세요.' };

  return { signals, summary, ma20, ma60, rsi: r, vol };
}

function marketMood(changePct) {
  if (changePct > 1) return '😄 크게 올랐어요';
  if (changePct > 0.2) return '🙂 조금 올랐어요';
  if (changePct >= -0.2) return '😐 거의 그대로예요';
  if (changePct >= -1) return '😕 조금 내렸어요';
  return '😟 크게 내렸어요';
}
