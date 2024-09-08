import { AIPermissionsEnum, RolesEnum } from '@metad/contracts'

export const DEFAULT_ROLE_PERMISSIONS = [
	{
		role: RolesEnum.SUPER_ADMIN,
		defaultEnabledPermissions: [AIPermissionsEnum.KNOWLEDGEBASE_EDIT]
	},
	{
		role: RolesEnum.ADMIN,
		defaultEnabledPermissions: [AIPermissionsEnum.KNOWLEDGEBASE_EDIT]
	},
	{
		role: RolesEnum.DATA_ENTRY,
		defaultEnabledPermissions: [AIPermissionsEnum.KNOWLEDGEBASE_EDIT]
	},
	{
		role: RolesEnum.VIEWER,
		defaultEnabledPermissions: []
	},
	{
		role: RolesEnum.EMPLOYEE,
		defaultEnabledPermissions: []
	},
	{
		role: RolesEnum.CANDIDATE,
		defaultEnabledPermissions: []
	},
	{
		role: RolesEnum.TRIAL,
		defaultEnabledPermissions: [AIPermissionsEnum.KNOWLEDGEBASE_EDIT]
	}
]
