import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';

import { FormlyMatFormFieldModule } from '@ngx-formly/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { NgmFormlyCheckboxComponent } from './checkbox.type';

@NgModule({
  declarations: [NgmFormlyCheckboxComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,

    MatCheckboxModule,

    FormlyMatFormFieldModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'checkbox',
          component: NgmFormlyCheckboxComponent,
          // wrappers: ['form-field'],
        },
        {
          name: 'boolean',
          extends: 'checkbox',
        },
      ],
    }),
  ],
})
export class NgmFormlyMatCheckboxModule {}
