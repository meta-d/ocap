import { Injectable, Injector } from '@angular/core'
import { ReferenceLineAggregation, ReferenceLineType, ReferenceLineValueType } from '@metad/ocap-core'
import { BaseDesignerSchemaService, BaseSchemaState } from '@metad/story/designer'
import { map, Observable } from 'rxjs'

@Injectable()
export class ReferenceLineSchemaService extends BaseDesignerSchemaService<BaseSchemaState> {
  public readonly storyDesigner$ = this.translate.stream('STORY_DESIGNER')

  constructor(public injector: Injector) {
    super(injector)
  }

  getTitle(): Observable<string> {
    return this.storyDesigner$.pipe(
      map((STORY_DESIGNER) => STORY_DESIGNER?.BUILDER?.CHART?.ReferenceLine?.Title ?? 'Create Reference Lines')
    )
  }

  getSchema() {
    return this.storyDesigner$.pipe(
      map((STORY_DESIGNER) => STORY_DESIGNER?.BUILDER?.CHART?.ReferenceLine),
      map((ReferenceLine) => {
        const className = 'nx-formly__col nx-formly__col-6'
        return [
          {
            key: 'referenceLines',
            wrappers: ['panel'],
            type: 'array-tabs',
            templateOptions: {
              label: ReferenceLine?.ReferenceLine ?? 'Reference Line',
              padding: true,
              labelField: 'label',
              removeLabel: ReferenceLine?.removeLabel ?? 'Remove'
            },
            fieldArray: {
              fieldGroupClassName: 'nx-formly__row',
              fieldGroup: [
                {
                  className,
                  key: 'label',
                  type: 'input',
                  templateOptions: {
                    label: ReferenceLine?.Label ?? 'Label',
                    required: true
                  }
                },
                {
                  className,
                  key: 'type',
                  type: 'select',
                  templateOptions: {
                    label: ReferenceLine?.Type ?? 'Visual Type',
                    required: true,
                    options: [
                      { value: ReferenceLineType.markLine, label: ReferenceLine?.MarkLine ?? 'Mark Line' },
                      { value: ReferenceLineType.markPoint, label: ReferenceLine?.MarkPoint ?? 'Mark Point' }
                    ]
                  }
                },
                {
                  className,
                  key: 'valueType',
                  type: 'select',
                  templateOptions: {
                    label: ReferenceLine?.ValueType ?? 'Value Type',
                    required: true,
                    options: [
                      { value: ReferenceLineValueType.fixed, label: ReferenceLine?.Fixed ?? 'Fixed' },
                      { value: ReferenceLineValueType.dynamic, label: ReferenceLine?.Dynamic ?? 'Dynamic' }
                    ]
                  }
                },
                {
                  className,
                  key: 'value',
                  type: 'input',
                  templateOptions: {
                    label: ReferenceLine?.Value ?? 'Value',
                    type: 'number'
                  }
                },
                {
                  className,
                  key: 'aggregation',
                  type: 'select',
                  templateOptions: {
                    label: ReferenceLine?.Aggregation ?? 'Aggregation',
                    options: [
                      { value: ReferenceLineAggregation.min, label: ReferenceLine?.Min ?? 'Min' },
                      { value: ReferenceLineAggregation.max, label: ReferenceLine?.Max ?? 'Max' },
                      { value: ReferenceLineAggregation.average, label: ReferenceLine?.Average ?? 'Average' },
                      { value: ReferenceLineAggregation.median, label: ReferenceLine?.Median ?? 'Median' }
                    ]
                  }
                }
                // {
                //   className,
                //   key: 'above',
                //   type: 'input',
                //   templateOptions: {
                //     label: '大于值区域的颜色',
                //   }
                // },
                // {
                //   className,
                //   key: 'below',
                //   type: 'input',
                //   templateOptions: {
                //     label: '小于值区域的颜色',
                //   }
                // }
              ]
            }
          }
        ]
      })
    )
  }
}
