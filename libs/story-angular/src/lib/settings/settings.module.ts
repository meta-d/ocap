import { NgModule } from '@angular/core'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { TranslateModule } from '@ngx-translate/core'
import { QuillModule } from 'ngx-quill'
import { PreferencesComponent } from './preferences/preferences.component'

@NgModule({
  declarations: [PreferencesComponent],
  imports: [
    MatIconModule,
    MatListModule,
    MatDialogModule,
    FormlyModule,
    QuillModule,
    TranslateModule,
    ButtonGroupDirective
  ],
  exports: [PreferencesComponent]
})
export class NxStorySettingsModule {}
