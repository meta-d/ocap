export class ModelRuntimeError extends Error {
	constructor(message: string) {
		super(message)
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

export class CredentialsValidateFailedError extends ModelRuntimeError {
	constructor(message: string) {
		super(message)
		this.name = 'CredentialsValidateFailedError'
	}
}
