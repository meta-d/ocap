import { Observable } from "rxjs";

export interface IsDirty {
    isDirty(): boolean;

    isDirty$?: Observable<boolean> | boolean | (() => boolean);
}
