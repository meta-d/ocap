import { IBusinessArea, ITag } from "../../../@core";

export function markdownBusinessAreas(areas: IBusinessArea[]) {
    return `Business areas:\n` +
        areas.map((area) => `  - id: ${area.id}\n    name: ${area.name}`).join('\n')
}

export function markdownTags(tags: ITag[]) {
    return `Tags:\n` +
        tags.map((tag) => `  - id: ${tag.id}\n    name: ${tag.name}`).join('\n')
}