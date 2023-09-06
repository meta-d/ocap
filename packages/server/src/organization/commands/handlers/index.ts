import { OrganizationCreateHandler } from './organization.create.handler'
import { OrganizationDemoHandler } from './organization.demo.handler'
import { OrganizationUpdateHandler } from './organization.update.handler'

export const CommandHandlers = [OrganizationCreateHandler, OrganizationUpdateHandler, OrganizationDemoHandler]
