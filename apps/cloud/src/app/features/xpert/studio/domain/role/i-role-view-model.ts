import { IPoint } from '@foblex/2d';
import { IRoleStorageModel } from './i-role-storage-model';

export interface IRoleViewModel extends IRoleStorageModel {
    position?: IPoint
}
