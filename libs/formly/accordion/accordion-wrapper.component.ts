import { Component } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { FieldWrapper, FormlyFieldConfig } from '@ngx-formly/core';

@Component({
  selector: 'ngm-formly-accordion',
  templateUrl: './accordion-wrapper.component.html',
  styleUrls: ['./accordion-wrapper.component.scss'],
  host: {
    class: 'ngm-formly-accordion',
  },
})
export class NgmFormlyAccordionComponent<
  F extends FormlyFieldConfig = FormlyFieldConfig
> extends FieldWrapper<F> {
  onToggle(
    event: MatSlideToggleChange,
    field: FormlyFieldConfig,
    expansionPanel: MatExpansionPanel
  ) {
    this.formControl.patchValue({
      [field.props.keyShow]: event.checked,
    });

    if (this.formControl.value[field.props.keyShow]) {
      expansionPanel?.open();
    } else {
      expansionPanel?.close();
    }
  }
}
