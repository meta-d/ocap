import { MEMBER_RETRIEVER_TOOL_NAME } from './constants'

export function makeCubeRulesPrompt() {
    return `The dimensions consist of three attributes: dimension, hierarchy, and level, each of which is taken from the name of dimension, hierarchy, and level in the cube, respectively.
Dimension name pattern: [Dimension Name];
Hierarchy name pattern: [Hierarchy Name];
Level name pattern: [Hierarchy Name].[Level Name];
Member key pattern: [MemberKey] (do not includes [Hierarchy Name] and [Level Name] in member key field).
`
}

export function createAgentStepsInstructions(...steps: string[]) {
    return `Use the following step-by-step instructions to respond to user inputs.

${steps.map((step, index) => `Step ${index + 1} - ${step};`).join('\n')}
`
}

export const CubeVariablePrompt = `If the cube has variables then all variables is required are added to the 'variables' parameter of tool, where each variable has the format:
{
  dimension: {
    dimension: variable.referenceDimension,
    hierarchy: variable.referenceHierarchy,
    parameter: name of variable
  },
  members: [
    {
      key: variable.defaultValueKey,
      caption: variable.defaultValueCaption
    }
  ]
}.`

export const PROMPT_RETRIEVE_DIMENSION_MEMBER = `Analyze user input to determine whether the sentence involves dimension members.` +
  ` If it involves dimension members, the "${MEMBER_RETRIEVER_TOOL_NAME}" tool needs to be called to retrieve information about the dimension members.` +
  ` Otherwise, proceed to the next step directly.`
