import { ILanguage } from '@metad/contracts'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { CrudService } from '../core'
import { Language } from './language.entity'
import { createLanguages } from './language.seed'

@Injectable()
export class LanguageService extends CrudService<Language> {
	constructor(
		@InjectRepository(Language)
		private readonly repository: Repository<Language>,
		// private readonly entityManager: EntityManager
	) {
		super(repository)
	}

	async findOneByName(name: string): Promise<Language> {
		const query = this.repository.createQueryBuilder('language').where('"language"."name" = :name', {
			name
		})
		const item = await query.getOne()
		return item
	}

	async initialize(): Promise<ILanguage[]> {
		// return await createLanguages(this.entityManager.connection)
		return []
	}
}
