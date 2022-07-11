import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { OcapCoreModule } from '@metad/ocap-angular/core'
import { moduleMetadata, Story } from '@storybook/angular'

export default {
  title: 'Appearance',
  decorators: [
    moduleMetadata({
      imports: [OcapCoreModule, MatIconModule, MatButtonModule],
      providers: []
    })
  ]
}

const Template: Story<any> = (args: any) => ({
  props: args,
  template: `
<div style="background-image: url(https://helpx.adobe.com/content/dam/help/en/photoshop/using/convert-color-image-black-white/jcr_content/main-pars/before_and_after/image-before/Landscape-Color.jpg)">
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
</div>
  `
})

export const Primary = Template.bind({})
Primary.args = {}
