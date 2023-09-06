import { animate, style, transition, trigger } from '@angular/animations'
import { Component, Inject, OnInit, Output } from '@angular/core'
import { FormGroup } from '@angular/forms'
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy'
import { FormlyFieldConfig, FormlyFormOptions } from '@ngx-formly/core'
import { isEqual, cloneDeep } from 'lodash-es'
import { EMPTY, isObservable, Observable, of, Subject, timer } from 'rxjs'
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  skipUntil,
  switchMap
} from 'rxjs/operators'
import {
  DesignerSchema,
  SettingsComponent,
  STORY_DESIGNER_FORM,
  STORY_DESIGNER_LIVE_MODE,
  STORY_DESIGNER_SCHEMA
} from '../types'

@UntilDestroy()
@Component({
  selector: 'nx-component-settings',
  templateUrl: 'formly-form.component.html',
  styleUrls: ['formly-form.component.scss'],
  animations: [
    trigger('settingsComponent', [
      transition(':enter', [
        style({ transform: 'translateX(100%)' }),
        animate(300, style({ transform: 'translateX(0)' }))
      ]),
      transition(':leave', [animate(200, style({ 'transform-origin': 'center', transform: 'scale(0.5)' }))])
    ])
  ]
})
export class NxComponentSettingsComponent implements OnInit {
  // @HostBinding('@settingsComponent') public settingsComponent

  initial = true
  model = {}

  options: FormlyFormOptions = {}

  public readonly title$ = this.schema.getTitle()

  public fields$: Observable<{ fields: FormlyFieldConfig[]; formGroup: FormGroup }[]> = this.schema.getSchema().pipe(
    debounceTime(100),
    map((fields) => [{ fields, formGroup: new FormGroup({}) }]),
    catchError((err) => {
      console.error(err)
      return EMPTY
    }),
    shareReplay(1)
  )
  private _modelChange$ = new Subject<unknown>()
  @Output() modelChange = this._modelChange$.pipe(debounceTime(500))

  constructor(
    @Inject(STORY_DESIGNER_FORM) private _settingsComponent: SettingsComponent,
    @Inject(STORY_DESIGNER_SCHEMA) private schema: DesignerSchema,
    @Inject(STORY_DESIGNER_LIVE_MODE) public liveMode: boolean,
  ) {}

  ngOnInit(): void {
    ;(isObservable(this._settingsComponent.model) ? this._settingsComponent.model : of(this._settingsComponent.model))
      .pipe(
        filter((model) => !!model && (this.initial || !isEqual(model, this.model))),
        untilDestroyed(this)
      )
      .subscribe((model) => {
        this.initial = false
        // console.log(`[NxComponentSettingsComponent] 开始设置 Model`, model)
        this.model = cloneDeep(model)
        this.schema.model = model
        // console.log(`[NxComponentSettingsComponent] 设置完毕 Model`)
      })

    this.fields$
      .pipe(
        switchMap((items) => {
          const { formGroup } = items[0]
          return formGroup.valueChanges
        }),
        // 跳过初始值
        skipUntil(timer(1000)),
        debounceTime(500),
        distinctUntilChanged(isEqual),
        untilDestroyed(this)
      )
      .subscribe((value) => {
        this.schema.model = value
        if (this.liveMode && !this.initial) {
          // 为什么原来不是 Submit form Value ?
          this.onSubmit(value)
        }
      })
  }

  onSubmit(value?) {
    this._settingsComponent.submit.next(value ?? this.model)
  }

  onModelChange(value) {
    this._modelChange$.next(value)
  }
}
