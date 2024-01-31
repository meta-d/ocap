// import { HttpClient } from '@angular/common/http'
// import { inject, Injectable } from '@angular/core'
// import { API_PREFIX } from '@metad/cloud/state'
// import { NgmCopilotService } from '@metad/core'
// import { omit } from '@metad/ocap-core'
// import OpenAI from 'openai'
// import { firstValueFrom } from 'rxjs'
// import { distinctUntilChanged, filter, map, startWith, switchMap } from 'rxjs/operators'
// import { ICopilot } from '../types'
// import { Store } from './store.service'

// @Injectable({ providedIn: 'root' })
// export class CopilotAPIService {
//   private httpClient = inject(HttpClient)
//   private store = inject(Store)

//   // private _copilot$ = new BehaviorSubject<ICopilot>(null)
//   // public copilot$ = this._copilot$.asObservable()
//   // public notEnabled$ = this.copilot$.pipe(map((copilot) => !(copilot?.enabled && copilot?.apiKey)))

//   // get enabled() {
//   //   return this.copilot?.enabled
//   // }
//   // get hasKey() {
//   //   return !!this.copilot?.apiKey
//   // }
//   openai: OpenAI
//   // Subscribers
//   // Init copilot config
//   private _userSub = this.store.user$
//     .pipe(
//       map((user) => user?.id),
//       startWith(null),
//       distinctUntilChanged(),
//       filter(Boolean),
//       switchMap(() => this.store.selectOrganizationId()),
//       switchMap(async (orgId) => this.getOne(orgId))
//     )
//     .subscribe(() => {
//       //
//     })
//   // React to copilot config change
//   private _copilotSub = this.copilot$.pipe(filter((copilot) => !!copilot?.apiKey)).subscribe((copilot) => {
//     // this.copilot = copilot
//     // this.openai = new OpenAI({
//     //   apiKey: copilot.apiKey
//     // })
//   })

//   async getOne(orgId?: string) {
//     const result = await firstValueFrom(this.httpClient.get<{ items: ICopilot[] }>(API_PREFIX + '/copilot'))
//     this.copilot = result.items[0]
//     return this.copilot
//   }

//   async upsertOne(input: Partial<ICopilot>) {
//     const copilot = await firstValueFrom(
//       this.httpClient.post(API_PREFIX + '/copilot', input.id ? input : omit(input, 'id'))
//     )
//     this.copilot = copilot
//   }

//   async createCompletion(...params: any[]) {
//     return []
//   }
//   async createEdit(...params: any[]) {}
// }
