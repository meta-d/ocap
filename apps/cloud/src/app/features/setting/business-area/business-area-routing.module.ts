import { CommonModule } from '@angular/common'
import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { BusinessAreaInfoFormComponent } from './area-info-form/area-info-form.component'
import { BusinessAreaUsersComponent } from './area-users/area-users.component'
import { BusinessAreaComponent } from './business-area.component'
import { EditBusinessAreaComponent } from './business-area/business-area.component'
import { BusinessAreasComponent } from './business-areas/areas.component'

const routes: Routes = [
  {
    path: '',
    component: BusinessAreaComponent,
    data: {
      title: 'Settings / BusinessArea'
    },
    children: [

      {
        path: ':id',
        component: EditBusinessAreaComponent,
        // children: [
        //   {
        //     path: '',
        //     component: BusinessAreaInfoFormComponent
        //   },
        //   {
        //     path: 'users',
        //     component: BusinessAreaUsersComponent
        //   }
        // ]
      },
      {
        path: '',
        component: BusinessAreasComponent
      },
    ]
  }
]

@NgModule({
  imports: [CommonModule, RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class BusinessAreasRoutingModule {}
