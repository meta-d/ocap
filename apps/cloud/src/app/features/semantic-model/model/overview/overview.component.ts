import { ChangeDetectorRef, Component, inject } from '@angular/core'
import { DBTable } from '@metad/ocap-core'
import { CopilotService } from '../../../../@core'
import { firstValueFrom } from 'rxjs'
import { map } from 'rxjs/operators'
import { ModelComponent } from '../model.component'
import { SemanticModelService } from '../model.service'
import { ActivatedRoute, Router } from '@angular/router'

@Component({
  selector: 'pac-model-overview',
  templateUrl: 'overview.component.html',
  styleUrls: ['overview.component.scss']
})
export class ModelOverviewComponent {
  private readonly copilotService = inject(CopilotService)
  private readonly modelComponent = inject(ModelComponent)
  private readonly modelState = inject(SemanticModelService)
  private readonly _cdr = inject(ChangeDetectorRef)
  private readonly route = inject(ActivatedRoute)
  private readonly router = inject(Router)
  
  get enableCopilot() {
    return this.copilotService.enabled
  }

  conversations = []
  asking = false
  text = ''

  analysis = [
    // {
    //   Statement: '客户销售额前 10 排名',
    //   SQL: `Select "CustomerKey", SUM("Sales Amount") AS "SalesAmount" FROM "Sales" GROUP BY "CustomerKey" ORDER BY "SalesAmount" DESC LIMIT 10`
    // }
  ]

  public readonly dimensions$ = this.modelState.dimensions$
  public readonly cubes$ = this.modelState.cubes$
  public readonly virtualCubes$ = this.modelState.virtualCubes$
  public readonly stories$ = this.modelState.stories$
  public readonly roles$ = this.modelState.roles$.pipe(map((roles) => (roles?.length ? roles : null)))
  public readonly indicators$ = this.modelState.indicators$

  ngOnInit() {
    // if (this.copilotService.enabled) {
    //   this.askCopilot()
    // }
  }

  async askCopilot(text?: string) {
    const dbTables: DBTable[] = await firstValueFrom(this.modelComponent.selectDBTables$)

    const prompt = `从${dbTables.map((table) => table.name).join(', ')}中推荐一个表进行数据分析，（不用解释）表名是：`

    this.asking = true

    const choices = await this.copilotService.createCompletion(prompt)
    const answer = choices[0].text.trim().replace(/\.+$/, '')
    this.asking = false

    this.conversations.push({
        prompt,
        choices: [
            answer
        ]
    })

    this._cdr.detectChanges()

    await this.askHowAnalysis(answer)
  }

  async askHowAnalysis(tableName: string) {
    console.log(tableName)
    const entityType = await firstValueFrom(this.modelState.selectOriginalEntityType(tableName))
    
    const prompt = `根据表信息给出分析(JSON 格式).
Table: 'Sales', Fields: 'CustomerKey', 'ProductKey', 'ResellerKey', 'Sales Amount', 'Order Quantity'
Result: {
    "Statement": "客户销售额前 10 排名",
    "SQL": "Select \\"CustomerKey\\", SUM(\\"Sales Amount\\") AS \\"SalesAmount\\" FROM \\"Sales\\" GROUP BY \\"CustomerKey\\" ORDER BY \\"SalesAmount\\" DESC LIMIT 10"
}
Table: '${tableName}', Fields: ${Object.keys(entityType.properties).map((key) => `'${entityType.properties[key].name}'`).join(', ')}
Result:
`

    const conversation = {prompt, choices: []}
    this.conversations.push(conversation)
    this.asking = true
    this._cdr.detectChanges()
    const choices = await this.copilotService.createCompletion(prompt)
    this.asking = false

    conversation.choices = choices.map(({text}) => text)

    conversation.choices.forEach((answer) => {
        this.analysis.push(JSON.parse(answer))
    })
    
    this._cdr.detectChanges()
  }

  async applyAnalysis(item) {
    const key = this.modelState.newQuery(`-- ${item.Statement}\n${item.SQL}`)
    this.router.navigate(['query', key], {relativeTo: this.route})
  }
}
