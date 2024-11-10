import { FormGroup } from "@angular/forms";

export abstract class XpertConfigureToolComponent {
    abstract isValid(): boolean
    abstract isDirty(): boolean

    abstract formGroup: FormGroup
}