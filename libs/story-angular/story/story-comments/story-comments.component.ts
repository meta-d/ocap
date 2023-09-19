import { CommonModule } from '@angular/common'
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core'
import { StoryComment } from '@metad/story/core'

@Component({
  standalone: true,
  selector: 'ngm-story-comments',
  templateUrl: './story-comments.component.html',
  styleUrls: ['./story-comments.component.scss'],
  host: {
    class: 'ngm-story-comments',
  },
  imports: [
    CommonModule,
    
  ]
})
export class StoryCommentsComponent implements OnChanges {
  @Input() comments: Array<StoryComment>

  @Output() createComment = new EventEmitter()

  commenting: string
  dataRelated: boolean

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.comments) {
      this.commenting = null
    }
  }

  onApplyComment() {
    this.createComment.emit({
      dataRelated: this.dataRelated,
      text: this.commenting,
    })
  }
}
