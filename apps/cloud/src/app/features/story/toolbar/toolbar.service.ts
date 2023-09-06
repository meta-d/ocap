import { Injectable, ViewContainerRef, inject } from '@angular/core'
import { MatDialog } from '@angular/material/dialog'
import { ComponentSubStore } from '@metad/store'
import { TranslateService } from '@ngx-translate/core'
import { DeepPartial } from '@metad/core'
import { NxStoryService, Story, StoryState, StoryWidget } from '@metad/story/core'
import { firstValueFrom } from 'rxjs'
import { distinctUntilChanged, map } from 'rxjs/operators'
import { IStoryTemplate, StoryTemplateType, ToastrService } from '../../../@core'
import { StoryTemplateComponent } from '../../../@shared'


@Injectable()
export class StoryToolbarService extends ComponentSubStore<Story, StoryState> {
  private readonly translateService = inject(TranslateService)
  public readonly toastrService = inject(ToastrService)
  public readonly _viewContainerRef = inject(ViewContainerRef)
  private storyService = inject(NxStoryService)
  private _dialog = inject(MatDialog)

  public widgetComponents = []

  public readonly creatingWidget$ = this.storyService.creatingWidget$.pipe(
    map((widget) => widget?.component),
    distinctUntilChanged()
  )
  constructor() {
    super({} as Story)
    this.connect(this.storyService, { parent: ['story'] })
  }

  /**
   * 新创建 Story Widget
   */
  async createWidget(widget: DeepPartial<StoryWidget>) {
    const untitled = await firstValueFrom(this.translateService.get('Story.Common.Untitled', { Default: 'Untitled' }))
    const currentWidget = await firstValueFrom(this.creatingWidget$)
    if (currentWidget === widget.component) {
      this.storyService.setCreatingWidget(null)
    } else {
      this.storyService.setCreatingWidget({
        ...widget,
        title: untitled
      } as StoryWidget)
    }
  }

  async openTemplates() {
    const story = await firstValueFrom(this.storyService.story$)
    const template = await firstValueFrom(
      this._dialog
        .open<StoryTemplateComponent, { templateId: string }, IStoryTemplate>(StoryTemplateComponent, {
          viewContainerRef: this._viewContainerRef,
          panelClass: 'large',
          data: {
            templateId: story.templateId
          }
        })
        .afterClosed()
    )

    if (template) {
      const points = await firstValueFrom(this.storyService.pageStates$)
      if (template.type === StoryTemplateType.Template && points.length > 0) {
        const confirm = await firstValueFrom(
          this.toastrService.confirm(
            {
              code: 'Story.Template.ConfirmApply',
              params: {
                Default: 'Applying a template will overwrite all pages in this story. Do you want to continue?'
              }
            },
            {
              verticalPosition: 'top'
            }
          )
        )

        if (!confirm) {
          return
        }
      }

      this.storyService.applyTemplate(template)
    }
  }
}
