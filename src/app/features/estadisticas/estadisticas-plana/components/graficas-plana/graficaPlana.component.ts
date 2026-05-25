import { Component, input, computed, ElementRef, viewChild, effect } from '@angular/core';
import { ChartSlice } from '../../../../../core/models/estadisticas';

@Component({
  selector: 'app-grafica-totales',
  standalone: true,
  templateUrl: './graficaPlana.component.html',
})
export class GraficaTotalesComponent {

  chartData  = input<ChartSlice[] | undefined>();
  chartTitle = input<string | undefined>();

  readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  readonly COLORS = [
    '#6366f1', '#f59e0b', '#10b981', '#e11d48', '#0ea5e9',
    '#a855f7', '#84cc16', '#f97316', '#06b6d4', '#ec4899',
    '#22c55e', '#eab308', '#3b82f6', '#d946ef', '#14b8a6',
    '#ef4444', '#8b5cf6', '#64748b', '#2dd4bf', '#f43f5e',
  ];

  readonly slices = computed(() => this.chartData() ?? []);
  readonly total  = computed(() => this.slices().reduce((s, c) => s + c.value, 0));

  pct(value: number): string {
    const t = this.total();
    return t ? ((value / t) * 100).toFixed(1) : '0';
  }

  getColor(index: number): string {
    const order = [0, 5, 10, 15, 1, 6, 11, 16, 2, 7, 12, 17, 3, 8, 13, 18, 4, 9, 14, 19];
    return this.COLORS[order[index % order.length]];
  }

  constructor() {
    effect(() => {
      const slices = this.slices();
      const canvas = this.chartCanvas()?.nativeElement;
      if (!canvas || !slices.length) return;
      setTimeout(() => this.draw(canvas, slices), 0);
    });
  }

  // ── Dona visible en pantalla ───────────────────────────────────
  private draw(canvas: HTMLCanvasElement, slices: ChartSlice[]) {
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
      ctx.fillStyle   = this.getColor(i);
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

  // ── Imagen completa para Excel (offscreen, sin bloquear UI) ───
  async getImageBase64(): Promise<string | null> {
    const slices = this.slices();
    const title  = this.chartTitle() ?? '';
    const total  = this.total();

    if (!slices.length) return null;

    const W   = 800;
    const H   = Math.max(420, 80 + slices.length * 24 + 60); // altura dinámica
    const cvs = document.createElement('canvas');
    cvs.width  = W;
    cvs.height = H;
    const ctx  = cvs.getContext('2d', { willReadFrequently: true })!;

    // Fondo
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);

    // Título
    ctx.fillStyle = '#1B4332';
    ctx.fillRect(24, 20, 4, 22);
    ctx.fillStyle    = '#374151';
    ctx.font         = 'bold 14px sans-serif';
    ctx.textBaseline = 'middle';
    ctx.textAlign    = 'left';
    ctx.fillText(title, 36, 31);

    // Dona
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
      ctx.fillStyle   = this.getColor(i);
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

    // Leyenda
    const legendX = 320;
    let   legendY = 80;

    slices.forEach((slice, i) => {
      const pct = ((slice.value / total) * 100).toFixed(1);

      ctx.beginPath();
      ctx.arc(legendX + 8, legendY, 7, 0, 2 * Math.PI);
      ctx.fillStyle = this.getColor(i);
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

    // Separador total
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

    return cvs.toDataURL('image/png');
  }
}
