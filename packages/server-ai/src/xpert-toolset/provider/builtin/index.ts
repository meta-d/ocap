import { Type } from "@nestjs/common";
import { IXpertToolset } from "@metad/contracts";
import { ToolProviderNotFoundError } from "../../errors";
import { BingToolset } from "./bing/bing";
import { DuckDuckGoToolset } from "./duckduckgo/duckduckgo";
import { TavilyToolset } from "./tavily/tavily";
import { BuiltinToolset } from "./builtin-toolset";

export const ToolProviders = [
    DuckDuckGoToolset,
    TavilyToolset,
    BingToolset
]

export function createBuiltinToolset(provider: string, toolset?: IXpertToolset) {
    const providerTypeClass = ToolProviders.find((t) => t.provider === provider)
    if (providerTypeClass) {
        return new providerTypeClass(toolset)
    }
    throw new ToolProviderNotFoundError(`Builtin tool provider '${provider}' not found!`)
}