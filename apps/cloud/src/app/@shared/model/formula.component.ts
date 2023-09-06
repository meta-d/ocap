import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, Inject, Input } from '@angular/core'
import { FormControl, FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { NgmSearchComponent } from '@metad/ocap-angular/common'
import { ButtonGroupDirective } from '@metad/ocap-angular/core'
import { FormulaModule } from '@metad/ocap-angular/formula'
import { DataSettings, EntityType, PropertyMeasure, Syntax } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { HighlightDirective } from '@metad/components/core'
import { MDXReference } from '@metad/components/mdx'
import { CalculatedMeasureComponent } from '@metad/components/property'
import { sortBy } from 'lodash-es'
import { MarkdownModule } from 'ngx-markdown'
import { map, of, startWith, switchMap } from 'rxjs'
import { MaterialModule } from '../material.module'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    FormulaModule,
    MarkdownModule,
    HighlightDirective,
    CalculatedMeasureComponent,
    ButtonGroupDirective,
    NgmSearchComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-model-formula',
  templateUrl: 'formula.component.html',
  styleUrls: ['formula.component.scss']
})
export class ModelFormulaComponent {
  Syntax = Syntax
  FUNCTIONS = sortBy(MDXReference.FUNCTIONS, 'label')

  @Input() dataSettings: DataSettings
  @Input() entityType: EntityType
  @Input() measure: Partial<PropertyMeasure>

  searchControl = new FormControl('')

  get highlight() {
    return this.searchControl.value
  }
  get syntax() {
    return this.entityType?.syntax
  }

  formula = ''

  public readonly functions$ = of(sortBy(MDXReference.FUNCTIONS, 'label')).pipe(
    switchMap((functions) =>
      this.searchControl.valueChanges.pipe(
        startWith(''),
        map((text) => {
          text = text?.trim().toLowerCase()
          return text ? functions.filter((item) => item.label.toLowerCase().includes(text)) : functions
        })
      )
    )
  )

  constructor(
    @Inject(MAT_DIALOG_DATA)
    private data: {
      dataSettings: DataSettings
      entityType: EntityType
      measure: Partial<PropertyMeasure>
      formula: string
    }
  ) {
    this.dataSettings = data.dataSettings
    this.entityType = data.entityType
    this.measure = data.measure
    this.formula = data.formula
  }
}
