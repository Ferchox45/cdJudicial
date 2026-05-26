import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  OnInit,
  OnDestroy,
  inject,
  ChangeDetectorRef,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subject, takeUntil, filter, distinctUntilChanged } from 'rxjs';
import { CatalogoItem } from '../../models/catalogo-apelaciones.model';
import { CatalogosFacade } from '../../facades/catalogos.facade';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-panel-identificacion',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-formulario.component.html',
})
export class PanelIdentificacionComponent implements OnInit, OnDestroy {

  public catalogosFacade = inject(CatalogosFacade);
  private cdr = inject(ChangeDetectorRef);
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
  this.catalogosFacade.cargar(this.form, 'penal');
  this.catalogosFacade.escucharMunicipio(this.form, () => this.cdr.markForCheck());
  this.form.get('materiaId')?.valueChanges
    .pipe(
      filter(id => !!id && !!this.MATERIA_MAP[id]),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    )
    .subscribe(id => {
      const materia = this.MATERIA_MAP[id];
      this.catalogosFacade.cargar(this.form, materia);
    });
}

  ngOnDestroy(): void {
    this.destroy$.complete();
    this.destroy$.next();
    this.catalogosFacade.destruir();
  }
}
