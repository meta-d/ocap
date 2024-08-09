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
    parameter: variable.name
  },
  members: [
    {
      key: variable.defaultValueKey,
      caption: variable.defaultValueCaption
    }
  ]
}.`