import { CommonModule } from '@angular/common'
import { Component, Input, OnChanges, SimpleChanges } from '@angular/core'
import { AbstractControl, FormControl, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn } from '@angular/forms'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatInputModule } from '@angular/material/input'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { DisplayDensity, OcapCoreModule } from '@metad/ocap-angular/core'
import { DisplayBehaviour, TreeNodeInterface } from '@metad/ocap-core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { NgmMatSelectComponent } from './select.component'

@Component({
  selector: 'test-select',
  template: `<ngm-mat-select
    [label]="label"
    [placeholder]="'Please Select ' + label"
    [selectOptions]="selectOptions"
    [multiple]="multiple"
    [virtualScroll]="virtualScroll"
    [displayBehaviour]="displayBehaviour"
    [displayDensity]="displayDensity"
    [validators]="validators"
    [formControl]="formControl"
    (ngModelChange)="onModelChange($event)"
  >
  </ngm-mat-select>
`
})
class TestSelectComponent<T> implements OnChanges {

  @Input() label: string
  @Input() placeholder: string
  @Input() selectOptions: TreeNodeInterface<T>
  @Input() multiple: boolean
  @Input() disabled: boolean
  @Input() virtualScroll: boolean
  @Input() treeViewer: boolean
  @Input() color: string
  @Input() displayBehaviour: DisplayBehaviour | string
  @Input() displayDensity: DisplayDensity | string
  @Input() model = null
  @Input() validators: ValidatorFn | ValidatorFn[] | null

  formControl = new FormControl()

  ngOnInit() {
    if (this.disabled) {
      this.formControl.disable()
    }
    this.formControl.setValue(this.model)
  }

  ngOnChanges({validators}: SimpleChanges): void {
    //
  }

  onModelChange(event) {
    console.warn(event)
  }
}

export default {
  title: 'NgmMatSelectComponent',
  component: NgmMatSelectComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, BrowserAnimationsModule, FormsModule, ReactiveFormsModule, OcapCoreModule,
        MatFormFieldModule,
        MatInputModule
      ],
      declarations: [TestSelectComponent]
    })
  ]
} as Meta<NgmMatSelectComponent>

const TREE_NODE_DATA = [
  {
    value: 'Fruit',
    label: '水果'
  },
  { value: 'Apple', label: '苹果', raw: { type: 'Hive' } },
  { value: 'Banana', label: '香蕉' },
  { value: 'Fruit loops', label: '果循环' },
  {
    value: 'Vegetables',
    label: '蔬菜'
  },
  {
    value: 'Green',
    label: '绿色'
  },
  { value: 'Broccoli', label: '西兰花' },
  { value: 'Brussel sprouts', label: '豆芽' },
  {
    value: 'Orange',
    label: '橙'
  },
  { value: 'Pumpkins', label: '南瓜', raw: { type: 'PG' } },
  { value: 'Carrots', label: '胡萝卜' }
] as any

const Template: Story<any> = (args: any) => ({
  props: args,
  template: `<test-select [label]="label" [selectOptions]="selectOptions" [model]="model" [multiple]="multiple" [virtualScroll]="virtualScroll"
  [displayBehaviour]="displayBehaviour" [displayDensity]="displayDensity"
  [disabled]="disabled"
  ></test-select>`,
  styles: [``]
})

export const Select = Template.bind({})
Select.args = {
  label: '水果',
  selectOptions: TREE_NODE_DATA,
  model: 'Apple'
}

export const SelectMultiple = Template.bind({})
SelectMultiple.args = {
  label: '水果',
  selectOptions: TREE_NODE_DATA,
  multiple: true,
  model: ['Apple', 'Pumpkins']
}

export const SelectVirtualScroll = Template.bind({})
SelectVirtualScroll.args = {
  label: '水果',
  selectOptions: TREE_NODE_DATA,
  multiple: true,
  virtualScroll: true,
  model: ['Apple', 'Pumpkins']
}

export const SelectDisplayBehaviour = Template.bind({})
SelectDisplayBehaviour.args = {
  label: '水果',
  selectOptions: TREE_NODE_DATA,
  model: 'Apple',
  displayBehaviour: DisplayBehaviour.descriptionAndId
}

export const SelectCosy = Template.bind({})
SelectCosy.args = {
  label: '水果',
  selectOptions: TREE_NODE_DATA,
  model: 'Apple',
  displayDensity: DisplayDensity.cosy
}

export const SelectCompact = Template.bind({})
SelectCompact.args = {
  label: '水果',
  selectOptions: TREE_NODE_DATA,
  model: 'Apple',
  displayDensity: DisplayDensity.compact
}

export const SelectNoSelectOptions = Template.bind({})
SelectNoSelectOptions.args = {
  label: '水果',
  model: 'Apple'
}

export const SelectDisabled = Template.bind({})
SelectDisabled.args = {
  label: '水果',
  model: 'Apple',
  selectOptions: TREE_NODE_DATA,
  disabled: true
}

const TemplateError: Story<any> = (args: any) => ({
  props: args,
  template: `<test-select [label]="label"
    [selectOptions]="selectOptions"
    [model]="model"
    [multiple]="multiple"
    [virtualScroll]="virtualScroll"
    [displayBehaviour]="displayBehaviour"
    [displayDensity]="displayDensity"
    [disabled]="disabled"
    [validators]="validators"
  ></test-select>`,
  styles: [``]
})

export const SelectValidators = TemplateError.bind({})
SelectValidators.args = {
  label: '水果',
  model: 'Apple',
  selectOptions: TREE_NODE_DATA,
  validators:  [(control: AbstractControl): ValidationErrors | null => {
    return control.value.value === "Apple" ? {forbiddenName: '不喜欢这个水果'} : null
  }]
}
