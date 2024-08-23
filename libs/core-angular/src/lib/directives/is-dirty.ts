import { Observable } from "rxjs";

export interface IsDirty {
    isDirty(): boolean;
    /**
     * @deprecated use isDirty function instead
     */
    isDirty$?: Observable<boolean> | boolean | (() => boolean);
}
