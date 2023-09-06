import { Component, Input, OnInit } from '@angular/core'
import { Story } from '@metad/story/core'
import { NGXLogger } from 'ngx-logger'
import { ID } from '../../../@core/types'

@Component({
  selector: 'pac-insight-widget',
  templateUrl: './widget.component.html',
  styleUrls: ['./widget.component.scss'],
  host: {
    class: 'pac-insight-widget',
  },
  providers: [
  ],
})
export class PACInsightWidgetComponent implements OnInit {
  @Input() story: Story
  @Input() pointId: ID
  @Input() widgetId: ID

  constructor(private _logger: NGXLogger) {
  }

  ngOnInit(): void {
    this._logger.debug(`[PACInsightWidgetComponent] init`, this.story, this.pointId, this.widgetId)
  }
}
