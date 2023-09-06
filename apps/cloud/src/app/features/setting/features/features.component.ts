import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core'
import { Router } from '@angular/router'
import { IOrganization } from '../../../@core'
import { TranslationBaseComponent } from '../../../@shared/language/translation-base.component'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'


@Component({
  selector: 'pac-features',
  templateUrl: './features.component.html',
  styleUrls: ['./features.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PACFeaturesComponent extends TranslationBaseComponent implements OnInit {
  private router = inject(Router)

  tabs: any[]
  organization: IOrganization

  ngOnInit(): void {
    this.loadTabs()
    this._applyTranslationOnTabs()
  }

  loadTabs() {
    this.tabs = [
      {
        title: this.getTranslation('MENU.TENANT'),
        route: this.getRoute('tenant')
      },
      {
        title: this.getTranslation('MENU.ORGANIZATION'),
        route: this.getRoute('organization')
      }
    ]
  }

  getRoute(tab: string): string {
    return `/settings/features/${tab}`
  }

  private _applyTranslationOnTabs() {
    this.translateService.onLangChange.pipe(takeUntilDestroyed()).subscribe(() => {
      this.loadTabs()
    })
  }

  navigate(url) {
    this.router.navigate([url])
  }
}
