import { NgmDSCoreService, NgmOcapCoreService, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { NxStoryService } from '@metad/story/core'
import { NxSettingsPanelService } from '@metad/story/designer'

export function provideStory() {
  return [NgmDSCoreService, NgmOcapCoreService, NxStoryService]
}

export function provideStoryDesigner() {
  return [NgmDSCoreService, NxStoryService, NgmOcapCoreService, NxSettingsPanelService]
}

export function provideStoryPoint() {
  return [NgmDSCoreService, NxStoryService, NgmSmartFilterBarService]
}