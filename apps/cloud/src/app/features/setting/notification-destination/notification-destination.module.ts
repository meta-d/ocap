import { NgModule } from '@angular/core'
import { FormlyModule } from '@ngx-formly/core'
import { FormlyMaterialModule } from '@ngx-formly/material'
import { MaterialModule, SharedModule } from '../../../@shared'
import { EditDestinationComponent } from './edit-destination/edit-destination.component'
import { NewNotificationDestinationComponent } from './new-notification-destination/new-notification-destination.component'
import { NotificationDestinationRoutingModule } from './notification-destination-routing.module'
import { NotificationDestinationsComponent } from './notification-destinations/notification-destinations.component'

@NgModule({
  imports: [
    SharedModule,
    MaterialModule,
    FormlyModule,
    FormlyMaterialModule,
    NotificationDestinationRoutingModule
  ],
  exports: [],
  declarations: [NotificationDestinationsComponent, NewNotificationDestinationComponent, EditDestinationComponent],
  providers: []
})
export class NotificationDestinationModule {}
