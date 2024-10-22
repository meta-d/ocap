import { CallbackManagerForToolRun } from '@langchain/core/callbacks/manager'
import { RunnableConfig } from '@langchain/core/runnables'
import { ToolParams } from '@langchain/core/tools'
import { ApiProviderAuthType, ApiToolBundle, IXpertTool, ToolProviderType } from '@metad/contracts'
import axios, { AxiosResponse } from 'axios'
import { ToolParameterValidationError, ToolProviderCredentialValidationError } from '../../errors'
import { BaseTool, IBaseTool } from '../../toolset'
import { ApiBasedToolSchemaParser } from '../../utils/parser'
import { zodToJsonSchema } from "zod-to-json-schema";

const API_TOOL_DEFAULT_TIMEOUT = [
	parseInt(process.env.API_TOOL_DEFAULT_CONNECT_TIMEOUT || '10'),
	parseInt(process.env.API_TOOL_DEFAULT_READ_TIMEOUT || '60')
]

export class OpenAPITool extends BaseTool {
	protected api_bundle: ApiToolBundle
	constructor(
		protected xpertTool: IXpertTool,
		protected base?: IBaseTool,
		fields?: ToolParams
	) {
		super(base, fields)

        this.name = xpertTool.name
        this.description = xpertTool.description
		this.api_bundle = xpertTool.options?.api_bundle
		if (xpertTool.schema) {
			this.schema = ApiBasedToolSchemaParser.parseParametersToZod(xpertTool.schema.parameters) as unknown as typeof this.schema
		}
	}

	// /**
	//  * Api tool
	//  */
	// fork_tool_runtime(runtime: Record<string, any>): Tool {
	//     return new (this.constructor as any)({
	//         identity: this.identity ? { ...this.identity } : undefined,
	//         parameters: this.parameters ? [...this.parameters] : undefined,
	//         description: this.description ? { ...this.description } : undefined,
	//         api_bundle: this.api_bundle ? { ...this.api_bundle } : undefined,
	//         runtime: new Tool.Runtime(runtime),
	//     });
	// }

	async validate_credentials(credentials: Record<string, any>, parameters: Record<string, any>, format_only = false) {
		const headers = this.assembling_request(parameters, credentials)

		if (format_only) {
			return ''
		}

		const response = await this.do_http_request(
			this.api_bundle.server_url,
			this.api_bundle.method,
			headers,
			parameters
		)
		return this.validate_and_parse_response(response)
	}

	tool_provider_type(): ToolProviderType {
		return ToolProviderType.API
	}

	assembling_request(parameters: Record<string, any>, _credentials?): Record<string, any> {
		const headers: Record<string, any> = {}
		const credentials = _credentials || this.runtime?.credentials || {}

		if (!credentials.auth_type) {
			throw new ToolProviderCredentialValidationError('Missing auth_type')
		}

		if (credentials.auth_type === ApiProviderAuthType.API_KEY) {
			let api_key_header = ApiProviderAuthType.API_KEY

			if (credentials.api_key_header) {
				api_key_header = credentials.api_key_header
			}

			if (!credentials.api_key_value) {
				throw new ToolProviderCredentialValidationError('Missing api_key_value')
			} else if (typeof credentials.api_key_value !== 'string') {
				throw new ToolProviderCredentialValidationError('api_key_value must be a string')
			}

			if (credentials.api_key_header_prefix) {
				const api_key_header_prefix = credentials.api_key_header_prefix
				if (api_key_header_prefix === 'basic' && credentials.api_key_value) {
					credentials.api_key_value = `Basic ${credentials.api_key_value}`
				} else if (api_key_header_prefix === 'bearer' && credentials.api_key_value) {
					credentials.api_key_value = `Bearer ${credentials.api_key_value}`
				} else if (api_key_header_prefix === 'custom') {
					// Do nothing
				}
			}

			headers[api_key_header] = credentials.api_key_value
		}

		const needed_parameters = this.api_bundle.parameters.filter((parameter) => parameter.required)
		for (const parameter of needed_parameters) {
			if (parameter.required && !(parameter.name in parameters)) {
				throw new ToolParameterValidationError(`Missing required parameter ${parameter.name}`)
			}

			if (parameter.default !== undefined && !(parameter.name in parameters)) {
				parameters[parameter.name] = parameter.default
			}
		}

		return headers
	}

	validate_and_parse_response(response: AxiosResponse): string {
		/**
		 * validate the response
		 */
		if (response instanceof Object) {
			if (response.status >= 400) {
				throw new Error(`Request failed with status code ${response.status} and ${response.statusText}`)
			}
			if (!response.data) {
				return 'Empty response from the tool, please check your parameters and try again.'
			}
			try {
				const responseData = response.data
				try {
					return JSON.stringify(responseData)
				} catch (e) {
					return JSON.stringify(responseData)
				}
			} catch (e) {
				return response.data
			}
		} else {
			throw new Error(`Invalid response type ${typeof response}`)
		}
	}

	static get_parameter_value(parameter: any, parameters: Record<string, any>): any {
		if (parameter.name in parameters) {
			return parameters[parameter.name]
		} else if (parameter.required) {
			throw new ToolParameterValidationError(`Missing required parameter ${parameter.name}`)
		} else {
			return (parameter.schema || {}).default || ''
		}
	}

	async do_http_request(
		url: string,
		method: string,
		headers: Record<string, any>,
		parameters: Record<string, any>
	): Promise<AxiosResponse> {
		method = method.toLowerCase()

		const params: Record<string, any> = {}
		const pathParams: Record<string, any> = {}
		let body: any = {}
		const cookies: Record<string, any> = {}

		for (const parameter of this.api_bundle.openapi.parameters || []) {
			const value = OpenAPITool.get_parameter_value(parameter, parameters)
			if (parameter.in === 'path') {
				pathParams[parameter.name] = value
			} else if (parameter.in === 'query') {
				if (value !== '') {
					params[parameter.name] = value
				}
			} else if (parameter.in === 'cookie') {
				cookies[parameter.name] = value
			} else if (parameter.in === 'header') {
				headers[parameter.name] = value
			}
		}

		if (this.api_bundle.openapi.requestBody) {
			const requestBody = this.api_bundle.openapi.requestBody
			if (requestBody.content) {
				for (const contentType in requestBody.content) {
					headers['Content-Type'] = contentType
					const bodySchema = requestBody.content[contentType].schema
					const required = bodySchema.required || []
					const properties = bodySchema.properties || {}
					for (const name in properties) {
						if (name in parameters) {
							body[name] = this._convert_body_property_type(properties[name], parameters[name])
						} else if (required.includes(name)) {
							throw new ToolParameterValidationError(
								`Missing required parameter ${name} in operation ${this.api_bundle.operation_id}`
							)
						} else if ('default' in properties[name]) {
							body[name] = properties[name].default
						} else {
							body[name] = null
						}
					}
					break
				}
			}
		}

		for (const name in pathParams) {
			url = url.replace(`{${name}}`, `${pathParams[name]}`)
		}

		if (headers['Content-Type']) {
			if (headers['Content-Type'] === 'application/json') {
				body = JSON.stringify(body)
			} else if (headers['Content-Type'] === 'application/x-www-form-urlencoded') {
				body = new URLSearchParams(body).toString()
			}
		}

		if (['get', 'head', 'post', 'put', 'delete', 'patch'].includes(method)) {
			try {
				const response = await axios({
					method: method as any, // Type assertion to satisfy TypeScript
					url: url,
					params: params,
					headers: headers,
					data: body,
					withCredentials: true, // To include cookies in the request
					timeout: 60000, // Example timeout, adjust as needed
					maxRedirects: 5 // Example follow redirects, adjust as needed
				})
				return response
			} catch (error) {
				throw new Error(`HTTP request failed: ${error}`)
			}
		} else {
			throw new Error(`Invalid HTTP method ${method}`)
		}
	}

	_convert_body_property_any_of(
		property: Record<string, any>,
		value: any,
		anyOf: Array<Record<string, any>>,
		maxRecursive = 10
	): any {
		if (maxRecursive <= 0) {
			throw new Error('Max recursion depth reached')
		}
		for (const option of anyOf || []) {
			try {
				if ('type' in option) {
					if (option.type === 'integer' || option.type === 'int') {
						return parseInt(value)
					} else if (option.type === 'number') {
						return value.includes('.') ? parseFloat(value) : parseInt(value)
					} else if (option.type === 'string') {
						return String(value)
					} else if (option.type === 'boolean') {
						if (String(value).toLowerCase() === 'true' || value === '1') {
							return true
						} else if (String(value).toLowerCase() === 'false' || value === '0') {
							return false
						}
					} else if (option.type === 'null' && !value) {
						return null
					}
				} else if ('anyOf' in option && Array.isArray(option.anyOf)) {
					return this._convert_body_property_any_of(property, value, option.anyOf, maxRecursive - 1)
				}
			} catch (e) {
				continue
			}
		}
		return value
	}

	_convert_body_property_type(property: Record<string, any>, value: any): any {
		try {
			if ('type' in property) {
				switch (property['type']) {
					case 'integer':
					case 'int':
						return parseInt(value, 10)
					case 'number':
						return value.toString().includes('.') ? parseFloat(value) : parseInt(value, 10)
					case 'string':
						return String(value)
					case 'boolean':
						return Boolean(value)
					case 'null':
						return value === null ? null : value
					case 'object':
					case 'array':
						if (typeof value === 'string') {
							try {
								// an array str like '[1,2]' also can convert to list [1,2] through JSON.parse
								// JSON does not support single quotes, but we can support it
								value = value.replace(/'/g, '"')
								return JSON.parse(value)
							} catch (error) {
								return value
							}
						} else if (typeof value === 'object') {
							return value
						} else {
							return value
						}
					default:
						throw new Error(`Invalid type ${property['type']} for property ${property}`)
				}
			} else if ('anyOf' in property && Array.isArray(property['anyOf'])) {
				return this._convert_body_property_any_of(property, value, property['anyOf'])
			}
		} catch (error) {
			return value
		}
	}

	protected async _call(
		toolParameters: any,
		runManager?: CallbackManagerForToolRun,
		parentConfig?: RunnableConfig
	): Promise<any> {
		/**
		 * invoke http request
		 */
		// assemble request
		const headers = this.assembling_request(toolParameters)

		// do http request
		const response = await this.do_http_request(
			this.api_bundle.server_url,
			this.api_bundle.method,
			headers,
			toolParameters
		)

		// validate response
		const validatedResponse = this.validate_and_parse_response(response)

		// assemble invoke message
		return validatedResponse
	}
}
