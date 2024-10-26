import { NgModule } from '@angular/core'
import { StoryExplorerModule } from './explorer'
import { NxStorySettingsModule } from './settings'

@NgModule({
  declarations: [],
  imports: [StoryExplorerModule, NxStorySettingsModule],
  exports: [StoryExplorerModule, NxStorySettingsModule]
})
export class NgmStoryModule {}
