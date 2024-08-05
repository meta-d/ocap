import { FORMLY_CONFIG } from '@ngx-formly/core'
import { PACFormlyImageUploadComponent } from './image-upload/image-upload.component'
import { PACFormlyWidgetDesignerComponent } from './widget/widget.component'
import { PACFormlyTextDesignerComponent } from './text/text.component'

export * from './image-upload/image-upload.component'
export * from './page-designer/page-designer.component'
export * from './story-designer/story-designer.component'
export * from './widget-designer/widget-designer.component'
export * from './widget/widget.component'

export function provideFormlyStory() {
  return {
    provide: FORMLY_CONFIG,
    multi: true,
    useValue: {
      types: [
        {
          name: 'styling',
          component: PACFormlyWidgetDesignerComponent
        },
        {
          name: 'text-css',
          component: PACFormlyTextDesignerComponent
        },
        {
          name: 'image-upload',
          component: PACFormlyImageUploadComponent
        },
      ]
    }
  }
}
