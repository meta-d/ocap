import { ModelType } from "@metad/contracts";

export function valueOf<T>(enumObj: T, value: string): T[keyof T] {
    const enumValues = Object.values(enumObj);
    if (enumValues.includes(value as T[keyof T])) {
        return value as T[keyof T];
    }
    throw new Error(`Invalid enum value: ${value}`);
}

export enum FetchFrom {
    PREDEFINED_MODEL = "predefined-model",
    CUSTOMIZABLE_MODEL = "customizable-model"
}

export enum ModelFeature {
    TOOL_CALL = "tool-call",
    MULTI_TOOL_CALL = "multi-tool-call",
    AGENT_THOUGHT = "agent-thought",
    VISION = "vision",
    STREAM_TOOL_CALL = "stream-tool-call"
}

export enum DefaultParameterName {
    TEMPERATURE = "temperature",
    TOP_P = "top_p",
    TOP_K = "top_k",
    PRESENCE_PENALTY = "presence_penalty",
    FREQUENCY_PENALTY = "frequency_penalty",
    MAX_TOKENS = "max_tokens",
    RESPONSE_FORMAT = "response_format",
    JSON_SCHEMA = "json_schema"
}

export enum ParameterType {
    FLOAT = "float",
    INT = "int",
    STRING = "string",
    BOOLEAN = "boolean",
    TEXT = "text"
}

export enum ModelPropertyKey {
    MODE = "mode",
    CONTEXT_SIZE = "context_size",
    MAX_CHUNKS = "max_chunks",
    FILE_UPLOAD_LIMIT = "file_upload_limit",
    SUPPORTED_FILE_EXTENSIONS = "supported_file_extensions",
    MAX_CHARACTERS_PER_CHUNK = "max_characters_per_chunk",
    DEFAULT_VOICE = "default_voice",
    VOICES = "voices",
    WORD_LIMIT = "word_limit",
    AUDIO_TYPE = "audio_type",
    MAX_WORKERS = "max_workers"
}

export interface ProviderModel {
    model: string;
    label: I18nObject;
    model_type: ModelType;
    features?: ModelFeature[];
    fetchFrom: FetchFrom;
    modelProperties: Record<ModelPropertyKey, any>;
    deprecated?: boolean;
    modelConfig?: any;
}

export interface ParameterRule {
    name?: string;
    useTemplate?: string;
    label: I18nObject;
    type: ParameterType;
    help?: I18nObject;
    required?: boolean;
    default?: any;
    min?: number;
    max?: number;
    precision?: number;
    options?: string[];
}

export interface PriceConfig {
    input: number;
    output?: number;
    unit: number;
    currency: string;
}

export interface AIModelEntity extends ProviderModel {
    parameterRules?: ParameterRule[];
    pricing?: PriceConfig;
}

export interface ModelUsage {
    // 这里可以根据需要添加具体的属性
  token?: number;
}

export enum PriceType {
    INPUT = "input",
    OUTPUT = "output"
}

export interface PriceInfo {
    unitPrice: number;
    unit: number;
    totalAmount: number;
    currency: string;
}

export interface I18nObject {
    en_US: string;
    zh_Hans?: string;
}