import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocialAuthService } from '../social-auth.service';
import { IIncomingRequest, RequestCtx } from '../request-context.decorator';
import { Public } from '../public.decorator';

@Controller('feishu')
export class FeishuController {
	constructor(public readonly service: SocialAuthService) {}

	@Get('')
	@Public()
	@UseGuards(AuthGuard('feishu'))
	feishuLogin(@Req() req: any) {}

	@Get('callback')
	@Public()
	@UseGuards(AuthGuard('feishu'))
	async feishuLoginCallback(
		@RequestCtx() requestCtx: IIncomingRequest,
		@Res() res
	) {
		const { user } = requestCtx;
		console.log(`got feishu:`, user)
		const {
			success,
			authData
		} = await this.service.validateOAuthLoginUser(user);
		return this.service.routeRedirect(success, authData, res);
	}
}
