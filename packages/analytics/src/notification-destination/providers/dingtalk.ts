
import { BaseNotificationDestination, register } from "../base-destination"

export class DingTalk extends BaseNotificationDestination {
    name = '钉钉'
    static type = 'dingtalk'
    type = DingTalk.type
    icon = 'dingtalk'
    schema = {
        "type": "object",
        "properties": {
            "url": {"type": "string"},
            "username": {"type": "string"},
            "password": {"type": "string"},
        },
        "required": ["url"],
        "secret": ["password", "url"],
    }

    notify() {
        throw new Error("Method not implemented.");
    }

    getGroups() {
        throw new Error("Method not implemented.");
    }
}

register(DingTalk)
