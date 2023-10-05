import { NgModule } from '@angular/core'
import { RouterModule, Routes } from '@angular/router'
import { StructuredOutputComponent } from './structured-output/structured-output.component'
import { CopilotComponent } from './copilot/copilot.component'

const routes: Routes = [
  {
    path: '',
    redirectTo: 'copilot',
    pathMatch: 'full'
  },
  {
    path: 'copilot',
    component: CopilotComponent
  },
  {
    path: 'structured',
    component: StructuredOutputComponent
  }
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LangChainRoutingModule {}
