import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormControl, ReactiveFormsModule } from '@angular/forms'
import { DensityDirective, NgmSmartFilterBarService } from '@metad/ocap-angular/core'
import { TimeGranularity } from '@metad/ocap-core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { TranslateModule } from '@ngx-translate/core'
import { NxTimeFilterModule } from '@metad/components/time-filter'
import { AbstractStoryWidget } from '@metad/core'

export interface TodayWidgetOptions {
  granularity: TimeGranularity
  granularitySequence: number
  defaultValue: string
}

@UntilDestroy({ checkProperties: true })
@Component({
  standalone: true,
  imports: [CommonModule, TranslateModule, ReactiveFormsModule, DensityDirective, NxTimeFilterModule],
  selector: 'ngm-story-widget-today',
  templateUrl: './today.component.html',
  styleUrls: ['./today.component.scss']
})
export class WidgetTodayComponent extends AbstractStoryWidget<TodayWidgetOptions> {
  private readonly filterBar = inject(NgmSmartFilterBarService)

  today = new FormControl(new Date())

  private todaySub = this.today.valueChanges.subscribe(() => {
    this.filterBar.go()
  })
}
