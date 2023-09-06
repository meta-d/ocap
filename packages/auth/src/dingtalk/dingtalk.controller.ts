import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { SocialAuthService } from '../social-auth.service';
import { IIncomingRequest, RequestCtx } from '../request-context.decorator';
import { Public } from '../public.decorator';

@Controller('dingtalk')
export class DingtalkController {
	constructor(public readonly service: SocialAuthService) {}

	@Get('')
	@Public()
	@UseGuards(AuthGuard('dingtalk'))
	dingtalkLogin(@Req() req: any) {
		//
	}

	@Get('callback')
	@Public()
	@UseGuards(AuthGuard('dingtalk'))
	async feishuLoginCallback(
		@RequestCtx() requestCtx: IIncomingRequest,
		@Res() res
	) {
		const { user } = requestCtx;
		console.log(`got dingtalk:`, user)
		const {
			success,
			authData
		} = await this.service.validateOAuthLoginUser(user);
		return this.service.routeRedirect(success, authData, res);
	}
}
