import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { CrudService } from './../core/crud'
import { SecretToken } from './secret-token.entity'

@Injectable()
export class SecretTokenService extends CrudService<SecretToken> {
	constructor(
		@InjectRepository(SecretToken)
		private readonly stRepository: Repository<SecretToken>
	) {
		super(stRepository)
	}
}
