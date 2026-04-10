// src/api/agent.ts
import axios from 'axios';
import type { ChatRequest, AgentChatResponse, ToolInfo, HistoryItem } from './types';

// 创建Axios实例
const api = axios.create({
  baseURL: 'http://localhost:8123/api',
  timeout: 10000,
});

// 同步聊天接口
export async function chatSync(request: ChatRequest): Promise<AgentChatResponse> {
  try {
    const res = await api.post<AgentChatResponse>('/agent/chat/sync', request);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message || '请求失败');
  }
}

// 流式聊天接口（SSE，返回EventSource）
// 注意：POST SSE流式接口建议直接用fetch+ReadableStream实现（见hooks/useStreamingChat.ts），如需EventSource请自行实现polyfill。
export async function chatStream(request: ChatRequest): Promise<EventSource> {
  throw new Error('chatStream接口建议通过fetch+ReadableStream实现，详见hooks/useStreamingChat.ts');
}

// 获取工具列表
export async function getTools(): Promise<ToolInfo[]> {
  try {
    const res = await api.get<ToolInfo[]>('/agent/tools');
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message || '获取工具列表失败');
  }
}

// 获取对话历史
export async function getHistory(chatId: string): Promise<HistoryItem[]> {
  try {
    const res = await api.get<HistoryItem[]>(`/agent/history/${chatId}`);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message || '获取历史失败');
  }
}

// 清空会话
export async function clearHistory(chatId: string): Promise<void> {
  try {
    await api.delete(`/agent/history/${chatId}`);
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message || '清空会话失败');
  }
}