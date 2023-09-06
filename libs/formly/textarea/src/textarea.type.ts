import { Component, ChangeDetectionStrategy, Type } from '@angular/core';
import { FieldTypeConfig, FormlyFieldConfig } from '@ngx-formly/core';
import { FieldType, FormlyFieldProps } from '@ngx-formly/material/form-field';
import { MAT_INPUT_VALUE_ACCESSOR } from '@angular/material/input';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { EntitySchemaType } from '@metad/ocap-angular/entity';

interface TextAreaProps extends FormlyFieldProps {
  autosize?: boolean;
  autosizeMinRows?: number;
  autosizeMaxRows?: number;
  dropEntity?: boolean;
}

export interface FormlyTextAreaFieldConfig extends FormlyFieldConfig<TextAreaProps> {
  type: 'textarea' | Type<FormlyFieldTextArea>;
}

@Component({
  selector: 'formly-field-mat-textarea',
  template: `
<label *ngIf="props?.label" class="p-1 text-sm text-ellipsis whitespace-nowrap overflow-hidden">{{to.label}}</label>
<textarea 
  matInput
  [id]="id"
  [readonly]="props.readonly"
  [required]="required"
  [formControl]="formControl"
  [errorStateMatcher]="errorStateMatcher"
  [cols]="props.cols"
  [rows]="props.rows"
  [formlyAttributes]="field"
  [placeholder]="props.placeholder"
  [tabindex]="props.tabindex"
  [cdkTextareaAutosize]="props.autosize"
  [cdkAutosizeMinRows]="props.autosizeMinRows"
  [cdkAutosizeMaxRows]="props.autosizeMaxRows"
  [class.cdk-textarea-autosize]="props.autosize"

  cdkDropList
  [cdkDropListData]="[]"
  [cdkDropListDisabled]="!props.dropEntity"
  (cdkDropListDropped)="drop($event)"
>
</textarea>
  `,
  providers: [
    // fix for https://github.com/ngx-formly/ngx-formly/issues/1688
    // rely on formControl value instead of elementRef which return empty value in Firefox.
    { provide: MAT_INPUT_VALUE_ACCESSOR, useExisting: FormlyFieldTextArea },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styleUrls: ['./textarea.type.scss'],
})
export class FormlyFieldTextArea extends FieldType<FieldTypeConfig<TextAreaProps>> {
  override defaultOptions = {
    props: {
      cols: 1,
      rows: 1,
    },
  };

  drop(event: CdkDragDrop<Array<{ name: string }>>) {
    let text = ''
    if (event.item.data.type === EntitySchemaType.Parameter) {
      text = `[@${event.item.data.name}]`
    } else if (event.item.data.type === EntitySchemaType.IMeasure) {
      text = `[#${event.item.data.name}]`
    }

    if (text) {
      this.formControl.setValue(this.formControl.value + text);
    }
  }
}
