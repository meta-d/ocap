import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, model, signal } from '@angular/core'
import { toObservable } from '@angular/core/rxjs-interop'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { nonBlank } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { injectParams } from 'ngxtension/inject-params'
import { BehaviorSubject } from 'rxjs'
import { distinctUntilChanged, filter, switchMap } from 'rxjs/operators'
import { IXpert, routeAnimations, TXpertTeamDraft, XpertTypeEnum } from '../../../@core'
import { MaterialModule } from '../../../@shared'
import { EmojiAvatarComponent } from '../../../@shared/avatar'
import { AppService } from '../../../app.service'
import { injectGetXpertTeam } from '../utils'
import { XpertBasicComponent } from './basic/basic.component'
import { NgmCommonModule } from '@metad/ocap-angular/common'


@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TranslateModule,
    MaterialModule,
    RouterModule,

    NgmCommonModule,
    XpertBasicComponent,
    EmojiAvatarComponent
  ],
  selector: 'xpert-xpert',
  templateUrl: './xpert.component.html',
  styleUrl: 'xpert.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: []
})
export class XpertComponent {
  eXpertTypeEnum = XpertTypeEnum

  readonly appService = inject(AppService)
  readonly paramId = injectParams('id')
  readonly getXpertTeam = injectGetXpertTeam()

  readonly paramId$ = toObservable(this.paramId)
  readonly #refresh$ = new BehaviorSubject<void>(null)

  readonly isMobile = this.appService.isMobile
  readonly sideMenuOpened = model(!this.isMobile())

  readonly draft = signal<TXpertTeamDraft>(null)
  readonly xpert = signal<Partial<IXpert>>(null)
  readonly avatar = computed(() => this.xpert()?.avatar)

  private xpertSub = this.paramId$
    .pipe(
      distinctUntilChanged(),
      filter(nonBlank),
      switchMap((id) => this.#refresh$.pipe(switchMap(() => this.getXpertTeam(id))))
    )
    .subscribe((value) => {
      this.xpert.set(value.draft?.team ?? value)
    })

  refresh() {
    this.#refresh$.next()
  }
}