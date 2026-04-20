import { Component} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-main-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
})
export class MainHeaderComponent {
  userName = 'FERNANDO CONTRERAS';
  area = 'Área: Poder Judicial del estado de Oaxaca';
  perfil = 'Perfil: Oficialía Salas';
  subArea = 'SubArea: Secretaría 1';
}
