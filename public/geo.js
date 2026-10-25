// 前後端共用的地理與顯示小工具(純函式,方便測試)。

export const DAY_COLORS = ['#2f6fb0', '#c93d27', '#2f8a6b', '#8a5aa8', '#c9702a', '#0f8b8d', '#b5446e', '#6b7a1f'];
export const dayColor = (day) => (day > 0 ? DAY_COLORS[(day - 1) % DAY_COLORS.length] : '#8a8a8a');

export const hasCoord = (p) => p && Number.isFinite(p.lat) && Number.isFinite(p.lng);

export function haversineKm(a, b) {
  const R = 6371;
  const rad = (d) => (d * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// 沒有路網資料,所以只是「估算」:直線距離乘 1.3 當路程;
// 1.2 公里內視為步行(每分鐘 75 公尺),再遠視為大眾運輸/開車(時速約 28 公里,另加 8 分鐘等候)。
export function estimateTravel(a, b) {
  const road = haversineKm(a, b) * 1.3;
  if (road <= 1.2) return { mode: 'walk', km: road, min: Math.max(1, Math.round((road * 1000) / 75)) };
  return { mode: 'transit', km: road, min: Math.round(8 + (road / 28) * 60) };
}

export function fmtKm(km) {
  return km < 1 ? `${Math.max(10, Math.round(km * 100) * 10)} 公尺` : `${km < 10 ? km.toFixed(1) : Math.round(km)} 公里`;
}

export function fmtMin(min) {
  if (min < 60) return `${min} 分鐘`;
  const h = Math.floor(min / 60), m = min % 60;
  return m ? `${h} 小時 ${m} 分` : `${h} 小時`;
}

export function directionsUrl(a, b, mode) {
  const p = (x) => `${x.lat},${x.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${p(a)}&destination=${p(b)}&travelmode=${mode === 'walk' ? 'walking' : 'transit'}`;
}

export const money = (n) => `¥${Math.round(Number(n)).toLocaleString('en-US')}`;

const WEEK = ['日', '一', '二', '三', '四', '五', '六'];
// start: 'YYYY-MM-DD';day 從 1 開始。沒有出發日期就回 null。
export function dayDateLabel(start, day) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(start || '');
  if (!m) return null;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3] + day - 1));
  return `${d.getUTCMonth() + 1}/${d.getUTCDate()}(${WEEK[d.getUTCDay()]})`;
}

// 一鍵複製的行程文字,方便貼到 LINE
export function tripText(trip) {
  const lines = [trip.name];
  const total = trip.items.reduce((s, i) => s + (i.cost || 0), 0);
  if (total) lines.push(`預估花費 ${money(total)}`);
  // 先排好的每一天,「還沒安排」放最後
  for (const d of [...Array.from({ length: trip.days }, (_, i) => i + 1), 0]) {
    const items = trip.items.filter((i) => i.day === d);
    if (!items.length) continue;
    lines.push('');
    lines.push(d === 0 ? '【還沒安排】' : `【第 ${d} 天${dayDateLabel(trip.start_date, d) ? ' ' + dayDateLabel(trip.start_date, d) : ''}】`);
    if (d > 0 && trip.tips?.[d]) lines.push(`💡 ${trip.tips[d]}`);
    for (const i of items) {
      lines.push(`${i.time ? i.time + ' ' : '・'}${i.name}${i.cost ? `(${money(i.cost)})` : ''}${i.note ? ` — ${i.note}` : ''}`);
    }
  }
  return lines.join('\n');
}
