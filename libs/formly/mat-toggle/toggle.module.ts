import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormlyModule } from '@ngx-formly/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { NgmFormlyToggleComponent } from './toggle.type';

@NgModule({
  declarations: [NgmFormlyToggleComponent],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'toggle',
          component: NgmFormlyToggleComponent,
          // wrappers: ['form-field'],
        },
      ],
    }),
  ],
})
export class NgmFormlyMatToggleModule {}
