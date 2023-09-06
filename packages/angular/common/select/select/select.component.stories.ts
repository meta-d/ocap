import { importProvidersFrom } from '@angular/core'
import { provideAnimations } from '@angular/platform-browser/animations'
import { NgmMissingTranslationHandler, OcapCoreModule } from '@metad/ocap-angular/core'
import { CustomTranslateLoader } from '@metad/ocap-angular/core/i18n/loader.spec'
import { MissingTranslationHandler, TranslateLoader, TranslateModule } from '@ngx-translate/core'
import { Meta, StoryObj, applicationConfig, moduleMetadata } from '@storybook/angular'
import { NgmSelectComponent } from './select.component'
import { NgmSelectModule } from '../select.module'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'

const meta: Meta<NgmSelectComponent> = {
  component: NgmSelectComponent,
  decorators: [
    applicationConfig({
      providers: [
        provideAnimations(),
        importProvidersFrom(
          TranslateModule.forRoot({
            missingTranslationHandler: {
              provide: MissingTranslationHandler,
              useClass: NgmMissingTranslationHandler
            },
            loader: { provide: TranslateLoader, useClass: CustomTranslateLoader },
            defaultLanguage: 'zh-Hans'
          })
        )
      ]
    }),
    moduleMetadata({
      declarations: [],
      imports: [MatButtonModule, MatIconModule, OcapCoreModule, NgmSelectModule]
    })
  ]
}

export default meta
type Story = StoryObj<NgmSelectComponent>

const TREE_NODE_DATA = [
  {
    value: null,
    label: ''
  },
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

export const Default = {
  args: {
    selectOptions: TREE_NODE_DATA
  }
}

export const Suffix = {
  render: (args) => ({
    props: args,
    template: `
<ngm-select [selectOptions]="selectOptions">
<div ngmSuffix>suffix</div>
</ngm-select>    
    `
  }),
  args: {
    selectOptions: TREE_NODE_DATA
  }
}


export const SuffixSearchable = {
  render: (args) => ({
    props: args,
    template: `
<ngm-select searchable [selectOptions]="selectOptions">
<div ngmSuffix>suffix</div>
</ngm-select>    
    `
  }),
  args: {
    selectOptions: TREE_NODE_DATA
  }
}

export const WithIcon: Story = {
  args: {
    valueKey: 'key',
    selectOptions: [
      {
        key: 'Fruit',
        caption: '水果',
        icon: 'apple'
      }
    ]
  }
}

export const Density: Story = {
  render: (args) => ({
    props: args,
    template: `
<div class="flex items-center gap-4 p-4">
  <ngm-select label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
  </ngm-select>

  <ngm-select searchable label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
  </ngm-select>


  <ngm-select label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
    <button ngmSuffix mat-icon-button>
      <mat-icon>close</mat-icon>
    </button>
  </ngm-select>
  <ngm-select searchable label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
    <button ngmSuffix mat-icon-button>
      <mat-icon>close</mat-icon>
    </button>
  </ngm-select>
  </div>
<div displayDensity="cosy" class="flex items-center gap-4 p-4">
  <ngm-select label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
  </ngm-select>

  <ngm-select searchable label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
  </ngm-select>


  <ngm-select label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
    <button ngmSuffix mat-icon-button>
      <mat-icon>close</mat-icon>
    </button>
  </ngm-select>
  <ngm-select searchable label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
    <button ngmSuffix mat-icon-button>
      <mat-icon>close</mat-icon>
    </button>
  </ngm-select>
</div>

<div displayDensity="compact" class="flex items-center gap-4 p-4">
  <ngm-select label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
  </ngm-select>

  <ngm-select searchable label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
  </ngm-select>

  <ngm-select label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions" displayDensity="compact">
    <button ngmSuffix mat-icon-button>
      <mat-icon>close</mat-icon>
    </button>
  </ngm-select>
  <ngm-select searchable label="Fruit" placeholder="Select an option" [selectOptions]="selectOptions">
    <button ngmSuffix mat-icon-button>
      <mat-icon>close</mat-icon>
    </button>
  </ngm-select>
</div>
    `
  }),
  args: {
    selectOptions: TREE_NODE_DATA,
  }
}