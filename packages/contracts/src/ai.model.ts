/**
 * Keep consistent with {@link packages/copilot/src/providers.ts}
 */
export enum AiProvider {
    OpenAI = 'openai',
    Azure = 'azure',
    DashScope = 'dashscope'
}

/**
 * Business roles for AI copilot (commands or contexts)
 */
export enum AiBusinessRole {
    FinanceBP = 'finance_bp',
    SupplyChainExpert = 'supply_chain_expert',
}