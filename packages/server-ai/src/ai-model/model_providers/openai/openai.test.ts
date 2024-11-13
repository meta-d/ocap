import { Test, TestingModule } from '@nestjs/testing';
import { OpenAIProvider, OpenAIProviderModule } from './openai';
import { CredentialsValidateFailedError } from '../errors';
import { AIModel } from '../../ai-model';
import { OpenAILargeLanguageModel } from './llm/llm';
import { ModelProvider } from '../../ai-provider';
import { ModelType } from '../../entities';

describe('OpenAIProvider', () => {
  let provider: OpenAIProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [OpenAIProviderModule],
      providers: [],
    }).compile();

    provider = module.get<OpenAIProvider>(ModelProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should get OpenAILargeLanguageModel instance', async () => {
    const modelInstance = await provider.getModelManager(ModelType.LLM);
    expect(modelInstance).toBeInstanceOf(OpenAILargeLanguageModel);
  });

  it('should return predefined models', async () => {
    const mockPredefinedModels = [
      { model: 'model1', modelType: 'type1' },
      { model: 'model2', modelType: 'type2' }
    ];

    const modelInstance = await provider.getModelManager(ModelType.LLM);
    const models = modelInstance.predefinedModels()
    expect(models).toEqual(mockPredefinedModels);
  });

  describe('validateProviderCredentials', () => {
    it('should validate credentials successfully', async () => {
      const mockCredentials = { apiKey: 'valid-api-key' };
      const mockModelInstance = {
        validateCredentials: jest.fn().mockResolvedValue(true),
      } as unknown as AIModel;

      jest.spyOn(provider, 'getModelInstance').mockResolvedValue(mockModelInstance);

      await expect(provider.validateProviderCredentials(mockCredentials)).resolves.not.toThrow();
      expect(mockModelInstance.validateCredentials).toHaveBeenCalledWith('gpt-3.5-turbo', mockCredentials);
    });

    it('should throw CredentialsValidateFailedError on invalid credentials', async () => {
      const mockCredentials = { apiKey: 'invalid-api-key' };
      const mockModelInstance = {
        validateCredentials: jest.fn().mockRejectedValue(new CredentialsValidateFailedError(`mock error`)),
      } as unknown as AIModel;

      jest.spyOn(provider, 'getModelInstance').mockResolvedValue(mockModelInstance);

      await expect(provider.validateProviderCredentials(mockCredentials)).rejects.toThrow(CredentialsValidateFailedError);
    });

    it('should log and rethrow other errors', async () => {
      const mockCredentials = { apiKey: 'error-api-key' };
      const mockError = new Error('Unexpected error');
      const mockModelInstance = {
        validateCredentials: jest.fn().mockRejectedValue(mockError),
      } as unknown as AIModel;

      jest.spyOn(provider, 'getModelInstance').mockResolvedValue(mockModelInstance);
      const loggerSpy = jest.spyOn(provider['logger'], 'error').mockImplementation();

      await expect(provider.validateProviderCredentials(mockCredentials)).rejects.toThrow(mockError);
      expect(loggerSpy).toHaveBeenCalledWith(expect.stringContaining('凭证验证失败'), mockError.stack);
    });
  });
});