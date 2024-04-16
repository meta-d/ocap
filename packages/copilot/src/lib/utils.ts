import { ZodType, ZodTypeDef } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'

export function zodToAnnotations(obj: ZodType<any, ZodTypeDef, any>) {
  return (<{ properties: any }>zodToJsonSchema(obj)).properties
}
