import { provideHttpClient } from '@angular/common/http'
import { MatButtonModule } from '@angular/material/button'
import { MatCheckboxModule } from '@angular/material/checkbox'
import { MatChipsModule } from '@angular/material/chips'
import { MatIconModule } from '@angular/material/icon'
import { provideAnimations } from '@angular/platform-browser/animations'
import { NgmSearchComponent } from '@metad/ocap-angular/common'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { provideTranslate } from '@metad/ocap-angular/mock'
import { applicationConfig, moduleMetadata } from '@storybook/angular'

export default {
  title: 'DisplayDensity',
  decorators: [
    applicationConfig({
      providers: [provideAnimations(), provideHttpClient(), provideTranslate()]
    }),
    moduleMetadata({
      imports: [OcapCoreModule, MatIconModule, MatButtonModule, MatChipsModule, MatCheckboxModule, NgmSearchComponent],
      providers: []
    })
  ]
}

const Template = (args: any) => ({
  props: args,
  template: `
<div>
  <mat-icon>share</mat-icon>
  <mat-icon displayDensity="cosy">share</mat-icon>
  <mat-icon displayDensity="compact">share</mat-icon>
</div>

<div>
  <button mat-icon-button>
    <mat-icon>share</mat-icon>
  </button>
  <button mat-icon-button displayDensity="cosy">
    <mat-icon>share</mat-icon>
  </button>
  <button mat-icon-button displayDensity="compact">
    <mat-icon>share</mat-icon>
  </button>
</div>

<div displayDensity="comfort">
  <mat-checkbox>Check me!</mat-checkbox>
  <ngm-search></ngm-search>
  <mat-chip-grid #chipGrid aria-label="Fruit selection">
    <mat-chip-row>fruit
      <button matChipRemove [attr.aria-label]="'remove ' + fruit">
        <mat-icon>cancel</mat-icon>
      </button>
    </mat-chip-row>
  </mat-chip-grid>
</div>
<div displayDensity="cosy">
  <mat-checkbox>Check me!</mat-checkbox>
  <ngm-search></ngm-search>
  <mat-chip-grid #chipGrid aria-label="Fruit selection">
    <mat-chip-row>fruit
      <button matChipRemove [attr.aria-label]="'remove ' + fruit">
        <mat-icon>cancel</mat-icon>
      </button>
    </mat-chip-row>
  </mat-chip-grid>
</div>
<div displayDensity="compact">
  <mat-checkbox>Check me!</mat-checkbox>
  <ngm-search></ngm-search>
  <mat-chip-grid #chipGrid aria-label="Fruit selection">
    <mat-chip-row>fruit
      <button matChipRemove [attr.aria-label]="'remove ' + fruit">
        <mat-icon>cancel</mat-icon>
      </button>
    </mat-chip-row>
  </mat-chip-grid>
</div>
  `
})

export const Primary = Template.bind({
  args: {}
})
