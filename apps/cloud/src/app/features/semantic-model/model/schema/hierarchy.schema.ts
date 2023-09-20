import { Injectable } from '@angular/core'
import { EntityProperty, PropertyHierarchy, serializeUniqueName } from '@metad/ocap-core'
import { FORMLY_ROW, FORMLY_W_1_2, FORMLY_W_FULL } from '@metad/story/designer'
import { combineLatest } from 'rxjs'
import { distinctUntilChanged, filter, map, switchMap, take } from 'rxjs/operators'
import { nonBlank } from '@metad/core'
import { DimensionModeling, DimensionSchemaService } from './dimension.schema'
import { CubeSchemaState } from './types'
import { AbstractControl } from '@angular/forms'
import { FormlyFieldConfig } from '@ngx-formly/core'
import { toSignal } from '@angular/core/rxjs-interop'

@Injectable()
export class HierarchySchemaService<T extends EntityProperty = PropertyHierarchy> extends DimensionSchemaService<T> {

  private readonly _dimension$ = this.select((state) => state.dimension)
  readonly dimensionName$ = this._dimension$.pipe(map((dimension) => dimension?.name), filter(nonBlank), distinctUntilChanged())
  readonly hierarchies$ = this.select((state) => state.hierarchies)
  readonly hierarchy$ = this.select((state) => state.modeling)

  readonly hierarchyOptions$ = combineLatest([this.dimensionName$, this.hierarchies$]).pipe(
    map(
      ([dimensionName, hierarchies]) =>
        hierarchies?.map((hierarchy) => ({
          key: serializeUniqueName(dimensionName, hierarchy.name),
          value: serializeUniqueName(dimensionName, hierarchy.name),
          caption: hierarchy.caption
        })) ?? []
    ),
  )

  readonly otherHierarchies = toSignal(this.select((state) => state.hierarchies?.filter((item) => item.__id__ !== state.modeling?.__id__)))
  
  /**
   * 多张表关联的维度, 需要为 Hierarchy 指定 `primaryKeyTable`
   */
  readonly hierarchyTables$ = this.select((state: CubeSchemaState<PropertyHierarchy>) =>
    state.modeling?.tables?.map((table) => ({
      key: table.name,
      value: table.name,
      caption: table.name
    })) ?? []
  )

  readonly table$ = this.select(
    (state: CubeSchemaState<PropertyHierarchy>) => state.modeling?.primaryKeyTable || state.modeling?.tables?.[0]?.name
  )

  readonly members$ = combineLatest([
    this._dimension$.pipe(filter(Boolean), map(({name}) => name), distinctUntilChanged(), filter(Boolean)),
    this.hierarchy$.pipe(filter(Boolean), map(({name}) => name), distinctUntilChanged()),
  ]).pipe(
    switchMap(([dimension, hierarchy]) => this.modelService.selectOriginalMembers(dimension, {
        dimension: serializeUniqueName(dimension),
        hierarchy: serializeUniqueName(dimension, hierarchy)
      }).pipe(
        // selectMembers 存在频繁刷新, 导致 ngm-select 组件显示异常
        take(1)
      )
    )
  )

  HIERARCHY: any

  getSchema() {
    return this.translate.stream('PAC.MODEL.SCHEMA').pipe(
      map((SCHEMA) => {
        this.SCHEMA = SCHEMA
        this.DIMENSION = SCHEMA?.DIMENSION
        this.HIERARCHY = SCHEMA?.HIERARCHY

        const dimensionModeling = DimensionModeling(
          SCHEMA,
          this.getTranslationFun(),
          this.hierarchyOptions$,
          this.fields$,
          this.dimensions
        )
        dimensionModeling.key = 'dimension'
        return [
          {
            type: 'tabs',
            fieldGroup: [
              {
                props: {
                  label: this.HIERARCHY?.TITLE ?? 'Hierarchy',
                  icon: 'h_mobiledata'
                },
                fieldGroup: [this.modeling]
              },
              {
                props: {
                  label: this.DIMENSION?.TITLE ?? 'Dimension',
                  icon: 'account_tree'
                },
                fieldGroup: [dimensionModeling]
              }
            ]
          }
        ]
      })
    )
  }

  get modeling() {
    const COMMON = this.SCHEMA?.COMMON
    const HIERARCHY = this.HIERARCHY
    const className = FORMLY_W_1_2
    const allMemberHide = `model === null || !model.hasAll`
    const translate = this.getTranslationFun()
    return {
      key: 'modeling',
      wrappers: ['panel'],
      props: {
        label: HIERARCHY?.Modeling ?? 'Modeling',
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
                label: HIERARCHY?.Name ?? 'Name'
              },
              validators: {
                name: {
                  expression: (c: AbstractControl) => !(this.otherHierarchies().find((item) => item.name === c.value)),
                  message: (error: any, field: FormlyFieldConfig) => field.formControl.value ? 
                    translate('PAC.Messages.AlreadyExists', {Default: `Name already exists`, value: translate('PAC.KEY_WORDS.Name', {Default: 'Name'})}) : 
                    translate('PAC.Messages.IsRequired', {Default: `Name is required`, value: translate('PAC.KEY_WORDS.Name', {Default: 'Name'})})
                }
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
                autosize: true,
              }
            },
          ]
        },

        {
          fieldGroupClassName: FORMLY_ROW,
          fieldGroup: [
            {
              className,
              key: 'visible',
              type: 'checkbox',
              defaultValue: true,
              props: {
                label: COMMON?.Visible ?? 'Visible',
              }
            },
            {
              key: 'hasAll',
              type: 'checkbox',
              defaultValue: true,
              className,
              props: {
                label: HIERARCHY?.HasAll ?? 'Has All'
              }
            },
            {
              key: 'allMemberName',
              type: 'input',
              className,
              props: {
                label: HIERARCHY?.AllMemberName ?? 'All Member Name'
              },
              expressions: {
                hide: allMemberHide
              }
            },
            {
              key: 'allMemberCaption',
              type: 'input',
              className,
              props: {
                label: HIERARCHY?.AllMemberCaption ?? 'All Member Caption'
              },
              expressions: {
                hide: allMemberHide
              }
            },
            {
              key: 'allLevelName',
              type: 'input',
              className,
              props: {
                label: HIERARCHY?.AllLevelName ?? 'All Level Name'
              },
              expressions: {
                hide: allMemberHide
              }
            }
          ]
        },
        {
          key: 'tables',
          type: 'array',
          props: {
            icon: 'table_view',
            label: HIERARCHY?.DimensionTable ?? 'Dimension Table',
            required: true
          },
          fieldArray: {
            fieldGroup: [
              {
                type: 'empty',
                key: 'join'
              },
              {
                key: 'name',
                type: 'select',
                props: {
                  label: HIERARCHY?.TableName ?? 'Table Name',
                  searchable: true,
                  required: true,
                  valueKey: 'key',
                  options: this.tables$
                }
              }
            ]
          }
        },
        {
          fieldGroupClassName: FORMLY_ROW,
          fieldGroup: [
            {
              key: 'primaryKey',
              type: 'ngm-select',
              className,
              props: {
                icon: 'view_column',
                label: HIERARCHY?.PrimaryKey ?? 'Primary Key',
                searchable: true,
                options: this.table$.pipe(
                  switchMap((table) => this.modelService.selectOriginalEntityProperties(table)),
                  map((properties) => {
                    const columns = [{ value: null, caption: this.getTranslation('PAC.KEY_WORDS.None', {Default: 'None'}) }]
                    properties?.forEach((property) => columns.push({ value: property.name, caption: property.caption }))
                    return columns
                  })
                ),
              },
              expressions: {
                'props.required': '!!model.tables && !!model.tables.length',
              },
            },
            {
              key: 'primaryKeyTable',
              type: 'select',
              className,
              props: {
                icon: 'view_column',
                label: HIERARCHY?.PrimaryKeyTable ?? 'Primary Key Table',
                options: this.hierarchyTables$
              },
              expressionProperties: {
                'props.required': '!!model.tables && model.tables.length > 1',
              },
            }
          ]
        },

        this.defaultMember()
      ]
    }
  }

  defaultMember() {
    return {
      className: FORMLY_W_FULL,
      key: 'defaultMember',
      type: 'ngm-select',
      props: {
        label: this.SCHEMA?.HIERARCHY?.DefaultMember ?? 'Default Member',
        searchable: true,
        virtualScroll: true,
        options: this.members$.pipe(map((members) => ([
          {
            value: null,
            label: this.getTranslation('PAC.KEY_WORDS.None', {Default: 'None'}),
            key: null,
            caption: this.getTranslation('PAC.KEY_WORDS.None', {Default: 'None'}),
          },
          ...members.map((member) => ({
            value: member.memberKey,
            label: member.memberCaption,
            key: member.memberKey,
            caption: member.memberCaption,
          }))
        ])))
      }
    }
  }
}
