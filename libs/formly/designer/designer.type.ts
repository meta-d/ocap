import { ChangeDetectionStrategy, Component, DestroyRef, HostBinding, OnInit, inject } from '@angular/core'
import { FieldType } from '@ngx-formly/core'
import { NxSettingsPanelService } from '@metad/story/designer'
import { isObservable, Observable, of, Subscription } from 'rxjs'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'


@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-formly-designer',
  template: `<button mat-button type="button" ngmAppearance="dashed" displayDensity="cosy" (click)="openDesigner()">
    {{ 'FORMLY.COMMON.Options' | translate: { Default: 'Options' } }}
  </button>`,
  styles: [
    `
      :host {
        flex: 1;
        max-width: 100%;
      }
    `
  ]
})
export class PACFormlyDesignerComponent extends FieldType implements OnInit {
  @HostBinding('class.pac-formly-designer') public _formlyDesignerComponent = true

  readonly settingsService = inject(NxSettingsPanelService)
  readonly destroyRef = inject(DestroyRef)
  
  type: string
  private subscription: Subscription

  ngOnInit(): void {
    ;((isObservable(this.props.designer) ? this.props.designer : of(this.props.designer)) as Observable<string>)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((type) => {
        this.type = type
      })
  }

  async openDesigner() {
    this.subscription?.unsubscribe()
    this.subscription = this.settingsService
      .openSecondDesigner(this.type, this.formControl.value ?? this.field.defaultValue, this.props.title, this.props.liveMode)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((result) => {
        if (result) {
          this.formControl.setValue(result)
        }
      })
  }
}
