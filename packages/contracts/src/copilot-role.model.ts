import { IBasePerTenantAndOrganizationEntityModel } from "./base-entity.model"

/**
 * Copilot role, business role for the copilot
 */
export interface ICopilotRole extends IBasePerTenantAndOrganizationEntityModel {
  name: string
  title?: string
  titleCN?: string
  description?: string
  active?: boolean
}
