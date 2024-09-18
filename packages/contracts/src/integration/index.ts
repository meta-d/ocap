import { IntegrationEnum } from '../integration.model'
import { IntegrationLarkProvider } from './lark'

export const INTEGRATION_PROVIDERS = {
  [IntegrationEnum.LARK]: IntegrationLarkProvider
}
