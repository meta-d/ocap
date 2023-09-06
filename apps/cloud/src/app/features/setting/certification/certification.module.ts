import { NgModule } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule } from '../../../@shared'
import { CertificationRoutingModule } from './certification-routing.module'

@NgModule({
  imports: [CertificationRoutingModule, TranslateModule, MaterialModule, FormsModule, ReactiveFormsModule],
  declarations: [],
  providers: []
})
export class CertificationModule {}
