import { NgModule } from '@angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { MaterialModule, SharedModule } from '../../../@shared'
import { SMTPComponent } from '../../../@shared/smtp/smtp.component'
import { CustomSmtpRoutingModule } from './custom-smtp-routing.module'
import { CustomSmtpComponent } from './custom-smtp.component'

@NgModule({
  imports: [CustomSmtpRoutingModule, TranslateModule, SharedModule, MaterialModule, SMTPComponent],
  declarations: [CustomSmtpComponent],
  providers: []
})
export class CustomSmtpModule {}
