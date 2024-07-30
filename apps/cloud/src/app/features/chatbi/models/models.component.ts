import { CommonModule } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, model } from '@angular/core'
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { MatIconModule } from '@angular/material/icon'
import { MatSelectModule } from '@angular/material/select'
import { RouterModule } from '@angular/router'
import { NgmDisplayBehaviourComponent, NgmSearchComponent } from '@metad/ocap-angular/common'
import { DensityDirective } from '@metad/ocap-angular/core'
import { TranslateModule } from '@ngx-translate/core'
import { ChatbiService } from '../chatbi.service'
import { ScrollingModule } from '@angular/cdk/scrolling'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    RouterModule,
    TranslateModule,
    ScrollingModule,
    MatSelectModule,
    MatIconModule,
    DensityDirective,
    NgmSearchComponent,
    NgmDisplayBehaviourComponent
  ],
  selector: 'pac-chatbi-models',
  templateUrl: './models.component.html',
  styleUrl: 'models.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ChatbiModelsComponent {
  readonly chatbiService = inject(ChatbiService)

  readonly search = model<string>('')
  readonly searchText = computed(() => this.search().trim().toLowerCase())

  readonly cubeSelectOptions = computed(() => {
    const search = this.searchText()
    let cubes = this.chatbiService.cubes()?.map((item) => ({ key: item.name, caption: item.caption, value: item }))
    if (search) {
      cubes = cubes?.filter(
        (item) => item.caption?.toLowerCase().includes(search) || item.key.toLowerCase().includes(search)
      )
    }

    return cubes
  })

  readonly cube = this.chatbiService.cube

  trackByKey(index, item): string {
    return item?.key
  }
  
  onCubeChange(key: string) {
    this.chatbiService.setCube(key)
  }
}
