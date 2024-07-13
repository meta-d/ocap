import { StateGraphArgs } from '@langchain/langgraph/web'
import { Team } from '@metad/copilot'

export interface StoryAgentState extends Team.State {
  tool_call_id: string
}

export const storyAgentState: StateGraphArgs<StoryAgentState>['channels'] = {
  ...Team.createState(),
  tool_call_id: {
    value: (x: string, y?: string) => y,
    default: () => null
  }
}
