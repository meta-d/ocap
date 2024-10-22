import { ApiToolBundle } from '@metad/contracts'
import type { ParameterObject } from "openapi-typescript/src/types";
import { ApiBasedToolSchemaParser } from './parser'

describe('ApiBasedToolSchemaParser', () => {
	describe('parseOpenapiToToolBundle', () => {
		it('should parse openapi object to tool bundle', () => {
			const openapi = {
				info: { description: 'Test API' },
				servers: [{ url: 'http://localhost' }],
				paths: {
					'/test': {
						get: {
							operationId: 'getTest',
							parameters: [
								{
									name: 'param1',
									description: 'A parameter',
									required: true,
									schema: { type: 'string' }
								}
							],
							requestBody: {
								content: {
									'application/json': {
										schema: {
											type: 'object',
											properties: {
												bodyParam: { type: 'string', description: 'Body parameter' }
											}
										}
									}
								}
							}
						}
					}
				}
			}

			const result: ApiToolBundle[] = ApiBasedToolSchemaParser.parseOpenapiToToolBundle(openapi)
			expect(result).toHaveLength(1)
			expect(result[0].server_url).toBe('http://localhost/test')
			expect(result[0].method).toBe('get')
			expect(result[0].parameters).toHaveLength(2)
		})

		it('should throw an error if no servers are defined', () => {
			const openapi = {
				info: { description: 'Test API' },
				paths: {}
			}

			expect(() => {
				ApiBasedToolSchemaParser.parseOpenapiToToolBundle(openapi)
			}).toThrow('No server found in the openapi yaml.')
		})
	})

	describe('parseOpenapiYamlToToolBundle', () => {
		it('should parse openapi yaml string to tool bundle', () => {
			const yaml = `
        info:
          description: Test API
        servers:
          - url: http://localhost
        paths:
          /test:
            get:
              operationId: getTest
              parameters:
                - name: param1
                  description: A parameter
                  required: true
                  schema:
                    type: string
      `

			const result: ApiToolBundle[] = ApiBasedToolSchemaParser.parseOpenapiYamlToToolBundle(yaml)
			expect(result).toHaveLength(1)
			expect(result[0].server_url).toBe('http://localhost/test')
			expect(result[0].method).toBe('get')
		})

		it('should throw an error for invalid yaml', () => {
			const invalidYaml = `invalid: yaml`

			expect(() => {
				ApiBasedToolSchemaParser.parseOpenapiYamlToToolBundle(invalidYaml)
			}).toThrow('No server found in the openapi yaml.')
		})
	})

    it('should convert parameters to a Zod schema', () => {
        const parameters: ParameterObject[] = [
            {
                name: 'param1',
                in: 'query',
                required: true,
                schema: {
                    type: 'string',
                }
            },
            {
                name: 'param2',
                in: 'query',
                required: false,
                schema: {
                    type: 'integer',
                }
            }
        ];

        const zodSchema = ApiBasedToolSchemaParser.parseParametersToZod(parameters);
        const parsedData = zodSchema.parse({ param1: 'test', param3: 123 });

		// param2 可以不填，param3 被忽略
        expect(parsedData).toEqual({ param1: 'test' });
    });

    it('should throw an error for invalid parameter data', () => {
        const parameters: ParameterObject[] = [
            {
                name: 'param1',
                in: 'query',
                required: true,
                schema: {
                    type: 'string'
                }
            }
        ];

        const zodSchema = ApiBasedToolSchemaParser.parseParametersToZod(parameters);

        expect(() => {
            zodSchema.parse({ param1: 123 });
        }).toThrow();
    });
})
