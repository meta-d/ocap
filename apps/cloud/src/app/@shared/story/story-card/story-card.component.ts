import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatIconModule } from '@angular/material/icon'
import { RouterModule } from '@angular/router'
import { HighlightDirective } from '@metad/components/core'
import { AppearanceDirective, ButtonGroupDirective, DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { formatRelative } from 'date-fns'
import { getDateLocale, IStory } from '../../../@core'
import { LazyImgDirective } from '../../directives/lazy-img.directive'
import { CreatedByPipe } from '../../pipes'

@Component({
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-story-card',
  templateUrl: 'story-card.component.html',
  styles: [
    `
      :host {
        flex: 1;
        max-width: 100%;
      }
    `
  ],
  imports: [
    CommonModule,
    RouterModule,
    MatIconModule,
    MatButtonModule,
    TranslateModule,
    DensityDirective,
    ButtonGroupDirective,
    AppearanceDirective,
    CreatedByPipe,

    LazyImgDirective,
    HighlightDirective
  ]
})
export class StoryCardComponent {
  private translateService = inject(TranslateService)
  @Input() story: IStory
  @Input() storyLink: string
  @Input() highlight: string

  get thumbnail() {
    return this.story?.thumbnail || this.story?.preview?.url
  }

  get updatedAt() {
    return this.story
      ? formatRelative(new Date(this.story.updatedAt), new Date(), {
          locale: getDateLocale(this.translateService.currentLang)
        })
      : null
  }
}
