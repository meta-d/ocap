import { ZodType, ZodTypeDef } from 'zod'
import zodToJsonSchema from 'zod-to-json-schema'
import { nanoid as _nanoid } from 'nanoid'

export function zodToAnnotations(obj: ZodType<any, ZodTypeDef, any>) {
  return (<{ properties: any }>zodToJsonSchema(obj)).properties
}

export function nanoid() {
  return _nanoid()
}