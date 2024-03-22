import { MatBottomSheet } from '@angular/material/bottom-sheet'
import { DataSourceService } from '@metad/cloud/state'
import { firstValueFrom, of, ReplaySubject, Subject } from 'rxjs'
import { switchMap } from 'rxjs/operators'
import { AuthInfoType, BottomSheetBasicAuthComponent } from '../auth'
import { AgentEvent, IDataSource, IDataSourceAuthentication } from '../types'

export abstract class AbstractAgent {
  private _auth: Record<string, [string, Subject<any>]> = {}
  get auth() {
    return this._auth
  }
  private _retryAuth: Record<string, boolean> = {}

  constructor(protected dataSourceService: DataSourceService, protected _bottomSheet: MatBottomSheet) {}

  /**
   * 获取认证信息
   */
  protected async authenticate(event: AgentEvent) {
    const dataSource = event.data.dataSource

    if (dataSource.id) {
      if (!this._auth[dataSource.id]) {
        this._auth[dataSource.id] = [dataSource.name, new ReplaySubject(1)]
        let auth: AuthInfoType = null
        try {
          auth = await firstValueFrom(this.dataSourceService.getAuthentication(dataSource.id))
        } catch (err) {}

        try {
          if (!auth) {
            auth = await this.signIn(dataSource, event)
            if (auth) {
              await firstValueFrom(
                this.dataSourceService.createAuthentication(dataSource.id, auth as IDataSourceAuthentication)
              )
            }
          }
          if (auth) {
            this._auth[dataSource.id][1].next(auth)
          } else {
            this._auth[dataSource.id][1].error(`未提供账号`)
            this._auth[dataSource.id] = null
          }
        } catch (err) {
          this._auth[dataSource.id][1].error(err)
          this._auth[dataSource.id] = null
        }
      }

      return firstValueFrom(this._auth[dataSource.id][1])
    } else {
      return this.signIn(dataSource, event)
    }
  }

  private async signIn(
    dataSource: Partial<Omit<IDataSource, 'type'>>,
    event: AgentEvent
  ): Promise<IDataSourceAuthentication> {
    return firstValueFrom(
      this._bottomSheet
        .open(BottomSheetBasicAuthComponent, {
          data: { name: dataSource.name, ping: this.getPingCallback(event, dataSource) }
        })
        .afterDismissed()
    )
  }

  retryAuthenticate(request: AgentEvent) {
    const dataSource = request.data.dataSource
    if (!this._retryAuth[dataSource.id]) {
      this._auth[dataSource.id]?.[1].complete()
      this._auth[dataSource.id] = [dataSource.name, new ReplaySubject(1)]
      this._retryAuth[dataSource.id] = true

      this._bottomSheet
        .open(BottomSheetBasicAuthComponent, {
          data: { name: dataSource.name, ping: this.getPingCallback(request, dataSource) }
        })
        .afterDismissed()
        .pipe(
          switchMap((auth) =>
            auth?.remeberMe ? this.dataSourceService.createAuthentication(dataSource.id, auth) : of(auth)
          )
        )
        .subscribe({
          next: (auth) => {
            if (auth) {
              this._auth[dataSource.id][1].next(auth)
            } else {
              this._auth[dataSource.id][1].error(`未提供账号`)
              this._auth[dataSource.id] = null
              this._retryAuth[dataSource.id] = false
            }
          },
          error: (err) => {
            this._auth[dataSource.id][1].error(err)
            this._auth[dataSource.id] = null
            this._retryAuth[dataSource.id] = false
          }
        })
    }

    return this._auth[dataSource.id][1]
  }

  async deleteAuthentication(id: string) {
    await firstValueFrom(this.dataSourceService.deleteAuthentication(id))
    this._auth[id] = null
  }

  abstract getPingCallback(
    request: any,
    dataSource: Partial<Omit<IDataSource, 'type'>>
  ): (auth: AuthInfoType) => Promise<any>
}
