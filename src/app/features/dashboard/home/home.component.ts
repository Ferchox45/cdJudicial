import { ActionCardComponent } from './../action-card/action-card.component';
import { Component } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [ActionCardComponent],
  templateUrl: './home.component.html',
})
export class HomeComponent {}
