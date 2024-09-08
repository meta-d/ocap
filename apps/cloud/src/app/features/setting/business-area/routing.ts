import { Routes } from '@angular/router'
import { BusinessAreaComponent } from './business-area.component'
import { EditBusinessAreaComponent } from './business-area/business-area.component'
import { AnalyticsPermissionsEnum } from '../../../@core'

export const routes: Routes = [
  {
    path: '',
    component: BusinessAreaComponent,
    data: {
      title: 'Settings / BusinessArea',
      permissions: {
        only: [AnalyticsPermissionsEnum.BUSINESS_AREA_EDIT],
        redirectTo: '/settings'
      }
    },
    children: [
      {
        path: ':id',
        component: EditBusinessAreaComponent
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
      }
    ]
  }
]
