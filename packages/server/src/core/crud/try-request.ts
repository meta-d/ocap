export interface ITryRequest<T = any> {
	success: boolean;
	record?: T;
	error?: any;
}
