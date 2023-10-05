import { IFeatureCreateInput } from '@metad/contracts'
import { setConfig } from '@metad/server-config'
import {
	coreEntities,
	coreSubscribers,
	DEFAULT_FEATURES as SERVER_DEFAULT_FEATURES,
	setDefaultFeatures,
	setDefaultRolePermissions
} from '@metad/server-core'
import { Type } from '@nestjs/common'
import { ALL_ENTITIES } from './entities/index'
import { coreSubscribers as analyticsSubscribers } from './entities/subscribers'
import { DEFAULT_FEATURES } from './features'
import { ANALYTICS_ROLE_PERMISSIONS } from './role-permissions'

export function prepare() {
	const allEntities = coreEntities as Array<Type<any>>
	allEntities.push(...ALL_ENTITIES)
	setConfig({
		dbConnectionOptions: {
			entities: allEntities,
			subscribers: [...coreSubscribers, ...analyticsSubscribers]
		}
	})

	// Append Features of analytics project into System default features
	const features = [...SERVER_DEFAULT_FEATURES]
	DEFAULT_FEATURES.forEach((feature) => {
		const index = features.findIndex((item) => item.code === feature.code)
		if (index > -1) {
			features[index].children.push(...feature.children)
		} else {
			features.push(feature as IFeatureCreateInput)
		}
	})
	setDefaultFeatures(features)

	// Append role permissions of analytics project into System default role permissions
	ANALYTICS_ROLE_PERMISSIONS.forEach(({ role, defaultEnabledPermissions }) => {
		setDefaultRolePermissions(role, defaultEnabledPermissions)
	})
}
