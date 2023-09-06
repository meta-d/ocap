import { BaseNotificationDestination, register } from "../base-destination"


const API_AUTH_TENANT_ACCESS_TOKEN = "https://open.feishu.cn/open-apis/auth/v3/tenant_access_token/internal/"
const API_MESSAGE_SEND = "https://open.feishu.cn/open-apis/message/v4/send/"
const API_CHATS_GROUPS = "https://open.feishu.cn/open-apis/im/v1/chats"
const API_CONTACT_USERS = "https://open.feishu.cn/open-apis/contact/v3/users"
const API_IM_IMAGES = "https://open.feishu.cn/open-apis/im/v1/images"

export class Feishu extends BaseNotificationDestination {
    name = '飞书'
    static type = 'feishu'
    type = Feishu.type
    icon = 'feishu'
    schema = {
        "type": "object",
        "properties": {
            "appId": {"type": "string", "title": "App ID"},
            "appSecret": {"type": "string", "title": "App Secret"},
            "encryptKey": {"type": "string", "title": "Encrypt Key"},
            "verificationToken": {"type": "string", "title": "Verification Token"},
        },
        "required": ["appId", "appSecret"],
        "secret": ["appId", "appSecret", "encryptKey", "verificationToken"],
    }

    notify() {
        throw new Error("Method not implemented.");
    }

    async getGroups() {
        const token = await this.__get_token()
        const headers = {
            "Content-Type": 'application/json',
            "Authorization": "Bearer " + token,
        }

        return this.get(API_CHATS_GROUPS, {headers})
            .then(({data}) => data.data.items)
            .catch(({response}) => {
                return response.data
            })
    }

    async __get_token() {
        const key = `${this.type}__tenant_access_token`
        const token = await this.redisClient.get(key)
        if (!token) {
            return this.__refresh_token()
        }
        return token
    }

    async __refresh_token() {
        const token = await this.get_tenant_access_token()

        this.redisClient.set(
            `${this.type}__tenant_access_token`,
            token.tenant_access_token,
            {
                EX: token.expire - 10
            }
        )

        return token.tenant_access_token
    }

    get_tenant_access_token() {
        const headers = {"Content-Type": "application/json"}
        const req_body = {"app_id": this.options.appId, "app_secret": this.options.appSecret}

        return this.post(API_AUTH_TENANT_ACCESS_TOKEN, req_body, {headers})
            .then(({data}) => {
                if (data.code !== 0) {
                    console.error(`Get token error:`, data.code)
                    return ''
                }
                return data
            })

    }
}

register(Feishu)
