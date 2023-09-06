import { Injectable } from '@angular/core'
import { map } from 'rxjs/operators'
import { SemanticsExpansion } from './common'
import { HierarchySchemaService } from './hierarchy.schema'
import { FORMLY_ROW, FORMLY_W_1_2 } from '@metad/story/designer'


@Injectable()
export class LevelAttributesSchema extends HierarchySchemaService {
  private LEVEL: any

  getSchema() {
    return this.translate.stream('PAC.MODEL.SCHEMA').pipe(
      map((SCHEMA) => {
        this.SCHEMA = SCHEMA
        this.LEVEL = SCHEMA.LEVEL
        return [
          {
            type: 'tabs',
            fieldGroup: [
              {
                props: {
                  label: this.LEVEL?.Level ?? 'Level',
                  icon: 'format_list_numbered'
                },
                fieldGroup: [
                  this.levelModeling
                  // this.levelProperty,
                ]
              },
              this.dataDistribution as any
            ]
          }
        ]
      })
    )
  }

  get levelModeling() {
    const COMMON = this.SCHEMA.COMMON
    const LEVEL = this.LEVEL
    return {
      key: 'modeling',
      wrappers: ['expansion'],
      props: {
        label: LEVEL?.Modeling ?? 'Modeling',
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
                label: LEVEL?.Name ?? 'Name',
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

        SemanticsExpansion(COMMON)
      ]
    }
  }
}
