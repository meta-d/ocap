import { ToolProviderCredentialValidationError } from "../../../errors";
import { BuiltinToolset } from "../builtin-toolset";

export class BingToolset extends BuiltinToolset {
    static provider = 'bing'

    private _validateCredentials(credentials: Record<string, any>): void {
       
    }
}
