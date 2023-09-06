import { ISelectOption } from "@metad/ocap-angular/core";

export interface ITagOption<T = unknown> extends ISelectOption<T> {
    color?: string
}