import { ActionCardComponent } from './../action-card/action-card.component';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ActionCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {

}
