import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatCommonModule } from '@angular/material/core'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyFieldSortComponent } from './sort.type'

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    MatCommonModule,
    FormsModule,
    ReactiveFormsModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'sort',
          component: FormlyFieldSortComponent
        }
      ]
    })
  ],
  schemas: []
})
export class PACFormlySortModule {}
