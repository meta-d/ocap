import { CommonModule, getCurrencySymbol } from '@angular/common'
import { Component, Input, LOCALE_ID, OnChanges, SimpleChanges, inject } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { NxCoreModule, nonNullable } from '@metad/core'

/**
 * https://experience.sap.com/fiori-design-web/object-display-elements/
 *
 * ## Semantic Colors:
 * https://experience.sap.com/fiori-design-web/how-to-use-semantic-colors/
 * * Regular (neutral) -> basic
 * * Good (positive) -> success
 * * Warning (critical) -> warning
 * * Bad (error) -> danger
 * * Information (highlight) -> primary | info
 */
@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NxCoreModule],
  selector: 'nx-object-number',
  templateUrl: './object-number.component.html',
  styleUrls: ['./object-number.component.scss']
})
export class NxObjectNumberComponent implements OnChanges {

  private _defaultLocale = inject(LOCALE_ID)

  @Input() number: number
  @Input() unit: string
  @Input() unitSemantics: 'currency-code' | 'unit-of-measure'
  @Input() shortNumber: boolean
  @Input() digitsInfo = '1.0-5'
  @Input() get locale(): string {
    return this._locale || this._defaultLocale
  }
  set locale(value) {
    this._locale = value
  }
  private _locale: string

  _number: number
  text: string
  getCurrencySymbol = getCurrencySymbol

  ngOnChanges({ number, unit }: SimpleChanges): void {
    if (number) {
      this._number = this.number
    }
    if (number?.currentValue || unit?.currentValue) {
      if (this.unit === '%' && nonNullable(this.number)) {
        this._number = this.number * 100
      }
    }
  }
}
