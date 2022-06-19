import { MatCardModule } from '@angular/material/card'
import { MatSidenavModule } from '@angular/material/sidenav'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Meta, moduleMetadata, Story } from '@storybook/angular'
import { ResizerBarDirective } from './resizer.directive'
import { ResizerModule } from './resizer.module'

export default {
  title: 'ResizerBarDirective',
  component: ResizerBarDirective,
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule, MatSidenavModule, MatCardModule, ResizerModule]
    })
  ]
} as Meta<ResizerBarDirective>

const Template: Story<any> = (args: any) => ({
  props: args,
  template: `
<mat-drawer-container class="example-container" autosize>
  <mat-drawer mode="side" [position]="drawerPosition" opened ngmResizer [resizerWidth]="200">Drawer content
    <div ngmResizerBar [resizerBarPosition]="barPosition" cdkDrag></div>
  </mat-drawer>
  <mat-drawer-content>Main content</mat-drawer-content>
</mat-drawer-container>
  `,
  styles: [`.mat-drawer-container {
height: 400px;
  }`]
})

export const Primary = Template.bind({})
Primary.args = {
  barPosition: 'right'
}

export const Left = Template.bind({})
Left.args = {
  drawerPosition: 'end',
  barPosition: 'left'
}

const CardTemplate: Story<any> = (args: any) => ({
  props: args,
  template: `
<mat-card ngmResizer [resizerHeight]="200">
Simple card
  <div ngmResizerBar [resizerBarPosition]="barPosition" cdkDrag></div>
</mat-card>
  `,
  styles: [`.mat-card {margin: 5rem;}`]
})

export const Top = CardTemplate.bind({})
Top.args = {
  barPosition: 'top'
}

export const Bottom = CardTemplate.bind({})
Bottom.args = {
  barPosition: 'bottom'
}
