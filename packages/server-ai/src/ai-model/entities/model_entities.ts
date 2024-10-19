import { I18nObject, ProviderModel } from "@metad/contracts";

export function valueOf<T>(enumObj: T, value: string): T[keyof T] {
    const enumValues = Object.values(enumObj);
    if (enumValues.includes(value as T[keyof T])) {
        return value as T[keyof T];
    }
    throw new Error(`Invalid enum value: ${value}`);
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
