import * as OAuth2Strategy from 'passport-oauth2'
import { oauth2tokenCallback } from 'oauth'
import * as Axios from 'axios'
import * as util from 'util'

const axios = Axios.default

/**
 * `Strategy` constructor.
 *
 * Feishu's OAuth strategy. Please refer to:
 *   Chinese: https://open.feishu.cn/document/ukTMukTMukTM/ukzN4UjL5cDO14SO3gTN
 *   English: https://open.feishu.cn/document/uQTO24CN5YjL0kjN/uEzN44SM3gjLxcDO
 *
 * Options:
 *   - `clientID`      your Feishu application's app id
 *   - `clientSecret`  your Feishu application's app secret
 *   - `callbackURL`   URL to which Feishu will redirect the user after granting authorization
 *   - `appType`       application type, 'public'(default) or 'internal'
 *   - `appTicket`     application ticket, required if `appType` is 'public'
 *
 * Examples:
 *
 *     passport.use(new FeishuStrategy({
 *         clientID: '123-456-789',
 *         clientSecret: 'shhh-its-a-secret',
 *         callbackURL: 'https://www.example.net/auth/feishu/callback',
 *         appType: 'public',
 *         appTicket: 'an-app-ticket'
 *       },
 *       function(accessToken, refreshToken, profile, cb) {
 *         cb(null, profile);
 *       }
 *     ));
 *
 * @constructor
 * @param {object} options
 * @param {function} verify
 * @access public
 */

export class Strategy extends OAuth2Strategy.Strategy {
  name = 'feishu'
  options
  _appTokenURL
  _appType
  _userProfileURL
  _appTicket
  constructor(options, verify) {
    super(options, verify)
    this.options.authorizationURL = options.authorizationURL || 'https://open.feishu.cn/open-apis/authen/v1/index';
    this.options.tokenURL = options.tokenURL || 'https://open.feishu.cn/open-apis/authen/v1/access_token';
    this.options.appType = options.appType || 'public';
    if (options.appType === 'public' && !options.appTicket) {
      throw new TypeError('A public Feishu app requires a `appTicket` option');
    }

    this._appTokenURL = options.appTokenURL || (
      options.appType === 'public' ?
      'https://open.feishu.cn/open-apis/auth/v3/app_access_token/' :
      'https://open.feishu.cn/open-apis/auth/v3/app_access_token/internal'
    );
    this._appType = options.appType;
    this._userProfileURL = options.userProfileURL || 'https://open.feishu.cn/open-apis/authen/v1/user_info';
    if (options.appType === 'public') {
      this._appTicket = options.appTicket;
    }

    // Override OAuth2's `getOAuthAccessToken` in accordance to Feishu's OAuth protocol
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    // const self = this;
    // this._oauth2.getOAuthAccessToken = (
    //   code: string,
    //   params: any,
    //   callback: oauth2tokenCallback
    // ): void => {

    // }
    
    // (code, params, callback) => {
    //   self.getAppAccessToken()
    //   .then(token => {
    //     const data = {};
    //     data['app_access_token'] = token;
    //     data['grant_type'] = 'authorization_code';
    //     data['code'] = code;
    //     axios.post(self._oauth2._getAccessTokenUrl(), data)
    //     .then(results => {
    //       const {access_token, refresh_token} = results.data;
    //       delete results.data['refresh_token'];
    //       callback(null, access_token, refresh_token, results.data);
    //     })
    //     .catch(callback);
    //   })
    //   .catch(callback);
    // } // end of `this._oauth2.getOAuthAccessToken`
  }

  authorizationParams = function(options) {
    const params = {};
  
    // Feishu's authorization query string uses `app_id` instead of `clien_id`
    params['app_id'] = this._oauth2._clientId;
  
    return params;
  }

  getAppAccessToken = function() {
    const data = {};
    data['app_id'] = this._oauth2._clientId;
    data['app_secret'] = this._oauth2._clientSecret;
    if (this._appType === 'public') {
      data['app_ticket'] = this._appTicket;
    }
  
    return new Promise((resolve, reject) => {
      axios.post(this._appTokenURL, data)
        .then(results => {
          resolve(results['app_access_token'])
          return ''
        })
        .catch(reject)
    });
  };

  userProfile = function(accessToken, done) {
    axios.get(this._userProfileURL, {
      headers: {'Authorization': `Bearer ${accessToken}`},
    })
    .then(results => {
      const profile = parse(results.data);
      profile.provider = 'feishu';
      done(null, profile);
    })
    .catch(done)
  };
}

export function parse(json) {
  if ('string' == typeof json) {
    json = JSON.parse(json);
  }
  
  const profile = {} as any
  profile.id = json.user_id;
  profile.name = json.name;
  profile.avatar = {
    icon: json.avatar_url,
    thumb: json.avatar_thumb,
    middle: json.avatar_middle,
    big: json.avatar_big
  };

  if (json.email) {
    profile.email = json.email;
  }

  if (json.mobile) {
    profile.mobile = json.mobile;
  }

  return profile;
}