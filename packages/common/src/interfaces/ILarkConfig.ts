export interface ILarkConfig {
	readonly appId: string;
	readonly appSecret: string;
	readonly domain?: string;
	readonly appType?: string;
	readonly verificationToken?: string
	readonly encryptKey?: string
	readonly appOpenId?: string
	readonly tenantId?: string
	readonly organizationId?: string
	readonly redirectUrl?: string
	readonly roleName?: string
}
