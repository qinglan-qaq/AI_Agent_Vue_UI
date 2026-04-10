// src/api/types.ts

/** 聊天请求体 */
export interface ChatRequest {
  message: string;
  chatId: string;
  toolIds: string[];
  agentMode: boolean;
  systemPrompt?: string;
}

/** 工具调用信息 */
export interface ToolCallInfo {
  toolName: string;
  arguments: string;
  result: string;
}

/** 聊天响应体 */
export interface AgentChatResponse {
  content: string;
  chatId: string;
  isComplete: boolean;
  toolCalls: ToolCallInfo[];
  error?: string;
}

/** 工具信息 */
export interface ToolInfo {
  id: string;
  name: string;
  description: string;
  category: string;
  enabled: boolean;
}

/** 历史消息 */
export interface HistoryItem {
  role: 'user' | 'assistant' | string;
  content: string;
}