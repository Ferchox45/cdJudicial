import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-action-card',
  standalone: true,
  templateUrl: './action.card.component.html',
  imports: [RouterLink]
})
export class ActionCardComponent {
  title = input.required<string>();
  description = input.required<string>();
  ruta = input.required<string>();
}
