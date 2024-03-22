import { Observable } from 'rxjs';

/**
 * @deprecated use {@link IsDirty}
 */
export interface DirtyComponent {
  isDirty$: Observable<boolean> | boolean | (() => boolean);
}
