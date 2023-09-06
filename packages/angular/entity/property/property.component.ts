import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { MatIconModule } from '@angular/material/icon'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { DensityDirective, DisplayDensity } from '@metad/ocap-angular/core'
import {
  AggregationRole,
  CalculationType,
  DisplayBehaviour,
  EntityProperty,
  isCalculationProperty,
  isIndicatorMeasureProperty,
  isMeasureControlProperty,
  isParameterProperty,
  isSemanticCalendar,
  PropertyAttributes,
  Semantics
} from '@metad/ocap-core'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    DensityDirective,
    NgmCommonModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'ngm-entity-property',
  templateUrl: './property.component.html',
  styleUrls: ['./property.component.scss'],
  host: {
    class: 'ngm-entity-property'
  }
})
export class NgmEntityPropertyComponent implements OnChanges {
  AGGREGATION_ROLE = AggregationRole

  @Input() property: PropertyAttributes
  @Input() displayBehaviour: DisplayBehaviour | string
  @Input() displayDensity: DisplayDensity
  @Input() get hiddenIcon() {
    return this._hiddenIcon
  }
  set hiddenIcon(value: string | boolean) {
    this._hiddenIcon = coerceBooleanProperty(value)
  }
  private _hiddenIcon: boolean = null

  @Input() highlight: string

  @Input() calculationType: CalculationType

  icon: string
  ngOnChanges({ property }: SimpleChanges) {
    if (property?.currentValue) {
      this.icon = propertyIcon(property.currentValue).icon
    }
  }
}

export const SemanticIconMap = {
  [Semantics['Address.Country']]: 'public'
}

export function propertyIcon(property: EntityProperty) {
  let icon = null
  let label = null
  switch (property?.role) {
    case AggregationRole.dimension:
      if (isSemanticCalendar(property)) {
        icon = 'schedule'
        label = 'Calendar'
      } else if (SemanticIconMap[property.semantics?.semantic]) {
        icon = SemanticIconMap[property.semantics?.semantic]
        label = property.semantics?.semantic
      } else {
        icon = 'tag'
        label = 'Dimension'
      }
      break
    case AggregationRole.hierarchy:
      icon = 'h_mobiledata'
      label = 'Hierarchy'
      break
    case AggregationRole.level:
      icon = 'format_list_numbered_rtl'
      label = 'Level'
      break
    case AggregationRole.measure:
      if (isCalculationProperty(property)) {
        if (isMeasureControlProperty(property)) {
          icon = 'alternate_email'
          label = 'Measure Control'
        } else if(isIndicatorMeasureProperty(property)) {
          icon = 'trending_up'
          label = 'Indicator'
        } else {
          icon = 'functions'
          label = 'Calculation'
        }
      } else {
        icon = 'straighten'
        label = 'Measure'
      }
      break
    default:
      if (isParameterProperty(property)) {
        icon = 'alternate_email'
        label = 'Parameter'
      }
  }
  return {icon, label}
}
