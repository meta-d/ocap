import { SecretTokenCreateHandler } from "./secret-token.create.handler";
import { SecretTokenGetHandler } from "./secret-token.get.handler";

export const CommandHandlers = [
	SecretTokenCreateHandler,
	SecretTokenGetHandler
];
