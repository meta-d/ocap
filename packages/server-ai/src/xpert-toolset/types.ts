import { I18nObject, ToolLabelEnum, ToolProviderCredentials } from '@metad/contracts'

export interface IToolRuntime {
	/**
	 * Meta data of a tool call processing
	 */
	tenantId?: string
	toolId?: string
	invokeFrom?: InvokeFrom
	toolInvokeFrom?: ToolInvokeFrom
	credentials?: Record<string, any>
	runtimeParameters?: Record<string, any>
}

export enum InvokeFrom {
	/**
	 * Invoke From.
	 */
	SERVICE_API = 'service-api',
	WEB_APP = 'web-app',
	EXPLORE = 'explore',
	DEBUGGER = 'debugger'
}

export enum ToolInvokeFrom {
	/**
	 * Enum class for tool invoke
	 */
	WORKFLOW = 'workflow',
	AGENT = 'agent'
}

export interface ToolIdentity {
	author: string // The author of the tool
	name: string // The name of the tool
	label: I18nObject // The label of the tool
	provider: string // The provider of the tool
	icon?: string // The icon of the tool (optional)
}

export interface ToolDescription {
	human: I18nObject // The description presented to the user
	llm: string // The description presented to the LLM
}

export enum ToolParameterType {
	STRING = 'string',
	NUMBER = 'number',
	BOOLEAN = 'boolean',
	SELECT = 'select',
	SECRET_INPUT = 'secret-input',
	FILE = 'file'
}

export enum ToolParameterForm {
	SCHEMA = 'schema', // should be set while adding tool
	FORM = 'form', // should be set before invoking tool
	LLM = 'llm' // will be set by LLM
}

export interface ToolProviderIdentity {
    author: string;
    name: string;
    description: I18nObject;
    icon: string;
    label: I18nObject;
    tags: ToolLabelEnum[];
}

export type TBaseToolsetOptions = {
    identity?: ToolProviderIdentity;
    credentialsSchema?: { [key: string]: ToolProviderCredentials };
}