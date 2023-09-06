import { OrganizationDemoHandler } from "./organization.demo.handler"
import { TenantCreatedHandler } from "./tenant.created.handler"
import { TrialUserCreatedHandler } from "./trial.created.handler"

export const EventHandlers = [TrialUserCreatedHandler, TenantCreatedHandler]
export const CommandHandlers = [OrganizationDemoHandler]
