import * as lark from '@larksuiteoapi/node-sdk'
import { environment } from '@metad/server-config'

export const client = new lark.Client({
	appId: environment.larkConfig.appId,
	appSecret: environment.larkConfig.appSecret,
	appType: lark.AppType.SelfBuild,
	domain: lark.Domain.Feishu
})
