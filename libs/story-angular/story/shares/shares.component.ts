import { Clipboard } from '@angular/cdk/clipboard'
import { DragDropModule } from '@angular/cdk/drag-drop'
import { CommonModule } from '@angular/common'
import { HttpParams } from '@angular/common/http'
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  TemplateRef,
  ViewChild,
  computed,
  inject
} from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { MAT_DIALOG_DATA } from '@angular/material/dialog'
import { MatDividerModule } from '@angular/material/divider'
import { MatFormFieldModule } from '@angular/material/form-field'
import { MatIconModule } from '@angular/material/icon'
import { MatInputModule } from '@angular/material/input'
import { MatRadioModule } from '@angular/material/radio'
import { MatSlideToggleModule } from '@angular/material/slide-toggle'
import { MatSliderModule } from '@angular/material/slider'
import { MatSnackBar } from '@angular/material/snack-bar'
import { MatTabsModule } from '@angular/material/tabs'
import { MatTooltipModule } from '@angular/material/tooltip'
import { DomSanitizer, SafeUrl } from '@angular/platform-browser'
import { AccessEnum, ISemanticModel, Visibility } from '@metad/contracts'
import { NgmCommonModule } from '@metad/ocap-angular/common'
import { TranslateModule, TranslateService } from '@ngx-translate/core'
import { NX_STORY_STORE, NxStoryService, NxStoryStore, StoryPoint, StoryWidget } from '@metad/story/core'
import { firstValueFrom } from 'rxjs'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DragDropModule,

    MatTabsModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTooltipModule,
    MatSlideToggleModule,
    MatSliderModule,

    TranslateModule,
    NgmCommonModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-story-shares-dialog',
  templateUrl: 'shares.component.html',
  styleUrls: ['shares.component.scss']
})
export class StorySharesComponent implements OnInit {
  Visibility = Visibility
  AccessEnum = AccessEnum

  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly _snackBar = inject(MatSnackBar)

  visibilities = [Visibility.Public, Visibility.Private]
  _applicationBaseUrl = window.location.origin
  applicationUrl = ''
  visibility: Visibility = Visibility.Private
  visibilityDisabled = false
  secret = false
  expires: number = null
  pageKey: string = null

  _embedBaseUrl = window.location.origin + '/public/'
  _embedUrl = ''
  showPreview = false

  embedUrl: SafeUrl

  get isStory() {
    return !(this.data?.point || this.data?.widget)
  }

  @ViewChild('copyMessage') copyMessage: TemplateRef<any>

  private readonly pages = this.storyService.displayPoints
  public readonly pagesSelectOptions = computed(() => {
    const pages = [
      {
        key: null,
        caption: this.getTranslation('Story.Shares.Default', { Default: 'Default' })
      }
    ]

    this.pages()?.forEach((point) => {
      pages.push({
        key: point.key,
        caption: point.name
      })
    })

    return pages
  })
  constructor(
    private storyService: NxStoryService,
    protected _sanitizer: DomSanitizer,

    @Inject(NX_STORY_STORE)
    private storyStore: NxStoryStore,

    @Inject(MAT_DIALOG_DATA)
    public data: {
      // story id
      id: string
      widget?: StoryWidget
      point?: StoryPoint
      visibility: Visibility
      isAuthenticated: boolean
      access: AccessEnum
      models: ISemanticModel[]
    },

    private clipboard: Clipboard,
    private translateService: TranslateService
  ) {
    this.visibilityDisabled = !this.isStory
  }

  ngOnInit() {
    this.visibility = this.data.visibility

    if (this.visibilityDisabled && (!this.visibility || this.visibility === Visibility.Public)) {
      this.generate()
    }
  }

  togglePreview() {
    this.showPreview = !this.showPreview
    if (this.showPreview) {
      this.embedUrl = this._sanitizer.bypassSecurityTrustResourceUrl(this.applicationUrl)
    }
  }

  async generate() {
    if (this.visibility !== this.data.visibility) {
      // Check semantic model visibility first
      if (this.visibility === Visibility.Public && this.data.models.some((m) => m.visibility !== Visibility.Public)) {
        this._snackBar.open(
          this.getTranslation('Story.Shares.SemanticModelPublicFirst', {
            Default: 'Change semantic model to public visibility first!'
          }),
          '',
          {
            duration: 5000
          }
        )
        return
      }
      await firstValueFrom(
        this.storyStore.putStory(this.data.id, {
          visibility: this.visibility
        })
      )
      const changedText = this.getTranslation('Story.Shares.VisibilityChanged', { Default: 'Visibility changed' })
      this._snackBar.open(changedText + '!', '', { duration: 2000 })
      this.storyService.updateStory({
        visibility: this.visibility
      })
    }

    this.applicationUrl = this.generateUrl()
    const queryParams = {}

    if (this.pageKey) {
      queryParams['pageKey'] = this.pageKey
    }
    if (this.secret) {
      const token = await firstValueFrom(
        this.storyStore.shareToken(
          this.data.id,
          this.expires > 0
            ? {
                minutes: this.expires
              }
            : null
        )
      )
      queryParams['token'] = token
    }

    this.applicationUrl = this.applicationUrl + '?' + new HttpParams({ fromObject: queryParams }).toString()

    this._cdr.markForCheck()
    this._cdr.detectChanges()
  }

  generateUrl() {
    const baseUrl = !this.visibility ||
      this.visibility === Visibility.Public ? this._applicationBaseUrl + '/public' : this._applicationBaseUrl
    if (this.data.widget) {
      return baseUrl + '/story/widget/' + this.data.widget.id
    } else if (this.data.point) {
      return baseUrl + '/story/point/' + this.data.point.id
    } else {
      return baseUrl + '/story/' + this.data.id
    }
  }

  copy(text: string) {
    this.clipboard.copy(text)
    this._snackBar.openFromTemplate(this.copyMessage, { duration: 2000 })
  }

  getTranslation(key: string, params?: any) {
    let t = ''
    this.translateService.get(key, params).subscribe((value) => {
      t = value
    })

    return t
  }
}
