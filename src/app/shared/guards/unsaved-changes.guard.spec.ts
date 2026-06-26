import { TestBed } from '@angular/core/testing';
import { unsavedChangesGuard } from './unsaved-changes.guard';
import { ModalService } from '../components/modal-custom/services/modal.service';
import { OnUnsavedChanges } from './on-unsaved-changes';

describe('unsavedChangesGuard', () => {
  const createComponent = (hasChanges: boolean): OnUnsavedChanges => ({
    hasUnsavedChanges: () => hasChanges,
  });

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [ModalService],
    });
  });

  it('should allow navigation when no unsaved changes', () => {
    const component = createComponent(false);
    const result = unsavedChangesGuard(component, null as any, null as any);
    expect(result).toBe(true);
  });

  it('should show confirmation dialog when there are unsaved changes', () => {
    const component = createComponent(true);
    const result = TestBed.runInInjectionContext(() =>
      unsavedChangesGuard(component, null as any, null as any)
    ) as any;
    expect(typeof result.subscribe).toBe('function');
  });
});
