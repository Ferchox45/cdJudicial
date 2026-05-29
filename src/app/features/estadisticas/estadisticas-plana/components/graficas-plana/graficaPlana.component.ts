import { ChangeDetectionStrategy, Component, input, computed, ElementRef, viewChild, effect } from '@angular/core';
import { ChartSlice } from '../../models/estadisticas';
import { drawDona, getDonaImageBase64 } from './utils/dona.painter';
import { getChartColor } from './utils/grafica-colors';

@Component({
  selector: 'app-grafica-totales',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './graficaPlana.component.html',
})
export class GraficaTotalesComponent {

  chartData  = input<ChartSlice[] | undefined>();
  chartTitle = input<string | undefined>();

  readonly chartCanvas = viewChild<ElementRef<HTMLCanvasElement>>('chartCanvas');

  readonly slices = computed(() => this.chartData() ?? []);
  readonly total  = computed(() => this.slices().reduce((s, c) => s + c.value, 0));

  // Expuesto al template para los badges de leyenda
  getColor = getChartColor;

  pct(value: number): string {
    const t = this.total();
    return t ? ((value / t) * 100).toFixed(1) : '0';
  }

  constructor() {
    effect(() => {
      const slices = this.slices();
      const canvas = this.chartCanvas()?.nativeElement;
      if (!canvas || !slices.length) return;
      setTimeout(() => drawDona(canvas, slices), 0);
    });
  }

  async getImageBase64(): Promise<string | null> {
    return getDonaImageBase64(this.slices(), this.chartTitle() ?? '', this.total());
  }
}