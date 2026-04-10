// src/api/agent.ts
import axios from 'axios';
import type { ChatRequest, AgentChatResponse, ToolInfo, HistoryItem } from './types';

// 创建Axios实例
const api = axios.create({
  baseURL: 'http://localhost:8123/api',
  timeout: 10000,
});
// 配置
const API_BASE_URL = 'http://localhost:8123/api'


// 同步聊天接口
export async function chatSync(request: ChatRequest): Promise<AgentChatResponse> {
  try {
    const res = await api.post<AgentChatResponse>('/agent/chat/sync', request);
    return res.data;
  } catch (error: any) {
    throw new Error(error?.response?.data?.error || error.message || '请求失败');
  }
}

/**
 * 流式聊天 (返回EventSource)
 */
export const chatStream = (request: ChatRequest): EventSource => {
  const params = new URLSearchParams({
    message: request.message,
    chatId: request.chatId
  })
  if (request.toolIds?.length) {
    params.append('toolIds', request.toolIds.join(','))
  }
  
  const url = `${API_BASE_URL}/agent/chat/stream?${params.toString()}`
  return new EventSource(url)
}

/**
 * 使用POST body的流式聊天 (推荐)
 */
export const chatStreamPost = (request: ChatRequest): EventSource => {
  const url = `${API_BASE_URL}/agent/chat/stream`
  // 注意：EventSource不支持POST，这里返回URL，实际使用时通过fetch实现
  return null as any
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

export default {
  chatSync,
  chatStream,
  chatStreamPost,
  getTools,
  getHistory,
  clearHistory
}