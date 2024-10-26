import { CommonModule } from '@angular/common'
import { Component, input } from '@angular/core'
import { IXpertAgentExecution } from '../../../@core'
import { NgmIsNilPipe } from '@metad/ocap-angular/core'

@Component({
  standalone: true,
  imports: [
    CommonModule,
    NgmIsNilPipe
  ],
  selector: 'xpert-agent-execution',
  templateUrl: 'execution.component.html',
  styleUrls: ['execution.component.scss']
})
export class XpertAgentExecutionComponent {
  readonly execution = input<IXpertAgentExecution>(null)
}