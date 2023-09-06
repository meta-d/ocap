import { Injectable } from '@angular/core'
import { map } from 'rxjs'
import { CubeSchemaService } from './cube.schema'
import { MeasureFormatting } from './common'
import { FORMLY_ROW, FORMLY_W_1_2 } from '@metad/story/designer'

@Injectable()
export class MeasureAttributesSchema extends CubeSchemaService {

  getSchema() {
    return this.translate.stream('PAC.MODEL.SCHEMA').pipe(
      map((SCHEMA) => {
        this.SCHEMA = SCHEMA

        return [
          {
            type: 'tabs',
            fieldGroup: [
              {
                props: {
                  label: SCHEMA?.MEASURE?.Title ?? 'Measure',
                  icon: 'straighten'
                },
                fieldGroup: this.measureSettings
              }
            ]
          } as any
        ]
      })
    )
  }

  get measureSettings() {
    const COMMON = this.SCHEMA?.COMMON
    const MEASURE = this.SCHEMA?.MEASURE
    return [
      {
        key: 'modeling',
        wrappers: ['expansion'],
        props: {
          label: COMMON?.Modeling ?? 'Modeling',
          // enableSelectFields: true,
          expanded: true
        },
        fieldGroup: [
          {
            fieldGroupClassName: FORMLY_ROW,
            fieldGroup: [
              {
                key: 'name',
                type: 'input',
                className: FORMLY_W_1_2,
                props: {
                  label: COMMON?.Name ?? 'Name',
                  readonly: true
                }
              },
              {
                key: 'caption',
                type: 'input',
                className: FORMLY_W_1_2,
                props: {
                  label: COMMON?.Caption ?? 'Caption'
                }
              }
            ]
          },

          MeasureFormatting(MEASURE?.FORMATTING)
        ]
      }
    ]
  }
}
