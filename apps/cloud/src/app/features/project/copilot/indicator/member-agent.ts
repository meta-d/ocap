import { Route } from '../../../../@core/copilot'

export async function createMemberWorker({ llm, memberRetrieverTool, copilotRoleContext }) {
  const systemPrompt =
    `You are a business expert in BI indicator system management.` +
    
    `\n{role}\n` +
    `\n2. Specify a hierarchy name (not the level name) of calendar dimension for this indicator to be used for future calculations of the indicator's trends at different time granularity. If no calendar semantic dimension is found in cube, this question needs to be answered.` +
    `\n3. 将未限定成员的可以自由选择的维度都加入到 dimensions 中，将必要的限定成员加入到 filters 属性中。` +
    `\n 如果未提供 Cube 信息或者需要重新选择 Cube 时请调用 'pickCube' tool 获取 Cube 信息。` +
    `\n{context}`
  return await Route.createWorkerAgent(llm, [memberRetrieverTool], systemPrompt, {
    role: copilotRoleContext
  })
}
