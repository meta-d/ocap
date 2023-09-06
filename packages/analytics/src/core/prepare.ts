import { Type } from '@nestjs/common'
import {
	coreEntities,
	coreSubscribers,
	DEFAULT_FEATURES as SERVER_DEFAULT_FEATURES,
	setDefaultFeatures,
	setDefaultRolePermissions,
} from '@metad/server-core'
import { setConfig } from '@metad/server-config'
import { ALL_ENTITIES } from './entities/index'
import { DEFAULT_FEATURES } from './features'
import { ANALYTICS_ROLE_PERMISSIONS } from './role-permissions'
import { coreSubscribers as analyticsSubscribers } from './entities/subscribers'

export function prepare() {
	const allEntities = coreEntities as Array<Type<any>>
	allEntities.push(...ALL_ENTITIES)
	setConfig({
		dbConnectionOptions: {
			entities: allEntities,
			subscribers: [...coreSubscribers, ...analyticsSubscribers]
		},
	})

	const features = [...SERVER_DEFAULT_FEATURES]
	features.push(...DEFAULT_FEATURES)
	setDefaultFeatures(features)

	ANALYTICS_ROLE_PERMISSIONS.forEach(({ role, defaultEnabledPermissions }) => {
		setDefaultRolePermissions(role, defaultEnabledPermissions)
	})
}
