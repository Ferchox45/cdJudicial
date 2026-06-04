import { ActionCardComponent } from './../../../../dashboard/components/action-card/action-card.component';
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

import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { Subject, takeUntil, filter, distinctUntilChanged } from 'rxjs';
import { CatalogosFacade } from '../../facades/catalogos.facade';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-panel-identificacion',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-identificacion.component.html',
})
export class PanelIdentificacionComponent implements OnInit, OnDestroy {

  protected catalogosFacade = inject(CatalogosFacade);
  private destroy$ = new Subject<void>();

  @Input() form!: FormGroup;
  @Input() folioTentativo = '';
  @Input() cargando = false;
  @Input() buscando = false;
  @Input() busquedaExitosa = false;
  @Input() esIndigena = false;
  @Input() abierto = true;

  @Output() toggleEvt = new EventEmitter<void>();
  @Output() buscarEvt = new EventEmitter<void>();

private readonly MATERIA_MAP: Record<number, string> = {
  5: 'penal',
  6: 'indigena',
};

ngOnInit(): void {
  this.catalogosFacade.escucharMunicipio(this.form);
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
