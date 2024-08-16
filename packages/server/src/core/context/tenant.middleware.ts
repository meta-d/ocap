import { Injectable, NestMiddleware } from '@nestjs/common'
import { NextFunction, Request, Response } from 'express'
import { RequestContext } from './request-context'

@Injectable()
export class TenantDomainMiddleware implements NestMiddleware {
	use(req: Request, res: Response, next: NextFunction) {
		if (!RequestContext.currentTenantId() && req.headers['origin']) {
			const url = new URL(req.headers['origin'])
			const host = url.hostname // 获取完整的域名，如 comp.app.mtda.cloud
			const subdomain = host.split('.')[0] // 提取第一个子域名部分
			req['tenant-domain'] = subdomain === 'localhost' ? null : subdomain // 将子域名存储到请求对象中
		}
		next()
	}
}
