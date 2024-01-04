import { ICopilot } from '@metad/contracts'
import { Body, Controller, HttpCode, HttpStatus, Logger, Post, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
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
	const apiHost: string = copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost
	const chatCompletionsUrl: string = AI_PROVIDERS[copilot.provider]?.chatCompletionsUrl
	return apiHost?.endsWith('/') ? apiHost.slice(0, apiHost.length - 1) + chatCompletionsUrl : apiHost + chatCompletionsUrl
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
	async chat(@Body() body: any, @Res() resp: ServerResponse) {
		const result = await this.copilotService.findAll()
		if (result.total === 0) {
			throw new Error('No copilot found')
		}

		const copilot = result.items[0]

		this.#logger.debug(`Try call ai api '${chatCompletionsUrl(copilot)}' with body ...}`)

		const response = await fetch(chatCompletionsUrl(copilot), {
			method: 'POST',
			body: JSON.stringify(body),
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${copilot.apiKey}`
			},
		})

		streamToResponse(response, resp, {
			status: response.status
		})

		// const abortController = new AbortController()
		// try {
		// 	const response = await fetch(chatCompletionsUrl(copilot), {
		// 		method: 'POST',
		// 		body: JSON.stringify(body),
		// 		headers: {
		// 			'Content-Type': 'application/json',
		// 			Authorization: `Bearer ${copilot.apiKey}`
		// 		},
		// 		signal: abortController?.signal
		// 	})

		// 	// Convert the response into a friendly text-stream
		// 	const stream = OpenAIStream(response)

		// 	// Pipe the stream to the response
		// 	streamToResponse(stream, res)
		// } catch (error) {
		// 	throw new HttpException(error.message, HttpStatus.BAD_REQUEST)
		// }
	}
}


/**
 * A utility function to stream a ReadableStream to a Node.js response-like object.
 */
export function streamToResponse(
	res: Response,
	response: ServerResponse,
	init?: { headers?: Record<string, string>; status?: number },
  ) {
	response.writeHead(init?.status || 200, {
	  'Content-Type': 'text/plain; charset=utf-8',
	  ...init?.headers,
	});
  
	const reader = res.body.getReader();
	function read() {
	  reader.read().then(({ done, value }: { done: boolean; value?: any }) => {
		if (done) {
		  response.end();
		  return;
		}
		response.write(value);
		read();
	  });
	}
	read();
  }
  