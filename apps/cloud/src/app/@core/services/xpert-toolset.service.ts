import { inject, Injectable } from '@angular/core'
import { NGXLogger } from 'ngx-logger'
import { BehaviorSubject } from 'rxjs'
import { API_XPERT_TOOLSET } from '../constants/app.constants'
import {
  ApiProviderSchemaType,
  ApiToolBundle,
  IBuiltinTool,
  IToolProvider,
  IToolTag,
  IXpertTool,
  IXpertToolset,
  ToolProviderCredentials
} from '../types'
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
    }>(this.apiBaseUrl + `/provider/openapi/schema`, {
      schema
    })
  }

  testOpenAPI(tool: IXpertTool) {
    return this.httpClient.post(this.apiBaseUrl + '/provider/openapi/test', {
      ...tool
    })
  }

  getAllTags() {
    return this.httpClient.get<IToolTag[]>(this.apiBaseUrl + `/tags`)
  }

  getProviders() {
    return this.httpClient.get<IToolProvider[]>(this.apiBaseUrl + `/providers`)
  }

  getBuiltinTools(provider: string) {
    return this.httpClient.get<IBuiltinTool[]>(this.apiBaseUrl + `/builtin-provider/${provider}/tools`)
  }

  getBuiltinCredentialsSchema(provider: string) {
    return this.httpClient.get<ToolProviderCredentials[]>(this.apiBaseUrl + `/builtin-provider/${provider}/credentials-schema`)
  }

}
