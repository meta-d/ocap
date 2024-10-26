import { BaseChatModel } from '@langchain/core/language_models/chat_models'
import { BaseMessage, SystemMessage } from '@langchain/core/messages'
import { Runnable, RunnableToolLike } from '@langchain/core/runnables'
import { StructuredToolInterface } from '@langchain/core/tools'
import { Annotation, BaseCheckpointSaver, MessagesAnnotation, START, StateGraph } from '@langchain/langgraph'
import { ToolNode } from '@langchain/langgraph/prebuilt'
import { IXpertAgent } from '@metad/contracts'

export const XpertAgentStateAnnotation = Annotation.Root({
	...MessagesAnnotation.spec,
	input: Annotation<string>
})

export type N = typeof START | 'agent' | 'tools' | any

export type CreateXpertReactAgentParams = {
	llm: BaseChatModel
	tools: ToolNode<typeof MessagesAnnotation.State> | (StructuredToolInterface | RunnableToolLike)[]
	messageModifier?:
		| SystemMessage
		| string
		| ((messages: BaseMessage[]) => BaseMessage[])
		| ((messages: BaseMessage[]) => Promise<BaseMessage[]>)
		| Runnable
	checkpointSaver?: BaseCheckpointSaver
	interruptBefore?: N[]
	interruptAfter?: N[]
}

export function createXpertReactAgent(params: CreateXpertReactAgentParams, xpertAgent: IXpertAgent) {
	const { llm, tools, messageModifier, checkpointSaver, interruptBefore, interruptAfter } = params

    


	const subgraph = new StateGraph(XpertAgentStateAnnotation)
		.addNode('subgraphNode1', subgraphNode1)
		.addNode('subgraphNode2', subgraphNode2)
		.addEdge(START, 'subgraphNode1')
		.addEdge('subgraphNode1', 'subgraphNode2')
		.compile({
            checkpointer: checkpointSaver,
            interruptBefore,
            interruptAfter
        })
}
