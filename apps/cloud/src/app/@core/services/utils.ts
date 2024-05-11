import { NgmDSCoreService } from '@metad/ocap-angular/core'
import { WasmAgentService } from '@metad/ocap-angular/wasm-agent'
import {
  AgentType,
  DataSourceOptions,
  isNil,
  omit,
  Syntax
} from '@metad/ocap-core'
import { NgmSemanticModel } from '@metad/cloud/state'
import { getSemanticModelKey } from '@metad/story/core'


export function registerModel(model: NgmSemanticModel, dsCoreService: NgmDSCoreService, wasmAgent: WasmAgentService) {
  const modelKey = getSemanticModelKey(model)
  const agentType = isNil(model.dataSource)
    ? AgentType.Wasm
    : model.dataSource.useLocalAgent
    ? AgentType.Local
    : AgentType.Server
  const dialect =
    model.dataSource?.type?.type === 'agent'
      ? 'sqlite'
      : agentType === AgentType.Wasm
      ? 'duckdb'
      : model.dataSource?.type?.type
  const catalog = agentType === AgentType.Wasm ? model.catalog || 'main' : model.catalog
  const semanticModel = {
    ...omit(model, 'indicators'),
    name: modelKey,
    catalog,
    dialect,
    agentType,
    settings: {
      dataSourceInfo: model.dataSource?.options?.data_source_info as string
    } as any,
    schema: {
      ...(model.schema ?? {}),
      indicators: model.indicators
    }
  } as DataSourceOptions

  if (model.dataSource?.type?.protocol?.toUpperCase() === 'SQL') {
    semanticModel.settings = semanticModel.settings
      ? { ...semanticModel.settings }
      : {
          ignoreUnknownProperty: true
        }
    semanticModel.settings.dataSourceId = model.dataSource.id
  }

  if (model.type === 'XMLA') {
    semanticModel.syntax = Syntax.MDX
    if (model.dataSource?.type?.protocol?.toUpperCase() === 'SQL') {
      dsCoreService.registerModel({
        ...semanticModel,
        name: getSQLSourceName(modelKey),
        type: 'SQL',
        syntax: Syntax.SQL
      })

      dsCoreService.registerModel({
        ...semanticModel,
        /**
         * Corresponding name of schema in olap engine:
         * ```xml
         * <root name="Semantic Model Name">
         *    <Cube name="Sales">
         * ...
         * ```
         */
        catalog: model.name,
        settings: {
          ...(semanticModel.settings ?? {}),
          /**
           * Corresponding id of XmlaConnection in olap engine:
           */
          dataSourceInfo: model.id
        } as any
      })
    } else {
      dsCoreService.registerModel({
        ...semanticModel,
        name: getXmlaSourceName(modelKey),
        settings: {
          ...semanticModel.settings,
          dataSourceInfo: model.dataSource?.options?.data_source_info
        } as any,
        // Don't use schema for source XMLA system
        schema: null
      })

      dsCoreService.registerModel({
        ...semanticModel,
        settings: {
          ...semanticModel.settings,
          dataSourceInfo: model.dataSource?.options?.data_source_info
        } as any
      })
    }
  } else {
    dsCoreService.registerModel({
      ...semanticModel,
      syntax: Syntax.SQL,
      settings: {
        ...semanticModel.settings,
        dataSourceInfo: model.dataSource?.options?.data_source_info
      } as any
    })
  }

  if (semanticModel.agentType === AgentType.Wasm) {
    // 先初始化 wasm 服务
    wasmAgent.registerModel({
      ...semanticModel
    })
  }

  return semanticModel
}

export function getSQLSourceName(key: string) {
  return key + '_SQL_SOURCE'
}
export function getXmlaSourceName(key: string) {
  return key + '_XMLA_SOURCE'
}

export function registerWasmAgentModel(wasmAgent: WasmAgentService, model: NgmSemanticModel) {
  wasmAgent.registerModel({
    ...model,
    name: getSemanticModelKey(model),
    catalog: model.catalog ?? 'main'
  })
}
