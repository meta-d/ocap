import { Controller, Get, Req, Res, UseGuards } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'
import { Public } from '../public.decorator'
import { IIncomingRequest, RequestCtx } from './../request-context.decorator'
import { SocialAuthService } from './../social-auth.service'

@Controller('github')
export class GithubController {
  constructor(public readonly service: SocialAuthService) {}

  @Get('')
  @Public()
  @UseGuards(AuthGuard('github'))
  githubLogin(@Req() req: any) {}

  @Get('callback')
  @Public()
  @UseGuards(AuthGuard('github'))
  async githubLoginCallback(@RequestCtx() requestCtx: IIncomingRequest, @Res() res: any) {
    const { user } = requestCtx

    const { success, authData } = await this.service.validateOAuthLoginEmail(user.emails)
    return this.service.routeRedirect(
      success,
      {
        ...authData,
        ...user
      },
      res
    )
  }
}
