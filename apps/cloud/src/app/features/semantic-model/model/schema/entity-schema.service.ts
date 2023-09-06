import { inject, Injectable, Optional } from '@angular/core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { TranslateService } from '@ngx-translate/core'
import { DataSettingsSchemaService } from '@metad/story/designer'
import { EMPTY } from 'rxjs'
import { filter, map, shareReplay, switchMap, tap } from 'rxjs/operators'
import { ModelEntityService } from '../entity/entity.service'
import { SemanticModelService } from '../model.service'
import { EntitySchemaState } from './types'

@UntilDestroy()
@Injectable()
export class EntitySchemaService<T extends EntitySchemaState<T['modeling']>> extends DataSettingsSchemaService<T> {

  private _translateService = inject(TranslateService)

  public readonly id$ = this.select((state) => state.id)
  public readonly modeling$ = this.select((state) => state.modeling)

  public readonly tables$ = this.modelService.selectDBTables$.pipe(
    map((dbTables) => {
      const tables = dbTables
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((table) => ({
          value: table.name,
          key: table.name,
          caption: table.caption,
        }))
      tables.splice(0, 0, {
        value: null,
        key: null,
        caption: this.getTranslation('PAC.MODEL.SCHEMA.COMMON.None') ?? 'None',
      })
      return tables
    }),
    untilDestroyed(this),
    shareReplay(1)
  )

  public readonly entityType$ = this.select((state) => state.entity).pipe(
    filter(Boolean),
    switchMap((entity) => this.modelService.selectEntityType(entity)),
    untilDestroyed(this),
    shareReplay(1)
  )

  public readonly entityProperties$ = this.entityType$.pipe(
    filter(Boolean),
    map((entityType) =>
      Object.values(entityType.properties).map((property) => ({ value: property.name, label: property.caption }))
    ),
    map((options) => [{ value: null, label: 'None' }, ...options])
  )

  constructor(
    protected modelService: SemanticModelService,
    @Optional()
    protected entityService?: ModelEntityService
  ) {
    super()
  }

  getSchema() {
    return this.translate.stream('STORY_DESIGNER').pipe(
      map((STORY_DESIGNER) => {
        this.STORY_DESIGNER = STORY_DESIGNER
        return [
          {
            type: 'tabs',
            fieldGroup: [
              {
                props: {
                  label: 'Model Details',
                  icon: 'view_in_ar'
                },
                fieldGroup: this.getModelSchema()
              }
            ]
          }
        ]
      })
    )
  }

  getModelSchema() {
    return [
      {
        // type: 'model-info',
      },
      {
        key: 'preferences',
        wrappers: ['expansion'],
        props: {
          label: 'Preferences'
        },
        fieldGroup: []
      }
    ]
  }

  selectTableColumns(table: string) {
    return this.modelService.selectOriginalEntityProperties(table).pipe(
      map((properties) => {
        const options = [{ value: null, label: 'None' }]
        properties.forEach((property) => {
          options.push({ value: property.name, label: property.caption })
        })
        return options
      })
    )
  }

  selectDimension(id: string) {
    return this.entityService?.selectDimension(id).pipe(untilDestroyed(this)) ?? EMPTY
  }

  selectDimensionHierarchies(id: string) {
    return this.selectDimension(id).pipe(map((dim) => dim?.hierarchies))
  }

  getTranslation(key: string, params?) {
    let result = ''
    this._translateService.get(key, params).subscribe((value) => {
      result = value
    })
    return result
  }
}
