import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { MatTabsModule } from '@angular/material/tabs'
import { FormlyModule } from '@ngx-formly/core'
import { PACFormlyTabGroupComponent } from './tab-group.component'

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatTabsModule,
    MatIconModule,
    FormlyModule.forChild({
      types: [
        {
          name: 'tabs',
          component: PACFormlyTabGroupComponent
        }
      ]
    })
  ],
  exports: [PACFormlyTabGroupComponent],
  declarations: [PACFormlyTabGroupComponent],
  providers: []
})
export class PACFormlyMatTabGroupModule {}
