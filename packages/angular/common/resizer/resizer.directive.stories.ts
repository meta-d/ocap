import { MatCardModule } from '@angular/material/card'
import { MatSidenavModule } from '@angular/material/sidenav'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { Meta, StoryObj, moduleMetadata } from '@storybook/angular'
import { ResizerBarDirective } from './resizer.directive'
import { ResizerModule } from './resizer.module'

export default {
  title: 'Common/ResizerBarDirective',
  component: ResizerBarDirective,
  decorators: [
    moduleMetadata({
      imports: [BrowserAnimationsModule, MatSidenavModule, MatCardModule, ResizerModule]
    })
  ],
  render: (args: Partial<ResizerBarDirective>) => ({
    props: {
      ...args,
    },
    template: `<mat-drawer-container class="ngm-drawer-container" autosize>
    <mat-drawer mode="side" [position]="drawerPosition" opened ngmResizer [resizerWidth]="200">Drawer content
      <div ngmResizerBar [resizerBarPosition]="barPosition" cdkDrag></div>
    </mat-drawer>
    <mat-drawer-content>Main content</mat-drawer-content>
  </mat-drawer-container>`,
  styles: [`.mat-drawer-container {
    height: 400px;
      }`]
  }),
} as Meta<ResizerBarDirective>

type Story = StoryObj<ResizerBarDirective>

export const Primary: Story = {
  args: {
    position: 'right'
  },
};

export const Left: Story = {
  args: {
    position: 'left'
  },
};

export const Top: Story = {
  args: {
    position: 'top'
  },
  render: (args: any) => ({
    template: `
    <mat-card ngmResizer [resizerHeight]="200">
Simple card
  <div ngmResizerBar [resizerBarPosition]="barPosition" cdkDrag></div>
</mat-card>`
  })
};

export const Bottom: Story = {
  args: {
    position: 'bottom'
  },
  render: (args: any) => ({
    template: `
    <mat-card ngmResizer [resizerHeight]="200">
Simple card
  <div ngmResizerBar [resizerBarPosition]="barPosition" cdkDrag></div>
</mat-card>`
  })
};
