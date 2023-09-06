import { deepMerge, IPluginConfig } from '@metad/server-common';
import { defaultConfiguration } from './default-configuration';

let defaultConfig: IPluginConfig = defaultConfiguration;

export function setConfig(config: any): void {
	defaultConfig = deepMerge(defaultConfig, config);
}

export function getConfig(): Readonly<IPluginConfig> {
	return defaultConfig;
}
