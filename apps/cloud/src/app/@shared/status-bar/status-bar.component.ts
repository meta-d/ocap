import { CommonModule } from '@angular/common'
import { ChangeDetectorRef, Component, OnInit, computed, inject } from '@angular/core'
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop'
import { FormsModule } from '@angular/forms'
import { NgFilterPipeModule } from '@metad/core'
import { ButtonGroupDirective, NgmAgentService, NgmDSCacheService, OcapCoreModule } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import { AgentStatus, AgentStatusEnum } from '@metad/ocap-core'
import { TranslateModule } from '@ngx-translate/core'
import { environment } from 'apps/cloud/src/environments/environment'
import { Observable, merge, of } from 'rxjs'
import { AbstractAgent, LocalAgent, ServerAgent, Store, ToastrService } from '../../@core'
import { TranslationBaseComponent } from '../language/translation-base.component'
import { MaterialModule } from '../material.module'

/**
 * @deprecated use {@link TuneComponent} instead
 */
@Component({
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    TranslateModule,
    ButtonGroupDirective,

    NgFilterPipeModule,
    OcapCoreModule
  ],
  selector: 'pac-status-bar',
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.scss'],
  host: {
    class: 'pac-status-bar'
  }
})
export class PACStatusBarComponent extends TranslationBaseComponent implements OnInit {
  AgentStatusEnum = AgentStatusEnum
  enableLocalAgent = environment.enableLocalAgent

  private store = inject(Store)
  private cacheService = inject(NgmDSCacheService)
  private agentService = inject(NgmAgentService)
  public localAgent? = inject(LocalAgent, { optional: true })
  public serverAgent? = inject(ServerAgent, { optional: true })
  private wasmAgentService = inject(WasmAgentService)
  private toastrService = inject(ToastrService)
  private _cdr = inject(ChangeDetectorRef)

  public readonly localAgentStatus = toSignal<AgentStatus>(
    (this.localAgent?.selectStatus() as Observable<AgentStatus>) ?? of({ status: AgentStatusEnum.OFFLINE })
  )
  public readonly localStatus = computed(() => {
    if (this.localAgentStatus() && typeof this.localAgentStatus() !== 'string') {
      return {
        status: this.localAgentStatus().status,
        icon: agentStatusIcon(this.localAgentStatus().status)
      }
    }

    return null
  })

  public readonly wasmAgentStatus = toSignal<AgentStatus>(
    this.wasmAgentService.selectStatus() as Observable<AgentStatus>
  )
  public readonly wasmStatus = computed(() => {
    if (this.wasmAgentStatus() && typeof this.wasmAgentStatus() !== 'string') {
      return {
        status: this.wasmAgentStatus().status,
        icon: agentStatusIcon(this.wasmAgentStatus().status)
      }
    }

    return null
  })

  errors = []

  hasError = false
  get cacheLevel() {
    return this.cacheService.getCacheLevel()
  }
  set cacheLevel(value) {
    this.cacheService.changeCacheLevel(value)
    this.store.cacheLevel = value
  }

  private errorSub = merge(this.wasmAgentService.selectError(), this.agentService.selectError())
    .pipe(takeUntilDestroyed())
    .subscribe((error) => {
      const message = typeof error === 'string' ? error : error?.message

      if (this.errors.length > 10) {
        this.errors.shift()
      }
      if (error) {
        this.errors.push(message)
        this.hasError = true
      }
    })

  ngOnInit(): void {
    if (this.store.cacheLevel !== null && this.cacheService.getCacheLevel() !== this.store.cacheLevel) {
      this.cacheService.changeCacheLevel(this.store.cacheLevel)
    }
  }

  tryConnectLocalAgent() {
    this.localAgent?.connect()
  }

  cacheLevelFormatter(value: number): string {
    switch (value) {
      case 0:
        return 'NO'
      case 1:
        return 'Metadata'
      case 2:
        return 'Members'
      case 3:
        return 'Query'
      case 4:
        return 'Others'
      default:
        return 'All'
    }
  }

  clearCache() {
    this.cacheService.clearAllCache()
    this.toastrService.success('PAC.ACTIONS.CLEAR_CACHE')
  }

  clearErrors() {
    this.errors = []
    this.hasError = false
  }

  afterClose() {}

  valueIsNotNil(item) {
    return !!item.value
  }

  async deleteAuth(service: AbstractAgent, id: string) {
    await service.deleteAuthentication(id)
    this._cdr.detectChanges()
  }
}

function agentStatusIcon(status: AgentStatusEnum) {
  let icon = '🔘'
  switch (status) {
    case AgentStatusEnum.ERROR:
      icon = '🔴'
      break
    case AgentStatusEnum.ONLINE:
      icon = '🟢'
      break
    default:
      icon = '🟡'
  }

  return icon
}
