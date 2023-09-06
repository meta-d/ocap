import { Inject, Injectable } from '@angular/core'
import { ChartAnnotation, DisplayBehaviour, FilterOperator, KPIType } from '@metad/ocap-core'
import { ComponentStore } from '@metad/store'
import {
  StoryModel,
  WidgetComponentType,
  NxStoryModelService,
  NX_STORY_MODEL,
} from '@metad/story/core'
import { original } from 'immer'
import { isEmpty, isString } from 'lodash-es'
import { NGXLogger } from 'ngx-logger'
import { EMPTY, Observable, of } from 'rxjs'
import { catchError, map, switchMap, tap, withLatestFrom } from 'rxjs/operators'
import { InsightService } from '../../@core'
import { ID, uuid } from '../../@core/types'

export interface PACInsightState {
  model: ID
  models: Array<StoryModel>
  stories: Array<any>
}

export interface Intelligent {
  modelId: ID
  keyWords: Array<any>
}

@Injectable()
export class PACInsightBoardService extends ComponentStore<PACInsightState> {

  stories$ = this.select(state => state.stories)

  constructor(
    @Inject(NX_STORY_MODEL)
    private storyModelService: NxStoryModelService,
    private insightService: InsightService,
    private _logger: NGXLogger
  ) {
    super({ models: [], stories: [] } as PACInsightState)
  }

  private _setModel = this.updater((state, model: StoryModel) => {
    if (!state.models.find((item) => item.id === model.id)) {
      state.models.push(model)
    }
    state.model = model.id
  })

  createStory = this.effect((intelligent$: Observable<Intelligent>) => {
    return intelligent$.pipe(
      withLatestFrom(this.state$),
      switchMap(([intelligent, state]) => {
        const model: any = state.models.find((item) => item.id === intelligent.modelId)
        if (model) {
          return of({ model, intelligent })
        } else {
          return this.storyModelService.getModel(intelligent.modelId).pipe(
            catchError((err, caught) => EMPTY),
            tap((model: any) => {
              this._setModel(model)
            }),
            map((model) => ({ intelligent, model }))
          )
        }
      }),
      tap(({ model, intelligent }) => {
        this._createStory({ model, intelligent })
      })
    )
  })

  addStory = this.effect((keyWords$: Observable<Array<any>>) => {
    return keyWords$.pipe(
      switchMap(keyWords => {
        return this.insightService.insight(keyWords.map(keyWord => keyWord.word).join(''))
          .pipe(
            catchError((err, caught) => EMPTY),
            tap((model: Intelligent) => {
              model.modelId = 'ab340a89-4d70-4b91-bb9b-045f9186f2f2'
              this.createStory({...model, keyWords})
            })
          )
      }),
    )
  })

  private _createStory = this.updater((state, { intelligent, model }: any) => {
    const storyId = uuid()
    const pointId = uuid()
    const widgetId = uuid()

    const statement = intelligent.statement
    const entitySet = intelligent.entitySet || '$/CPMB/IKIJLTD'
    const dimensions = intelligent.dimensions ? isString(intelligent.dimensions) ? 
      JSON.parse(intelligent.dimensions) : intelligent.dimensions : [
      {
        dimension: '[/CPMB/IKD2ZQE]',
        hierarchy: '[/CPMB/IKD2ZQE                 PARENTH1]',
        level: '[/CPMB/IKD2ZQE                 PARENTH1].[LEVEL02]'
      }
    ]
    const measures = intelligent.measures ? isString(intelligent.measures) ? JSON.parse(intelligent.measures)
    : intelligent.measures : [{value: '/CPMB/SDATA'}]
    const slicers = intelligent.slicers ? isString(intelligent.slicers) ? JSON.parse(intelligent.slicers) :
    intelligent.slicers : []
    const chartType = intelligent.chartType || 'Column'

    const filters = slicers.map((item) => {
      if (item.name === 'time') {
        return createTimeSlicer(item)
      }
      return {
        path: item.path, // '[/CPMB/IKDH7P7]',
        operator: FilterOperator.EQ,
        value: item.value, //'CHN',
        label: item.label,
        and: true,
        show: true
      }
    })

    let KPIAnnotation: Partial<KPIType> = null
    let chartAnnotation: ChartAnnotation = null
    if (isEmpty(dimensions)) {
      const mainMeasure = measures[0]
      KPIAnnotation = {
        DataPoint: {
          Title: mainMeasure.label,
          Value: mainMeasure.value
        }
      }

      if (measures.length > 1) {
        KPIAnnotation.AdditionalDataPoints = measures.slice(1).map(item => ({
          Title: item.label,
          Value: item.value
        }))
      }
    } else {
      chartAnnotation = {
        chartType,
        dimensions: dimensions.map(item => item.value),
        measures: measures.map(item => item.value),
      }
    }

    this._logger.debug(`intelligent chartAnnotation`, chartAnnotation)

    const story = {
      model,
      key: storyId,
      id: storyId,
      name: storyId,
      details: {
        themeName: 'default'
      },
      options: {
        filters
      },
      points: [
        {
          storyId,
          key: pointId,
          id: pointId,
          name: pointId,
          widgets: [
            {
              storyId,
              pointId,
              key: widgetId,
              id: widgetId,
              name: widgetId,
              component: KPIAnnotation ? WidgetComponentType.KpiCard : WidgetComponentType.AnalyticalCard,
              dataSettings: {
                dataSource: model.name,
                entitySet,
                KPIAnnotation,
                chartAnnotation,
                selectionVariant: {
                  selectOptions: filters
                },
              },
              options: {
                shortNumber: true,
                digitsInfo: '1.0-2'
              },
              chartSettings: {
                categoryAxis: {
                  axisLabel: {
                    rotate: 15
                  }
                },
              },
              chartOptions: {
                axisDimensionTechnical: DisplayBehaviour.descriptionOnly,
                seriesStyle: {
                  barMaxWidth: 30
                },
                options: {
                  toolbox: {
                    show: true,
                    feature: {
                      dataZoom: {
                        yAxisIndex: 'none'
                      },
                      dataView: {readOnly: false},
                      magicType: {type: ['line', 'bar']},
                      restore: {},
                      saveAsImage: {},
                      // brush: {
                      //   show: true,
                      //   type: ['rect', 'keep', 'clear']
                      // }
                    }
                  },
                  dataZoom: [
                    {
                      type: 'inside',
                      xAxisIndex: 0
                    }
                  ],
                }
              }
            },
          ],
        },
      ],
    }

    state.stories.push({
      story,
      pointId,
      widgetId,
      statement,
      keyWords: intelligent.keyWords
    })
  })

  removeSlicer = this.updater((state, {storyId, slicer}: any) => {
    const story = state.stories.find(item => item.story.id === storyId).story
    story.options.filters = story.options.filters.filter(item => original(item) !== slicer)
    story.points[0].widgets[0].dataSettings.selectionVariant.selectOptions = story.points[0].widgets[0].dataSettings.selectionVariant.selectOptions.filter(item => original(item) !== slicer)
  })

  removeStory = this.updater((state, story: any) => {
    state.stories = state.stories.filter(item => original(item) !== story)
  })
}

function createTimeSlicer(tSlicer) {
  return {
    currentDate: "TODAY",
    propertyName: tSlicer.path, // '[/CPMB/IKD2ZQE                 PARENTH1]',
    ranges: [
      {
        ...tSlicer,
        type: "Standard"
      }
    ],
    path: tSlicer.path,
    label: tSlicer.label
  }
}
