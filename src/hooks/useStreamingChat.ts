// src/hooks/useStreamingChat.ts
import { ref } from "vue";
import type { ChatRequest, ToolCallInfo } from "../api/types";

interface StreamingChatOptions {
  onMessage?: (text: string) => void;
  onToolCall?: (tool: { name: string; arguments: string }) => void;
  onComplete?: () => void;
  onError?: (err: string) => void;
}

export function useStreamingChat(options: StreamingChatOptions = {}) {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  let abortController: AbortController | null = null;

  // 发送消息，开启流式会话
  async function sendMessage(request: ChatRequest) {
    isLoading.value = true;
    error.value = null;
    abortController = new AbortController();

    try {
      const response = await fetch(
        "http://localhost:8123/api/agent/chat/stream",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(request),
          signal: abortController.signal,
        },
      );

      if (!response.body) throw new Error("无响应流");
      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // 处理SSE事件
        let eventMatch;
        const eventRegex = /event: (\w+)\ndata: (.*)\n\n/g;
        while ((eventMatch = eventRegex.exec(buffer)) !== null) {
          const [, event, data] = eventMatch;
          switch (event) {
            case "message":
              options.onMessage?.(data);
              break;
            case "tool_call":
              try {
                const tool = JSON.parse(data);
                options.onToolCall?.(tool);
              } catch {}
              break;
            case "complete":
              options.onComplete?.();
              break;
            case "error":
              options.onError?.(data);
              error.value = data;
              break;
          }
        }
        // 清理已处理部分
        buffer = buffer.slice(eventRegex.lastIndex);
        eventRegex.lastIndex = 0;
      }
    } catch (err: any) {
      error.value = err.message || "流式请求失败";
      options.onError?.(error.value as string);
    } finally {
      isLoading.value = false;
    }
  }

  // 中断流式请求
  function abort() {
    abortController?.abort();
    isLoading.value = false;
  }

  return {
    isLoading,
    error,
    sendMessage,
    abort,
  };
}
