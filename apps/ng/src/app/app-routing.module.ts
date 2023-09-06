import { NgModule } from '@angular/core'
import { ExtraOptions, PreloadAllModules, RouterModule, Routes } from '@angular/router'
import { ChartsComponent } from './charts/charts.component'
import { ExplorerComponent } from './explorer/explorer.component'
import { FoodMartComponent } from './foodmart/foodmart.component'
import { QueryLabComponent } from './query-lab/query-lab.component'

const routes: Routes = [
  // {
  //   path: 'auth',
  //   loadChildren: () => import('@metad/cloud/auth').then((m) => m.PacAuthModule)
  // },
  // { path: 'sign-in/success', component: SignInSuccessComponent },
  // {
  //   path: 'features',
  //   loadChildren: () => import('./features/features.module').then((m) => m.FeaturesModule)
  // },
  {
    path: 'public',
    loadChildren: () => import('./public/public.module').then((m) => m.PublicModule)
  },
  {
    path: 'covid',
    loadChildren: () => import('./covid/covid.module').then((m) => m.CovidModule)
  },
  {
    path: 'charts',
    component: ChartsComponent
  },
  {
    path: 'foodmart',
    component: FoodMartComponent
  },
  {
    path: 'query',
    component: QueryLabComponent
  },
  {
    path: 'explorer',
    component: ExplorerComponent
  }
  // { path: '', redirectTo: 'pages', pathMatch: 'full' },
  // { path: '**', redirectTo: 'pages' }
]

const config: ExtraOptions = {
  useHash: false,
  preloadingStrategy: PreloadAllModules
}

@NgModule({
  imports: [RouterModule.forRoot(routes, config)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
