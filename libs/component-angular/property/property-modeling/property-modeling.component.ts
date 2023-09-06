// import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop'
// import { Component, forwardRef, Input, OnChanges, SimpleChanges } from '@angular/core'
// import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
// import { EntityType, DataSettings } from '@metad/ocap-core'
// import { assign } from 'lodash-es'

// @Component({
//   selector: 'nx-property-modeling',
//   templateUrl: './property-modeling.component.html',
//   styleUrls: ['./property-modeling.component.scss'],
//   host: {
//     class: 'nx-property-modeling',
//   },
//   providers: [
//     {
//       provide: NG_VALUE_ACCESSOR,
//       multi: true,
//       useExisting: forwardRef(() => PropertyModelingComponent),
//     },
//   ],
// })
// export class PropertyModelingComponent implements OnChanges, ControlValueAccessor {

//   @Input() dataSettings: DataSettings
//   @Input() entityType: EntityType

//   rows = []
//   columns = []
//   filters = []

//   private onChange: any
//   constructor() {}
  
//   ngOnChanges({dataSettings, entityType}: SimpleChanges): void {
//     if (dataSettings) {
//       console.log(dataSettings.currentValue)
//     }
//     if (entityType) {
//       console.log(entityType.currentValue)
//     }
//   }

//   writeValue(obj: any): void {
//     const {rows, columns, filters} = obj || {}
//     this.rows = rows || []
//     this.columns = columns || []
//     this.filters = filters || []
//   }
//   registerOnChange(fn: any): void {
//     this.onChange = fn
//   }
//   registerOnTouched(fn: any): void {
//   }
//   setDisabledState?(isDisabled: boolean): void {
//   }

//   drop(event: CdkDragDrop<any[]>) {
//     if (event.previousContainer === event.container) {
//       moveItemInArray(event.container.data, event.previousIndex, event.currentIndex)
//     } else {
//       transferArrayItem(
//         event.previousContainer.data,
//         event.container.data,
//         event.previousIndex,
//         event.currentIndex
//       )
//     }
//   }

//   add(rows) {
//     rows.push({value: {}})
//   }

//   remove(rows, index) {
//     rows.splice(index, 1)
//   }

//   onPropertyChange(property, value) {
//     assign(property, value)
//     this.onChange?.({rows: this.rows, columns: this.columns, filters: this.filters})
//   }
// }
