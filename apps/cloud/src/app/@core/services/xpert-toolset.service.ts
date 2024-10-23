import { inject, Injectable } from '@angular/core'
import { OrganizationBaseCrudService } from '@metad/cloud/state'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject } from 'rxjs'
import { API_XPERT_TOOLSET } from '../constants/app.constants'
import { ApiProviderSchemaType, ApiToolBundle, IXpertTool, IXpertToolset, ToolProviderCredentials } from '../types'
import { XpertWorkspaceBaseCrudService } from './xpert-workspace.service'

@Injectable({ providedIn: 'root' })
export class XpertToolsetService extends XpertWorkspaceBaseCrudService<IXpertToolset> {
  readonly #logger = inject(NGXLogger)

  readonly #refresh = new BehaviorSubject<void>(null)

  constructor() {
    super(API_XPERT_TOOLSET)
  }

  parserOpenAPISchema(schema: string) {
    return this.httpClient.post<{
      schema_type: ApiProviderSchemaType
      parameters_schema: ApiToolBundle[]
      credentials_schema: ToolProviderCredentials
      warning: any
    }>(this.apiBaseUrl + `/tool-provider/openapi/schema`, {
      schema
    })
  }

  testOpenAPI(tool: IXpertTool) {
    return this.httpClient.post(this.apiBaseUrl + '/tool-provider/openapi/test', {
      ...tool
    })
  }
}
