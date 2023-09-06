import { Inject } from '@nestjs/common';

export const prefixesForLoggers: string[] = new Array<string>();

export function LoggerDecorator(prefix = '') {
	if (!prefixesForLoggers.includes(prefix)) {
		prefixesForLoggers.push(prefix);
	}
	return Inject(`LoggerService${prefix}`);
}
