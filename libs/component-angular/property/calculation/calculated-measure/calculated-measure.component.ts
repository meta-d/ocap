import { coerceBooleanProperty } from '@angular/cdk/coercion'
import { CdkDragDrop, DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { Component, forwardRef, inject, Input, ViewChild, ViewContainerRef } from '@angular/core'
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatDialog } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { MatListModule } from '@angular/material/list'
import { MatMenuModule } from '@angular/material/menu'
import { MatSidenavModule } from '@angular/material/sidenav'
import { MatTabsModule } from '@angular/material/tabs'
import { MatToolbarModule } from '@angular/material/toolbar'
import { NgmCommonModule, ResizerModule } from '@metad/ocap-angular/common'
import { NgmDSCoreService, OcapCoreModule } from '@metad/ocap-angular/core'
import { EntityCapacity, NgmEntitySchemaComponent, NgmEntityPropertyComponent } from '@metad/ocap-angular/entity'
import {
  C_MEASURES,
  DataSettings,
  EntityType,
  getEntityCalculations,
  getEntityParameters,
  isIndicatorMeasureProperty,
  isPropertyMeasure,
  ParameterProperty,
  Syntax
} from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { BaseEditorDirective, NxEditorModule } from '@metad/components/editor'
import { NxCoreService } from '@metad/core'
import { negate, sortBy } from 'lodash-es'
import { BehaviorSubject, combineLatestWith, firstValueFrom, map, of, startWith, switchMap } from 'rxjs'
import { MDXReference } from '@metad/components/mdx'
import { MatExpansionModule } from '@angular/material/expansion'
import { HighlightDirective } from '@metad/components/core'
import { MarkdownModule } from 'ngx-markdown'
import { NgmParameterCreateComponent } from '@metad/ocap-angular/parameter'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    DragDropModule,
    MatMenuModule,
    MatSidenavModule,
    MatTabsModule,
    MatIconModule,
    MatButtonModule,
    MatListModule,
    MatToolbarModule,
    MatExpansionModule,
    TranslateModule,
    MarkdownModule,

    OcapCoreModule,
    NgmCommonModule,
    ResizerModule,
    NgmEntityPropertyComponent,
    NgmEntitySchemaComponent,
    NxEditorModule,
    HighlightDirective,
  ],
  selector: 'ngm-calculated-measure',
  templateUrl: './calculated-measure.component.html',
  styleUrls: ['./calculated-measure.component.scss'],
  host: {
    class: 'ngm-calculated-measure'
  },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => CalculatedMeasureComponent)
    }
  ]
})
export class CalculatedMeasureComponent implements ControlValueAccessor {
  Syntax = Syntax
  EntityCapacity = EntityCapacity
  FUNCTIONS = []
  
  private readonly _dialog = inject(MatDialog)
  private readonly _viewContainerRef = inject(ViewContainerRef)

  @Input() get opened() {
    return this._opened
  }
  set opened(value: boolean | string) {
    this._opened = coerceBooleanProperty(value)
  }
  private _opened = false

  @Input() dsCoreService: NgmDSCoreService
  @Input() dataSettings: DataSettings

  @Input()
  get entityType(): EntityType {
    return this.entityType$.value
  }
  set entityType(value) {
    this.entityType$.next(value)
  }
  private entityType$ = new BehaviorSubject<EntityType>(null)
  
  @Input() coreService: NxCoreService
  @Input() syntax: Syntax

  @Input() get story() {
    return this._story
  }
  set story(value: boolean | string) {
    this._story = coerceBooleanProperty(value)
  }
  private _story = false
  @Input() get disabled() {
    return this._disabled
  }
  set disabled(value: boolean | string) {
    this._disabled = coerceBooleanProperty(value)
  }
  private _disabled = false

  @ViewChild('editor') editor!: BaseEditorDirective

  calculatedMemberSearch = new FormControl<string>('')
  get calculatedMemberHighlight() {
    return this.calculatedMemberSearch.value
  }

  fnSearchControl = new FormControl<string>(null)
  get fnHighlight() {
    return this.fnSearchControl.value
  }
  get statement(): string {
    return this._statement
  }
  set statement(value) {
    this._statement = value
    this._onChange?.(this._statement)
  }
  private _statement = ''
  
  calculations = []
  private _onChange: any

  public readonly calculations$ = this.entityType$.pipe(
    map(getEntityCalculations),
    map((values) => [
      ...sortBy(values.filter(negate(isIndicatorMeasureProperty)), 'calculationType'),
      ...values.filter(isIndicatorMeasureProperty)
    ]),
    combineLatestWith(this.calculatedMemberSearch.valueChanges.pipe(startWith(''))),
    map(([values, search]) => values.filter((v) => v.caption?.toLowerCase().includes(search.toLowerCase()) ||
      v.name.toLowerCase().includes(search.toLowerCase()))
    ),
  )
  public readonly parameters$ = this.entityType$.pipe(map(getEntityParameters))

  public readonly functions$ = of(sortBy(MDXReference.FUNCTIONS, 'label')).pipe(
    switchMap((functions) =>
      this.fnSearchControl.valueChanges.pipe(
        startWith(''),
        map((text) => {
          text = text?.trim().toLowerCase()
          return text ? functions.filter((item) => item.label.toLowerCase().includes(text)) : functions
        })
      )
    )
  )

  writeValue(obj: any): void {
    this._statement = obj
  }
  registerOnChange(fn: any): void {
    this._onChange = fn
  }
  registerOnTouched(fn: any): void {}
  setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled
  }

  async openCreateParameter(parameter?: ParameterProperty) {
    const result = await firstValueFrom(this._dialog.open(NgmParameterCreateComponent, {
        viewContainerRef: this._viewContainerRef,
        data: {
          dataSettings: this.dataSettings,
          entityType: this.entityType,
          coreService: this.coreService,
          dimension: {}, // TODO
          name: parameter?.name
        }
      })
      .afterClosed())
    
    if (result) {
      // 参数创建成功
      console.log(result)
    }
  }

  drop(event: CdkDragDrop<Array<{ name: string }>>) {
    if (event.container.id === 'ngm-calculated-editor') {
      if (event.previousContainer.id === 'ngm-calculated-calculations') {
        this.editor.insert(`[${C_MEASURES}].[${event.item.data.name}]`)
      } else if (event.previousContainer.id === 'ngm-calculated-parameters') {
        this.editor.insert(`[@${event.item.data.name}]`)
      } else if (event.previousContainer.id === 'ngm-calculated-measure__entity-schema') {
        if (isPropertyMeasure(event.item.data)) {
          this.editor.insert(`[${C_MEASURES}].[${event.item.data.name}]`)
        } else {
          this.editor.insert(event.item.data.name)
        }
      } else if(typeof event.item.data === 'string') {
        this.editor.insert(event.item.data)
      }
    }
  }

  openHelp(event) {
    window.open('https://docs.microsoft.com/en-us/sql/mdx/mdx-function-reference-mdx', '_blank')
  }
}
