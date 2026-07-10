import { HomeComponent } from '../home/home.component';
import { MenulateralComponent } from '../menu-lateral/menu-lateral.component';
import { MainHeaderComponent } from '../header/header.component';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-dashboard-layout',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MenulateralComponent, MainHeaderComponent, RouterOutlet],
  templateUrl: './dashboard.component.html',
})
export class DashboardLayoutComponent {
  sidebarExpanded = signal(false);
  isMobileMenuOpen = signal(false);
}
