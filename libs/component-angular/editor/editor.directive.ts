import { Directive } from '@angular/core'
import { NgmBaseEditorDirective } from '@metad/ocap-angular/formula/editor.directive'

@Directive({
  selector: '[ngmEditor]'
})
export class BaseEditorDirective extends NgmBaseEditorDirective {}
