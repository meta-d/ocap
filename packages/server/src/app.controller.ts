import { IContact } from '@metad/contracts'
import { Controller, Get } from '@nestjs/common'
import { AppService } from './app.service'

@Controller()
export class AppController {
	constructor(private readonly appService: AppService) {}

	@Get('hello')
	getHello(): IContact {
		return {}
	}
}
