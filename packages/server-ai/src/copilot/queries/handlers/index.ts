import { FindCopilotModelsHandler } from "./copilot-model-find.handler";
import { CopilotGetOneHandler } from "./get-one.handler";
import { ModelParameterRulesHandler } from "./model-parameter-rules.handler";

export const QueryHandlers = [
	FindCopilotModelsHandler,
	CopilotGetOneHandler,
	ModelParameterRulesHandler
];
