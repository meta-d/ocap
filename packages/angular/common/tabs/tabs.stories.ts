import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { MatMenuModule } from '@angular/material/menu'
import { MatTabGroup, MatTabsModule } from '@angular/material/tabs'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { Meta, moduleMetadata, Story } from '@storybook/angular'

export default {
  title: 'MaterialTabs',
  component: MatTabGroup,
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule, MatButtonModule, MatMenuModule, MatIconModule, MatTabsModule, OcapCoreModule]
    })
  ]
} as Meta<MatTabGroup>

const Template: Story<any> = (args: any) => ({
  props: args,
  template: `
<mat-tab-group class="ngm-tab-group-desktop">
  <mat-tab label="First"> Content 1 </mat-tab>
  <mat-tab label="Second"> Content 2 </mat-tab>
  <mat-tab label="Third"> Content 3 </mat-tab>
</mat-tab-group>
  `,
  styles: [``]
})

export const Primary = Template.bind({})
Primary.args = {
  barPosition: 'right'
}

export const CloseButton = ((args: any) => ({
  props: args,
  template: `
<mat-tab-group class="ngm-appearance-desktop" disableRipple>
  <mat-tab label="First">
    <ng-template matTabLabel>First
      <button mat-icon-button disableRipple displayDensity="cosy" class="ngm-appearance-desktop ngm-tab-button-right"
          [matMenuTriggerFor]="pointMenu"
          [matMenuTriggerData]="{point: point}"
      >
          <mat-icon>more_vert</mat-icon>
      </button>
    </ng-template>
   Content 1 </mat-tab>
  <mat-tab label="Second"> Content 2 </mat-tab>
  <mat-tab label="Third"> Content 3 </mat-tab>
</mat-tab-group>
<mat-menu #pointMenu="matMenu" xPosition="before">
  <button mat-menu-item>Item 1</button>
  <button mat-menu-item>Item 2</button>
</mat-menu>
  `,
  styles: [``]
})).bind({})
