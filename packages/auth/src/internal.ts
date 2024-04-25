import { FeishuController, FeishuStrategy } from './feishu';
import { Auth0Strategy, Auth0Controller } from './auth0';
import { FacebookStrategy, FacebookController } from './facebook';
import { GithubStrategy, GithubController } from './github';
import { GoogleStrategy, GoogleController } from './google';
import { DingtalkController, DingtalkStrategy } from './dingtalk';

export const Strategies = [
	Auth0Strategy,
	FacebookStrategy,
	GithubStrategy,
	GoogleStrategy,
	FeishuStrategy,
	DingtalkStrategy
];

export const Controllers = [
	Auth0Controller,
	FacebookController,
	GithubController,
	GoogleController,
	FeishuController,
	DingtalkController
];

export const AuthGuards = [];
