import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { Component } from '@angular/core'
import { FormArray } from '@angular/forms';
import { FieldArrayType } from '@ngx-formly/core'

@Component({
  selector: 'pac-formly-array',
  template: `
<div class="nx-formly__title">{{ to.label }}</div>
<div class="nx-formly-cdk__drag-list flex flex-col justify-start items-stretch" [class.empty]="!field.fieldGroup?.length" 
  cdkDropList
  (cdkDropListDropped)="drop($event)">

  <button *ngIf="!field.fieldGroup?.length" mat-button color="primary" type="button" (click)="add()">
    <div class="flex items-center">
      <mat-icon>add</mat-icon>{{ 'FORMLY.COMMON.ADD' | translate: {Default: 'Add'} }} {{to.label}}
    </div>
  </button>

  <div *ngFor="let field of field.fieldGroup; let i = index;" class="nx-formly__array-row"
    cdkDragBoundary=".nx-formly-cdk__drag-list" cdkDrag>

    <formly-field class="flex-1" [field]="field"></formly-field>

    <button *ngIf="!to.disableDelete" class="nx-formly__remove" mat-icon-button color="warn" (click)="remove(i)">
      <mat-icon>clear</mat-icon>
    </button>

    <div class="nx-formly-cdk__drag-placeholder" *cdkDragPlaceholder></div>
  </div>
</div>

<button *ngIf="field.fieldGroup?.length" mat-button color="primary" type="button" ngmAppearance="dashed" (click)="add()">
  <div class="flex items-center">
    <mat-icon>add</mat-icon>
    <span>{{ 'FORMLY.COMMON.ADD' | translate: {Default: 'Add'} }} {{to.label}}</span>
  </div>
</button>
`,
  host: {
    class: 'pac-formly-array'
  },
  styles: [
`
:host {
  flex: 1;
}
.nx-formly-cdk__drag-placeholder {
  min-height: 60px;
}
`,
  ]
})
export class NxFormlyArrayComponent extends FieldArrayType {

  drop(event: CdkDragDrop<string[]>) {
    if (!Array.isArray(this.field.fieldGroup) || !Array.isArray(this.field.model)) {
      throw new Error(`fieldGroup or model is not an array`)
    }
    moveItemInArray(this.field.fieldGroup, event.previousIndex, event.currentIndex)
    this.field.fieldGroup.forEach((fieldGroup, i) => fieldGroup.key = `${i}`)
    // done: 在某些情况下下面两行会造成重复操作的问题 ??
    moveItemInArray(this.field.model, event.previousIndex, event.currentIndex)
    moveItemInArray((this.field.formControl as FormArray).controls, event.previousIndex, event.currentIndex)
    this.field.formControl.setValue(this.field.model.map(value => value ?? {}))
  }
}
