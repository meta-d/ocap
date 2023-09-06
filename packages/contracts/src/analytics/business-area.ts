import { IBasePerTenantEntityModel } from "../base-entity.model";
import { ITag } from "../tag-entity.model";
import { IStory } from "./story";

export interface IBusinessArea extends IBasePerTenantEntityModel {
    type?: BusinessType
    name?: string
    parentId?: string
    level?: number
    tags?: ITag[]
    stories?: Array<IStory>

    children?: Array<IBusinessArea>
}

export enum BusinessType {
    SEMANTIC_MODEL = 'SEMANTIC_MODEL',
    STORY = 'STORY',
    INDICATOR = 'INDICATOR'
}