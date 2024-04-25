'use strict';

const isConsole = false; // Set to true to use console exporter only (for debugging)
const isAuto = true; // Set to true to use auto-instrumentations



export default {
	start: () => {
		if (process.env.OTEL_ENABLED === 'true') {
			
		}
	},
	shutdown: async () => {
		if (process.env.OTEL_ENABLED === 'true') {
			
		}
	}
};
