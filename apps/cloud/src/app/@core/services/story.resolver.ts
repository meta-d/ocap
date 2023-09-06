import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentType, omit } from '@metad/ocap-core'
import { convertStoryResult, StoriesService } from '@metad/cloud/state'
import { Story } from '@metad/story/core'
import { catchError, map, Observable, of, tap } from 'rxjs'

@Injectable()
export class StoryResolver  {
  constructor(private storyService: StoriesService, private wasmAgent: WasmAgentService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Story | string> {
    const storyId = route.paramMap.get('id')
    const token = route.queryParamMap.get('token')
    return this.storyService.getOne(storyId, null, token).pipe(
      map(convertStoryResult),
      // tap((story) => {
      //   if (story.model?.agentType === AgentType.Wasm) {
      //     this.wasmAgent.registerModel({
      //       ...omit(story.model, 'indicators'),
      //       name: story.options?.modelAlias || story.model.name,
      //       catalog: story.model.catalog ?? 'main',
      //     })
      //   }
      // }),
      catchError((error) => {
        return of(`未找到或者没有权限查看故事 '${storyId}'`)
      })
    )
  }
}

@Injectable()
export class StoryPublicResolver  {
  constructor(private storyService: StoriesService, private wasmAgent: WasmAgentService) {}
  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Story | Observable<Story> | Promise<Story> {
    const storyId = route.paramMap.get('id')
    return this.storyService.getPublicOne(storyId).pipe(
      map(convertStoryResult),
      // tap((story) => {
      //   if (story.model?.agentType === AgentType.Wasm) {
      //     this.wasmAgent.registerModel({
      //       ...omit(story.model, 'indicators'),
      //       name: story.options?.modelAlias || story.model.name,
      //       catalog: story.model.catalog ?? 'main'
      //     })
      //   }
      // }),
    )
  }
}