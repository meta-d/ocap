import { AgentExecutor, createOpenAIToolsAgent } from "langchain/agents";
import { HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { JsonOutputToolsParser } from "langchain/output_parsers";
import { Runnable, RunnableConfig } from "@langchain/core/runnables";
import { StructuredTool } from "@langchain/core/tools";
import { BaseChatModel } from "@langchain/core/language_models/chat_models";
import { ChatOpenAI } from "@langchain/openai";

export async function createAgent(
  llm: BaseChatModel,
  tools: StructuredTool[],
  systemPrompt: string,
): Promise<AgentExecutor> {
  const combinedPrompt = systemPrompt +
    "\nWork autonomously according to your specialty, using the tools available to you." +
    " Do not ask for clarification." +
    " Your other team members (and other teams) will collaborate with you with their own specialties." +
    " You are chosen for a reason! You are one of the following team members: {team_members}.";
  const toolNames = tools.map((t) => t.name).join(", ");
  const prompt = await ChatPromptTemplate.fromMessages([
    ["system", combinedPrompt],
    new MessagesPlaceholder("messages"),
    new MessagesPlaceholder("agent_scratchpad"),
    [
      "system",
      [
        "Supervisor instructions: {instructions}\n" +
        `Remember, you individually can only use these tools: ${toolNames}` +
        "\n\nEnd if you have already completed the requested task. Communicate the work completed.",
      ].join("\n"),
    ],
  ]);
  const agent = await createOpenAIToolsAgent({ llm, tools, prompt });
  return new AgentExecutor({ agent, tools });
}

export async function runAgentNode(params: {
  state: any;
  agent: Runnable;
  name: string;
  config?: RunnableConfig & {
    config: RunnableConfig;
} & Record<string, any>;
}) {
  const { state, agent, name, config } = params;
  const result = await agent.invoke(state, config);
  return {
    messages: [new HumanMessage({ content: result.output, name })],
  };
}

export async function createTeamSupervisor(
  llm: ChatOpenAI,
  systemPrompt: string,
  members: string[],
): Promise<Runnable> {
  const options = ["FINISH", ...members];
  const functionDef = {
    name: "route",
    description: "Select the next role.",
    parameters: {
      title: "routeSchema",
      type: "object",
      properties: {
        reasoning: {
          title: "Reasoning",
          type: "string",
        },
        next: {
          title: "Next",
          anyOf: [{ enum: options }],
        },
        instructions: {
          title: "Instructions",
          type: "string",
          description:
            "The specific instructions of the sub-task the next role should accomplish.",
        },
      },
      required: ["reasoning", "next", "instructions"],
    },
  };
  const toolDef = {
    type: "function" as const,
    function: functionDef,
  };
  let prompt = await ChatPromptTemplate.fromMessages([
    ["system", systemPrompt],
    new MessagesPlaceholder("messages"),
    [
      "system",
      "Given the conversation above, who should act next? Or should we FINISH? Select one of: {options}",
    ],
  ]);
  prompt = await prompt.partial({
    options: options.join(", "),
    team_members: members.join(", "),
  });

  const supervisor = prompt
    .pipe(
      llm
      .bindTools(
        [toolDef],
        {
          tool_choice: { "type": "function", "function": { "name": "route" } },
        },
      )
    )
    .pipe(new JsonOutputToolsParser())
    // select the first one
    .pipe((x) => ({
      next: x[0].args.next,
      instructions: x[0].args.instructions,
    }));

  return supervisor;
}