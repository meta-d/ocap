import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { MatButtonModule } from '@angular/material/button'
import { MatDialogModule } from '@angular/material/dialog'
import { MatIconModule } from '@angular/material/icon'
import { ActivatedRoute, Router, RouterModule } from '@angular/router'
import { NgmCalculationEditorComponent } from '@metad/ocap-angular/entity'
import { CalculationProperty } from '@metad/ocap-core'
import { NxStoryService } from '@metad/story/core'
import { TranslateModule } from '@ngx-translate/core'
import { derivedFrom } from 'ngxtension/derived-from'
import { injectParams } from 'ngxtension/inject-params'
import { of } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { StoryCalculationsComponent } from '../calculations.component'
import { injectCalculationCommand } from '../commands'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    TranslateModule,

    NgmCalculationEditorComponent
  ],
  selector: 'pac-story-calculation',
  templateUrl: 'calculation.component.html',
  styleUrls: ['calculation.component.scss'],
  host: {
    class: 'pac-story-calculation'
  }
})
export class StoryCalculationComponent {
  readonly storyService = inject(NxStoryService)
  readonly router = inject(Router)
  readonly route = inject(ActivatedRoute)
  readonly calculationsComponent = inject(StoryCalculationsComponent)
  readonly paramKey = injectParams('key')

  readonly dataSettings = this.calculationsComponent.dataSettings

  readonly property = derivedFrom(
    [this.paramKey, this.dataSettings],
    switchMap(([key, dataSettings]) =>
      key && dataSettings
        ? this.storyService.selectEntitySchemaProperty<CalculationProperty>(
            dataSettings.dataSource,
            dataSettings.entitySet,
            key
          )
        : of(null)
    )
  )

  readonly calculatioCommand = injectCalculationCommand(this.storyService, this.property)

  close() {
    this.router.navigate(['../'], { relativeTo: this.route })
  }

  onApply(event: CalculationProperty) {
    if (event) {
      this.storyService.addCalculationMeasure({ dataSettings: this.dataSettings(), calculation: event })
    }

    // updateCalculationMeasure
    this.close()
  }
}
