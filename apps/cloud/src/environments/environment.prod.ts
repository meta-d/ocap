import { IEnvironment } from './types'

export const environment: IEnvironment = {
  production: true,
  DEMO: false,
  API_BASE_URL: 'DOCKER_API_BASE_URL',
  IS_ELECTRON: false,
  enableLocalAgent: 'DOCKER_ENABLE_LOCAL_AGENT'
}
