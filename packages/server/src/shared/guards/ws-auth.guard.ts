import { ExecutionContext, Injectable } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { AuthGuard } from '@nestjs/passport'

@Injectable()
export class WsJWTGuard extends AuthGuard('ws-jwt') {
  constructor(private readonly _reflector: Reflector) {
    super()
  }

  getRequest(context: ExecutionContext) {
    return context.switchToWs().getClient().handshake
  }

  canActivate(context: ExecutionContext) {
    /*
     * PUBLIC recorator method level
     */
    const isMethodPublic = this._reflector.get<boolean>(
      'isPublic',
      context.getHandler()
    )

    /*
     * PUBLIC recorator class level
     */
    const isClassPublic = this._reflector.get<boolean>(
      'isPublic',
      context.getClass()
    )

    /*
     * IF methods/class are publics allowed them
     */
    if (isMethodPublic || isClassPublic) {
      return true
    }

    // Make sure to check the authorization, for now, just return false to have a difference between public routes.
    return super.canActivate(context)
  }
}
