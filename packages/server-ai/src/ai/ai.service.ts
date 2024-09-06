// src/openai/openai.service.ts

import { ICopilot } from '@metad/contracts'
import { AI_PROVIDERS } from '@metad/copilot'
import { Injectable } from '@nestjs/common'
import axios from 'axios'
import { PassThrough } from 'stream'
import { CopilotService } from '../copilot'

function chatCompletionsUrl(copilot: ICopilot, path?: string) {
	const apiHost: string = copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost
	const chatCompletionsUrl: string = AI_PROVIDERS[copilot.provider]?.chatCompletionsUrl
	return (apiHost?.endsWith('/') ? apiHost.slice(0, apiHost.length - 1) : apiHost) + (path ?? chatCompletionsUrl)
}

@Injectable()
export class AiService {
	constructor(private readonly copilotService: CopilotService) {}

	async getCopilot() {
		const result = await this.copilotService.findAll()
		if (result.total === 0) {
			throw new Error('No copilot found')
		}
		return result.items[0]
	}

	async proxyChatCompletionStream(path: string, body: any, headers) {
		const copilot = await this.getCopilot()
		const copilotUrl = chatCompletionsUrl(copilot, path)

		const passThrough = new PassThrough()

		try {
			const response = await axios({
				method: 'POST',
				url: copilotUrl,
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${copilot.apiKey}`,
					Accept: headers.accept
				},
				data: body,
				responseType: 'stream'
			})

			response.data.pipe(passThrough)
		} catch (error) {
			passThrough.emit('error', error)
		}

		return passThrough
	}
}
