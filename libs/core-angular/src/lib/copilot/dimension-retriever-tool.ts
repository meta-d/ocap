import { InjectionToken, Signal, inject } from '@angular/core'
import { BaseRetriever } from '@langchain/core/retrievers'
import { createRetrieverTool } from 'langchain/tools/retriever'

export abstract class BaseDimensionMemberRetriever extends BaseRetriever {
  model: Signal<string>
  cube: Signal<string>
}

export const MEMBER_RETRIEVER_TOKEN = new InjectionToken<BaseDimensionMemberRetriever>('DimensionMemberRetriever')
export const MEMBER_RETRIEVER_TOOL_NAME = 'dimensionMemberKeySearch'

export function createDimensionMemberRetrieverTool(
  retriever: BaseDimensionMemberRetriever,
  model: Signal<string>,
  cube: Signal<string>
) {
  retriever.model = model
  retriever.cube = cube
  return createRetrieverTool(retriever, {
    name: MEMBER_RETRIEVER_TOOL_NAME,
    description:
      'Search for dimension member key information about filter conditions. For any needs about filtering data, you must use this tool!'
  })
}

export function injectDimensionMemberRetrieverTool(model: Signal<string>, cube: Signal<string>) {
  const memberRetriever = inject(MEMBER_RETRIEVER_TOKEN)
  return createDimensionMemberRetrieverTool(memberRetriever, model, cube)
}

export const PROMPT_RETRIEVE_DIMENSION_MEMBER = `Analyze user input to determine whether the sentence involves dimension members. If it involves dimension members, the "${MEMBER_RETRIEVER_TOOL_NAME}" tool needs to be called to retrieve information about the dimension members. Otherwise, proceed to the next step directly.`