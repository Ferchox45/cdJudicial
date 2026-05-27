import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerColor = 'white' | 'emerald' | 'forest' | 'gray' | 'current';

@Component({
  selector: 'app-spinner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner.component.html',
})
export class SpinnerComponent {
  @Input() size: SpinnerSize = 'sm';

  /** Color del trazo */
  @Input() color: SpinnerColor = 'current';

  /** Texto accesible para lectores de pantalla */
  @Input() ariaLabel = 'Cargando...';

  get sizeClass(): string {
    const map: Record<SpinnerSize, string> = {
      xs: 'h-3 w-3',
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
      xl: 'h-8 w-8',
    };
    return map[this.size];
  }

  get colorClass(): string {
    const map: Record<SpinnerColor, string> = {
      white:   'text-white',
      emerald: 'text-emerald-600',
      forest:  'text-emerald-900',
      gray:    'text-gray-400',
      current: 'text-current',
    };
    return map[this.color];
  }
}
