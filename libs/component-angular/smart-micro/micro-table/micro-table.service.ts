// import { Model, ModelFactory } from '@angular-extensions/model'
// import { Injectable } from '@angular/core'
// import { SortDirection, SortPropDir } from '@metad/core'
// import { EntityType } from '@metad/ocap-core'
// import { isEmpty, isNil, orderBy } from 'lodash-es'
// import { combineLatest, Observable } from 'rxjs'
// import { filter, map } from 'rxjs/operators'

// @Injectable()
// export class NxMicroTableService {
//   public sortable = false

//   private _data: Model<Array<any>>
//   private _columns: Model<Array<string>>
//   private _sorts: Model<SortPropDir[]>
//   protected _entityType: Model<EntityType>

//   public data$: Observable<Array<any>>
//   // public entityType$: Observable<EntityType>
//   public renderData$: Observable<Array<any>>

//   public columns$: Observable<Array<NxProperty>>

//   constructor(public modelFactory: ModelFactory<any>) {
//     this._data = this.modelFactory.createMutable(null)
//     this._columns = this.modelFactory.createMutable(null)
//     this._entityType = this.modelFactory.createMutable(null)
//     this._sorts = this.modelFactory.create(null)

//     this.data$ = this._data.data$.pipe(filter((data) => data !== null))
//     this.renderData$ = combineLatest([this.data$, this._sorts.data$]).pipe(
//       map(([data, sorts]) => {
//         if (sorts) {
//           return orderBy(
//             data,
//             sorts.map((sort) => sort.prop),
//             sorts.map((sort) => sort.dir)
//           )
//         }
//         return data
//       })
//     )

//     this.columns$ = combineLatest([
//       this._columns.data$,
//       this._entityType.data$.pipe(filter((data) => data !== null)),
//       this._sorts.data$,
//       this._data.data$.pipe(filter((data) => data !== null)),
//     ]).pipe(
//       map(([columns, entityType, sorts, data]) => {
//         if (isNil(columns) && !isEmpty(data)) {
//           columns = Object.keys(data[0])
//         }
//         const fields = []
//         columns?.forEach((name) => {
//           const property = entityType.properties[name]
//           const field: any = {
//             property: property.name,
//             description: property.label,
//             role: property.role,
//           }
//           fields.push(field)
//           if (property.text) {
//             const text = {
//               property: property.text.name,
//               description: property.text.label,
//               role: property.text.role,
//             }
//             fields.push(text)
//             field.text = text
//           }
//           if (property.unit) {
//             const unit = {
//               property: property.unit.name,
//               description: property.unit.label,
//               role: property.unit.role,
//               semantic: property.unit.semantic,
//             }
//             fields.push(unit)
//             field.unit = unit
//           }
//         })

//         // if (sorts) {
//         sorts?.forEach((sort) => {
//           fields
//             .filter((field) => field.property === sort.prop)
//             .forEach((field) => (field.sortDir = sort.dir))
//         })
//         // }
//         return fields
//       })
//     )
//   }

//   setData(data) {
//     this._data.set(data)
//   }

//   setColumns(columns) {
//     this._columns.set(columns)
//   }

//   setEntityType(entityType: EntityType) {
//     this._entityType.set(entityType)
//   }

//   /**
//    *
//    */
//   toggleColumnSort(column: NxProperty) {
//     if (!this.sortable) {
//       return
//     }
//     const sort = {
//       prop: column.property,
//       dir: SortDirection.asc,
//     }
//     let sorts = this._sorts.get()
//     if (sorts) {
//       const index = sorts.findIndex((item) => item.prop === column.property)
//       if (index > -1) {
//         const item = sorts.splice(index, 1)
//         if (item[0].dir === SortDirection.asc) {
//           sort.dir = SortDirection.desc
//           sorts.push(sort)
//         }
//       } else {
//         sorts.push(sort)
//       }
//     } else {
//       sorts = [sort]
//     }

//     this._sorts.set(sorts)
//   }
// }
