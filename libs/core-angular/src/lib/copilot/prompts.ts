export function createAgentStepsInstructions(...steps: string[]) {
    return `Use the following step-by-step instructions to respond to user inputs.

${steps.map((step, index) => `Step ${index + 1} - ${step};`).join('\n')}
`
}
