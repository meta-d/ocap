import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop'
import { ChangeDetectionStrategy, Component, Optional } from '@angular/core'
import { toSignal } from '@angular/core/rxjs-interop'
import { ActivatedRoute, Router } from '@angular/router'
import { IsDirty } from '@metad/core'
import { cloneDeep } from '@metad/ocap-core'
import { convertModelQueryResult } from 'apps/cloud/src/app/@core'
import { orderBy } from 'lodash-es'
import { map } from 'rxjs'
import { TranslationBaseComponent } from '../../../../@shared'
import { ModelEntityService } from '../entity/entity.service'
import { SemanticModelService } from '../model.service'
import { ModelQuery, ModelQueryState } from '../types'
import { QueryLabService } from './query-lab.service'

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'pac-model-query-lab',
  templateUrl: 'query-lab.component.html',
  styleUrls: ['query-lab.component.scss'],
  host: {
    class: 'pac-model-query-lab'
  },
  providers: [QueryLabService]
})
export class QueryLabComponent extends TranslationBaseComponent implements IsDirty {
  public readonly queries = toSignal(this.queryLabService.queries$.pipe(map((queries) => orderBy(queries, ['index']))))

  private readonly modelId = toSignal(this.modelService.select((state) => state.model.id))
  private readonly modelQueries = toSignal(
    this.modelService.select(
      (state) =>
        state.queries ??
        state.model.queries.map((query) => {
          query = convertModelQueryResult(query)
          return {
            key: query.key,
            origin: cloneDeep(query),
            query: query,
            dirty: false,
            results: []
          } as ModelQueryState
        })
    )
  )

  constructor(
    public modelService: SemanticModelService,
    private queryLabService: QueryLabService,
    private route: ActivatedRoute,
    private router: Router,

    @Optional()
    public entityService?: ModelEntityService
  ) {
    super()

    this.queryLabService.init({
      modelId: this.modelId(),
      queries: this.modelQueries()
    })
  }

  trackByKey(i: number, item: any) {
    return item.key
  }

  isQueryDirty(key: string) {
    return this.queryLabService.dirty[key]
  }

  isDirty() {
    return this.queryLabService.isDirty
  }

  addQuery() {
    const key = this.queryLabService.newQuery('')
    this.router.navigate(['.', key], { relativeTo: this.route })
  }

  deleteQuery(key: string) {
    this.queryLabService.deleteQuery(key)
  }

  renameQuery(key: string) {
    this.queryLabService.renameQuery(key)
  }

  sortQueries(event: CdkDragDrop<ModelQuery[]>) {
    const queries = this.queries()
    moveItemInArray(queries, event.previousIndex, event.currentIndex)
    this.queryLabService.updateOrders(queries.map((query, index) => ({ key: query.key, index })))
  }
}
