import { Component, Input, OnInit } from '@angular/core'
import { NxCoreService } from '@metad/core'
import { ID, NxStoryService, Story, StoryWidget } from '@metad/story/core'
import { NxSettingsPanelService } from '@metad/story/designer'
import { BehaviorSubject, Observable } from 'rxjs'

@Component({
  selector: 'ngm-pin-widget',
  templateUrl: './pin-widget.component.html',
  styleUrls: ['./pin-widget.component.scss'],
  providers: [
    NxStoryService,
    NxSettingsPanelService,
    NxCoreService,
  ],
})
export class PinWidgetComponent implements OnInit {
  @Input() get story(): Story {
    return this._story$.value
  }
  set story(value) {
    this._story$.next(value)
  }
  private _story$ = new BehaviorSubject<Story>(null)

  @Input() pointKey: ID
  @Input() widgetId: ID

  widget$: Observable<StoryWidget>

  constructor(
    public storyService: NxStoryService,
  ) {}

  ngOnInit(): void {
    this.widget$ = this.storyService.selectWidget(this.pointKey, this.widgetId)
    this.storyService.setStory(this.story)
    this.storyService.setCurrentPageKey(this.pointKey)
  }
}
