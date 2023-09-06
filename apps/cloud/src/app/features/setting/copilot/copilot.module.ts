import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from '../../../@shared'
import { CopilotRoutingModule } from './copilot-routing.module'
import { CopilotComponent } from './copilot.component'

@NgModule({
  imports: [CopilotRoutingModule, TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule],
  declarations: [CopilotComponent],
  providers: []
})
export class CopilotModule {}
