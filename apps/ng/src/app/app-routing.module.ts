import { NgModule } from '@angular/core'
import { ExtraOptions, PreloadAllModules, RouterModule, Routes } from '@angular/router'

const routes: Routes = [
  // {
  //   path: 'auth',
  //   loadChildren: () => import('@pangolin/cloud/auth').then((m) => m.PacAuthModule)
  // },
  // { path: 'sign-in/success', component: SignInSuccessComponent },
  // {
  //   path: 'features',
  //   loadChildren: () => import('./features/features.module').then((m) => m.FeaturesModule)
  // },
  {
    path: 'public',
    loadChildren: () => import('./public/public.module').then((m) => m.PublicModule)
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
