import { InjectionToken } from '@angular/core'
import { Agent, DataSourceOptions } from '@metad/ocap-core'

export const OCAP_AGENT_TOKEN = new InjectionToken<Agent>('OCAP-Agent')
export const OCAP_MODEL_TOKEN = new InjectionToken<DataSourceOptions>('OCAP-Model')
