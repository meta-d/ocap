import { Injectable } from '@angular/core'
import { nonBlank } from '@metad/core'
import { ISelectOption } from '@metad/ocap-angular/core'
import { Cube } from '@metad/ocap-core'
import { FORMLY_ROW, FORMLY_W_1_2, FORMLY_W_FULL } from '@metad/story/designer'
import { untilDestroyed } from '@ngneat/until-destroy'
import { Observable } from 'rxjs'
import { filter, map, shareReplay, switchMap } from 'rxjs/operators'
import { EntitySchemaService } from './entity-schema.service'
import { CubeSchemaState } from './types'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { toSignal } from '@angular/core/rxjs-interop'


@Injectable()
export class CubeSchemaService<T = Cube> extends EntitySchemaService<CubeSchemaState<T>> {
  public readonly cube$ = this.select((state) => state.cube)
  public readonly cubeName$ = this.cube$.pipe(map((cube) => cube?.name))
  public readonly factName$ = this.cube$.pipe(map((cube) => cube?.tables?.[0]?.name))

  public readonly measures$ = this.cube$.pipe(
    map((cube) => {
      const measures = [
        {
          value: null,
          label: this.getTranslation('PAC.KEY_WORDS.None', { Default: 'None' })
        }
      ]

      if (cube.measures) {
        measures.push(
          ...cube.measures.map((measure) => ({
            value: measure.name,
            label: measure.caption
          }))
        )
      }

      return measures
    })
  )

  public readonly fields$ = this.cubeName$.pipe(
    filter(Boolean),
    switchMap((cubeName) => this.modelService.selectOriginalEntityProperties(cubeName)),
    map((properties) => [
      { value: null, label: this.getTranslation('PAC.KEY_WORDS.None', { Default: 'None' }) },
      ...properties.map((property) => ({ value: property.name, label: property.caption }))
    ]),
    untilDestroyed(this),
    shareReplay(1)
  )

  /**
   * 原始 Fact 数据表字段
   */
  public readonly factFields$ = this.factName$.pipe(
    filter(nonBlank),
    switchMap((table) => this.modelService.selectOriginalEntityProperties(table)),
    map((properties) => [
      {
        value: null,
        key: null,
        caption: this.getTranslation('PAC.KEY_WORDS.None', { Default: 'None' })
      },
      ...properties.map((property) => ({
        value: property.name,
        key: property.name,
        caption: property.caption
      }))
    ])
  )

  public readonly cube = toSignal(this.cube$)

  SCHEMA: any

  getSchema() {
    return this.translate.stream('PAC.MODEL.SCHEMA').pipe(
      map((SCHEMA) => {
        this.SCHEMA = SCHEMA
        const CUBE = this.SCHEMA?.CUBE
        return [
          {
            type: 'tabs',
            fieldGroup: [
              {
                props: {
                  label: CUBE?.TITLE ?? 'Cube',
                  icon: 'crop_free'
                },
                fieldGroup: [this.cubeModeling]
              }
            ] 
          }
        ] as FormlyFieldConfig[]
      })
    )
  }

  get cubeModeling() {
    const COMMON = this.SCHEMA?.COMMON
    const CUBE = this.SCHEMA?.CUBE
    const className = FORMLY_W_1_2
    return {
      key: 'modeling',
      wrappers: ['panel'],
      props: {
        label: CUBE?.Modeling ?? 'Modeling',
        padding: true
      },
      fieldGroup: [
        {
          fieldGroupClassName: FORMLY_ROW,
          fieldGroup: [
            {
              key: 'name',
              type: 'input',
              className,
              props: {
                label: CUBE?.Name ?? 'Name'
              }
            },
            {
              key: 'caption',
              type: 'input',
              className,
              props: {
                label: COMMON?.Caption ?? 'Caption'
              }
            },
            {
              className: FORMLY_W_FULL,
              key: 'description',
              type: 'textarea',
              props: {
                label: COMMON?.Description ?? 'Description',
                rows: 1,
                autosize: true
              }
            },
            {
              className,
              key: 'defaultMeasure',
              type: 'ngm-select',
              props: {
                label: CUBE?.DefaultMeasure ?? 'Default Measure',
                options: this.measures$,
                searchable: true,
                required: true
              }
            },
            {
              className,
              key: 'visible',
              type: 'checkbox',
              defaultValue: true,
              props: {
                label: COMMON?.Visible ?? 'Visible'
              }
            },
            {
              className,
              key: 'enabled',
              type: 'checkbox',
              defaultValue: true,
              props: {
                label: COMMON?.Enabled ?? 'Enabled'
              }
            },
            {
              className,
              key: 'cache',
              type: 'checkbox',
              defaultValue: true,
              props: {
                label: COMMON?.Cache ?? 'Cache'
              }
            }
          ]
        },
        Tables(COMMON, this.tables$)
      ]
    }
  }

  get dataDistribution() {
    const COMMON = this.SCHEMA?.COMMON
    return {
      key: 'dataDistribution',
      props: {
        label: COMMON?.DATA || 'Data',
        icon: 'data_array'
      },
      fieldGroup: []
    }
  }

  get role() {
    const COMMON = this.SCHEMA?.COMMON
    return {
      key: 'role',
      props: {
        label: COMMON?.Role || 'Role',
        icon: 'policy'
      },
      fieldGroup: []
    }
  }
}

export function Tables(COMMON, tables$: Observable<ISelectOption[]>) {
  return {
    key: 'tables',
    type: 'array',
    fieldArray: {
      fieldGroup: [
        {
          key: 'name',
          type: 'ngm-select',
          props: {
            label: COMMON?.Table ?? 'Table',
            searchable: true,
            options: tables$
          }
        }
      ]
    },
    props: {
      label: COMMON?.FactTable ?? 'Fact Table'
    }
  }
}
