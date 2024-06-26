import { DestroyRef, Injectable, Injector, inject, signal } from '@angular/core'
import { ComponentStore } from '@ngrx/component-store'
import { TranslateService } from '@ngx-translate/core'
import { Observable, of } from 'rxjs'
import { DesignerSchema } from '../types'

export interface BaseSchemaState<T = any> {
  model: T
}

@Injectable()
export abstract class BaseDesignerSchemaService<T extends BaseSchemaState = BaseSchemaState>
  extends ComponentStore<T>
  implements DesignerSchema
{
  protected readonly translate = inject(TranslateService)
  protected readonly injector = inject(Injector)
  protected readonly destroyRef = inject(DestroyRef)

  abstract getSchema()

  readonly title = signal<string>(null)

  getTitle(): Observable<string> {
    return of(null)
  }

  public set model(value) {
    this.patchState({
      model: value
    } as T)
  }
  public get model() {
    return this.get((state) => state.model)
  }

  public readonly model$ = this.select((state) => state.model)

  constructor(injector?: Injector) {
    super({} as T)
  }

  getTranslation(key: string, interpolateParams?: any): string {
    return this.translate.instant(key, interpolateParams)
  }
}
