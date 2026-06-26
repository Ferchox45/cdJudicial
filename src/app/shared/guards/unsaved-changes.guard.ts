import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { ModalService } from '../components/modal-custom/services/modal.service';
import { OnUnsavedChanges } from './on-unsaved-changes';

export const unsavedChangesGuard: CanDeactivateFn<OnUnsavedChanges> = (component) => {
  if (!component.hasUnsavedChanges()) {
    return true;
  }

  const modal = inject(ModalService);

  return modal.confirm(
    'Cambios no guardados',
    'Tienes cambios sin guardar. ¿Estás seguro de que deseas salir?',
    'Salir',
    'Cancelar',
  );
};
