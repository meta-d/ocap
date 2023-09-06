import { PermissionsEnum } from '@metad/contracts'
import { PERMISSIONS_METADATA } from '@metad/server-common'
import { environment as env } from '@metad/server-config'
import { createParamDecorator, SetMetadata } from '@nestjs/common'
import { verify } from 'jsonwebtoken'
import { RequestContext } from '../../core/context'

export const Permissions = (...permissions: string[]) => SetMetadata(PERMISSIONS_METADATA, permissions)

export const UserPermissions = createParamDecorator((): PermissionsEnum[] => {
	const token = RequestContext.currentToken()

	const { permissions } = verify(token, env.JWT_SECRET) as {
		id: string
		permissions: PermissionsEnum[]
	}

	return permissions.map((permission) => PermissionsEnum[permission])
})
