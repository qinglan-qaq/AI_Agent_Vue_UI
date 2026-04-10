// src/composables/useAgentChat.ts
import { ref } from 'vue';
import type { ChatRequest, ToolInfo, HistoryItem } from '../api/types';
import { chatSync, getTools, getHistory, clearHistory } from '../api/agent';
import { useStreamingChat } from '../hooks/useStreamingChat';

export function useAgentChat() {
  const messages = ref<HistoryItem[]>([]);
  const tools = ref<ToolInfo[]>([]);
  const chatId = ref<string>('');
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  // 加载工具列表
  async function loadTools() {
    try {
      tools.value = await getTools();
    } catch (err: any) {
      error.value = err.message;
    }
  }

  // 加载历史消息
  async function loadHistory(id: string) {
    try {
      messages.value = await getHistory(id);
      chatId.value = id;
    } catch (err: any) {
      error.value = err.message;
    }
  }
  // 清空会话
  async function clearChat() {
    if (!chatId.value) return;
    try {
      await clearHistory(chatId.value);
      messages.value = [];
    } catch (err: any) {
      error.value = err.message;
    }
  }


  // 发送消息（流式）
  function sendMessage(content: string, toolIds: string[], systemPrompt?: string) {
    if (!chatId.value) {
      // 生成唯一会话ID
      chatId.value = Date.now().toString();
    }
    const request: ChatRequest = {
      message: content,
      chatId: chatId.value,
      toolIds,
      agentMode: false,
      systemPrompt,
    };

    const { isLoading: streaming, error: streamError, sendMessage: streamSend, abort } = useStreamingChat({
      onMessage: (text) => {
        messages.value.push({ role: 'assistant', content: text });
      },
      onError: (err) => {
        error.value = err;
      },
    });

    isLoading.value = streaming.value;
    error.value = streamError.value;

    // 添加用户消息
    messages.value.push({ role: 'user', content });

    // 启动流式对话
    streamSend(request);

    return { abort };
  }

  return {
    messages,
    tools,
    chatId,
    isLoading,
    error,
    sendMessage,
    loadTools,
    loadHistory,
    clearChat,
  };
}