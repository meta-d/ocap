import { IXpertToolset } from "@metad/contracts";
import { ToolProviderNotFoundError } from "../../errors";
import { BingToolset } from "./bing/bing";
import { DuckDuckGoToolset } from "./duckduckgo/duckduckgo";
import { TavilyToolset } from "./tavily/tavily";
import { ChatDBToolset } from "./chatdb/chatdb";
import { TBuiltinToolsetParams } from "./builtin-toolset";

export const ToolProviders = [
    DuckDuckGoToolset,
    TavilyToolset,
    BingToolset,
    ChatDBToolset
]

export function createBuiltinToolset(provider: string, toolset?: IXpertToolset, params?: TBuiltinToolsetParams) {
    const providerTypeClass = ToolProviders.find((t) => t.provider === provider)
    if (providerTypeClass) {
        return new providerTypeClass(toolset, params)
    }
    throw new ToolProviderNotFoundError(`Builtin tool provider '${provider}' not found!`)
}