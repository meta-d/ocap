import { createParamDecorator } from '@nestjs/common'
import { IUser } from '@metad/contracts'
import { RequestContext } from '../../core/context'

export const CurrentUser = createParamDecorator((): IUser => {
	return RequestContext.currentUser()
})

export const EmployeeId = createParamDecorator((): string => {
	return RequestContext.currentUser()?.employeeId
})