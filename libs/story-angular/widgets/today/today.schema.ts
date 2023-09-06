import { Injectable } from '@angular/core'
import { UntilDestroy } from '@ngneat/until-destroy'
import { FORMLY_ROW, DataSettingsSchemaService, FORMLY_W_1_2, dateFilterOptions } from '@metad/story/designer'
import { combineLatest } from 'rxjs'
import { map } from 'rxjs/operators'

@UntilDestroy()
@Injectable()
export class TodaySchemaService extends DataSettingsSchemaService {
  getSchema() {
    return combineLatest([this.translate.stream('Story.Widgets'), this.translate.stream('DateVariable')]).pipe(
      map(([I18nWidgets, DateVariable]) => {
        return [
          {
            key: 'options',
            wrappers: ['panel'],
            props: {
              padding: true
            },
            fieldGroup: [
              {
                fieldGroupClassName: FORMLY_ROW,
                fieldGroup: dateFilterOptions(this.coreService, FORMLY_W_1_2, I18nWidgets?.Filter, DateVariable)
              }
            ]
          }
        ]
      })
    )
  }
}
