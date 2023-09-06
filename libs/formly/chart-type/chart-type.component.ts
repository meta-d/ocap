import { ChangeDetectionStrategy, Component, HostBinding, inject, OnInit, TemplateRef, ViewChild } from '@angular/core'
import { FormArray, FormControl, FormGroup } from '@angular/forms'
import { MatDialog } from '@angular/material/dialog'
import { CopilotChatMessageRoleEnum } from '@metad/copilot'
import { MetadFormlyArrayComponent } from '@metad/formly-mat/array'
import { cloneDeep, isNil, isString } from '@metad/ocap-core'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FieldType } from '@ngx-formly/core'
import { NgmCopilotService, NxChartType } from '@metad/core'
import { NgxPopperjsPlacements, NgxPopperjsTriggers } from 'ngx-popperjs'
import { BehaviorSubject, firstValueFrom } from 'rxjs'
import { CHART_TYPES, GeoProjections } from './types'
import { TranslateService } from '@ngx-translate/core'
import { NxSettingsPanelService } from '@metad/story/designer'

@UntilDestroy({ checkProperties: true })
@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-formly-chart-type',
  templateUrl: './chart-type.component.html',
  styleUrls: ['chart-type.component.scss']
})
export class PACFormlyChartTypeComponent extends FieldType implements OnInit {
  @HostBinding('class.pac-formly-chart-type') readonly _hostClass = true
  NgxPopperjsTriggers = NgxPopperjsTriggers
  NgxPopperjsPlacements = NgxPopperjsPlacements
  NxChartType = NxChartType
  GeoProjections = GeoProjections

  private readonly _dialog = inject(MatDialog)
  private readonly formlyArray? = inject(MetadFormlyArrayComponent,{ optional: true })
  private readonly translateService = inject(TranslateService)
  private readonly settingsService = inject(NxSettingsPanelService)

  ORIENTS = [
    { value: 'horizontal', label: 'Horizontal', icon: 'align_horizontal_left' },
    { value: 'vertical', label: 'Vertical', icon: 'align_vertical_bottom' }
  ]

  HAS_ORIENTS = {
    [NxChartType.Bar]: true,
    [NxChartType.Waterfall]: true,
    [NxChartType.Line]: true,
    [NxChartType.Heatmap]: true,
    [NxChartType.Tree]: true,
    [NxChartType.Sankey]: true
  }
  VARIANTS = {
    Bar: [
      { value: null, label: 'None' },
      { value: 'polar', label: 'Polar' }
    ],
    Waterfall: [
      {
        value: null, label: 'None'
      },
      {
        value: 'polar', label: 'Polar'
      }
    ],
    Pie: [
      { value: null, label: 'Pie' },
      { value: 'Doughnut', label: 'Doughnut' },
      { value: 'Nightingale', label: 'Nightingale' }
    ],
    Scatter: [
      { value: null, label: 'None' },
      { value: 'polar', label: 'Polar' }
    ],
    Tree: [
      { value: null, label: 'None' },
      { value: 'reverse', label: 'Reverse' },
      { value: 'radial', label: 'Radial' }
    ],
    [NxChartType.Heatmap]: [
      { value: null, label: 'None' },
      { value: 'calendar', label: 'Calendar' }
    ]
  }

  private copilotService = inject(NgmCopilotService)

  @ViewChild('mapTemp') mapTemplate: TemplateRef<unknown>

  get chartType() {
    return this.chartTypeForm.value
  }

  chartTypeForm = new FormGroup({
    name: new FormControl(null),
    type: new FormControl(null),
    orient: new FormControl(null),
    variant: new FormControl(null),
    scripts: new FormControl(null),
    chartOptions: new FormControl(null)
  })
  get name() {
    return this.chartTypeForm.get('name') as FormControl
  }
  get chartTypeControl() {
    return this.chartTypeForm.get('type') as FormControl
  }
  get type() {
    return this.chartType?.type
  }
  get typeLabel() {
    return this.getChartType(this.chartType?.type)?.label
  }

  chartTypeGroups = CHART_TYPES

  get orient() {
    return this.chartTypeForm.get('orient').value
  }
  set orient(value) {
    this.chartTypeForm.patchValue({ orient: value })
  }
  get variant() {
    return this.chartTypeForm.get('variant').value
  }
  set variant(value) {
    this.chartTypeForm.patchValue({ variant: value })
  }
  get scripts() {
    return this.chartTypeForm.get('scripts').value
  }
  set scripts(value) {
    this.chartTypeForm.patchValue({ scripts: value })
  }

  // Form for geomap type
  mapFormGroup = new FormGroup({
    map: new FormControl(null),
    mapUrl: new FormControl(null),
    projection: new FormControl(null),
    isTopoJSON: new FormControl<boolean>(null),
    features: new FormControl(null)
  })

  get removable() {
    return this.field.props?.['removable']
  }

  @HostBinding('class.pac-formly-chart-type__custom-code')
  showCustomCode = false

  prompt = ''
  answering = false
  systemPrompt = `假设你一名程序员，请根据注释需求补全代码，要求：编写一个函数用于绘制 ECharts 图形，只要编写函数体内部代码，函数只返回 ECharts options，输入参数有 data chartAnnotation chartOptions chartSettings
data 数据类型为 {data: <实际数据对象（包含measure对应的属性）>[]} chartAnnotation 类型为 {measures: {measure: string}[]}`
  public editor$ = new BehaviorSubject(null)
  editorOptions = {
    theme: 'vs',
    language: 'javascript',
    automaticLayout: true
  }

  ngOnInit(): void {
    if (isNil(this.field.formControl.value) || isString(this.field.formControl.value)) {
      this.chartTypeForm.patchValue({ type: this.field.formControl.value })
    } else {
      this.chartTypeForm.patchValue(this.field.formControl.value)
    }

    this.chartTypeForm.valueChanges.subscribe((value) => {
      this.field.formControl.setValue(value)
    })
  }

  async openMap() {
    this.mapFormGroup.patchValue({
      ...this.field.formControl.value,
    })
    
    const result = await firstValueFrom(this._dialog.open(this.mapTemplate, { panelClass: 'nx-dialog-container' }).afterClosed())
    if (result) {
      this.field.formControl.setValue({
        ...this.mapFormGroup.value,
        ...this.chartTypeForm.value
      })
    } else {
      this.mapFormGroup.reset()
    }
  }

  getChartType(type: string) {
    let chart = null
    this.chartTypeGroups.find((group) => {
      return group.charts.find((item) => {
        if (item.value === type) {
          chart = item
          return true
        }
        return false
      })
    })
    return chart
  }

  async openChartOptions() {
    const title = await firstValueFrom(
      this.translateService.get('FORMLY.PROPERTY_SELECT.ChartOptions', { Default: 'Chart Options' })
    )

    const result = this.settingsService.openSecondDesigner(
      'ChartOptions',
      cloneDeep(this.field.formControl.value),
      title,
      true
    )
    .pipe(untilDestroyed(this))
    .subscribe((result) => {
      if (result) {
        this.chartTypeForm.patchValue({
          chartOptions: cloneDeep(result.chartOptions)
        })
      }
    })
  }

  killMyself() {
    if (this.field.form instanceof FormArray) {
      const index = this.field.parent.fieldGroup.indexOf(this.field)
      this.formlyArray?.remove(index)
    } else {
      const index = this.field.parent.fieldGroup.findIndex((field) => field.key === this.field.key)
      if (index > -1) {
        this.field.parent.fieldGroup.splice(index, 1)
        this.field.parent.model[this.field.key as string] = null
      }
      this.field.parent.formControl.setValue(this.field.parent.model)
    }
  }

  // async openCode() {
  //   const result = await firstValueFrom(this._dialog.open(ChartTypeCodeEditorComponent, {
  //     hasBackdrop: false,
  //     panelClass: 'medium',
  //     data: {
  //       model: this.chartTypeForm.value?.scripts,
  //       language: 'javascript',
  //       onApply: (model) => {
  //         this.chartTypeForm.patchValue({
  //           scripts: model
  //         })
  //       }
  //     }
  //   }).afterClosed())

  //   if (result !== undefined) {
  //     this.chartTypeForm.patchValue({
  //       scripts: result
  //     })
  //   }
  // }

  async askComplete() {
    this.answering = true
    try {
      const choices = await this.copilotService.createChat([
        {
          role: CopilotChatMessageRoleEnum.System,
          content: this.systemPrompt
        },
        {
          role: CopilotChatMessageRoleEnum.User,
          content: this.scripts
        }
      ])
  
      this.scripts = choices[0].message.content
    } catch(err) {
      this.answering = false
    }
  }

  async askCopilot() {
    this.answering = true
    try {
      const choices = await this.copilotService.createChat([
        {
          role: CopilotChatMessageRoleEnum.System,
          content: this.systemPrompt + `根据以下描述补全代码：${this.prompt}`
        },
        {
          role: CopilotChatMessageRoleEnum.User,
          content: this.scripts
        }
      ])
  
      this.scripts = choices[0].message.content
    } catch(err) {
      this.answering = false
    }
  }
}
