import { IBasePerTenantAndOrganizationEntityModel } from './base-entity.model'
import { FileStorageProviderEnum } from './file-provider'

export interface IStorageFile extends IBasePerTenantAndOrganizationEntityModel {
  file: string
  url?: string
  thumb?: string
  fileUrl?: string
  thumbUrl?: string
  originalName?: string
  encoding?: string
  size?: number
  mimetype?: string
  recordedAt?: Date
  storageProvider?: FileStorageProviderEnum
}

export interface ICreateStorageFileInput extends IBasePerTenantAndOrganizationEntityModel {
  activityTimestamp: string
  employeeId?: string
  file: string
  thumb?: string
  recordedAt: Date | string
}

export interface IUpdateStorageFileInput extends ICreateStorageFileInput {
  id: string
}
