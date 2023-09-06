import { Component, Input, OnInit } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentType } from '@metad/ocap-core'
import { convertStoryResult, convertStoryWidgetResult, WidgetsService } from '@metad/cloud/state'
import { omit } from 'lodash-es'
import { BehaviorSubject, EMPTY } from 'rxjs'
import { catchError, filter, map, shareReplay, switchMap, tap } from 'rxjs/operators'

@Component({
  selector: 'pac-story-widget-feed',
  templateUrl: 'story-widget.component.html',
  styleUrls: ['story-widget.component.scss'],
  host: {
    class: 'pac-story-widget-feed'
  }
})
export class StoryWidgetFeedComponent implements OnInit {
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
          'point.story.model',
          'point.story.model.indicators',
          'point.story.model.dataSource',
          'point.story.model.dataSource.type'
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
      const points = widget.point.story.points
      points.forEach((point) => {
        if (point.id === widget.pointId) {
          point.widgets = [omit(widget, ['point', 'story'])]
        }
      })
      return convertStoryResult({
        ...widget.point.story,
        points
      })
    }),
    tap((story) => {
      if (story.model?.agentType === AgentType.Wasm) {
        this.wasmAgent.registerModel({
          ...story.model,
          catalog: story.model.catalog ?? 'main'
        })
      }
    })
  )

  public readonly _widget$ = this.widget$.pipe(
    map((widget) => {
      return convertStoryWidgetResult(widget)
    })
  )

  public error$ = new BehaviorSubject(null)

  constructor(
    private widgetsService: WidgetsService,
    private wasmAgent: WasmAgentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {}
}
