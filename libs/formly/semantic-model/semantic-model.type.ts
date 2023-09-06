import { Component, inject } from '@angular/core'
import { FormControl } from '@angular/forms'
import { Router } from '@angular/router'
import { FieldType } from '@ngx-formly/core'
import { Observable } from 'rxjs'

@Component({
  selector: 'pac-formly-semantic-model',
  template: `<ngm-select displayDensity="compact"
    [label]="'FORMLY.SemanticModel.Label' | translate: { Default: 'Semantic Model' }"
    [selectOptions]="selectOptions | async"
    [formControl]="valueControl"
  >
    <ng-template ngmOptionContent let-option>
      <div class="flex items-center whitespace-nowrap overflow-hidden">
        <button mat-icon-button (click)="openSemanticModel(option.key)">
          <mat-icon>open_in_new</mat-icon>
        </button>

        <div class="flex-1 text-ellipsis overflow-hidden" [title]="option.caption">
          {{ option.caption }}
        </div>
      </div>
    </ng-template>
  </ngm-select>`,
  styles: [
    `
      :host {
        flex: 1;
      }
    `
  ]
})
export class PACFormlySemanticModelComponent extends FieldType {
  private router = inject(Router)

  public get selectOptions() {
    return this.props.options as Observable<any[]>
  }
  get valueControl() {
    return this.formControl as FormControl
  }

  openSemanticModel(key: string) {
    const url = this.router.serializeUrl(this.router.createUrlTree(['models', key]))
    window.open(url, '_blank')
  }
}
