import { ChatOpenAI } from '@langchain/openai'
import { CubeModelerName } from '../cube/graph'
import { DimensionModelerName } from '../dimension/graph'
import { createTeamSupervisor } from '../langgraph-helper-utilities'


export async function createSupervisor(llm: ChatOpenAI) {
  const supervisorNode = await createTeamSupervisor(
    llm,
    'You are a supervisor tasked with managing a conversation between the' +
      ' following teams: {team_members}. Given the following user request,' +
      ' respond with the worker to act next. Each worker will perform a' +
      ' task and respond with their results and status. When finished,' +
      ' respond with FINISH.\n\n' +
      ' Select strategically to minimize the number of steps taken.',
    [DimensionModelerName, CubeModelerName]
  )

  return supervisorNode
}
