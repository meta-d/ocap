import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MatButtonToggleModule } from '@angular/material/button-toggle'
import { MatIconModule } from '@angular/material/icon'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { moduleMetadata, Story } from '@storybook/angular'

export default {
  title: 'Appearance',
  decorators: [
    moduleMetadata({
      imports: [FormsModule, OcapCoreModule, MatIconModule, MatButtonModule, MatButtonToggleModule],
      providers: []
    })
  ]
}

const Template: Story<any> = (args: any) => ({
  props: args,
  template: `
<div >
<div >
  <mat-icon>share</mat-icon>
  <mat-icon displayDensity="cosy">share</mat-icon>
  <mat-icon displayDensity="compact">share</mat-icon>
</div>

<div>
  <button mat-icon-button ngmAppearance="danger">
    <mat-icon>share</mat-icon>
  </button>
  <button mat-icon-button ngmAppearance="acrylic">
    <mat-icon>share</mat-icon>
  </button>
  <button mat-icon-button displayDensity="cosy">
    <mat-icon>share</mat-icon>
  </button>
  <button mat-icon-button displayDensity="compact">
    <mat-icon>share</mat-icon>
  </button>
</div>

<div>
  <mat-button-toggle-group name="fontStyle" aria-label="Font Style" ngmAppearance="color" color="primary">
    <mat-button-toggle value="bold">Bold</mat-button-toggle>
    <mat-button-toggle value="italic">Italic</mat-button-toggle>
    <mat-button-toggle value="underline">Underline</mat-button-toggle>
  </mat-button-toggle-group>

  <mat-button-toggle-group name="fontStyle" aria-label="Font Style" ngmAppearance="color" color="accent">
    <mat-button-toggle value="bold">Bold</mat-button-toggle>
    <mat-button-toggle value="italic">Italic</mat-button-toggle>
    <mat-button-toggle value="underline">Underline</mat-button-toggle>
  </mat-button-toggle-group>

  <mat-button-toggle-group name="fontStyle" aria-label="Font Style" displayDensity="compact"
    ngmAppearance="color" color="accent"
    [value]="'italic'">
    <mat-button-toggle disableRipple value="bold">Bold</mat-button-toggle>
    <mat-button-toggle disableRipple value="italic">Italic</mat-button-toggle>
    <mat-button-toggle disableRipple value="underline">Underline</mat-button-toggle>
  </mat-button-toggle-group>

  <mat-button-toggle-group name="fontStyle" aria-label="Font Style" multiple="true" displayDensity="compact"
    ngmAppearance="color" color="accent">
    <mat-button-toggle disableRipple value="bold">Bold</mat-button-toggle>
    <mat-button-toggle disableRipple value="italic">Italic</mat-button-toggle>
    <mat-button-toggle disableRipple value="underline">Underline</mat-button-toggle>
  </mat-button-toggle-group>

  <mat-button-toggle-group name="fontStyle" aria-label="Font Style" vertical ngmAppearance="color" color="primary">
    <mat-button-toggle value="bold">Bold</mat-button-toggle>
    <mat-button-toggle value="italic">Italic</mat-button-toggle>
    <mat-button-toggle value="underline">Underline</mat-button-toggle>
  </mat-button-toggle-group>

  <mat-button-toggle-group name="fontStyle" aria-label="Font Style" vertical multiple="true" displayDensity="compact"
    ngmAppearance="color" color="accent">
    <mat-button-toggle disableRipple value="bold">Bold</mat-button-toggle>
    <mat-button-toggle disableRipple value="italic">Italic</mat-button-toggle>
    <mat-button-toggle disableRipple value="underline">Underline</mat-button-toggle>
  </mat-button-toggle-group>

  <mat-button-toggle-group name="fontStyle" aria-label="Font Style" ngmAppearance="outline" color="primary">
    <mat-button-toggle value="bold">Bold</mat-button-toggle>
    <mat-button-toggle value="italic">Italic</mat-button-toggle>
    <mat-button-toggle value="underline">Underline</mat-button-toggle>
  </mat-button-toggle-group>

  <mat-button-toggle-group name="fontStyle" aria-label="Font Style" ngmAppearance="outline" color="primary" displayDensity="compact">
    <mat-button-toggle value="bold">Bold</mat-button-toggle>
    <mat-button-toggle value="italic">Italic</mat-button-toggle>
    <mat-button-toggle value="underline">Underline</mat-button-toggle>
  </mat-button-toggle-group>
</div>
</div>
  `
})

export const Primary = Template.bind({})
Primary.args = {}
