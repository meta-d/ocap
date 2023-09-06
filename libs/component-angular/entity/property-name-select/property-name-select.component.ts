// import { Component, forwardRef, HostBinding, Input, ViewChild } from '@angular/core'
// import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms'
// import { MatSelect } from '@angular/material/select'
// import { convertToBoolProperty } from '@metad/core'
// import { DisplayBehaviour, Property, PropertyName } from '@metad/ocap-core'
// import { isArray, isNil } from 'lodash-es'
// import { BehaviorSubject } from 'rxjs'
// import { map } from 'rxjs/operators'

// /**
//  * @deprecated use MeasureSelectComponent 等
//  */
// @Component({
//   selector: 'nx-property-name-select',
//   templateUrl: './property-name-select.component.html',
//   styleUrls: ['./property-name-select.component.scss'],
//   providers: [
//     {
//       provide: NG_VALUE_ACCESSOR,
//       multi: true,
//       useExisting: forwardRef(() => PropertyNameSelectComponent),
//     },
//   ],
// })
// export class PropertyNameSelectComponent implements ControlValueAccessor {

//   @Input() label: string
//   @Input() properties: Array<Property>
//   @Input() displayBehaviour: DisplayBehaviour
//   @Input() get multiple() {
//     return this._multiple
//   }
//   set multiple(value) {
//     this._multiple = convertToBoolProperty(value)
//   }
//   private _multiple: boolean | string

//   @ViewChild('propertySelect', { read: MatSelect })
//   public propertySelect: MatSelect

//   get value(): PropertyName | Array<PropertyName> {
//     return this._value$.value
//   }
//   set value(value) {
//     this._value$.next(value)
//   }
//   private _value$ = new BehaviorSubject<PropertyName | Array<PropertyName>>(null)

//   selectTriggers$ = this._value$.pipe(map(value => {
//     const values = isArray(value) ? value : isNil(value) ? [] : [value]
//     return values.map(name => {
//       return this.properties.find(item => item.name === name)
//     })
//   }))

//   selectable = true
//   removable = true

//   private _onChange: (value) => any

//   writeValue(obj: any): void {
//     this.value = obj
//   }
//   registerOnChange(fn: any): void {
//     this._onChange = fn
//   }
//   registerOnTouched(fn: any): void {}
//   setDisabledState?(isDisabled: boolean): void {}

//   remove(event) {
//     if (this.value === event.name) {
//       this.value = null
//     } else if(isArray(this.value)) {
//       this.value = this.value.filter(name => event.name !== name)
//     }
//   }

//   onModelChange(value) {
//     this._onChange?.(value)
//   }

//   focus(options?: FocusOptions): void {
//     this.propertySelect?.focus()
//   }

//   @HostBinding('class.nx-property-select__non_value')
//   get isNonValue() {
//     return !this.value
//   }

// }
