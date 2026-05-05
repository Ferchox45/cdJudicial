import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subject, takeUntil, filter, distinctUntilChanged } from 'rxjs';
import { CatalogoItem } from '../../../../../core/models';
import { CatalogosFacade } from '../../facades/catalogos.facade';

@Component({
  selector: 'app-panel-identificacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-formulario.component.html',
})
export class PanelIdentificacionComponent implements OnInit, OnDestroy {

  public catalogosFacade = inject(CatalogosFacade);

  private destroy$ = new Subject<void>();

  @Input() form!: FormGroup;
  @Input() folioTentativo = '';
  @Input() cargando = false;
  @Input() buscando = false;
  @Input() busquedaExitosa = false;
  @Input() esIndigena = false;
  @Input() abierto = true;

  @Input() materias:         CatalogoItem[] = [];
  @Input() apelaciones:      CatalogoItem[] = [];
  @Input() tiposApelaciones: CatalogoItem[] = [];
  @Input() tiposEscritos:    CatalogoItem[] = [];
  @Input() juzgados:         CatalogoItem[] = [];
  @Input() magistrados:      CatalogoItem[] = [];
  @Input() municipios:       CatalogoItem[] = [];
  @Input() localidades:      CatalogoItem[] = [];
  @Input() etnias:           CatalogoItem[] = [];

  @Output() toggleEvt = new EventEmitter<void>();
  @Output() buscarEvt = new EventEmitter<void>();

// Mapa fijo basado en lo que devuelve tu API
private readonly MATERIA_MAP: Record<number, string> = {
  5: 'penal',
  6: 'indigena',
};

ngOnInit(): void {
  // Carga inicial penal por defecto
  this.catalogosFacade.cargar(this.form, 'penal');

  this.form.get('materiaId')?.valueChanges
    .pipe(
      filter(id => !!id && !!this.MATERIA_MAP[id]),  // solo ids conocidos
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    )
    .subscribe(id => {
      const materia = this.MATERIA_MAP[id];
      this.catalogosFacade.cargar(this.form, materia);
    });
}

  ngOnDestroy(): void {
    this.destroy$.next();
    this.catalogosFacade.cargar(this.form, 'penal');
    this.destroy$.complete();
  }
}
