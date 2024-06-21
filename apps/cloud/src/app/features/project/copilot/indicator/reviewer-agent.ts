import { Route } from '../../../../@core/copilot'

export async function createReviewerWorker({ llm, copilotRoleContext, tools }) {
  const systemPrompt =
    `You are a business expert in BI indicator system management. Review the MDX formula for the indicator.` +
    `\n{role}\n` +
    `\n{context}`
  return await Route.createWorkerAgent(llm, tools, systemPrompt, {
    role: copilotRoleContext
  })
}
