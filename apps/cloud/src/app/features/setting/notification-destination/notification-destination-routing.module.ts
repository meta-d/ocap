import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { EditDestinationComponent } from './edit-destination/edit-destination.component'
import { NotificationDestinationsComponent } from './notification-destinations/notification-destinations.component'

const routes: Routes = [
  {
    path: '',
    component: NotificationDestinationsComponent,
  },
  {
    path: ':id',
    component: EditDestinationComponent
  }
]

@NgModule({
  declarations: [],
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NotificationDestinationRoutingModule {}
