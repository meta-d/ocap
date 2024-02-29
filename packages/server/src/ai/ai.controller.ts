import { ICopilot } from '@metad/contracts'
import { Body, Controller, HttpCode, HttpException, HttpStatus, Headers, Logger, Post, Res } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ServerResponse } from 'http'
import { CopilotService } from '../copilot'
import { AI_PROVIDERS } from './providers'

function chatCompletionsUrl(copilot: ICopilot) {
	const apiHost: string = copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost
	const chatCompletionsUrl: string = AI_PROVIDERS[copilot.provider]?.chatCompletionsUrl
	return (apiHost?.endsWith('/') ? apiHost.slice(0, apiHost.length - 1) : apiHost) + chatCompletionsUrl
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
	async chat(@Headers() headers, @Body() body: any, @Res() resp: ServerResponse) {

		const result = await this.copilotService.findAll()
		if (result.total === 0) {
			throw new Error('No copilot found')
		}

		const copilot = result.items[0]

		this.#logger.debug(`Try call ai api '${chatCompletionsUrl(copilot)}' with body ...`)

		try {
			const response = await fetch(chatCompletionsUrl(copilot), {
				method: 'POST',
				body: JSON.stringify(body),
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${copilot.apiKey}`,
					accept: headers.accept
				},
			})
			
			if (!resp.headersSent) {
				await streamToResponse(response, resp, { status: response.status })
			}
		} catch (error) {
			throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}
}


/**
 * A utility function to stream a ReadableStream to a Node.js response-like object.
 */
export async function streamToResponse(
	res: Response,
	response: ServerResponse,
	init?: { headers?: Record<string, string>; status?: number },
  ) {
	response.writeHead(init?.status || 200, {
	  'Content-Type': 'text/plain; charset=utf-8',
	  ...init?.headers,
	});
  
	const reader = res.body.getReader();
	async function read() {
	  const { done, value } = await reader.read()
	  if (done) {
		response.end();
		return;
	  }
	  response.write(value);
	  await read();
	}
	await read();
}