import { NgModule } from '@angular/core'
import { StoryExplorerModule } from './explorer'
import { NgmPinModule } from './pin'
import { NxStorySettingsModule } from './settings'

@NgModule({
  declarations: [],
  imports: [StoryExplorerModule, NgmPinModule, NxStorySettingsModule],
  exports: [StoryExplorerModule, NgmPinModule, NxStorySettingsModule]
})
export class NgmStoryModule {}
