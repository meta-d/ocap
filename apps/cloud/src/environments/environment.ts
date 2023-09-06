// This file can be replaced during build by using the `fileReplacements` array.
// `ng build` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

let API_BASE_URL = 'http://localhost:3000'

export const environment = {
	production: false,
	DEMO: false,
	API_BASE_URL: '',
	IS_ELECTRON: false,

	GOOGLE_AUTH_LINK: API_BASE_URL + '/api/auth/google',
	FACEBOOK_AUTH_LINK: API_BASE_URL + '/api/auth/facebook',
	LINKEDIN_AUTH_LINK: API_BASE_URL + '/api/auth/linkedin',
	GITHUB_AUTH_LINK: API_BASE_URL + '/api/auth/github',
	TWITTER_AUTH_LINK: API_BASE_URL + '/api/auth/twitter',
	MICROSOFT_AUTH_LINK: API_BASE_URL + '/api/auth/microsoft',
	AUTH0_AUTH_LINK: API_BASE_URL + '/api/auth/auth0'
}

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/plugins/zone-error';  // Included with Angular CLI.
