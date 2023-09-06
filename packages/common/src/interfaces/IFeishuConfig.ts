export interface IFeishuConfig {
	readonly clientId: string;
	readonly clientSecret: string;
	readonly redirectUrl: string;
	readonly state?: string;
	readonly appType?: string;
    readonly appTicket?: () => Promise<string>
}
