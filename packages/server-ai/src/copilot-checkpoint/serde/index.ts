export * from './jsonplus'

export function toUint8Array(value: object | string) {
	if (typeof value === 'object' && value['type'] === 'Buffer') {
		return new Uint8Array(value['data'])
	}

	return new TextEncoder().encode(value as string)
}
