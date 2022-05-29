import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core'
import { FormControl } from '@angular/forms'
import { MatFormFieldAppearance } from '@angular/material/form-field'
import { DisplayDensity } from '@metad/ocap-angular/core'
import { DataSettings, ParameterControlEnum, ParameterProperty } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { distinctUntilChanged } from 'rxjs'

export interface ParameterOptions {}

export interface ParameterStyling {
  displayDensity?: DisplayDensity
  appearance: MatFormFieldAppearance
}

@UntilDestroy()
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-parameter',
  templateUrl: 'parameter.component.html',
  styleUrls: ['parameter.component.scss']
})
export class ParameterComponent implements OnInit, OnChanges {
  ParameterControlEnum = ParameterControlEnum

  @Input() dataSettings: DataSettings
  @Input() parameter: ParameterProperty
  @Input() options: ParameterOptions
  @Input() styling: ParameterStyling

  @Output() parameterChange = new EventEmitter<ParameterProperty>()

  get paramType() {
    return this.parameter?.paramType
  }
  get availableMembers() {
    return this.parameter?.availableMembers ?? []
  }
  get members() {
    return this.parameter.members
  }
  set members(members) {
    this.parameter = {
      ...this.parameter,
      members
    }
    this.changeParameter()
  }

  inputControl = new FormControl()
  constructor(private _cdr: ChangeDetectorRef) {
    this.inputControl.valueChanges.pipe(distinctUntilChanged(), untilDestroyed(this)).subscribe((value) => {
      this.parameter = {
        ...this.parameter,
        value
      }
      this.changeParameter()
    })
  }

  ngOnInit() {}

  ngOnChanges({ parameter }: SimpleChanges): void {
    if (parameter) {
      this.inputControl.setValue(parameter.currentValue?.value)
      // this._cdr.detectChanges()
    }
  }

  onValueChange(value) {
    this.parameter = {
      ...this.parameter,
      value
    }
    this.changeParameter()
  }

  updateParameterValue(event) {
    this.parameter.value = event
    this.changeParameter()
  }

  changeParameter() {
    this.parameterChange.emit(this.parameter)
  }
}
