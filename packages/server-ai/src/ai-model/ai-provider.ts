import { ICopilot, IProviderEntity, ModelType, ProviderModel } from '@metad/contracts'
import { ConfigService } from '@metad/server-config'
import { loadYamlFile } from '@metad/server-core'
import { Inject, Injectable, Logger } from '@nestjs/common'
import * as path from 'path'
import { AIModel } from './ai-model'
import { AIModelEntity } from './entities'
import { AIProviderRegistry } from './registry'

@Injectable()
export abstract class ModelProvider {
	protected logger = new Logger(this.constructor.name)
	public readonly MyFolderPath = 'packages/server-ai/src/ai-model/model_providers'

	@Inject(ConfigService)
	protected readonly configService: ConfigService

	protected providerSchema: IProviderEntity | null = null

	protected modelInstances: Map<ModelType, AIModel> = new Map()

	constructor(public name: string) {
		AIProviderRegistry.getInstance().registerProvider(this)
	}

	abstract validateProviderCredentials(credentials: Record<string, any>): Promise<void>

	getProviderServerPath() {
		return path.join(this.configService.assetOptions.serverRoot, this.MyFolderPath, this.name)
	}

	getProviderSchema(): IProviderEntity {
		if (this.providerSchema) {
			return this.providerSchema
		}

		const yamlPath = path.join(this.getProviderServerPath(), `${this.name}.yaml`)

		const yamlData = loadYamlFile(yamlPath, this.logger) as Record<string, any>

		try {
			this.providerSchema = yamlData as IProviderEntity
		} catch (e) {
			throw new Error(`Invalid provider schema for ${this.name}: ${e.message}`)
		}

		return this.providerSchema
	}

	async getModels(modelType: ModelType): Promise<AIModelEntity[]> {
		const providerSchema = this.getProviderSchema()
		if (!providerSchema.supported_model_types.includes(modelType)) {
			return []
		}

		const modelInstance = this.getModelInstance(modelType)
		return modelInstance.predefinedModels()
	}

	registerAIModelInstance(modelType: ModelType, modelInstance: AIModel): void {
		this.modelInstances.set(modelType, modelInstance)
	}

	getModelInstance(modelType: ModelType): AIModel {
		const modelInstance = this.modelInstances.get(modelType)

		if (!modelInstance) {
			throw new Error(`Missing AIModel instance for model type ${modelType}`)
		}

		return modelInstance
	}

	/**
	 * Get provider models.
	 * @param modelType - model type
	 * @param onlyActive - only active models
	 * @return provider models
	 */
	getProviderModels(modelType?: ModelType, onlyActive = false): ProviderModel[] {
		let modelTypes: ModelType[] = []
		if (modelType) {
			modelTypes.push(modelType)
		} else {
			modelTypes = this.getProviderSchema().supported_model_types
		}

		const providerModels: AIModelEntity[] = this.getSystemProviderModels(modelTypes)

		if (onlyActive) {
			// providerModels = providerModels.filter(m => m.status === ModelStatus.ACTIVE);
		}

		// Resort providerModels
		return providerModels.sort((a, b) => a.model_type.localeCompare(b.model_type))
	}

	getSystemProviderModels(modelTypes: ModelType[]) {
		const models = []
		modelTypes?.forEach((modelType) => {
			const modelInstance = this.modelInstances.get(modelType)
			if (modelInstance) {
				models.push(...modelInstance.predefinedModels())
			}
		})
		return models
	}

	getChatModel(copilot: ICopilot) {
		return this.getModelInstance(ModelType.LLM)?.getChatModel(copilot)
	}
}
