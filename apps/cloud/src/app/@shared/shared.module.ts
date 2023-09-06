import { CommonModule } from '@angular/common'
import { ModuleWithProviders, NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { AbilityModule } from '@casl/angular'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { LetModule, LetDirective } from '@ngrx/component'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from './material.module'
import { CreatedByPipe, UserPipe } from './pipes/index'
import { TagEditorComponent, TagViewerComponent } from './tag'

const Modules = [
  TranslateModule,
  FormsModule,
  ReactiveFormsModule,
  AbilityModule,

  OcapCoreModule,
  LetModule
]

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    ...Modules,
    CreatedByPipe,
    UserPipe,
    TagEditorComponent,
    TagViewerComponent
  ],
  exports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    ...Modules,
    UserPipe,
    CreatedByPipe,
    TagEditorComponent,
    TagViewerComponent
  ],
  providers: []
})
export class SharedModule {
  static forRoot(): ModuleWithProviders<SharedModule> {
    return {
      ngModule: SharedModule,
      providers: []
    }
  }
}
