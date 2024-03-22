import { Routes } from '@angular/router'
import { CopilotComponent } from './copilot.component'

export const routes = [
  {
    path: '',
    redirectTo: 'copilot',
    pathMatch: 'full'
  },
  {
    path: 'copilot',
    component: CopilotComponent
  }
] as Routes