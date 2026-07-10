import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  input,
  output,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ReactiveFormsModule, FormGroup } from '@angular/forms';
import { filter, distinctUntilChanged } from 'rxjs';
import { CatalogosFacade } from '../../facades/catalogos.facade';
import { SpinnerComponent } from '../../../../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-panel-identificacion',
  standalone: true,
  imports: [ReactiveFormsModule, SpinnerComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './panel-identificacion.component.html',
})
export class PanelIdentificacionComponent implements OnInit {
  protected catalogosFacade = inject(CatalogosFacade);
  private destroyRef = inject(DestroyRef);

  readonly form = input.required<FormGroup>();
  readonly folioTentativo = input('');
  readonly cargando = input(false);
  readonly buscando = input(false);
  readonly busquedaExitosa = input(false);
  readonly esIndigena = input(false);
  readonly abierto = input(true);

  readonly toggleEvt = output<void>();
  readonly buscarEvt = output<void>();

  ngOnInit(): void {
    const form = this.form();
    this.catalogosFacade.escucharMunicipio(form);
    this.catalogosFacade.escucharApelacion(form);
    form
      .get('materiaId')
      ?.valueChanges.pipe(
        filter((id) => !!id),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((id) => {
        this.catalogosFacade.cargar(form, id);
      });
  }
}
