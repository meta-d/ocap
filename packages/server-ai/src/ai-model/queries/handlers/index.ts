import { AIModelGetIconHandler } from "./get-model-icon.handler";
import { AIModelGetOneHandler } from "./get-one.handler";
import { ListModelProvidersHandler } from "./list-providers.handler";

export const QueryHandlers = [
	AIModelGetOneHandler,
	AIModelGetIconHandler,
	ListModelProvidersHandler
];
