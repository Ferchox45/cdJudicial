import { ChartSlice } from '../../../models/estadisticas';
import { getChartColor } from './grafica-colors';

// ── Dona visible en pantalla ──────────────────────────────────────────────────

export function drawDona(canvas: HTMLCanvasElement, slices: ChartSlice[]): void {
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;

  const W  = canvas.width;
  const H  = canvas.height;
  const cx = W / 2;
  const cy = H / 2;
  const R  = Math.min(W, H) / 2 - 20;
  const r  = R * 0.52;

  ctx.clearRect(0, 0, W, H);

  const total = slices.reduce((s, c) => s + c.value, 0);
  let startAngle = -Math.PI / 2;

  slices.forEach((slice, i) => {
    const angle    = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle   = getChartColor(i);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 2;
    ctx.stroke();

    startAngle = endAngle;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#374151';
  ctx.font         = 'bold 22px sans-serif';
  ctx.fillText(String(total), cx, cy - 8);
  ctx.fillStyle = '#9ca3af';
  ctx.font      = '11px sans-serif';
  ctx.fillText('Total', cx, cy + 14);
}

// ── Imagen completa para Excel (offscreen) ────────────────────────────────────

export async function getDonaImageBase64(
  slices: ChartSlice[],
  title: string,
  total: number
): Promise<string | null> {
  if (!slices.length) return null;

  const W   = 800;
  const H   = Math.max(420, 80 + slices.length * 24 + 60);
  const cvs = document.createElement('canvas');
  cvs.width  = W;
  cvs.height = H;
  const ctx  = cvs.getContext('2d', { willReadFrequently: true })!;

  _drawBackground(ctx, W, H);
  _drawTitle(ctx, title);
  _drawDonaOffscreen(ctx, slices, total, H);
  _drawLeyenda(ctx, slices, total, W);
  _drawFooter(ctx, total, W, H);

  return cvs.toDataURL('image/png');
}

// ── Helpers privados del offscreen ───────────────────────────────────────────

function _drawBackground(ctx: CanvasRenderingContext2D, W: number, H: number): void {
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, W, H);
}

function _drawTitle(ctx: CanvasRenderingContext2D, title: string): void {
  ctx.fillStyle = '#1B4332';
  ctx.fillRect(24, 20, 4, 22);
  ctx.fillStyle    = '#374151';
  ctx.font         = 'bold 14px sans-serif';
  ctx.textBaseline = 'middle';
  ctx.textAlign    = 'left';
  ctx.fillText(title, 36, 31);
}

function _drawDonaOffscreen(
  ctx: CanvasRenderingContext2D,
  slices: ChartSlice[],
  total: number,
  H: number
): void {
  const cx = 170;
  const cy = H / 2;
  const R  = 110;
  const r  = R * 0.52;

  let startAngle = -Math.PI / 2;

  slices.forEach((slice, i) => {
    const angle    = (slice.value / total) * 2 * Math.PI;
    const endAngle = startAngle + angle;

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, R, startAngle, endAngle);
    ctx.closePath();
    ctx.fillStyle   = getChartColor(i);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth   = 2;
    ctx.stroke();

    startAngle = endAngle;
  });

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, 2 * Math.PI);
  ctx.fillStyle = '#ffffff';
  ctx.fill();

  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#374151';
  ctx.font         = 'bold 28px sans-serif';
  ctx.fillText(String(total), cx, cy - 10);
  ctx.fillStyle = '#9ca3af';
  ctx.font      = '13px sans-serif';
  ctx.fillText('Total', cx, cy + 16);
}

function _drawLeyenda(
  ctx: CanvasRenderingContext2D,
  slices: ChartSlice[],
  total: number,
  W: number
): void {
  const legendX = 320;
  let   legendY = 80;

  slices.forEach((slice, i) => {
    const pct = ((slice.value / total) * 100).toFixed(1);

    ctx.beginPath();
    ctx.arc(legendX + 8, legendY, 7, 0, 2 * Math.PI);
    ctx.fillStyle = getChartColor(i);
    ctx.fill();

    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle    = '#4b5563';
    ctx.font         = '12px sans-serif';
    ctx.fillText(slice.label, legendX + 22, legendY);

    ctx.fillStyle = '#111827';
    ctx.font      = 'bold 12px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(String(slice.value), W - 90, legendY);

    ctx.fillStyle = '#9ca3af';
    ctx.font      = '12px sans-serif';
    ctx.fillText(`(${pct}%)`, W - 20, legendY);

    legendY += 24;
  });
}

function _drawFooter(
  ctx: CanvasRenderingContext2D,
  total: number,
  W: number,
  H: number
): void {
  ctx.strokeStyle = '#e5e7eb';
  ctx.lineWidth   = 1;
  ctx.beginPath();
  ctx.moveTo(24, H - 40);
  ctx.lineTo(W - 24, H - 40);
  ctx.stroke();

  ctx.textAlign    = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle    = '#6b7280';
  ctx.font         = '12px sans-serif';
  ctx.fillText('Total', 24, H - 22);

  ctx.textAlign = 'right';
  ctx.fillStyle = '#111827';
  ctx.font      = 'bold 13px sans-serif';
  ctx.fillText(String(total), W - 24, H - 22);
}