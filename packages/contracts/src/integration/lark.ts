import { IIntegration, IntegrationEnum } from "../integration.model"

export const IntegrationLarkProvider = {
    name: IntegrationEnum.LARK,
    avatar: 'lark.png',
    schema: {
        type: 'object',
        properties: {
            appId: { type: 'string', title: 'App ID' },
            appSecret: { type: 'string', title: 'App Secret' },
            verificationToken: { type: 'string', title: 'Verification Token' },
            encryptKey: { type: 'string', title: 'Encrypt Key' },
        },
        required: ['appId', 'appSecret'],
          secret: ['appSecret', 'encryptKey']
    },
    webhookUrl: (integration: IIntegration, baseUrl: string) => {
        return `${baseUrl}/api/lark/webhook/${integration.id}`
    }
}