import { omit, pick } from '@metad/ocap-core'
import { StoriesService } from '@metad/cloud/state'
import { saveAsYaml } from '@metad/core'
import { EmulatedDevice } from '@metad/story/core'
import { firstValueFrom } from 'rxjs'

export const StoryScales = [
  {
    name: '50%',
    value: 50
  },
  {
    name: '70%',
    value: 70
  },
  {
    name: '85%',
    value: 85
  },
  {
    name: '100%',
    value: 100
  },
  {
    name: '125%',
    value: 125
  },
  {
    name: '150%',
    value: 150
  },
  {
    name: '200%',
    value: 200
  }
]

export const EmulatedDevices: EmulatedDevice[] = [
  {
    name: 'Moto G4',
    width: 360,
    height: 640
  },
  {
    name: 'iPhone SE',
    width: 375,
    height: 667
  },
  {
    name: 'iPhone 12 Pro',
    width: 390,
    height: 844
  },
  {
    name: 'Samsung Galaxy S8+',
    width: 360,
    height: 740
  },
  {
    name: 'iPad Air',
    width: 820,
    height: 1180
  },
  {
    name: 'iPad Mini',
    width: 768,
    height: 1024
  },
  {
    name: 'Galaxy Fold',
    width: 280,
    height: 653,
    isFold: true,
    fold: {
      width: 717,
      height: 512
    }
  },
  {
    name: 'Macbook pro 14',
    width: 1512,
    height: 945
  },
]

export const DeviceZooms = [
  {
    name: '50%',
    value: 0.5
  },
  {
    name: '75%',
    value: 0.75
  },
  {
    name: '100%',
    value: 1
  },
  {
    name: '125%',
    value: 1.25
  },
  {
    name: '150%',
    value: 1.5
  }
]

export enum DeviceOrientation {
  portrait,
  landscape
}

/**
 * Download story file
 *
 * @param id Story ID
 */
export async function downloadStory(storiesService: StoriesService, id: string) {
  let storyName = ''
  let story = await firstValueFrom(storiesService.getOne(id, [
    'template',
    'asTemplate',
    'preview',
    'points',
    'points.widgets',
    'models'
  ]))
  
  story = {
    ...pick(story, 'name', 'description', 'modelId', 'options', 'thumbnail', 'templateId', 'previewId'),
    models: story.models?.map(model => ({
      ...pick(model, 'key', 'name', 'id')
    })),
    points: story.points?.map(point => ({
      ...pick(point, 'key', 'name', 'options'),
      widgets: point.widgets?.map(widget => ({
        ...pick(widget, 'key', 'name', 'options')
      }))
    }))
  } as any

  storyName = story.name || story.id
  saveAsYaml(`${storyName}.yml`, story)
}
