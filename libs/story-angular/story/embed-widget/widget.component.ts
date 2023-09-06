import { CommonModule } from '@angular/common'
import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core'
import { NgmDSCoreService, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { TimeGranularity } from '@metad/ocap-core'
import { NxCoreService } from '@metad/core'
import { NxStoryService, Story, StoryWidget } from '@metad/story/core'
import { NxStoryPointService } from '../story-point.service'
import { NxStoryModule } from '../story.module'

@Component({
  standalone: true,
  imports: [CommonModule, NxStoryModule],
  selector: 'pac-embed-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  providers: [NxStoryService, NxStoryPointService, NgmSmartFilterBarService, NxCoreService]
})
export class EmbedWidgetComponent implements OnInit, OnChanges {
  @Input() story: Story
  @Input() widget: StoryWidget

  constructor(
    public storyService: NxStoryService,
    private pointService: NxStoryPointService,
    public smartFilterBarService: NgmSmartFilterBarService,
    private dsCoreService: NgmDSCoreService
  ) {}

  ngOnInit(): void {
    this.dsCoreService.setTimeGranularity(TimeGranularity.Month)
  }

  ngOnChanges({ story, widget }: SimpleChanges) {
    if (story.currentValue) {
      this.storyService.setStory(story.currentValue)
    }
    if (widget.currentValue) {
      this.pointService.init(widget.currentValue.point.key)
      this.pointService.active(true)
    }
  }
}
