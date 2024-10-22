import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, effect, inject, model } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { RouterModule } from '@angular/router'
import { routeAnimations } from '@metad/core'
import { XpertToolsetService } from 'apps/cloud/src/app/@core'
import { derivedAsync } from 'ngxtension/derived-async'

@Component({
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  selector: 'pac-xpert-tool-configure',
  templateUrl: './configure.component.html',
  styleUrl: 'configure.component.scss',
  animations: [routeAnimations],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class XpertStudioConfigureToolComponent {
  private readonly xpertToolsetService = inject(XpertToolsetService)

  readonly schema = model<string>()

  readonly schemas = derivedAsync(() => {
    if (this.schema()) {
      return this.xpertToolsetService.parserOpenAPISchema(this.schema())
    }
    return null
  })

  readonly availableTools = computed(() => {
    return this.schemas()?.parameters_schema
  })

  constructor() {
    effect(() => {
      console.log(this.schemas())
    })
  }
}
