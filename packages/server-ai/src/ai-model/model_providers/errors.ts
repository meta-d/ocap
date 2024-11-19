import { HttpException, HttpStatus, ForbiddenException } from '@nestjs/common'

export class ModelRuntimeError extends HttpException {
	constructor(message: string) {
		super(message, HttpStatus.INTERNAL_SERVER_ERROR)
		this.name = 'ModelRuntimeError'
	}
}

export class ProviderTokenNotInitError extends ModelRuntimeError {
	constructor(message: string) {
		super(message)
		this.name = 'ProviderTokenNotInitError'
	}
}

export class InvokeError extends ModelRuntimeError {
	constructor(message: string) {
		super(message)
		this.name = 'InvokeError'
	}
}

export class InvokeAuthorizationError extends InvokeError {
	constructor(message: string) {
		super(message)
		this.name = 'InvokeAuthorizationError'
	}
}

export class ProviderNotInitError extends ModelRuntimeError {
	constructor(message: string) {
		super(message)
		this.name = 'ProviderNotInitError'
	}
}

export class QuotaExceededError extends ModelRuntimeError {
	constructor(message: string) {
		super(message)
		this.name = 'QuotaExceededError'
	}
}

export class ModelCurrentlyNotSupportError extends ModelRuntimeError {
	constructor(message: string) {
		super(message)
		this.name = 'ModelCurrentlyNotSupportError'
	}
}

export class CredentialsValidateFailedError extends ForbiddenException {
}
