<template>
  <div
    class="flex flex-col h-screen max-w-full overflow-hidden bg-white text-gray-900 transition-colors duration-300"
  >
    <div class="flex flex-col h-full bg-white">
      <!-- 头部区域 (Header) -->
      <header
        class="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-white/80 backdrop-blur-md z-10"
      >
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl bg-[#9dd7d5] flex items-center justify-center text-white shadow-lg shadow-[#9dd7d5]/20"
          >
            <Sparkles :size="24" />
          </div>
          <div>
            <h1 class="text-lg font-bold tracking-tight text-gray-800">
              Law Lovely AI
            </h1>
            <p class="text-xs text-gray-400 font-medium">
              专业法律助手 · 可靠(爱)的AI法务
            </p>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <!-- 已移除黑暗模式切换按钮 -->
          <button
            class="p-2.5 rounded-full hover:bg-gray-100 text-gray-500 transition-all active:scale-95"
          >
            <Settings :size="20" />
          </button>
        </div>
      </header>

      <!-- 结果展示板块 (Show) -->
      <main
        ref="scrollRef"
        class="flex-1 overflow-y-auto px-4 py-8 scroll-smooth"
      >
        <div class="max-w-3xl mx-auto space-y-8">
          <transition-group name="message">
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="[
                'flex gap-4',
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row',
              ]"
            >
              <!-- 头像 -->
              <div
                :class="[
                  'w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center shadow-sm',
                  msg.role === 'user' ? 'bg-[#fff4c5]' : 'bg-[#9dd7d5]',
                ]"
              >
                <User
                  v-if="msg.role === 'user'"
                  :size="20"
                  class="text-gray-700"
                />
                <Bot v-else :size="20" class="text-white" />
              </div>

              <!-- 对话框 -->
              <div
                :class="[
                  'max-w-[80%] px-5 py-3.5 rounded-2xl text-[15px] leading-relaxed chat-bubble-shadow',
                  msg.role === 'user'
                    ? 'bg-[#fff4c5]/20 rounded-tr-none'
                    : 'bg-white border border-gray-100 rounded-tl-none',
                ]"
              >
                <div class="whitespace-pre-wrap">{{ msg.content }}</div>
                <div class="mt-2 text-[10px] text-gray-400 text-right">
                  {{ formatTime(msg.timestamp) }}
                </div>
              </div>
            </div>
          </transition-group>

          <!-- 加载状态与进度圈 -->
          <div v-if="isLoading" class="flex gap-4">
            <div
              class="w-10 h-10 rounded-full bg-[#9dd7d5] flex items-center justify-center shadow-sm"
            >
              <Bot :size="20" class="text-white" />
            </div>
            <div class="flex flex-col gap-3 w-full max-w-[80%]">
              <div
                class="flex items-center gap-2 text-sm text-[#9dd7d5] font-medium"
              >
                <div class="flex gap-1">
                  <span
                    class="w-1.5 h-1.5 bg-[#9dd7d5] rounded-full animate-bounce [animation-delay:-0.3s]"
                  ></span>
                  <span
                    class="w-1.5 h-1.5 bg-[#9dd7d5] rounded-full animate-bounce [animation-delay:-0.15s]"
                  ></span>
                  <span
                    class="w-1.5 h-1.5 bg-[#9dd7d5] rounded-full animate-bounce"
                  ></span>
                </div>
                AI 正在思考中...
              </div>

              <!-- 趣味进度圈 -->
              <div class="flex items-center gap-4 py-2">
                <div class="relative w-10 h-10">
                  <svg
                    class="w-full h-full transform -rotate-90"
                    viewBox="0 0 36 36"
                  >
                    <circle
                      class="text-gray-100"
                      stroke-width="3"
                      stroke="currentColor"
                      fill="none"
                      cx="18"
                      cy="18"
                      r="16"
                    />
                    <circle
                      class="text-[#9dd7d5] transition-all duration-500 ease-out"
                      :stroke-dasharray="progress * 1.005 + ', 100'"
                      stroke-width="3"
                      stroke-linecap="round"
                      stroke="currentColor"
                      fill="none"
                      cx="18"
                      cy="18"
                      r="16"
                    />
                  </svg>
                  <div
                    class="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-[#9dd7d5]"
                  >
                    {{ Math.round(progress) }}%
                  </div>
                </div>
                <span class="text-xs text-gray-400 italic"
                  >正在检索法律条文与案例...</span
                >
              </div>
            </div>
          </div>
        </div>
      </main>

      <!-- 底部输入区域 (Foot) -->
      <footer
        class="p-4 md:p-6 bg-gradient-to-t from-white via-white to-transparent"
      >
        <div class="max-w-3xl mx-auto">
          <!-- 工具选择 -->
          <div class="flex flex-wrap gap-2 mb-4">
            <button
              v-for="tool in tools"
              :key="tool.id"
              @click="toggleTool(tool.id)"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                selectedTools.includes(tool.id)
                  ? 'bg-[#9dd7d5] text-white border-[#9dd7d5] shadow-md shadow-[#9dd7d5]/20'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-[#9dd7d5]/50',
              ]"
            >
              <component :is="tool.icon" :size="14" />
              {{ tool.name }}
            </button>

            <div class="h-6 w-px bg-gray-200 mx-1" />

            <button
              @click="isAgentMode = !isAgentMode"
              :class="[
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all border',
                isAgentMode
                  ? 'bg-purple-500 text-white border-purple-500 shadow-md shadow-purple-500/20'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-purple-500/50',
              ]"
            >
              <Sparkles :size="14" />
              Agent 模式
            </button>
          </div>

          <!-- 搜索框 -->
          <div
            class="relative bg-white rounded-[28px] border border-gray-200 input-shadow transition-all overflow-hidden"
          >
            <div class="flex items-end p-2 pl-4">
              <button
                class="p-2 text-gray-400 hover:text-[#9dd7d5] transition-colors"
              >
                <Plus :size="22" />
              </button>

              <textarea
                v-model="input"
                @keydown.enter.prevent="handleEnter"
                placeholder="问问 Law Lovely..."
                class="flex-1 max-h-48 py-3 px-2 bg-transparent border-none focus:ring-0 text-gray-700 placeholder-gray-400 resize-none text-[15px] outline-none"
                rows="1"
              ></textarea>

              <div class="flex items-center gap-1 pb-1 pr-2">
                <button
                  @click="handleSend"
                  :disabled="!input.trim() || isLoading"
                  :class="[
                    'p-2.5 rounded-full transition-all',
                    input.trim() && !isLoading
                      ? 'bg-[#9dd7d5] text-white shadow-lg shadow-[#9dd7d5]/30 scale-105'
                      : 'text-gray-300',
                  ]"
                >
                  <Send :size="20" />
                </button>
              </div>
            </div>

            <div
              class="flex items-center justify-between px-6 py-2 bg-gray-50/50 border-t border-gray-50"
            >
              <div class="flex gap-4">
                <button
                  class="text-gray-400 hover:text-[#9dd7d5] transition-colors"
                >
                  <Paperclip :size="16" />
                </button>
                <button
                  class="text-gray-400 hover:text-[#9dd7d5] transition-colors"
                >
                  <MoreHorizontal :size="16" />
                </button>
              </div>
              <span class="text-[10px] text-gray-400 font-medium"
                >Shift + Enter 换行</span
              >
            </div>
          </div>

          <p class="mt-3 text-center text-[11px] text-gray-400">
            AI 可能会产生误差，请核实重要法律信息。
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script>
import axios from "axios";
// 引入专门为 Vue 优化的 lucide-vue-next 图标库
import {
  Send,
  User,
  Bot,
  Plus,
  Settings,
  Sparkles,
  Search,
  Code,
  BookOpen,
  Brain,
  MoreHorizontal,
  Paperclip,
  FileCheck,
} from "lucide-vue-next";

const API_BASE_URL = "http://localhost:8123/api";

export default {
  name: "App",
  components: {
    Send,
    User,
    Bot,
    Plus,
    Settings,
    Sparkles,
    Search,
    Code,
    BookOpen,
    Brain,
    MoreHorizontal,
    Paperclip,
    FileCheck,
  },
  // 使用 Vue 3 选项式 API
  data() {
    return {
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "你好！我是您的法律助手。今天有什么我可以帮您的吗？",
          timestamp: Date.now(),
        },
      ],
      input: "",
      isLoading: false,
      isAgentMode: false,
      selectedTools: [],
      progress: 0,
      tools: [
        { id: "search", name: "搜索", icon: "Search" },
        { id: "code", name: "代码", icon: "Code" },
        { id: "file", name: "文件", icon: "FileCheck" },
        { id: "law", name: "法律库", icon: "BookOpen" },
        { id: "thinking", name: "深度思考", icon: "Brain" },
      ],
      progressInterval: null,
    };
  },
  watch: {
    // 监听加载状态，模拟进度圈数值
    isLoading(newVal) {
      if (newVal) {
        this.progress = 0;
        this.progressInterval = setInterval(() => {
          if (this.progress < 95) {
            this.progress += Math.random() * 5;
          }
        }, 400);
      } else {
        clearInterval(this.progressInterval);
        this.progress = 100;
        setTimeout(() => {
          this.progress = 0;
        }, 500);
      }
    },
  },
  methods: {
    // 切换工具选择
    toggleTool(toolId) {
      const index = this.selectedTools.indexOf(toolId);
      if (index > -1) {
        this.selectedTools.splice(index, 1);
      } else {
        this.selectedTools.push(toolId);
      }
    },
    // 处理回车发送
    handleEnter(e) {
      if (!e.shiftKey) {
        this.handleSend();
      }
    },
    // 发送消息
    async handleSend() {
      if (!this.input.trim() || this.isLoading) return;

      const userMessage = {
        id: Date.now().toString(),
        role: "user",
        content: this.input,
        timestamp: Date.now(),
      };

      this.messages.push(userMessage);
      const currentInput = this.input;
      this.input = "";
      this.isLoading = true;

      // 自动滚动到底部
      this.$nextTick(() => {
        this.scrollToBottom();
      });

      try {
        // 调用后端同步接口
        const response = await axios.get(`${API_BASE_URL}/law_app/chat/sync`, {
          params: {
            message: currentInput,
            chatId: "default-session",
          },
        });

        this.messages.push({
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: response.data || "抱歉，我暂时无法回答。",
          timestamp: Date.now(),
        });
      } catch (error) {
        console.error("Chat error:", error);
        this.messages.push({
          id: Date.now().toString(),
          role: "assistant",
          content: "连接服务器失败，请检查后端接口是否开启。",
          timestamp: Date.now(),
        });
      } finally {
        this.isLoading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    // 滚动到底部
    scrollToBottom() {
      const el = this.$refs.scrollRef;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    },
    // 格式化时间
    formatTime(timestamp) {
      return new Date(timestamp).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
  },
};
</script>

<style scoped>
.chat-bubble-shadow {
  box-shadow:
    0 2px 15px -3px rgba(0, 0, 0, 0.07),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.input-shadow {
  box-shadow:
    0 4px 20px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

/* 消息列表过渡动画 */
.message-enter-active,
.message-leave-active {
  transition: all 0.4s ease;
}

.message-enter-from {
  opacity: 0;
  transform: translateY(20px);
}

.message-leave-to {
  opacity: 0;
  transform: scale(0.9);
}

/* 移除 textarea 默认边框和焦点环 */
textarea {
  border: none;
  outline: none;
  box-shadow: none;
}
</style>
