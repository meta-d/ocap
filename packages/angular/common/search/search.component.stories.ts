import { CommonModule } from '@angular/common'
import { BrowserAnimationsModule } from '@angular/platform-browser/animations'
import { TranslateModule } from '@ngx-translate/core'
import { Meta, moduleMetadata } from '@storybook/angular'
import { NgmSearchComponent } from './search.component'

export default {
  title: 'NgmSearchComponent',
  component: NgmSearchComponent,
  decorators: [
    moduleMetadata({
      imports: [CommonModule, BrowserAnimationsModule, TranslateModule.forRoot(), NgmSearchComponent],
      declarations: []
    })
  ]
} as Meta<NgmSearchComponent>

const Template = (args: any) => ({
  props: args
})

export const Search = Template.bind({})
