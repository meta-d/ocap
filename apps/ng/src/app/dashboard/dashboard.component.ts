import { CommonModule } from '@angular/common'
import { Component, inject } from '@angular/core'
import { FormsModule } from '@angular/forms'
import { MatButtonModule } from '@angular/material/button'
import { AnalyticalCardModule } from '@metad/ocap-angular/analytical-card'
import { NgmAgentService, NgmDSCoreService, OCAP_AGENT_TOKEN, OCAP_DATASOURCE_TOKEN } from '@metad/ocap-angular/core'
import { AgentType, DataSource, Syntax, Type } from '@metad/ocap-core'
import { S4ServerAgent } from './s4-agent.service'

@Component({
  standalone: true,
  selector: 'ngm-dashboard',
  templateUrl: 'dashboard.component.html',
  styles: [
    `
      :host {
        height: 100vh;
      }
    `
  ],
  providers: [
    NgmDSCoreService,
    NgmAgentService,
    S4ServerAgent,
    {
      provide: OCAP_AGENT_TOKEN,
      useExisting: S4ServerAgent,
      multi: true
    },
    {
      provide: OCAP_DATASOURCE_TOKEN,
      useValue: {
        type: 'XMLA',
        factory: async (): Promise<Type<DataSource>> => {
          const { XmlaDataSource } = await import('@metad/ocap-xmla')
          return XmlaDataSource
        }
      },
      multi: true
    }
  ],
  imports: [CommonModule, FormsModule, MatButtonModule, AnalyticalCardModule]
})
export class DashboardComponent {
  #dsCoreService = inject(NgmDSCoreService)

  constructor() {
    this.#dsCoreService.registerModel({
      id: '##########',
      key: '##########',
      name: 'S4CDS',
      type: 'XMLA',
      agentType: AgentType.Server,
      syntax: Syntax.MDX,
      dialect: 'SAP',
      catalog: '$INFOCUBE'
    })

    // this.#dsCoreService.getDataSource('S4CDS').subscribe((ds) => {
    //     console.log(`============================`)
    // })
  }
}
