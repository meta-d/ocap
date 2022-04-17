import { Component, Input, OnInit } from '@angular/core'
import { DataSettings } from '@metad/ocap-core'
import { echarts } from '@metad/ocap-echarts'

@Component({
  selector: 'metad-analytical-card',
  templateUrl: './analytical-card.component.html',
  styleUrls: ['./analytical-card.component.scss']
})
export class AnalyticalCardComponent implements OnInit {
  @Input() dataSettings: DataSettings | null = null

  constructor() {}

  ngOnInit(): void {}
}
