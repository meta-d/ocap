/* eslint-disable @typescript-eslint/member-ordering */
import { HttpClient, HttpParams } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { IDataSource, ISemanticModel } from '@metad/contracts'
import { hierarchize, Indicator, omit, pick, SemanticModel as OcapSemanticModel } from '@metad/ocap-core'
import { StoryModel } from '@metad/story/core'
import { zip } from 'rxjs'
import { map, switchMap } from 'rxjs/operators'
import { BusinessAreasService } from './business-area.service'
import { C_URI_API_MODELS } from './constants'
import { OrganizationBaseService } from './organization-base.service'
import { Store } from './store.service'
import { convertIndicatorResult, convertStoryModel } from './types'

@Injectable({
  providedIn: 'root'
})
export class ModelsService extends OrganizationBaseService {
  constructor(store: Store, public httpClient: HttpClient, private businessAreaService: BusinessAreasService) {
    super(store)
  }

  getModels(path: string, query?) {
    let params = new HttpParams().append(
      '$query',
      JSON.stringify({
        relations: ['createdBy', 'updatedBy', 'dataSource', 'dataSource.type', 'businessArea'],
        order: {
          updatedAt: 'DESC'
        }
      })
    )

    if (query) {
      params = params.appendAll(query)
    }

    return this.organizationId$.pipe(
      switchMap(() =>
        this.httpClient
          .get<{ items: Array<ISemanticModel> }>(C_URI_API_MODELS + path, {
            params
          })
          .pipe(map(({ items }) => items.map(convertNewSemanticModelResult)))
      )
    )
  }

  getAll() {
    return this.getModels('')
  }

  getMy(businessAreaId?: string) {
    return this.getModels('/my', businessAreaId ? { businessAreaId } : null)
  }

  getMyModelsByAreaTree() {
    return zip([this.businessAreaService.getMy(true), this.getMy()]).pipe(
      map(([areas, models]) => {
        return (
          hierarchize(
            [
              ...models.map((item) => ({
                ...item,
                parentId: item.businessAreaId,
                dataSource: item.dataSource?.name,
                __isModel__: true
              })),
              ...areas
            ],
            {
              parentNodeProperty: 'parentId',
              valueProperty: 'id',
              labelProperty: 'name'
            }
          ) ?? []
        )
      })
    )
  }

  getModelsByAreaTree() {
    return zip([this.businessAreaService.getAll(), this.getAll()]).pipe(
      map(([areas, models]) => {
        return (
          hierarchize(
            [
              ...models.map((item) => ({
                ...item,
                parentId: item.businessAreaId,
                dataSource: item.dataSource?.name
              })),
              ...areas
            ],
            {
              parentNodeProperty: 'parentId',
              valueProperty: 'id',
              labelProperty: 'name'
            }
          ) ?? []
        )
      })
    )
  }

  getByGroup(groupId?: string) {
    const findInput = {}
    if (groupId) {
      findInput['groupId'] = groupId
    }

    return this.organizationId$.pipe(
      switchMap(() =>
        this.httpClient
          .get<{ items: Array<ISemanticModel> }>(C_URI_API_MODELS, {
            params: new HttpParams().append(
              '$query',
              JSON.stringify({
                relations: ['createdBy', 'updatedBy', 'dataSource', 'dataSource.type', 'group'],
                findInput
              })
            )
          })
          .pipe(map(({ items }) => items.map(convertNewSemanticModelResult)))
      )
    )
  }

  upload(data: ISemanticModel) {
    return this.httpClient.post(C_URI_API_MODELS, data)
  }

  create(data: Partial<StoryModel>) {
    return this.httpClient.post(C_URI_API_MODELS, convertStoryModel(data))
  }

  createNew(data: Partial<NgmSemanticModel>) {
    return this.httpClient.post(C_URI_API_MODELS, convertNewSemanticModel(data))
  }

  update(id: string, input: Partial<OcapSemanticModel>, options?: { relations: string[] }) {
    let params = new HttpParams()
    if (options?.relations) {
      params = params.append('relations', options.relations.join(','))
    }
    return this.httpClient.put<ISemanticModel>(C_URI_API_MODELS + `/${id}`, convertNewSemanticModel(input), { params })
  }

  delete(id: string) {
    return this.httpClient.delete(`${C_URI_API_MODELS}/${id}`)
  }

  getById(id: string, relations = []) {
    return this.httpClient.get<ISemanticModel>(C_URI_API_MODELS + `/${id}`, {
      params: new HttpParams().append(
        '$query',
        JSON.stringify({
          relations
        })
      )
    })
  }

  count() {
    return this.httpClient.get<number>(C_URI_API_MODELS + `/count`)
  }

  createRole(modelId: string, name: string) {
    return this.httpClient.post(`${C_URI_API_MODELS}/${modelId}/role`, { name })
  }

  deleteCache(id: string) {
    return this.httpClient.delete(`${C_URI_API_MODELS}/${id}/cache`)
  }

  updateMembers(id: string, members: string[]) {
    return this.httpClient.put<ISemanticModel>(C_URI_API_MODELS + `/${id}/members`, members)
  }

  deleteMember(id: string, memberId: string) {
    return this.httpClient.delete(C_URI_API_MODELS + `/${id}/members/${memberId}`)
  }

  updateOwner(id: string, userId: string, params?) {
    return this.httpClient.put<ISemanticModel>(C_URI_API_MODELS + `/${id}`, {ownerId: userId}, { params })
  }
}

/**
 * @deprecated 需重构, 找到更好的转换方式
 */
export function convertNewSemanticModel(model: Partial<OcapSemanticModel>): ISemanticModel {
  const systemFields = [
    'key',
    'name',
    'description', 
    'type',
    'catalog',
    'cube',
    'dataSourceId',
    'businessAreaId',
    'preferences',
    'visibility',
    'roles',
    'ownerId',
    'status'
  ]
  const updateModel: ISemanticModel = {
    options: omit(model, ...[
      ...systemFields,
      'options',
      'id',
      'tenantId',
      'tenant',
      'organizationId',
      'organization',
      'businessArea',
      'dataSource',
      'stories',
      'indicators',
      'createdAt',
      'updatedAt',
      'createdById',
      'createdBy',
      'updatedById',
      'updatedBy',
      'queries'
    ]),
    ...pick(model, ...systemFields)
  }

  return updateModel
}

/**
 * @deprecated 需重构, 找到更好的转换方式
 */
export interface NgmSemanticModel extends OcapSemanticModel, Pick<ISemanticModel, 'cube'>, Pick<ISemanticModel, 'roles'>,  Pick<ISemanticModel, 'queries'> {
  key?: string
  preferences?: any
  dataSource?: IDataSource
  businessAreaId?: string
  indicators?: Indicator[]
}

/**
 * @deprecated 需重构, 找到更好的转换方式
 */
export function convertNewSemanticModelResult(result: ISemanticModel): NgmSemanticModel {
  return {
    ...result.options,
    ...omit(result, 'options'),
    indicators: result.indicators?.map(convertIndicatorResult)
  } as NgmSemanticModel
}
