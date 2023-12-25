import { ICopilot } from '@metad/contracts'
import { Body, Controller, HttpCode, HttpException, HttpStatus, Logger, Post, Response, Sse } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { OpenAIStream, streamToResponse } from 'ai'
import { ServerResponse } from 'http'
import { CopilotService } from '../copilot'

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge'

export const AI_PROVIDERS = {
	openai: {
		apiHost: 'https://api.openai.com',
		chatCompletionsUrl: '/v1/chat/completions'
	},
	azure: {
		apiHost: '',
		chatCompletionsUrl: '/v1/chat/completions'
	}
}

function chatCompletionsUrl(copilot: ICopilot) {
	return (
		(copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost) + AI_PROVIDERS[copilot.provider].chatCompletionsUrl
	)
}

@ApiTags('AI/Chat')
@ApiBearerAuth()
@Controller()
export class AIController {
	readonly #logger = new Logger(AIController.name)

	constructor(private readonly copilotService: CopilotService) {}

	@ApiOperation({ summary: 'Chat with AI provider apis' })
	@ApiResponse({
		status: HttpStatus.CREATED,
		description: 'Success!'
	})
	@ApiResponse({
		status: HttpStatus.BAD_REQUEST,
		description: 'Invalid input, The response body may contain clues as to what went wrong'
	})
	@HttpCode(HttpStatus.CREATED)
	@Post('chat')
	async chat(@Body() body: any, @Response() res: ServerResponse) {
		const result = await this.copilotService.findAll()
		if (result.total === 0) {
			throw new Error('No copilot found')
		}

		const copilot = result.items[0]

		this.#logger.debug(`Try call ai api '${chatCompletionsUrl(copilot)}' with body ...}`)
		const abortController = new AbortController()
		try {
			const response = await fetch(chatCompletionsUrl(copilot), {
				method: 'POST',
				body: JSON.stringify(body),
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${copilot.apiKey}`
				},
				signal: abortController?.signal
			})

			// Convert the response into a friendly text-stream
			const stream = OpenAIStream(response)

			// Pipe the stream to the response
			streamToResponse(stream, res)
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		}
	}
}
