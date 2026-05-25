import { Injectable, inject, signal } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs';

export interface BreadcrumbItem { label: string; url: string; }

@Injectable({ providedIn: 'root' })
export class BreadcrumbService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);

  breadcrumbs = signal<BreadcrumbItem[]>([]);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      const root = this.activatedRoute.root;
      let crumbs = this.createBreadcrumbs(root);

      // 1. FORZAR "Inicio" AL PRINCIPIO SIEMPRE
      // Si la lista está vacía o el primer elemento no es inicio, lo agregamos
      if (crumbs.length === 0 || crumbs[0].label !== 'Inicio') {
        crumbs.unshift({ label: 'Inicio', url: '/inicio' });
      }

      this.breadcrumbs.set(crumbs);
    });
  }

  private createBreadcrumbs(route: ActivatedRoute, url: string = '', breadcrumbs: BreadcrumbItem[] = []): BreadcrumbItem[] {
    const children: ActivatedRoute[] = route.children;
    if (children.length === 0) return breadcrumbs;

    for (const child of children) {
      const routeURL: string = child.snapshot.url.map(segment => segment.path).join('/');
      if (routeURL !== '') url += `/${routeURL}`;

      const label = child.snapshot.data['breadcrumb'];

      // 2. EVITAR DUPLICADOS
      // Solo lo agregamos si NO es exactamente igual al último que acabamos de meter
      if (label && (breadcrumbs.length === 0 || breadcrumbs[breadcrumbs.length - 1].label !== label)) {
        breadcrumbs.push({ label, url: url || '/' });
      }

      return this.createBreadcrumbs(child, url, breadcrumbs);
    }
    return breadcrumbs;
  }
}
