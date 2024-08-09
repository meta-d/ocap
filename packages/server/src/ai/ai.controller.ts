import { AiProviderRole, ICopilot } from '@metad/contracts'
import { Body, Controller, HttpCode, HttpException, HttpStatus, Headers, Logger, Post, Res, Param, Get, ForbiddenException } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger'
import { ServerResponse } from 'http'
import { CopilotService } from '../copilot'
import { AI_PROVIDERS } from './providers'
import { AiService } from './ai.service'
import { CopilotUserService } from '../copilot-user/index'
import { RequestContext } from '../core'
import { CopilotOrganizationService } from '../copilot-organization/index'

function chatCompletionsUrl(copilot: ICopilot, path?: string) {
	const apiHost: string = copilot.apiHost || AI_PROVIDERS[copilot.provider]?.apiHost
	const chatCompletionsUrl: string = AI_PROVIDERS[copilot.provider]?.chatCompletionsUrl
	return (apiHost?.endsWith('/') ? apiHost.slice(0, apiHost.length - 1) : apiHost) + (path ?? chatCompletionsUrl)
}

@ApiTags('AI/Chat')
@ApiBearerAuth()
@Controller()
export class AIController {
	readonly #logger = new Logger(AIController.name)

	constructor(
		private readonly aiService: AiService,
		private readonly copilotService: CopilotService,
		private readonly copilotUserService: CopilotUserService,
		private readonly copilotOrganizationService: CopilotOrganizationService,
	) {}

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
		const copilotUrl = chatCompletionsUrl(copilot)
		try {
			const response = await fetch(copilotUrl, {
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
			this.#logger.error(`Try to call ai api '${copilotUrl}' with body:
\`\`\`
${JSON.stringify(body)}
\`\`\`
failed: ${error.message}`)
			throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	@Get('proxy/:role/:m')
	async proxyGetModule(@Param('role') role: AiProviderRole, @Param('m') m: string, @Headers() headers) {
		const path = '/' + m
		const copilot = await this.getCopilot(role)
		const copilotUrl = chatCompletionsUrl(copilot, path)
		try {
			const response = await fetch(copilotUrl, {
				method: 'GET',
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${copilot.apiKey}`,
					accept: headers.accept
				},
			})
			// return response
			return await response.json()
		} catch (error) {
			this.#logger.error(`Try to call ai api '${copilotUrl}'
failed: ${error.message}`)
			throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}
	@Post('proxy/:role/:m')
	async proxyModule(@Param('role') role: AiProviderRole, @Param('m') m: string, @Headers() headers, @Body() body: any, @Res() resp: ServerResponse) {
		const path = '/' + m
		return await this.proxy(role, path, headers, body, resp)
	}
	@Post('proxy/:role/:m/:f')
	async proxyModuleFun(@Param('role') role: AiProviderRole, @Param('m') m: string, @Param('f') f: string, @Headers() headers, @Body() body: any, @Res() resp: ServerResponse) {
		const path = '/' + m + (f ? '/'+ f : '')

		// const stream = await this.aiService.proxyChatCompletionStream(path, body, headers);
		// resp.setHeader('Content-Type', 'application/json');
		// stream.pipe(resp);

		return await this.proxy(role, path, headers, body, resp)
	}

	async proxy(role: AiProviderRole, path: string, headers: any, body: any, resp: ServerResponse) {
		let copilot = null
		let copilotUrl = null
		try {
			copilot = await this.getCopilot(role)
			copilotUrl = chatCompletionsUrl(copilot, path)
		} catch(err) {
			throw new ForbiddenException(err.message)
		}
		
		try {
			const response = await fetch(copilotUrl, {
				method: 'POST',
				body: JSON.stringify(body),
				headers: {
					'content-type': 'application/json',
					authorization: `Bearer ${copilot.apiKey}`,
					accept: headers.accept
				},
			})

			// if (body.stream) {
				if (!resp.headersSent) {
					await streamToResponse(response, resp, { status: response.status, headers: {
						'content-type': response.headers.get('content-type') || 'application/json',
					} })
				}
			// } else {
			// 	const result = await response.json()
				
			// 	resp.write(JSON.stringify(result))
			// 	resp.end()
			// }
		} catch (error) {
			this.#logger.error(`Try to call ai api '${copilotUrl}' with body:
\`\`\`
${JSON.stringify(body)}
\`\`\`
failed: ${error.message}`)
			throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR)
		}
	}

	async getCopilot(role: AiProviderRole) {
		const userId = RequestContext.currentUserId()
		const organizationId = RequestContext.getOrganizationId()
		let result = await this.copilotService.findOneByRole(role)
		if (result?.enabled) {
			// Check token usage in organizaiton
			const usage = await this.copilotUserService.findOneOrFail({ where: { userId, organizationId, provider: result.provider }})
			if (usage.success && usage.record.tokenLimit) {
				if (usage.record.tokenUsed >= usage.record.tokenLimit) {
					throw new Error('Token usage exceeds limit')
				}
			}
		} else {
			result = await this.copilotService.findTenantOneByRole(role)
			if (!result?.enabled) {
				throw new Error('No copilot found')
			}
			// Check token usage in tenant
			const usage = await this.copilotOrganizationService.findOneOrFail({where: { organizationId, provider: result.provider }})
			if (usage.success && usage.record.tokenLimit) {
				if (usage.record.tokenUsed >= usage.record.tokenLimit) {
					throw new Error('Token usage exceeds limit')
				}
			}
		}
		return result
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
	  ...(init?.headers ?? {}),
	});
  
	const reader = res.body.getReader();
	async function read() {
	  const { done, value } = await reader.read()
	  if (done) {
		response.end();
		return;
	  }
	  if (value) {
		response.write(value);
	  }
	  await read();
	}
	await read();
}