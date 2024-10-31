import { ToolProviderCredentialValidationError } from "../../../errors";
import { BuiltinToolset } from "../builtin-toolset";

export class TavilyToolset extends BuiltinToolset {
    static provider = 'tavily'

    private _validateCredentials(credentials: Record<string, any>): void {
        // try {
        //     new TavilySearchTool().forkToolRuntime({
        //         runtime: {
        //             credentials: credentials,
        //         }
        //     }).invoke({
        //         user_id: "",
        //         tool_parameters: {
        //             query: "Sachin Tendulkar",
        //             search_depth: "basic",
        //             include_answer: true,
        //             include_images: false,
        //             include_raw_content: false,
        //             max_results: 5,
        //             include_domains: "",
        //             exclude_domains: "",
        //         },
        //     });
        // } catch (e) {
        //     throw new ToolProviderCredentialValidationError(String(e));
        // }
    }
}
