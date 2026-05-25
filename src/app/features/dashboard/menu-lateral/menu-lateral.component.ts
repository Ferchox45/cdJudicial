import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { input, output } from '@angular/core';
@Component({
  selector: 'app-menulateral',
  standalone: true,
  templateUrl: './menu-lateral.component.html',
  imports: [RouterLink, RouterLinkActive],
})

export class MenulateralComponent {
// Recibe si debe estar abierto desde el Padre
  isOpen = input(false);

  // Emite un evento al Padre cuando un enlace o el overlay es presionado
  closeMenu = output<void>();
}
