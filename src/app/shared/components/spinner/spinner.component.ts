import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'white' | 'emerald' | 'forest' | 'gray' | 'current';

@Component({
  selector: 'app-spinner',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [],
  templateUrl: './spinner.component.html',
})
export class SpinnerComponent {
  readonly size = input<SpinnerSize>('sm');

  /** Color del trazo */
  readonly color = input<SpinnerColor>('current');

  /** Texto accesible para lectores de pantalla */
  readonly ariaLabel = input('Cargando...');

  readonly sizeClass = computed(() => {
    const map: Record<SpinnerSize, string> = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    };
    return map[this.size()];
  });

  readonly colorClass = computed(() => {
    const map: Record<SpinnerColor, string> = {
      white:   'text-white',
      emerald: 'text-emerald-600',
      forest:  'text-emerald-900',
      gray:    'text-gray-400',
      current: 'text-current',
    };
    return map[this.color()];
  });
}
