import { ToolsetGetToolsHandler } from "./get-tools.handler";
import { ParserODataSchemaHandler } from "./parser-odata-schema.handler";
import { ParserOpenAPISchemaHandler } from "./parser-openapi-schema.handler";

export const CommandHandlers = [ToolsetGetToolsHandler, ParserOpenAPISchemaHandler, ParserODataSchemaHandler]
