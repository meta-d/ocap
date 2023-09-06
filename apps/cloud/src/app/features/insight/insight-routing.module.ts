import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PACInsgihtBoardComponent } from './board/board.component';

const routes: Routes = [
  {
    path: '',
    component: PACInsgihtBoardComponent,
  },
]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PACInsightRoutingModule { }
