import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { XpertWorkspaceService } from '../workspace.service';

@Injectable()
export class WorkspaceOwnerGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly workspaceService: XpertWorkspaceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId;

    const workspace = await this.workspaceService.findOne(workspaceId);

    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    const isOwner = workspace.ownerId === user.id;

    if (!isOwner) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
