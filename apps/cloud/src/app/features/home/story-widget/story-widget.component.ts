import { Component, Input, inject } from '@angular/core'
import { WidgetsService, convertStoryResult, convertStoryWidgetResult } from '@metad/cloud/state'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentType } from '@metad/ocap-core'
import { omit } from 'lodash-es'
import { BehaviorSubject, EMPTY } from 'rxjs'
import { catchError, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { registerWasmAgentModel } from '../../../@core'

@Component({
  selector: 'pac-story-widget-feed',
  templateUrl: 'story-widget.component.html',
  styleUrls: ['story-widget.component.scss'],
  host: {
    class: 'pac-story-widget-feed'
  }
})
export class StoryWidgetFeedComponent {
  private readonly widgetsService = inject(WidgetsService)
  private readonly wasmAgent = inject(WasmAgentService)

  @Input() get id(): string {
    return this.id$.value
  }
  set id(value) {
    this.id$.next(value)
  }
  private id$ = new BehaviorSubject<string>(null)

  public readonly widget$ = this.id$.pipe(
    filter((value) => !!value),
    switchMap((id) =>
      this.widgetsService
        .getOne(id, [
          'point',
          'point.story',
          'point.story.points',
          'createdBy',
          // 'point.story.model',
          // 'point.story.model.indicators',
          // 'point.story.model.dataSource',
          // 'point.story.model.dataSource.type'

          'point.story.models',
          'point.story.models.dataSource',
          'point.story.models.dataSource.type',
          'point.story.models.indicators'
        ])
        .pipe(
          catchError((err) => {
            this.error$.next(err.error)
            return EMPTY
          })
        )
    ),
    shareReplay(1)
  )

  public readonly story$ = this.widget$.pipe(
    map((widget) => {
      return convertStoryResult({
        ...widget.point.story,
        points: [
          {
            ...widget.point,
            story: null,
            widgets: [omit(widget, 'point')]
          }
        ]
      })
    }),
    tap((story) => {
      story.models?.forEach((model) => {
        if (model.agentType === AgentType.Wasm) {
          registerWasmAgentModel(this.wasmAgent, model)
        }
      })
    })
  )

  public readonly _widget$ = this.widget$.pipe(
    map((widget) => {
      return convertStoryWidgetResult(widget)
    })
  )

  public error$ = new BehaviorSubject(null)
}
