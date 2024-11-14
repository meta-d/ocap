// workspace.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { XpertWorkspaceService } from '../workspace.service';

@Injectable()
export class WorkspaceGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly workspaceService: XpertWorkspaceService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const workspaceId = request.params.workspaceId;

    const workspace = await this.workspaceService.findOne(workspaceId, { relations: ['members'] });

    if (!workspace) {
      throw new ForbiddenException('Workspace not found');
    }

    const isMember = workspace.members.some(member => member.id === user.id);
    const isOwner = workspace.ownerId === user.id;

    if (!isMember && !isOwner) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
