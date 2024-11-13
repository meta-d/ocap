import { NotFoundException } from '@nestjs/common'

export class XpertCopilotNotFoundException extends NotFoundException {}
export class CopilotNotFoundException extends NotFoundException {}
export class CopilotModelNotFoundException extends NotFoundException {}
export class AiModelNotFoundException extends NotFoundException {}
